import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { DiffEditor } from '@monaco-editor/react'
import { useAtomValue } from 'jotai'

import { useFile } from '../hooks/useFile'
import { useFileVersion } from '../hooks/useFileVersion'
import { useFileVersions } from '../hooks/useFileVersions'
import { useRestoreWithConfirm } from '../hooks/useRestoreWithConfirm'
import { baseRevisionAtom, openFileIdAtom } from '../stores/openFileAtom'

// VIEWER 권한 여부 — 추후 auth 연동 시 실제 권한으로 교체
const useIsViewer = () => false

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'js':
    case 'jsx':
      return 'javascript'
    case 'json':
      return 'json'
    case 'md':
      return 'markdown'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'py':
      return 'python'
    case 'java':
      return 'java'
    default:
      return 'plaintext'
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
  const baseRevision = useAtomValue(baseRevisionAtom)
  const isViewer = useIsViewer()

  const { data: file } = useFile(projectId, fileId)
  const { data: versions = [], isLoading: versionsLoading } = useFileVersions(projectId, fileId)
  const { restorePhase, isRestoring, requestRestore, cancelRestore, confirmRestore } =
    useRestoreWithConfirm(projectId)

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)
  const effectiveVersionId = selectedVersionId ?? versions.at(-1)?.id ?? null
  const selectedIdx = versions.findIndex((v) => v.id === effectiveVersionId)
  const selectedVersion = versions[selectedIdx] ?? null

  const confirmVersion =
    restorePhase?.phase === 'confirm'
      ? (versions.find((v) => v.id === restorePhase.versionId) ?? null)
      : null

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
      {/* 토스트 */}
      {restorePhase?.phase === 'toast' && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-lg text-[13px] border ${
            restorePhase.ok
              ? 'bg-bg-secondary border-green-500/40 text-green-400'
              : 'bg-bg-secondary border-red-500/40 text-red-400'
          }`}
        >
          {restorePhase.message}
        </div>
      )}

      {/* 버전 탐색 바 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border shrink-0 bg-bg-secondary">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          title="더 오래된 버전과 비교"
          className="w-6 h-6 rounded border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/80 hover:border-text-primary/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[12px] text-text-primary/40">비교:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-tertiary border border-border/60 rounded text-[12px]">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-text-primary/70 font-medium">v{selectedVersion?.version}</span>
            {selectedVersion && (
              <span className="text-text-primary/35">
                · {selectedVersion.authorName} · {formatDate(selectedVersion.savedAt)}
              </span>
            )}
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-primary)"
            strokeWidth="2"
            className="opacity-30 shrink-0"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/30 rounded text-[12px]">
            <span className="text-accent font-medium">현재</span>
            {file && <span className="text-text-primary/35">· {file.name}</span>}
          </div>
        </div>

        <span className="text-[11px] text-text-primary/30 shrink-0">
          {versions.length - selectedIdx}번째 이전 버전
        </span>

        {!isViewer && effectiveVersionId && (
          <button
            onClick={() => requestRestore(effectiveVersionId)}
            className="px-2.5 py-1 text-[12px] rounded border border-border/60 text-text-primary/50 hover:text-text-primary/80 hover:border-border hover:bg-bg-tertiary transition-colors shrink-0"
          >
            이 버전으로 복원
          </button>
        )}

        <button
          onClick={goNext}
          disabled={!canGoNext}
          title="더 최근 버전과 비교"
          className="w-6 h-6 rounded border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/80 hover:border-text-primary/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 컬럼 헤더 */}
      <div className="flex border-b border-border shrink-0 bg-bg-secondary">
        <div className="flex-1 px-4 py-1.5 text-[11px] text-text-primary/40 border-r border-border">
          v{selectedVersion?.version} — 이전
        </div>
        <div className="flex-1 px-4 py-1.5 text-[11px] text-accent/70">현재 — {file?.name}</div>
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

      {/* 복원 확인 모달 */}
      {restorePhase?.phase === 'confirm' && confirmVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-[15px] font-semibold text-text-primary mb-1">버전 복원</h3>
            <p className="text-[13px] text-text-primary/60 mb-4 leading-relaxed">
              <span className="text-text-primary font-medium">v{confirmVersion.version}</span> (
              {confirmVersion.authorName} · {formatDate(confirmVersion.savedAt)}) 으로 복원합니다.
            </p>
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-400 shrink-0 mt-0.5"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-[12px] text-orange-300/90 leading-relaxed">
                현재 작업 중인 내용이 사라집니다. 복원은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelRestore}
                className="px-4 py-1.5 text-[13px] text-text-primary/60 hover:text-text-primary transition-colors"
              >
                취소
              </button>
              <button
                onClick={() =>
                  fileId &&
                  baseRevision !== null &&
                  confirmRestore(fileId, `v${confirmVersion.version}`, baseRevision)
                }
                disabled={isRestoring}
                className="px-4 py-1.5 text-[13px] bg-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRestoring ? '복원 중...' : '복원'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
