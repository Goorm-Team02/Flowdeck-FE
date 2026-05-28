import { useQuery } from '@tanstack/react-query'

import { getFileTree } from '../api/fileTree'
import { fileTreeKeys } from '../lib/queryKeys'

export function useFileTree(projectId: string) {
  return useQuery({
    queryKey: fileTreeKeys.all(projectId),
    queryFn: () => getFileTree(projectId),
    enabled: !!projectId,
  })
}
