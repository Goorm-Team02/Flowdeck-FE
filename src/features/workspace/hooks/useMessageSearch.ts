import { useQuery } from '@tanstack/react-query'

import { searchMessages } from '../api/messages'
import { chatKeys } from '../lib/queryKeys'

export function useMessageSearch(projectId: string, keyword: string) {
  return useQuery({
    queryKey: chatKeys.search(projectId, keyword),
    queryFn: () => searchMessages(projectId, keyword),
    enabled: !!projectId && keyword.trim().length > 0,
  })
}
