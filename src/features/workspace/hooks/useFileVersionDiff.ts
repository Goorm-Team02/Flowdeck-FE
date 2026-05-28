import { useQuery } from '@tanstack/react-query'

import { getFileVersionDiff } from '../api/fileVersions'
import { fileVersionKeys } from '../lib/queryKeys'

export function useFileVersionDiff(
  projectId: string,
  fileId: number | null,
  from: number | null,
  to: number | null,
) {
  return useQuery({
    queryKey: fileVersionKeys.diff(projectId, fileId ?? 0, from ?? 0, to ?? 0),
    queryFn: () => getFileVersionDiff(projectId, fileId!, from!, to!),
    enabled: !!fileId && !!from && !!to,
  })
}
