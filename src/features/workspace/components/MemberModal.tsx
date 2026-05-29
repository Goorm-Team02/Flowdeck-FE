import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAtom } from 'jotai'

import { useCurrentMemberRole } from '../hooks/useCurrentMemberRole'
import { useMembers } from '../hooks/useMembers'
import { memberModalOpenAtom } from '../stores/memberModalAtom'
import type { MemberRole } from '../types'

// 현재 사용자 ID — 추후 auth 연동 시 실제 값으로 교체
const useCurrentUserId = () => null as string | null

const AVATAR_COLORS = [
  'bg-teal-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-green-500',
  'bg-orange-500',
]

function avatarColor(memberId: number): string {
  return AVATAR_COLORS[memberId % AVATAR_COLORS.length]
}

const ROLE_BADGE: Record<MemberRole, { label: string; className: string }> = {
  OWNER: {
    label: 'Owner',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  EDITOR: {
    label: 'Editor',
    className: 'bg-accent/15 text-accent border-accent/30',
  },
  VIEWER: {
    label: 'Viewer',
    className: 'bg-text-primary/10 text-text-primary/50 border-text-primary/20',
  },
}

function RoleBadge({ role }: { role: MemberRole }) {
  const { label, className } = ROLE_BADGE[role]
  return (
    <span className={`shrink-0 text-[11px] px-1.5 py-0.5 rounded border font-medium ${className}`}>
      {label}
    </span>
  )
}

export default function MemberModal() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const [isOpen, setIsOpen] = useAtom(memberModalOpenAtom)
  const currentUserId = useCurrentUserId()
  const currentRole = useCurrentMemberRole(projectId)
  const isOwner = currentRole === 'OWNER'

  const { data: members = [], isLoading, isError } = useMembers(projectId)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR')

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false)
      }}
    >
      <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-[540px] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
              <span>👑</span>
              <span>멤버 관리</span>
            </h2>
            <p className="text-[13px] text-text-primary/45 mt-1">
              OWNER만 멤버를 초대하거나 권한을 변경할 수 있어요.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-primary/35 hover:text-text-primary/70 transition-colors text-[20px] leading-none mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Invite (OWNER only) */}
        {isOwner && (
          <div className="px-6 pb-5">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-primary/30 outline-none focus:border-accent/60 transition-colors min-w-0"
                placeholder="이메일로 멤버 초대"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setInviteEmail('')
                }}
              />
              <div className="relative shrink-0">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'EDITOR' | 'VIEWER')}
                  className="appearance-none bg-bg-tertiary border border-border rounded-lg pl-3 pr-7 py-2 text-[13px] text-text-primary/80 outline-none cursor-pointer hover:border-text-primary/30 transition-colors"
                >
                  <option value="EDITOR">EDITOR</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-primary/40 pointer-events-none"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <button
                onClick={() => setInviteEmail('')}
                className="shrink-0 px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                초대
              </button>
            </div>
          </div>
        )}

        {/* Member list */}
        <div className="px-6 pb-4">
          <p className="text-[12px] text-text-primary/45 mb-2.5">
            현재 멤버 ({isLoading ? '…' : members.length})
          </p>

          {isLoading && (
            <div className="flex items-center justify-center py-8 border border-border rounded-lg">
              <p className="text-[13px] text-text-primary/30">불러오는 중...</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex items-center justify-center py-8 border border-border rounded-lg">
              <p className="text-[13px] text-red-400/70">멤버 목록을 불러올 수 없습니다.</p>
            </div>
          )}

          {!isLoading && !isError && members.length === 0 && (
            <div className="flex items-center justify-center py-8 border border-border rounded-lg">
              <p className="text-[13px] text-text-primary/30">멤버가 없습니다.</p>
            </div>
          )}

          {!isLoading && !isError && members.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden max-h-[260px] overflow-y-auto">
              {members.map((member, index) => (
                <div
                  key={member.memberId}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    index < members.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full ${avatarColor(member.memberId)} flex items-center justify-center text-white text-[12px] font-bold shrink-0`}
                  >
                    {member.name.slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[13px] font-medium text-text-primary truncate">
                        {member.name}
                      </span>
                      {currentUserId === member.userId && (
                        <span className="shrink-0 text-[11px] text-text-primary/35">(나)</span>
                      )}
                    </div>
                    <p className="text-[12px] text-text-primary/40 truncate">{member.email}</p>
                  </div>

                  {/* Role badge */}
                  <RoleBadge role={member.role} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-border">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 text-[13px] text-text-primary/60 hover:text-text-primary transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
