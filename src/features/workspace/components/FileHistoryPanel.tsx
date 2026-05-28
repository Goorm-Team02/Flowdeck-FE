import { useState } from 'react'

import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'

import { useFileVersion } from '../hooks/useFileVersion'
import { useFileVersionDiff } from '../hooks/useFileVersionDiff'
import { useFileVersions } from '../hooks/useFileVersions'
import { openFileIdAtom } from '../stores/openFileAtom'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}

function initials(name: string): string {
  return name.slice(0, 2)
}

const AVATAR_COLORS = [
  'bg-accent',
  'bg-purple-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-indigo-500',
]

export default function FileHistoryPanel() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const fileId = useAtomValue(openFileIdAtom)

  const { data: versions = [], isLoading: versionsLoading, isError: versionsError } = useFileVersions(projectId, fileId)

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)

  // 목록이 로드되면 최신 버전을 기본 선택
  const effectiveId = selectedVersionId ?? versions.at(-1)?.id ?? null
  const selectedIdx = versions.findIndex((v) => v.id === effectiveId)
  const selectedVersion = versions[selectedIdx] ?? null
  const prevVersion = selectedIdx > 0 ? versions[selectedIdx - 1] : null

  const { data: versionDetail, isLoading: detailLoading } = useFileVersion(
    projectId,
    fileId,
    effectiveId,
  )
  const { data: diff } = useFileVersionDiff(
    projectId,
    fileId,
    prevVersion?.id ?? null,
    effectiveId,
  )

  const contentLines = versionDetail?.content.split('\n') ?? []
  const addedCount = diff?.lines.filter((l) => l.type === 'ADDED').length ?? 0
  const removedCount = diff?.lines.filter((l) => l.type === 'REMOVED').length ?? 0

  const total = versions.length

  if (!fileId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px] text-text-primary/30">파일을 선택하세요</p>
      </div>
    )
  }

  if (versionsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px] text-text-primary/30">불러오는 중...</p>
      </div>
    )
  }

  if (versionsError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px] text-red-400/70">버전 목록을 불러올 수 없습니다.</p>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px] text-text-primary/30">저장된 버전이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto px-6 py-4 flex flex-col gap-4 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-text-primary">버전 히스토리</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-bg-tertiary text-text-primary/60 border border-border">
            {total}개 버전
          </span>
        </div>
        {selectedVersion && (
          <span className="text-[12px] text-text-primary/40">
            v{selectedVersion.version} — {selectedVersion.authorName}
          </span>
        )}
      </div>

      {/* Code preview */}
      <div className="rounded-lg border border-border bg-bg-secondary overflow-hidden shrink-0">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="font-mono text-[12px] leading-[1.7] py-2 overflow-x-auto max-h-52">
          {detailLoading ? (
            <p className="px-4 text-text-primary/30">불러오는 중...</p>
          ) : contentLines.length === 0 ? (
            <p className="px-4 text-text-primary/30">(내용 없음)</p>
          ) : (
            contentLines.map((line, i) => (
              <div key={i} className="flex items-start">
                <span className="w-10 shrink-0 text-right pr-3 text-text-muted select-none">
                  {i + 1}
                </span>
                <span className="flex-1 pr-6 whitespace-pre text-text-primary/80">
                  {line || ' '}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Slider */}
      {total > 1 && (
        <div className="shrink-0 space-y-3">
          <div className="relative flex items-center h-5">
            <div className="absolute inset-x-1.5 h-px bg-border">
              <div
                className="h-full bg-accent transition-all duration-200"
                style={{ width: `${(selectedIdx / (total - 1)) * 100}%` }}
              />
            </div>
            <div className="relative flex justify-between w-full">
              {versions.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVersionId(v.id)}
                  title={`v${v.version} · ${v.authorName}`}
                  className={`rounded-full border-2 transition-all duration-200 ${
                    v.id === effectiveId
                      ? 'w-4 h-4 bg-accent border-accent'
                      : i < selectedIdx
                        ? 'w-3 h-3 bg-accent border-accent'
                        : 'w-3 h-3 bg-bg-secondary border-border hover:border-text-primary/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-text-primary/70">
              버전 {selectedIdx + 1} / {total}
            </span>
            {selectedVersion && (
              <span className="text-[12px] text-text-primary/40">
                {selectedVersion.authorName} · {formatDate(selectedVersion.savedAt)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Version cards */}
      <div className="flex gap-3 overflow-x-auto pb-1 shrink-0">
        {versions.map((v, i) => (
          <button
            key={v.id}
            onClick={() => setSelectedVersionId(v.id)}
            className={`flex-none w-40 p-3 rounded-lg border text-left transition-colors ${
              v.id === effectiveId
                ? 'border-accent/40 bg-bg-selected'
                : 'border-border bg-bg-secondary hover:bg-bg-tertiary'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div
                className={`w-5 h-5 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
              >
                {initials(v.authorName)}
              </div>
              <span className="text-[12px] text-text-primary/60 truncate">{v.authorName}</span>
            </div>
            <p className="text-[13px] font-semibold text-text-primary leading-tight">
              v{v.version}
            </p>
            <p className="text-[11px] text-text-primary/35 mt-1">{formatDate(v.savedAt)}</p>
          </button>
        ))}
      </div>

      {/* Diff stats */}
      <div className="text-[12px] text-text-primary/50 shrink-0">
        {!prevVersion ? (
          <span>초기 버전</span>
        ) : diff ? (
          <>
            이전 버전 대비{' '}
            <span className="text-green-400">+{addedCount}줄</span>{' '}
            <span className="text-red-400">-{removedCount}줄</span>
          </>
        ) : (
          <span className="text-text-primary/25">diff 계산 중...</span>
        )}
      </div>
    </div>
  )
}
