import { useMutation, useQueryClient } from '@tanstack/react-query'

import { restoreFileVersion } from '../api/fileVersions'
import { fileTreeKeys, fileVersionKeys } from '../lib/queryKeys'

export function useRestoreFileVersion(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      fileId,
      versionId,
      baseRevision,
    }: {
      fileId: number
      versionId: number
      baseRevision: number
    }) => restoreFileVersion(projectId, fileId, versionId, baseRevision),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.all(projectId) })
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.detail(projectId, fileId) })
      queryClient.invalidateQueries({ queryKey: fileVersionKeys.all(projectId, fileId) })
    },
  })
}
