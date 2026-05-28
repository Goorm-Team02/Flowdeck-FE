import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAtomValue, useSetAtom } from 'jotai'

import { isApiError } from '@/shared/api/errors'

import { useFileVersionTimeline } from '../hooks/useFileVersionTimeline'
import { useRestoreFileVersion } from '../hooks/useRestoreFileVersion'
import { openFileIdAtom } from '../stores/openFileAtom'
import { timelineOpenAtom } from '../stores/sidebarAtom'

// VIEWER 권한 여부 — 추후 auth 연동 시 실제 권한으로 교체
const useIsViewer = () => false

function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}

const AVATAR_COLORS = [
  'bg-accent',
  'bg-purple-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-indigo-500',
]

export default function VersionTimelineSlide() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const fileId = useAtomValue(openFileIdAtom)
  const setTimelineOpen = useSetAtom(timelineOpenAtom)
  const isViewer = useIsViewer()

  const { data: cards = [], isLoading, isError } = useFileVersionTimeline(projectId, fileId)
  const { mutate: restore, isPending: isRestoring } = useRestoreFileVersion(projectId)

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const effectiveIdx = selectedIdx ?? (cards.length > 0 ? cards.length - 1 : 0)
  const selected = cards[effectiveIdx] ?? null

  const [confirmVersionId, setConfirmVersionId] = useState<number | null>(null)
  const [restoreResult, setRestoreResult] = useState<{ ok: boolean; message: string } | null>(null)

  const confirmCard = cards.find((c) => c.id === confirmVersionId) ?? null

  const handleRestoreConfirm = () => {
    if (!fileId || !confirmVersionId) return
    restore(
      { fileId, versionId: confirmVersionId },
      {
        onSuccess: () => {
          setConfirmVersionId(null)
          setRestoreResult({ ok: true, message: `v${confirmCard?.version} 버전으로 복원됐습니다.` })
          setTimeout(() => setRestoreResult(null), 3000)
        },
        onError: (error) => {
          setConfirmVersionId(null)
          if (isApiError(error)) {
            if (error.status === 403) {
              setRestoreResult({ ok: false, message: '복원 권한이 없습니다.' })
            } else if (error.status === 409) {
              setRestoreResult({
                ok: false,
                message: '다른 사용자가 먼저 파일을 수정했습니다. 잠시 후 다시 시도해주세요.',
              })
            } else {
              setRestoreResult({ ok: false, message: error.message })
            }
          } else {
            setRestoreResult({ ok: false, message: '복원 중 오류가 발생했습니다.' })
          }
          setTimeout(() => setRestoreResult(null), 4000)
        },
      },
    )
  }

  const goPrev = () => setSelectedIdx(Math.max(0, effectiveIdx - 1))
  const goNext = () => setSelectedIdx(Math.min(cards.length - 1, effectiveIdx + 1))

  const contentLines = selected?.content.split('\n') ?? []

  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden">
      {/* 토스트 */}
      {restoreResult && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-lg text-[13px] border ${
            restoreResult.ok
              ? 'bg-bg-secondary border-green-500/40 text-green-400'
              : 'bg-bg-secondary border-red-500/40 text-red-400'
          }`}
        >
          {restoreResult.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-bg-secondary">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-[14px] font-semibold text-text-primary">버전 타임라인</span>
          {cards.length > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-bg-tertiary text-text-primary/50 border border-border">
              {cards.length}개 버전
            </span>
          )}
        </div>
        <button
          onClick={() => setTimelineOpen(false)}
          className="text-text-primary/35 hover:text-text-primary/70 transition-colors text-[18px] leading-none"
        >
          ×
        </button>
      </div>

      {/* 로딩 / 에러 / 빈 상태 */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-text-primary/30">불러오는 중...</p>
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-red-400/70">타임라인을 불러올 수 없습니다.</p>
        </div>
      )}
      {!isLoading && !isError && cards.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-text-primary/30">저장된 버전이 없습니다.</p>
        </div>
      )}

      {!isLoading && !isError && cards.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 카드 슬라이드 영역 */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0 bg-bg-secondary">
            <button
              onClick={goPrev}
              disabled={effectiveIdx === 0}
              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/90 hover:border-text-primary/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* 카드 목록 (가로 스크롤) */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-2 pb-1">
                {cards.map((card, i) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedIdx(i)}
                    className={`flex-none w-36 p-2.5 rounded-lg border text-left transition-colors ${
                      i === effectiveIdx
                        ? 'border-accent/50 bg-accent/10'
                        : 'border-border bg-bg-tertiary hover:bg-bg-hover'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div
                        className={`w-5 h-5 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}
                      >
                        {card.authorName.slice(0, 2)}
                      </div>
                      <span className="text-[11px] text-text-primary/50 truncate">
                        {card.authorName}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-text-primary">v{card.version}</p>
                    <p className="text-[10px] text-text-primary/35 mt-0.5">
                      {formatDate(card.savedAt)}
                    </p>
                    {card.diffSummary && (
                      <p className="text-[10px] mt-1">
                        <span className="text-green-400">+{card.diffSummary.added}</span>{' '}
                        <span className="text-red-400">-{card.diffSummary.removed}</span>
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={goNext}
              disabled={effectiveIdx === cards.length - 1}
              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/90 hover:border-text-primary/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <span className="text-[12px] text-text-primary/40 shrink-0 w-12 text-right">
              {effectiveIdx + 1} / {cards.length}
            </span>
          </div>

          {/* 선택 버전 코드 프리뷰 */}
          {selected && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-2 shrink-0">
                <span className="text-[12px] text-text-primary/50">
                  v{selected.version} · {selected.authorName} · {formatDate(selected.savedAt)}
                </span>
                <div className="flex items-center gap-3">
                  {selected.diffSummary ? (
                    <span className="text-[12px]">
                      <span className="text-green-400">+{selected.diffSummary.added}줄</span>{' '}
                      <span className="text-red-400">-{selected.diffSummary.removed}줄</span>
                    </span>
                  ) : (
                    <span className="text-[12px] text-text-primary/30">초기 버전</span>
                  )}
                  {!isViewer && (
                    <button
                      onClick={() => setConfirmVersionId(selected.id)}
                      className="px-2.5 py-1 text-[12px] rounded border border-border/60 text-text-primary/50 hover:text-text-primary/80 hover:border-border hover:bg-bg-tertiary transition-colors"
                    >
                      이 버전으로 복원
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto font-mono text-[12px] leading-[1.7] bg-bg-secondary border-t border-border px-0 py-2">
                {contentLines.map((line, i) => (
                  <div key={i} className="flex items-start hover:bg-bg-hover/40">
                    <span className="w-12 shrink-0 text-right pr-4 text-text-muted select-none">
                      {i + 1}
                    </span>
                    <span className="flex-1 pr-6 whitespace-pre text-text-primary/80">
                      {line || ' '}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 복원 확인 모달 */}
      {confirmVersionId && confirmCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-[15px] font-semibold text-text-primary mb-1">버전 복원</h3>
            <p className="text-[13px] text-text-primary/60 mb-4 leading-relaxed">
              <span className="text-text-primary font-medium">v{confirmCard.version}</span> (
              {confirmCard.authorName} · {formatDate(confirmCard.savedAt)}) 으로 복원합니다.
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
                onClick={() => setConfirmVersionId(null)}
                className="px-4 py-1.5 text-[13px] text-text-primary/60 hover:text-text-primary transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRestoreConfirm}
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
