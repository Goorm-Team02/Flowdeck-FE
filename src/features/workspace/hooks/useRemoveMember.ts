import { useMutation, useQueryClient } from '@tanstack/react-query'

import { removeMember } from '../api/members'
import { memberKeys } from '../lib/queryKeys'
import type { Member } from '../types'

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: number) => removeMember(projectId, memberId),
    onSuccess: (_, memberId) => {
      queryClient.setQueryData<Member[]>(memberKeys.list(projectId), (prev = []) =>
        prev.filter((m) => m.memberId !== memberId),
      )
    },
  })
}
