import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateMemberRole } from '../api/members'
import { memberKeys } from '../lib/queryKeys'
import type { Member, MemberRole } from '../types'

export function useUpdateMemberRole(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: MemberRole }) =>
      updateMemberRole(projectId, memberId, role),
    onSuccess: (updated: Member) => {
      queryClient.setQueryData<Member[]>(memberKeys.list(projectId), (prev = []) =>
        prev.map((m) => (m.memberId === updated.memberId ? updated : m)),
      )
    },
  })
}
