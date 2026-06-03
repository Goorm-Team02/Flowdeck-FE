import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'

import { currentUserAtom } from '@/features/auth/stores/currentUserAtom'
import { useSubscription } from '@/shared/hooks/useSubscription'
import type { ProjectFileEventResponse } from '@/shared/socket/types'
import { TOPICS } from '@/shared/socket/types'

import { fileTreeKeys } from '../lib/queryKeys'
import { fileEditorsAtom } from '../stores/fileEditorAtom'

export function useFileSocket(projectId: string) {
  const queryClient = useQueryClient()
  const setFileEditors = useSetAtom(fileEditorsAtom)
  const currentUser = useAtomValue(currentUserAtom)

  useSubscription(TOPICS.FILES(projectId), (msg) => {
    const event: ProjectFileEventResponse = JSON.parse(msg.body)

    // 파일 트리 캐시 무효화
    if (
      event.eventType === 'FILE_CREATED' ||
      event.eventType === 'FILE_SAVED' ||
      event.eventType === 'FILE_RESTORED' ||
      event.eventType === 'FILE_DELETED' ||
      event.eventType === 'FILE_RENAMED' ||
      event.eventType === 'FILE_MOVED'
    ) {
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.all(projectId) })
    }

    // 타인 저장/복원 시 파일 내용 재조회
    if (event.eventType === 'FILE_SAVED' || event.eventType === 'FILE_RESTORED') {
      const isMyEvent = currentUser?.numericId === event.actorId
      if (!isMyEvent) {
        queryClient.invalidateQueries({
          queryKey: fileTreeKeys.detail(projectId, event.fileId),
        })
      }
    }

    // 삭제된 파일은 편집자 목록에서 제거
    if (event.eventType === 'FILE_DELETED') {
      const removed = event.deletedFileIds ?? [event.fileId]
      setFileEditors((prev) => {
        const next = new Map(prev)
        removed.forEach((id) => next.delete(id))
        return next
      })
    }
  })
}
