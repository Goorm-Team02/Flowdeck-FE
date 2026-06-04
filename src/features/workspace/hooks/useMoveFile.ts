import { useMutation, useQueryClient } from '@tanstack/react-query'

import { moveFile } from '../api/files'
import { fileTreeKeys } from '../lib/queryKeys'

interface MoveFileVariables {
  fileId: number
  newParentId: number | null
}

export function useMoveFile(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, newParentId }: MoveFileVariables) =>
      moveFile(projectId, fileId, newParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.all(projectId) })
    },
  })
}
