import { useAtom, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { memberModalOpenAtom } from '../stores/memberModalAtom'
import { isRunningAtom, runTriggerAtom, stopTriggerAtom } from '../stores/terminalAtom'

export default function TopBar() {
  const navigate = useNavigate()
  const [isRunning] = useAtom(isRunningAtom)
  const setRunTrigger = useSetAtom(runTriggerAtom)
  const setStopTrigger = useSetAtom(stopTriggerAtom)
  const setMemberModalOpen = useSetAtom(memberModalOpenAtom)

  const handleRunClick = () => {
    if (isRunning) {
      setStopTrigger((prev) => prev + 1)
    } else {
      setRunTrigger((prev) => prev + 1)
    }
  }

  return (
    <header className="h-10 flex items-center justify-between px-3 bg-bg-secondary border-b border-border shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate('/')}
          className="text-text-primary/50 hover:text-text-primary transition-colors cursor-pointer"
        >
          프로젝트 목록
        </button>
        <span className="text-text-primary/30">/</span>
        <span className="text-text-primary font-medium">react-dashboard</span>
        <span className="px-1.5 py-0.5 text-xs rounded bg-bg-tertiary text-text-primary/70 border border-border">
          main
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Avatar stack */}
        <div className="flex items-center gap-2 mr-2">
          <div className="flex -space-x-1.5">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-bg-secondary z-10">
              JM
            </div>
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-bg-secondary">
              +2
            </div>
          </div>
          <span className="text-sm text-text-primary/50">인원</span>
        </div>

        {/* 멤버 */}
        <button
          onClick={() => setMemberModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-sm text-text-primary/60 hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          멤버
        </button>

        {/* 공유 */}
        <button className="flex items-center gap-1.5 px-2.5 py-1 text-sm text-text-primary/60 hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          공유
        </button>

        {/* 실행 / 정지 */}
        <button
          onClick={handleRunClick}
          className={`flex items-center gap-1.5 px-3 py-1 ml-1 text-sm text-white rounded transition-colors font-medium ${
            isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {isRunning ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="1" />
              </svg>
              정지
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              실행
            </>
          )}
        </button>
      </div>
    </header>
  )
}
