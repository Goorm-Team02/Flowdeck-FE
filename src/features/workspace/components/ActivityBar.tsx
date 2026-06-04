import type React from 'react'

import { useAtom } from 'jotai'

import { activeSidebarPanelAtom, timelineOpenAtom } from '../stores/sidebarAtom'
import type { SidebarPanel } from '../stores/sidebarAtom'

const SIDEBAR_ICONS: { id: SidebarPanel; label: string; path: React.ReactNode }[] = [
  {
    id: 'filetree',
    label: '탐색기',
    path: (
      <>
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </>
    ),
  },
  {
    id: 'search',
    label: '검색',
    path: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
]

export default function ActivityBar() {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSidebarPanelAtom)
  const [timelineOpen, setTimelineOpen] = useAtom(timelineOpenAtom)

  const toggleTimeline = () => {
    setTimelineOpen((v) => !v)
  }

  return (
    <div className="w-12 flex flex-col items-center py-2 bg-bg-activity border-r border-border shrink-0">
      <div className="flex flex-col items-center gap-1 flex-1">
        {SIDEBAR_ICONS.map(({ id, label, path }) => (
          <div key={id} className="relative group">
            <button
              onClick={() => setActiveSidebar(id)}
              className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                activeSidebar === id && !timelineOpen
                  ? 'text-text-primary bg-bg-secondary/50'
                  : 'text-text-primary/40 hover:text-text-primary/80 hover:bg-bg-secondary/30'
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                {path}
              </svg>
            </button>
            <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-bg-tertiary border border-border px-2 py-1 text-[11px] text-text-primary opacity-0 transition-opacity group-hover:opacity-100 z-50">
              {label}
            </span>
          </div>
        ))}

        {/* 타임라인 — 시계 아이콘 */}
        <div className="relative group">
          <button
            onClick={toggleTimeline}
            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
              timelineOpen
                ? 'text-accent bg-bg-secondary/50'
                : 'text-text-primary/40 hover:text-text-primary/80 hover:bg-bg-secondary/30'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-bg-tertiary border border-border px-2 py-1 text-[11px] text-text-primary opacity-0 transition-opacity group-hover:opacity-100 z-50">
            버전 타임라인
          </span>
        </div>
      </div>

      <div className="relative group">
        <button className="w-10 h-10 flex items-center justify-center text-text-primary/40 hover:text-text-primary/80 hover:bg-bg-secondary/30 rounded transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-bg-tertiary border border-border px-2 py-1 text-[11px] text-text-primary opacity-0 transition-opacity group-hover:opacity-100 z-50">
          설정
        </span>
      </div>
    </div>
  )
}
