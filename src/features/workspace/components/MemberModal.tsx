import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAtom } from 'jotai'

import { isApiError, isNetworkError } from '@/shared/api/errors'

import { isLastOwner, useCurrentMemberRole } from '../hooks/useCurrentMemberRole'
import { useInviteMember } from '../hooks/useInviteMember'
import { useLeaveProject } from '../hooks/useLeaveProject'
import { useMembers } from '../hooks/useMembers'
import { useRemoveMember } from '../hooks/useRemoveMember'
import { useUpdateMemberRole } from '../hooks/useUpdateMemberRole'
import { memberModalOpenAtom } from '../stores/memberModalAtom'
import type { Member, MemberRole } from '../types'

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

function resolveInviteError(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 409) return '이미 프로젝트 멤버입니다.'
    if (error.status === 404) return '존재하지 않는 이메일입니다.'
    if (error.status === 403) return '초대 권한이 없습니다.'
  }
  if (isNetworkError(error)) return error.message
  return '초대에 실패했습니다. 다시 시도해 주세요.'
}

function resolveRoleError(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 403) {
      if (error.code === 'LAST_OWNER_CONSTRAINT') return '마지막 OWNER의 권한은 변경할 수 없습니다.'
      return '권한 변경 권한이 없습니다.'
    }
  }
  if (isNetworkError(error)) return error.message
  return '권한 변경에 실패했습니다. 다시 시도해 주세요.'
}

function resolveRemoveError(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 403) return '멤버를 제거할 권한이 없습니다.'
  }
  if (isNetworkError(error)) return error.message
  return '멤버 제거에 실패했습니다. 다시 시도해 주세요.'
}

function resolveLeaveError(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 403) {
      if (error.code === 'LAST_OWNER_CONSTRAINT')
        return '마지막 OWNER는 나갈 수 없습니다. 권한을 다른 멤버에게 위임해 주세요.'
      return '나가기 권한이 없습니다.'
    }
  }
  if (isNetworkError(error)) return error.message
  return '나가기에 실패했습니다. 다시 시도해 주세요.'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type PendingRoleChange = { memberId: number; newRole: MemberRole }

