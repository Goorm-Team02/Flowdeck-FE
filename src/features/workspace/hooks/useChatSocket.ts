import { useQueryClient } from '@tanstack/react-query'

import { useSubscription } from '@/shared/hooks/useSubscription'
import type { ProjectMessage, ProjectMessageEventResponse } from '@/shared/socket/types'
import { TOPICS } from '@/shared/socket/types'

import { chatKeys } from '../lib/queryKeys'

export function useChatSocket(projectId: string) {
  const queryClient = useQueryClient()

  useSubscription(TOPICS.MESSAGES(projectId), (msg) => {
    const event: ProjectMessageEventResponse = JSON.parse(msg.body)

    if (event.eventType === 'CREATED' && event.message) {
      const newMsg = event.message
      queryClient.setQueryData<ProjectMessage[]>(chatKeys.messages(projectId), (prev) => {
        const msgs = prev ?? []
        if (msgs.some((m) => m.id === newMsg.id)) return msgs
        return [...msgs, newMsg]
      })
    } else if (event.eventType === 'DELETED') {
      queryClient.setQueryData<ProjectMessage[]>(
        chatKeys.messages(projectId),
        (prev) => prev?.filter((m) => m.id !== event.messageId) ?? [],
      )
    }
  })
}
