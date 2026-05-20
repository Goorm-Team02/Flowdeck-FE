interface ChatMessage {
  id: number
  user: string
  bgClass: string
  time: string
  text: string
}

const MESSAGES: ChatMessage[] = [
  {
    id: 1,
    user: '민서',
    bgClass: 'bg-purple-500',
    time: '오전 10:21',
    text: 'Editor.jsx에서 Yjs 적용한 부분 반반 버그수정요. v4 스타이드에서 반영 내부 확인 기능이에요.',
  },
  {
    id: 2,
    user: '현수',
    bgClass: 'bg-accent',
    time: '오전 10:30',
    text: '활성화터 ↑ WebSocket 연결 부분에서 제가 어때 주하면 가능 및 협력세요.',
  },
  {
    id: 3,
    user: '지우',
    bgClass: 'bg-green-500',
    time: '오전 10:32',
    text: '좋아요. 그럼 오늘 회의 전까지 v5에서 useRef로 되었으니 어느 부분 정리하고 마지하게요.',
  },
  {
    id: 4,
    user: '수지',
    bgClass: 'bg-orange-500',
    time: '오전 10:32',
    text: '저는 README 업데이트 알을게요!',
  },
]

export default function ChatPanel() {
  return (
    <div className="w-72 flex flex-col bg-bg-secondary border-l border-border shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-text-primary/40 font-bold text-sm">#</span>
          <span className="text-[13px] font-semibold text-text-primary">프로젝트 채팅</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
        </div>
        <button className="text-[11px] px-2 py-0.5 rounded bg-bg-tertiary text-text-primary/60 hover:text-text-primary border border-border transition-colors">
          새로 만들기
        </button>
      </div>

      {/* Date separator */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-text-primary/35">오늘</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
        {MESSAGES.map((msg) => (
          <div key={msg.id} className="flex gap-2.5">
            <div
              className={`w-8 h-8 rounded-full ${msg.bgClass} flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5`}
            >
              {msg.user[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[13px] font-semibold text-text-primary">{msg.user}</span>
                <span className="text-[11px] text-text-primary/35">{msg.time}</span>
              </div>
              <p className="text-[13px] text-text-primary/75 leading-relaxed break-words">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="px-3 pb-3 shrink-0">
        <div className="rounded-lg border border-border bg-bg-tertiary overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2">
            <button className="text-text-primary/35 hover:text-text-primary/60 transition-colors shrink-0">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button className="text-text-primary/35 hover:text-text-primary/60 transition-colors shrink-0">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
            <input
              className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-primary/25 outline-none"
              placeholder="팀원에게 메시지 보내기..."
            />
            <button className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white hover:opacity-80 transition-opacity shrink-0">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-text-primary/20 mt-1.5 text-center">
          ⌘ + Enter로 전송, Enter로 줄바꿈
        </p>
      </div>
    </div>
  )
}
