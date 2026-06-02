import { useAtomValue } from 'jotai'

import { currentUserAtom } from '@/features/auth/stores/currentUserAtom'

import type { Member, MemberRole } from '../types'
import { useMembers } from './useMembers'

export function useCurrentMemberRole(projectId: string): MemberRole | null {
  const currentUser = useAtomValue(currentUserAtom)
  const { data: members = [] } = useMembers(projectId)
  if (!currentUser) return null
  return members.find((m) => m.userId === currentUser.userId)?.role ?? null
}

export function isLastOwner(members: Member[], userId: string | null): boolean {
  if (!userId) return false
  const owners = members.filter((m) => m.role === 'OWNER')
  return owners.length === 1 && owners[0].userId === userId
}
