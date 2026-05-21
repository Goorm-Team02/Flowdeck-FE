import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { memberModalOpenAtom } from '../stores/memberModalAtom'

type Role = 'OWNER' | 'EDITOR' | 'VIEWER'

interface Member {
  id: string
  name: string
  email: string
  role: Role
  color: string
  initials: string
}

const INITIAL_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Jiwoo Seo',
    email: 'jiwoo@codenest.io',
    role: 'OWNER',
    color: 'bg-teal-500',
    initials: 'Ji',
  },
  {
    id: '2',
    name: 'Minseo Kim',
    email: 'minseo@codenest.io',
    role: 'EDITOR',
    color: 'bg-pink-500',
    initials: 'Mi',
  },
  {
    id: '3',
    name: 'Hyun Lee',
    email: 'hyun@codenest.io',
    role: 'EDITOR',
    color: 'bg-green-500',
    initials: 'Hy',
  },
  {
    id: '4',
    name: 'Suji Park',
    email: 'suji@codenest.io',
    role: 'VIEWER',
    color: 'bg-orange-500',
    initials: 'Su',
  },
]

const AVATAR_COLORS = [
  'bg-purple-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
]

function RoleSelect({
  value,
  onChange,
}: {
  value: 'EDITOR' | 'VIEWER'
  onChange: (v: 'EDITOR' | 'VIEWER') => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'EDITOR' | 'VIEWER')}
        className="appearance-none bg-bg-tertiary border border-border rounded-lg pl-3 pr-7 py-1.5 text-[12px] text-text-primary/80 outline-none cursor-pointer hover:border-text-primary/30 transition-colors"
      >
        <option value="EDITOR">EDITOR</option>
        <option value="VIEWER">VIEWER</option>
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-primary/40 pointer-events-none"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}

export default function MemberModal() {
  const [isOpen, setIsOpen] = useAtom(memberModalOpenAtom)
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR')
  const [colorIdx, setColorIdx] = useState(0)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  const handleInvite = () => {
    const email = inviteEmail.trim()
    if (!email || !email.includes('@')) return
    const rawName = email.split('@')[0]
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1)
    const initials = rawName.slice(0, 2)
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        email,
        role: inviteRole,
        color: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
        initials,
      },
    ])
    setColorIdx((i) => i + 1)
    setInviteEmail('')
  }

  const updateRole = (id: string, role: 'EDITOR' | 'VIEWER') => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
  }

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

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

        {/* Invite */}
        <div className="px-6 pb-5">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-primary/30 outline-none focus:border-accent/60 transition-colors min-w-0"
              placeholder="이메일로 멤버 초대"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInvite()
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
              onClick={handleInvite}
              className="shrink-0 px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              초대
            </button>
          </div>
        </div>

        {/* Member list */}
        <div className="px-6 pb-4">
          <p className="text-[12px] text-text-primary/45 mb-2.5">현재 멤버 ({members.length})</p>
          <div className="border border-border rounded-lg overflow-hidden max-h-[260px] overflow-y-auto">
            {members.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  index < members.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full ${member.color} flex items-center justify-center text-white text-[12px] font-bold shrink-0`}
                >
                  {member.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-text-primary truncate">
                      {member.name}
                    </span>
                    {member.role === 'OWNER' && (
                      <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-medium">
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-text-primary/40 truncate">{member.email}</p>
                </div>

                {/* Controls */}
                {member.role === 'OWNER' ? (
                  <span className="text-[12px] text-text-primary/25 shrink-0">변경 불가</span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <RoleSelect
                      value={member.role as 'EDITOR' | 'VIEWER'}
                      onChange={(role) => updateRole(member.id, role)}
                    />
                    <button
                      onClick={() => removeMember(member.id)}
                      title="멤버 제거"
                      className="p-1 text-text-primary/30 hover:text-red-400 transition-colors"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
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
