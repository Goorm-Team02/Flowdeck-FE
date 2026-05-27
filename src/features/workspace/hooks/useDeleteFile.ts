import { useMutation, useQueryClient } from '@tanstack/react-query'

import { isApiError } from '@/shared/api/errors'

import { deleteFile } from '../api/files'
import { fileTreeKeys } from '../lib/queryKeys'

interface DeleteFileVariables {
  fileId: number
  expectedRevision: number
}

export function useDeleteFile(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, expectedRevision }: DeleteFileVariables) =>
      deleteFile(projectId, fileId, expectedRevision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.all(projectId) })
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 409) {
        // 삭제 충돌: 파일 트리 갱신 후 사용자 안내
        queryClient.invalidateQueries({ queryKey: fileTreeKeys.all(projectId) })
      }
    },
  })
}
