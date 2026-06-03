import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAtomValue } from 'jotai'

import { currentUserAtom } from '@/features/auth/stores/currentUserAtom'
import { isApiError } from '@/shared/api/errors'
import { useDebounce } from '@/shared/hooks/useDebounce'

import { useChatSocket } from '../hooks/useChatSocket'
import { useDeleteMessage } from '../hooks/useDeleteMessage'
import { useMessageSearch } from '../hooks/useMessageSearch'
import { useMessages } from '../hooks/useMessages'
import { usePublishMessage } from '../hooks/usePublishMessage'

// VIEWER 권한 여부 — 추후 auth 연동 시 실제 권한으로 교체
const useIsViewer = () => false

const AVATAR_COLORS = [
  'bg-accent',
  'bg-purple-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-indigo-500',
]

function avatarColor(userId: number): string {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h >= 12 ? '오후' : '오전'} ${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m}`
}

function HighlightedText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-yellow-400/30 text-text-primary rounded-sm not-italic">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}


const EMOJIS = [
  '😀',
  '😄',
  '😊',
  '😍',
  '🥰',
  '😂',
  '😭',
  '🥲',
  '😅',
  '😬',
  '😎',
  '🤔',
  '🙄',
  '😴',
  '🤗',
  '😤',
  '🥳',
  '😇',
  '🤩',
  '😏',
  '🫠',
  '🙃',
  '🤯',
  '👍',
  '👎',
  '👏',
  '🙌',
  '🤝',
  '✌️',
  '👌',
  '💪',
  '❤️',
  '🔥',
  '💯',
  '✅',
  '❌',
  '⚡',
  '🎉',
  '🚀',
  '⭐',
  '💡',
  '🎯',
  '💎',
  '🧡',
  '💚',
  '💙',
  '🖤',
]

export default function ChatPanel() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const currentUser = useAtomValue(currentUserAtom)
  const currentUserId = currentUser?.numericId ?? null
  const isViewer = useIsViewer()

  const { data: messages = [], isLoading, isError } = useMessages(projectId)
  useChatSocket(projectId)
  const publishMessage = usePublishMessage(projectId)
  const { mutate: deleteMsg, isPending: isDeleting } = useDeleteMessage(projectId)

  const [input, setInput] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [searchOpen, setSearchOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)

  const {
    data: searchResults = [],
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useMessageSearch(projectId, debouncedKeyword)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isAtBottomRef = useRef(true)

  const handleScroll = () => {
    const el = messagesContainerRef.current
    if (!el) return
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const closeSearch = () => {
    setSearchOpen(false)
    setKeyword('')
  }

  const sendMessage = () => {
    const text = input.trim()
    if (!text || isViewer) return
    publishMessage(text)
    setInput('')
  }

  const handleDeleteConfirm = (messageId: number) => {
    deleteMsg(messageId, {
      onSuccess: () => setDeletingId(null),
      onError: (error) => {
        setDeletingId(null)
        if (isApiError(error) && error.status === 403) {
          setDeleteError('삭제 권한이 없습니다.')
        } else {
          setDeleteError('메시지 삭제 중 오류가 발생했습니다.')
        }
        setTimeout(() => setDeleteError(null), 3000)
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      if (e.metaKey || e.ctrlKey || !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    }
  }


  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji)
    setShowEmoji(false)
    inputRef.current?.focus()
  }

  const isSearchMode = searchOpen && debouncedKeyword.trim().length > 0

  return (
    <div className="w-72 flex flex-col bg-bg-secondary border-l border-border shrink-0">
      {/* 삭제 에러 토스트 */}
      {deleteError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-lg text-[13px] border bg-bg-secondary border-red-500/40 text-red-400">
          {deleteError}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-text-primary/40 font-bold text-sm">#</span>
          <span className="text-[13px] font-semibold text-text-primary">프로젝트 채팅</span>
        </div>
        <button
          onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          className={`transition-colors ${searchOpen ? 'text-accent' : 'text-text-primary/35 hover:text-text-primary/70'}`}
          title="메시지 검색"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* 검색 입력바 */}
      {searchOpen && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0 bg-bg-primary">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-primary/35 shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="메시지 검색..."
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-primary/30 outline-none"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="text-text-primary/35 hover:text-text-primary/70 transition-colors text-[16px] leading-none shrink-0"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* 검색 결과 */}
      {searchOpen && (
        <>
          {!debouncedKeyword.trim() && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[12px] text-text-primary/30">검색어를 입력하세요</p>
            </div>
          )}
          {debouncedKeyword.trim() && isSearchLoading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[12px] text-text-primary/30">검색 중...</p>
            </div>
          )}
          {debouncedKeyword.trim() && isSearchError && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[12px] text-red-400/70">검색 중 오류가 발생했습니다.</p>
            </div>
          )}
          {debouncedKeyword.trim() &&
            !isSearchLoading &&
            !isSearchError &&
            searchResults.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[12px] text-text-primary/30">일치하는 메시지가 없습니다.</p>
              </div>
            )}
          {isSearchMode && !isSearchLoading && !isSearchError && searchResults.length > 0 && (
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4 pt-3">
              <p className="text-[11px] text-text-primary/35 pb-1">
                검색 결과 {searchResults.length}건
              </p>
              {searchResults.map((msg) =>
                msg.messageType === 'LOG' ? (
                  <div key={msg.id} className="flex items-center gap-2 py-1">
                    <div className="w-3 h-px bg-border shrink-0" />
                    <span className="text-[11px] text-text-primary/35 text-center break-words flex-1">
                      <HighlightedText text={msg.content} keyword={debouncedKeyword} />
                    </span>
                    <div className="w-3 h-px bg-border shrink-0" />
                  </div>
                ) : (
                  <div key={msg.id} className="flex gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full ${avatarColor(msg.userId)} flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5`}
                    >
                      {msg.senderName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-[13px] font-semibold text-text-primary">
                          {msg.senderName}
                        </span>
                        <span className="text-[11px] text-text-primary/35">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-[13px] text-text-primary/75 leading-relaxed break-words">
                        <HighlightedText text={msg.content} keyword={debouncedKeyword} />
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </>
      )}

      {/* 일반 메시지 목록 */}
      {!searchOpen && (
        <>
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[12px] text-text-primary/30">불러오는 중...</p>
            </div>
          )}
          {isError && !isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[12px] text-red-400/70">메시지를 불러올 수 없습니다.</p>
            </div>
          )}
          {!isLoading && !isError && messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[12px] text-text-primary/30">아직 메시지가 없습니다.</p>
            </div>
          )}
          {!isLoading && !isError && messages.length > 0 && (
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 pb-3 space-y-4 pt-3"
            >
              {messages.map((msg) =>
                msg.messageType === 'LOG' ? (
                  <div key={msg.id} className="flex items-center gap-2 py-1">
                    <div className="w-3 h-px bg-border shrink-0" />
                    <span className="text-[11px] text-text-primary/35 text-center break-words flex-1">{msg.content}</span>
                    <div className="w-3 h-px bg-border shrink-0" />
                  </div>
                ) : (
                  <div key={msg.id} className="group flex gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full ${avatarColor(msg.userId)} flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5`}
                    >
                      {msg.senderName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-[13px] font-semibold text-text-primary">
                          {msg.senderName}
                        </span>
                        {currentUserId !== null && currentUserId !== -1 && currentUserId === msg.userId && (
                          <span className="text-[11px] text-text-primary/35">(나)</span>
                        )}
                        <span className="text-[11px] text-text-primary/35">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-[13px] text-text-primary/75 leading-relaxed break-words">
                        {msg.content}
                      </p>
                      {deletingId === msg.id && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-text-primary/50">삭제할까요?</span>
                          <button
                            onClick={() => handleDeleteConfirm(msg.id)}
                            disabled={isDeleting}
                            className="text-[11px] text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-[11px] text-text-primary/40 hover:text-text-primary/70 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      )}
                    </div>
                    {currentUserId !== null && currentUserId !== -1 && currentUserId === msg.userId && deletingId !== msg.id && (
                      <button
                        onClick={() => setDeletingId(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 p-0.5 rounded text-text-primary/30 hover:text-red-400 hover:bg-bg-tertiary"
                        title="메시지 삭제"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                ),
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </>
      )}

      {/* Input area */}
      <div className="px-3 pb-3 shrink-0">
        <div className="relative">
          {showEmoji && (
            <>
              <div className="fixed inset-0 z-[9]" onClick={() => setShowEmoji(false)} />
              <div className="absolute bottom-full left-0 mb-2 bg-bg-secondary border border-border rounded-xl p-3 shadow-2xl z-10 w-[252px]">
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
            </>
          )}

          <div className="rounded-lg border border-border bg-bg-tertiary overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2">
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
                disabled={isViewer}
                className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-primary/25 outline-none disabled:cursor-not-allowed"
                placeholder={isViewer ? '읽기 전용 모드' : '팀원에게 메시지 보내기...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isViewer}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-opacity shrink-0 ${
                  input.trim() && !isViewer
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

      </div>

    </div>
  )
}
