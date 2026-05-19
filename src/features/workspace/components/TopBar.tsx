import { useNavigate } from 'react-router-dom'

export default function TopBar() {
  const navigate = useNavigate()

  return (
    <header className="h-10 flex items-center justify-between px-3 bg-bg-secondary border-b border-border shrink-0">
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

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
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

        <button className="p-1.5 text-text-primary/50 hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        <button className="px-3 py-1 text-sm text-text-primary border border-border rounded hover:bg-bg-tertiary transition-colors">
          유저
        </button>

        <button className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-500 transition-colors font-medium">
          실행
        </button>
      </div>
    </header>
  )
}
