import { useQuery } from '@tanstack/react-query'

import { getFileVersions } from '../api/fileVersions'
import { fileVersionKeys } from '../lib/queryKeys'

export function useFileVersions(projectId: string, fileId: number | null) {
  return useQuery({
    queryKey: fileVersionKeys.all(projectId, fileId ?? 0),
    queryFn: () => getFileVersions(projectId, fileId!),
    enabled: !!fileId,
  })
}
