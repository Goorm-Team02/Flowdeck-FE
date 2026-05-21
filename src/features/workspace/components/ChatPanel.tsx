import { useEffect, useRef, useState } from 'react'

interface AttachedFile {
  name: string
  size: string
}

interface ChatMessage {
  id: number
  user: string
  bgClass: string
  time: string
  text: string
  isMe?: boolean
  file?: AttachedFile
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    user: '민서',
    bgClass: 'bg-purple-500',
    time: '오전 10:21',
    text: 'Editor.jsx에서 Yjs 적용한 부분 한번 봐주세요. v4 슬라이드에서 변경 내역 확인 가능해요.',
  },
  {
    id: 2,
    user: '현우',
    bgClass: 'bg-accent',
    time: '오전 10:24',
    text: '확인했어요 👍 WebSocket 연결 부분은 제가 어제 푸시한 거랑 잘 합쳐졌네요.',
  },
  {
    id: 3,
    user: '지우',
    bgClass: 'bg-green-500',
    time: '오전 10:30',
    isMe: true,
    text: '좋아요. 그럼 오늘 회의 전까지 v5에서 useRef로 ydoc 메모리 누수 막는 부분만 정리하고 머지할게요.',
  },
  {
    id: 4,
    user: '수지',
    bgClass: 'bg-orange-500',
    time: '오전 10:32',
    text: '저는 README 업데이트 맡을게요!',
  },
]

const EMOJIS = [
  '😀', '😄', '😊', '😍', '🥰', '😂', '😭', '🥲',
  '😅', '😬', '😎', '🤔', '🙄', '😴', '🤗', '😤',
  '🥳', '😇', '🤩', '😏', '🫠', '🙃', '😤', '🤯',
  '👍', '👎', '👏', '🙌', '🤝', '✌️', '👌', '💪',
  '❤️', '🔥', '💯', '✅', '❌', '⚡', '🎉', '🚀',
  '⭐', '💡', '🎯', '💎', '🧡', '💚', '💙', '🖤',
]

const ONLINE_COUNT = 4

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function getNow(): string {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes().toString().padStart(2, '0')
  return `${h >= 12 ? '오후' : '오전'} ${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m}`
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!showEmoji) return
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEmoji])

  const sendMessage = () => {
    const text = input.trim()
    if (!text && !attachedFile) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: '지우',
        bgClass: 'bg-green-500',
        time: getNow(),
        isMe: true,
        text,
        file: attachedFile ?? undefined,
      },
    ])
    setInput('')
    setAttachedFile(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey || !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile({ name: file.name, size: formatFileSize(file.size) })
    }
    e.target.value = ''
    inputRef.current?.focus()
  }

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji)
    setShowEmoji(false)
    inputRef.current?.focus()
  }

  return (
    <div className="w-72 flex flex-col bg-bg-secondary border-l border-border shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-text-primary/40 font-bold text-sm">#</span>
          <span className="text-[13px] font-semibold text-text-primary">프로젝트 채팅</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          <span className="text-[12px] text-text-primary/50">{ONLINE_COUNT}명 온라인</span>
        </div>
      </div>

      {/* Date separator */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-text-primary/35">오늘</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2.5">
            <div
              className={`w-8 h-8 rounded-full ${msg.bgClass} flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5`}
            >
              {msg.user[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
                <span className="text-[13px] font-semibold text-text-primary">{msg.user}</span>
                {msg.isMe && (
                  <span className="text-[11px] text-text-primary/35">(나)</span>
                )}
                <span className="text-[11px] text-text-primary/35">{msg.time}</span>
              </div>
              {msg.text && (
                <p className="text-[13px] text-text-primary/75 leading-relaxed break-words">
                  {msg.text}
                </p>
              )}
              {msg.file && (
                <div className="mt-1 flex items-center gap-1.5 bg-bg-tertiary border border-border rounded px-2 py-1.5 w-fit max-w-full">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-text-primary/50 shrink-0"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-[12px] text-text-primary/70 truncate">{msg.file.name}</span>
                  <span className="text-[11px] text-text-primary/35 shrink-0">{msg.file.size}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-3 pb-3 shrink-0">
        <div className="relative">
          {/* Emoji picker */}
          {showEmoji && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full left-0 mb-2 bg-bg-secondary border border-border rounded-xl p-3 shadow-2xl z-10 w-[252px]"
            >
              <div className="grid grid-cols-8 gap-0.5">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-[18px] w-7 h-7 flex items-center justify-center hover:bg-bg-tertiary rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-bg-tertiary overflow-hidden">
            {/* File preview */}
            {attachedFile && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-text-primary/50 shrink-0"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-[12px] text-text-primary/70 flex-1 truncate">
                  {attachedFile.name}
                </span>
                <span className="text-[11px] text-text-primary/35 shrink-0">{attachedFile.size}</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-text-primary/35 hover:text-text-primary/70 transition-colors leading-none ml-1"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2">
              {/* File attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-text-primary/35 hover:text-text-primary/60 transition-colors shrink-0"
                title="파일 첨부"
              >
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

              {/* Emoji */}
              <button
                onClick={() => setShowEmoji((v) => !v)}
                className={`transition-colors shrink-0 ${showEmoji ? 'text-text-primary/70' : 'text-text-primary/35 hover:text-text-primary/60'}`}
                title="이모지"
              >
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
                ref={inputRef}
                className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-primary/25 outline-none"
                placeholder="팀원에게 메시지 보내기..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              {/* Send */}
              <button
                onClick={sendMessage}
                disabled={!input.trim() && !attachedFile}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-opacity shrink-0 ${
                  input.trim() || attachedFile
                    ? 'bg-accent hover:opacity-80'
                    : 'bg-accent/30 cursor-not-allowed'
                }`}
                title="전송"
              >
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
        </div>

        <p className="text-[10px] text-text-primary/20 mt-1.5 text-center">
          ⌘ + Enter로 전송, @멘션 가능
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
