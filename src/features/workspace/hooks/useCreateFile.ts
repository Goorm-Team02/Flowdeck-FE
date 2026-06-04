import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createFile } from '../api/files'
import { fileTreeKeys } from '../lib/queryKeys'
import type { FileNodeType } from '../types'

interface CreateFileVariables {
  parentId: number | null
  name: string
  type: FileNodeType
}

export function useCreateFile(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ parentId, name, type }: CreateFileVariables) =>
      createFile(projectId, parentId, name, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.all(projectId) })
    },
  })
}
