import { useMutation, useQueryClient } from '@tanstack/react-query'

import { restoreFileVersion } from '../api/fileVersions'
import { fileTreeKeys, fileVersionKeys } from '../lib/queryKeys'

export function useRestoreFileVersion(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fileId, versionId }: { fileId: number; versionId: number }) =>
      restoreFileVersion(projectId, fileId, versionId),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.detail(projectId, fileId) })
      queryClient.invalidateQueries({ queryKey: fileVersionKeys.all(projectId, fileId) })
    },
  })
}
