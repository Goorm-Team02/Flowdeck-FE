import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { isApiError } from '@/shared/api/errors'

import { saveFile } from '../api/files'
import { fileTreeKeys } from '../lib/queryKeys'
import { baseRevisionAtom, isDirtyAtom, saveConflictAtom } from '../stores/openFileAtom'

interface SaveFileVariables {
  fileId: number
  content: string
  baseRevision: number
}

export function useSaveFile(projectId: string) {
  const queryClient = useQueryClient()
  const setBaseRevision = useSetAtom(baseRevisionAtom)
  const setIsDirty = useSetAtom(isDirtyAtom)
  const setSaveConflict = useSetAtom(saveConflictAtom)

  return useMutation({
    mutationFn: ({ fileId, content, baseRevision }: SaveFileVariables) =>
      saveFile(projectId, fileId, content, baseRevision),
    onSuccess: (data, variables) => {
      // 서버 응답에 content가 없을 수 있으므로 전송한 content를 직접 유지
      queryClient.setQueryData(
        fileTreeKeys.detail(projectId, data.id),
        (old: import('../types').FileDetail | undefined) => ({
          ...(old ?? data),
          editRevision: data.editRevision,
          currentVersion: data.currentVersion,
          content: variables.content,
        }),
      )
      setBaseRevision(data.editRevision)
      setIsDirty(false)
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 409) {
        setSaveConflict(true)
      }
    },
  })
}
