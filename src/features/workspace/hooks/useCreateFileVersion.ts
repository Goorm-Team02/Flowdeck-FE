import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createFileVersion } from '../api/fileVersions'
import { fileVersionKeys } from '../lib/queryKeys'

interface CreateVersionVariables {
  fileId: number
  changeMessage: string
}

export function useCreateFileVersion(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, changeMessage }: CreateVersionVariables) =>
      createFileVersion(projectId, fileId, changeMessage),
    onSuccess: (_data, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: fileVersionKeys.all(projectId, fileId) })
    },
  })
}
