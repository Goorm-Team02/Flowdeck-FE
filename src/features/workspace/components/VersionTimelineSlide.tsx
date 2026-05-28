import { useState } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'
import { useParams } from 'react-router-dom'

import { useFileVersionTimeline } from '../hooks/useFileVersionTimeline'
import { openFileIdAtom } from '../stores/openFileAtom'
import { timelineOpenAtom } from '../stores/sidebarAtom'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}

const AVATAR_COLORS = [
  'bg-accent', 'bg-purple-500', 'bg-teal-500',
  'bg-orange-500', 'bg-rose-500', 'bg-indigo-500',
]

export default function VersionTimelineSlide() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const fileId = useAtomValue(openFileIdAtom)
  const setTimelineOpen = useSetAtom(timelineOpenAtom)

  const { data: cards = [], isLoading, isError } = useFileVersionTimeline(projectId, fileId)

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const effectiveIdx = selectedIdx ?? (cards.length > 0 ? cards.length - 1 : 0)
  const selected = cards[effectiveIdx] ?? null

  const goPrev = () => setSelectedIdx(Math.max(0, effectiveIdx - 1))
  const goNext = () => setSelectedIdx(Math.min(cards.length - 1, effectiveIdx + 1))

  const contentLines = selected?.content.split('\n') ?? []

  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-bg-secondary">
        <div className="flex items-center gap-2">
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-accent)" strokeWidth="2"
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
            {/* 이전 버튼 */}
            <button
              onClick={goPrev}
              disabled={effectiveIdx === 0}
              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/90 hover:border-text-primary/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                      <span className="text-[11px] text-text-primary/50 truncate">{card.authorName}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-text-primary">v{card.version}</p>
                    <p className="text-[10px] text-text-primary/35 mt-0.5">{formatDate(card.savedAt)}</p>
                    {card.diffSummary && (
                      <p className="text-[10px] mt-1">
                        <span className="text-green-400">+{card.diffSummary.added}</span>
                        {' '}
                        <span className="text-red-400">-{card.diffSummary.removed}</span>
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={goNext}
              disabled={effectiveIdx === cards.length - 1}
              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-primary/50 hover:text-text-primary/90 hover:border-text-primary/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* 인디케이터 */}
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
                {selected.diffSummary ? (
                  <span className="text-[12px]">
                    <span className="text-green-400">+{selected.diffSummary.added}줄</span>
                    {' '}
                    <span className="text-red-400">-{selected.diffSummary.removed}줄</span>
                  </span>
                ) : (
                  <span className="text-[12px] text-text-primary/30">초기 버전</span>
                )}
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
    </div>
  )
}
