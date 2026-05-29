import type { Member, MemberRole } from '../types'
import { useMembers } from './useMembers'

// 현재 사용자 ID — 추후 auth 연동 시 실제 값으로 교체
const getCurrentUserId = () => null as string | null

export function useCurrentMemberRole(projectId: string): MemberRole | null {
  const currentUserId = getCurrentUserId()
  const { data: members = [] } = useMembers(projectId)
  if (!currentUserId) return null
  return members.find((m) => m.userId === currentUserId)?.role ?? null
}

export function isLastOwner(members: Member[], userId: string | null): boolean {
  if (!userId) return false
  const owners = members.filter((m) => m.role === 'OWNER')
  return owners.length === 1 && owners[0].userId === userId
}
