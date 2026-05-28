import { useQuery } from '@tanstack/react-query'

import { getFileVersion } from '../api/fileVersions'
import { fileVersionKeys } from '../lib/queryKeys'

export function useFileVersion(
  projectId: string,
  fileId: number | null,
  versionId: number | null,
) {
  return useQuery({
    queryKey: fileVersionKeys.detail(projectId, fileId ?? 0, versionId ?? 0),
    queryFn: () => getFileVersion(projectId, fileId!, versionId!),
    enabled: !!fileId && !!versionId,
  })
}
