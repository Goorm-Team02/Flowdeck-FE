import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createFileVersion } from '../api/fileVersions'
import { fileVersionKeys } from '../lib/queryKeys'

export function useCreateFileVersion(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fileId: number) => createFileVersion(projectId, fileId),
    onSuccess: (_data, fileId) => {
      queryClient.invalidateQueries({ queryKey: fileVersionKeys.all(projectId, fileId) })
    },
  })
}
