import { useMutation, useQueryClient } from '@tanstack/react-query'

import { renameFile } from '../api/files'
import { fileTreeKeys } from '../lib/queryKeys'

interface RenameFileVariables {
  fileId: number
  name: string
}

export function useRenameFile(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, name }: RenameFileVariables) => renameFile(projectId, fileId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.all(projectId) })
    },
  })
}
