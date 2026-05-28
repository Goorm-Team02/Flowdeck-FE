import { useState } from 'react'

import { DiffEditor } from '@monaco-editor/react'
import { useAtomValue } from 'jotai'
import { useParams } from 'react-router-dom'

import { useFile } from '../hooks/useFile'
import { useFileVersion } from '../hooks/useFileVersion'
import { useFileVersions } from '../hooks/useFileVersions'
import { openFileIdAtom } from '../stores/openFileAtom'

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts': case 'tsx': return 'typescript'
    case 'js': case 'jsx': return 'javascript'
    case 'json': return 'json'
    case 'md': return 'markdown'
    case 'html': return 'html'
    case 'css': return 'css'
    case 'py': return 'python'
    case 'java': return 'java'
    default: return 'plaintext'
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}

export default function FileDiffViewer() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const fileId = useAtomValue(openFileIdAtom)

  const { data: file } = useFile(projectId, fileId)
  const { data: versions = [], isLoading: versionsLoading } = useFileVersions(projectId, fileId)

  // 기본값: 가장 최신 버전 (마지막 인덱스)
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)
  const effectiveVersionId = selectedVersionId ?? versions.at(-1)?.id ?? null
  const selectedIdx = versions.findIndex((v) => v.id === effectiveVersionId)
  const selectedVersion = versions[selectedIdx] ?? null

  const { data: versionDetail, isLoading: detailLoading } = useFileVersion(
    projectId,
    fileId,
    effectiveVersionId,
  )

  const canGoPrev = selectedIdx > 0
  const canGoNext = selectedIdx < versions.length - 1

  const goPrev = () => {
    if (canGoPrev) setSelectedVersionId(versions[selectedIdx - 1].id)
  }
  const goNext = () => {
    if (canGoNext) setSelectedVersionId(versions[selectedIdx + 1].id)
  }

  const language = file ? getLanguage(file.name) : 'plaintext'

  if (!fileId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <p className="text-[13px] text-text-primary/30">파일을 선택하세요</p>
      </div>
    )
  }

  if (versionsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <p className="text-[13px] text-text-primary/30">불러오는 중...</p>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <p className="text-[13px] text-text-primary/30">저장된 버전이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary">
      {/* 버전 탐색 바 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border shrink-0 bg-bg-secondary">
        {/* 이전(더 오래된) 버전 */}
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          title="더 오래된 버전과 비교"
          className="w-6 h-6 rounded border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/80 hover:border-text-primary/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* 버전 정보 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[12px] text-text-primary/40">비교:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-tertiary border border-border/60 rounded text-[12px]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-text-primary/70 font-medium">
              v{selectedVersion?.version}
            </span>
            {selectedVersion && (
              <span className="text-text-primary/35">
                · {selectedVersion.authorName} · {formatDate(selectedVersion.savedAt)}
              </span>
            )}
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" className="opacity-30 shrink-0">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/30 rounded text-[12px]">
            <span className="text-accent font-medium">현재</span>
            {file && <span className="text-text-primary/35">· {file.name}</span>}
          </div>
        </div>

        {/* 버전 위치 */}
        <span className="text-[11px] text-text-primary/30 shrink-0">
          {versions.length - selectedIdx}번째 이전 버전
        </span>

        {/* 다음(더 최근) 버전 */}
        <button
          onClick={goNext}
          disabled={!canGoNext}
          title="더 최근 버전과 비교"
          className="w-6 h-6 rounded border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/80 hover:border-text-primary/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 컬럼 헤더 */}
      <div className="flex border-b border-border shrink-0 bg-bg-secondary">
        <div className="flex-1 px-4 py-1.5 text-[11px] text-text-primary/40 border-r border-border">
          v{selectedVersion?.version} — 이전
        </div>
        <div className="flex-1 px-4 py-1.5 text-[11px] text-accent/70">
          현재 — {file?.name}
        </div>
      </div>

      {/* Monaco DiffEditor */}
      <div className="flex-1 overflow-hidden">
        {detailLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[13px] text-text-primary/30">버전 불러오는 중...</p>
          </div>
        ) : (
          <DiffEditor
            original={versionDetail?.content ?? ''}
            modified={file?.content ?? ''}
            language={language}
            theme="vs-dark"
            height="100%"
            options={{
              readOnly: true,
              renderSideBySide: true,
              fontSize: 13,
              lineHeight: 22,
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              wordWrap: 'on',
            }}
          />
        )}
      </div>
    </div>
  )
}
