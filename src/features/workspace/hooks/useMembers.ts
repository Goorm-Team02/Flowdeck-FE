import { useQuery } from '@tanstack/react-query'

import { getMembers } from '../api/members'
import { memberKeys } from '../lib/queryKeys'

export function useMembers(projectId: string) {
  return useQuery({
    queryKey: memberKeys.list(projectId),
    queryFn: () => getMembers(projectId),
    enabled: !!projectId,
  })
}
