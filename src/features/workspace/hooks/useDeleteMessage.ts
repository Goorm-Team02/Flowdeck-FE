import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { ProjectMessage } from '@/shared/socket/types'

import { deleteMessage } from '../api/messages'
import { chatKeys } from '../lib/queryKeys'

export function useDeleteMessage(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: number) => deleteMessage(projectId, messageId),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData<ProjectMessage[]>(
        chatKeys.messages(projectId),
        (prev) => prev?.filter((m) => m.id !== messageId) ?? [],
      )
    },
  })
}
