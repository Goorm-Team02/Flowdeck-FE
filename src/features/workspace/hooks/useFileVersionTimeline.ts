import { useQuery } from '@tanstack/react-query'

import { getFileVersionTimeline } from '../api/fileVersions'
import { fileVersionKeys } from '../lib/queryKeys'

export function useFileVersionTimeline(projectId: string, fileId: number | null) {
  return useQuery({
    queryKey: fileVersionKeys.timeline(projectId, fileId ?? 0),
    queryFn: () => getFileVersionTimeline(projectId, fileId!),
    enabled: !!fileId,
  })
}