export default function MemberModal() {
  const { projectId = '' } = useParams<{ projectId: string }>()
  const [isOpen, setIsOpen] = useAtom(memberModalOpenAtom)
  const currentUserId = useCurrentUserId()
  const currentRole = useCurrentMemberRole(projectId)
  const isOwner = currentRole === 'OWNER'

  const { data: members = [], isLoading, isError } = useMembers(projectId)
  const inviteMutation = useInviteMember(projectId)
  const updateRoleMutation = useUpdateMemberRole(projectId)
  const removeMutation = useRemoveMember(projectId)
  const leaveMutation = useLeaveProject(projectId)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR')
  const [emailError, setEmailError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const [pendingChange, setPendingChange] = useState<PendingRoleChange | null>(null)
  const [roleChangeError, setRoleChangeError] = useState('')

  const [pendingRemove, setPendingRemove] = useState<number | null>(null)
  const [removeError, setRemoveError] = useState('')

  const [confirmLeave, setConfirmLeave] = useState(false)
  const [leaveError, setLeaveError] = useState('')

  const ownerCount = members.filter((m) => m.role === 'OWNER').length
  const canLeave = !isLastOwner(members, currentUserId)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  function handleInvite() {
    const email = inviteEmail.trim()
    if (!EMAIL_RE.test(email)) {
      setEmailError('유효한 이메일 주소를 입력해 주세요.')
      return
    }
    setEmailError('')
    setInviteSuccess(false)
    inviteMutation.mutate(
      { email, role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail('')
          setInviteSuccess(true)
        },
        onError: () => setInviteSuccess(false),
      },
    )
  }

  function handleRoleSelectChange(member: Member, newRole: MemberRole) {
    if (newRole === member.role) return
    setPendingChange({ memberId: member.memberId, newRole })
    setPendingRemove(null)
    setRoleChangeError('')
    updateRoleMutation.reset()
  }

  function confirmRoleChange() {
    if (!pendingChange) return
    updateRoleMutation.mutate(
      { memberId: pendingChange.memberId, role: pendingChange.newRole },
      {
        onSuccess: () => setPendingChange(null),
        onError: (err) => setRoleChangeError(resolveRoleError(err)),
      },
    )
  }

  function cancelRoleChange() {
    setPendingChange(null)
    setRoleChangeError('')
    updateRoleMutation.reset()
  }

  function getSelectValue(member: Member): MemberRole {
    if (pendingChange?.memberId === member.memberId) return pendingChange.newRole
    return member.role
  }

  function handleRemoveClick(memberId: number) {
    setPendingRemove(memberId)
    setPendingChange(null)
    setRemoveError('')
    removeMutation.reset()
  }

  function confirmRemove() {
    if (pendingRemove === null) return
    removeMutation.mutate(pendingRemove, {
      onSuccess: () => setPendingRemove(null),
      onError: (err) => setRemoveError(resolveRemoveError(err)),
    })
  }

  function cancelRemove() {
    setPendingRemove(null)
    setRemoveError('')
    removeMutation.reset()
  }

  function handleLeaveClick() {
    setConfirmLeave(true)
    setLeaveError('')
    leaveMutation.reset()
  }

  function confirmLeaveProject() {
    leaveMutation.mutate(undefined, {
      onError: (err) => setLeaveError(resolveLeaveError(err)),
    })
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

        {/* Invite (OWNER only) */}
        {isOwner && (
          <div className="px-6 pb-5">
            <div className="flex gap-2">
              <input
                className={`flex-1 bg-bg-tertiary border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-primary/30 outline-none transition-colors min-w-0 ${
                  emailError
                    ? 'border-red-500/60 focus:border-red-500/80'
                    : 'border-border focus:border-accent/60'
                }`}
                placeholder="이메일로 멤버 초대"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value)
                  setEmailError('')
                  setInviteSuccess(false)
                  inviteMutation.reset()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInvite()
                }}
                disabled={inviteMutation.isPending}
              />
              <div className="relative shrink-0">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'EDITOR' | 'VIEWER')}
                  className="appearance-none bg-bg-tertiary border border-border rounded-lg pl-3 pr-7 py-2 text-[13px] text-text-primary/80 outline-none cursor-pointer hover:border-text-primary/30 transition-colors"
                  disabled={inviteMutation.isPending}
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
                disabled={inviteMutation.isPending}
                className="shrink-0 px-4 py-2 bg-accent text-white text-[13px] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteMutation.isPending ? '초대 중…' : '초대'}
              </button>
            </div>

            {emailError && <p className="mt-2 text-[12px] text-red-400">{emailError}</p>}
            {!emailError && inviteMutation.isError && (
              <p className="mt-2 text-[12px] text-red-400">
                {resolveInviteError(inviteMutation.error)}
              </p>
            )}
            {inviteSuccess && (
              <p className="mt-2 text-[12px] text-green-400">멤버를 초대했습니다.</p>
            )}
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
            <div className="border border-border rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
              {members.map((member, index) => {
                const isLastOwnerMember = member.role === 'OWNER' && ownerCount === 1
                const isSelf = currentUserId === member.userId
                const hasPendingRole = pendingChange?.memberId === member.memberId
                const hasPendingRemove = pendingRemove === member.memberId
                const isRoleMutating = updateRoleMutation.isPending && hasPendingRole
                const isRemoveMutating = removeMutation.isPending && hasPendingRemove
                const isAnyPending = pendingChange !== null || pendingRemove !== null

                return (
                  <div key={member.memberId}>
                    {/* Member row */}
                    <div
                      className={`group flex items-center gap-3 px-4 py-3 ${
                        index < members.length - 1 && !hasPendingRole && !hasPendingRemove
                          ? 'border-b border-border'
                          : ''
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
                          {isSelf && (
                            <span className="shrink-0 text-[11px] text-text-primary/35">(나)</span>
                          )}
                        </div>
                        <p className="text-[12px] text-text-primary/40 truncate">{member.email}</p>
                      </div>

                      {/* Role: select for OWNER, badge otherwise */}
                      {isOwner ? (
                        <div className="relative shrink-0">
                          <select
                            value={getSelectValue(member)}
                            onChange={(e) =>
                              handleRoleSelectChange(member, e.target.value as MemberRole)
                            }
                            disabled={isLastOwnerMember || isRoleMutating || isAnyPending}
                            title={
                              isLastOwnerMember
                                ? '마지막 OWNER의 권한은 변경할 수 없어요'
                                : undefined
                            }
                            className="appearance-none bg-bg-tertiary border border-border rounded-lg pl-2.5 pr-6 py-1 text-[12px] text-text-primary/80 outline-none cursor-pointer hover:border-text-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                          <svg
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-primary/40 pointer-events-none"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}

                      {/* Remove button (OWNER only, not self) */}
                      {isOwner && !isSelf && (
                        <button
                          onClick={() => handleRemoveClick(member.memberId)}
                          disabled={isAnyPending}
                          title="멤버 제거"
                          className="shrink-0 ml-1 p-1 text-text-primary/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:pointer-events-none"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Role change confirm bar */}
                    {hasPendingRole && (
                      <div
                        className={`px-4 py-3 bg-bg-tertiary/60 ${
                          index < members.length - 1 ? 'border-b border-border' : ''
                        }`}
                      >
                        <p className="text-[12px] text-text-primary/70">
                          <span className="font-medium text-text-primary">{member.name}</span>의
                          권한을{' '}
                          <span className="font-medium text-text-primary">
                            {pendingChange.newRole}
                          </span>
                          으로 변경합니다.
                        </p>
                        <p className="text-[11px] text-amber-400/80 mt-0.5">
                          ⚠ 변경 시 해당 사용자가 강제 로그아웃됩니다.
                        </p>
                        {roleChangeError && (
                          <p className="text-[11px] text-red-400 mt-1">{roleChangeError}</p>
                        )}
                        <div className="flex gap-2 mt-2.5">
                          <button
                            onClick={cancelRoleChange}
                            disabled={isRoleMutating}
                            className="px-3 py-1 text-[12px] text-text-primary/50 hover:text-text-primary border border-border rounded-md transition-colors disabled:opacity-40"
                          >
                            취소
                          </button>
                          <button
                            onClick={confirmRoleChange}
                            disabled={isRoleMutating}
                            className="px-3 py-1 text-[12px] text-white bg-accent rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRoleMutating ? '변경 중…' : '확인'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Remove confirm bar */}
                    {hasPendingRemove && (
                      <div
                        className={`px-4 py-3 bg-bg-tertiary/60 ${
                          index < members.length - 1 ? 'border-b border-border' : ''
                        }`}
                      >
                        <p className="text-[12px] text-text-primary/70">
                          <span className="font-medium text-text-primary">{member.name}</span>을(를)
                          프로젝트에서 제거합니다.
                        </p>
                        {removeError && (
                          <p className="text-[11px] text-red-400 mt-1">{removeError}</p>
                        )}
                        <div className="flex gap-2 mt-2.5">
                          <button
                            onClick={cancelRemove}
                            disabled={isRemoveMutating}
                            className="px-3 py-1 text-[12px] text-text-primary/50 hover:text-text-primary border border-border rounded-md transition-colors disabled:opacity-40"
                          >
                            취소
                          </button>
                          <button
                            onClick={confirmRemove}
                            disabled={isRemoveMutating}
                            className="px-3 py-1 text-[12px] text-white bg-red-500 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRemoveMutating ? '제거 중…' : '제거'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          {/* Leave project */}
          {confirmLeave ? (
            <div className="flex-1">
              <p className="text-[12px] text-text-primary/70 mb-1">프로젝트에서 나가시겠습니까?</p>
              {leaveError && <p className="text-[11px] text-red-400 mb-1">{leaveError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setConfirmLeave(false)
                    setLeaveError('')
                    leaveMutation.reset()
                  }}
                  disabled={leaveMutation.isPending}
                  className="px-3 py-1 text-[12px] text-text-primary/50 hover:text-text-primary border border-border rounded-md transition-colors disabled:opacity-40"
                >
                  취소
                </button>
                <button
                  onClick={confirmLeaveProject}
                  disabled={leaveMutation.isPending}
                  className="px-3 py-1 text-[12px] text-white bg-red-500 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {leaveMutation.isPending ? '나가는 중…' : '나가기'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLeaveClick}
              disabled={!canLeave}
              title={!canLeave ? '권한을 다른 멤버에게 위임 후 나갈 수 있습니다.' : undefined}
              className="text-[13px] text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              프로젝트 나가기
            </button>
          )}

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
