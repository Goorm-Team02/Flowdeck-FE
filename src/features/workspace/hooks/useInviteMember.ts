import { useMutation, useQueryClient } from '@tanstack/react-query'

import { inviteMember } from '../api/members'
import { memberKeys } from '../lib/queryKeys'
import type { Member } from '../types'

export function useInviteMember(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'EDITOR' | 'VIEWER' }) =>
      inviteMember(projectId, email, role),
    onSuccess: (newMember: Member) => {
      queryClient.setQueryData<Member[]>(memberKeys.list(projectId), (prev = []) => {
        if (prev.some((m) => m.memberId === newMember.memberId)) return prev
        return [...prev, newMember]
      })
    },
  })
}
