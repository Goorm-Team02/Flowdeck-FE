import { useQuery } from '@tanstack/react-query'

import { getMessages } from '../api/messages'
import { chatKeys } from '../lib/queryKeys'

export function useMessages(projectId: string) {
  return useQuery({
    queryKey: chatKeys.messages(projectId),
    queryFn: () => getMessages(projectId),
    enabled: !!projectId,
  })
}
