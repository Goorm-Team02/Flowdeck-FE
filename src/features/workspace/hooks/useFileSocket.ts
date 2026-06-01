import { useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { useSubscription } from '@/shared/hooks/useSubscription'
import type { ProjectFileEventResponse } from '@/shared/socket/types'
import { TOPICS } from '@/shared/socket/types'

import { fileTreeKeys } from '../lib/queryKeys'
import { fileEditorsAtom } from '../stores/fileEditorAtom'

export function useFileSocket(projectId: string) {
  const queryClient = useQueryClient()
  const setFileEditors = useSetAtom(fileEditorsAtom)

  useSubscription(TOPICS.FILES(projectId), (msg) => {
    const event: ProjectFileEventResponse = JSON.parse(msg.body)

    // 파일 트리 캐시 무효화
    if (
      event.eventType === 'FILE_CREATED' ||
      event.eventType === 'FILE_DELETED' ||
      event.eventType === 'FILE_RENAMED' ||
      event.eventType === 'FILE_MOVED'
    ) {
      queryClient.invalidateQueries({ queryKey: fileTreeKeys.all(projectId) })
    }

    // 편집자 추적: 저장/복원 이벤트 → 해당 파일을 마지막으로 작업한 사람 기록
    if (event.eventType === 'FILE_SAVED' || event.eventType === 'FILE_RESTORED') {
      setFileEditors((prev) => {
        const next = new Map(prev)
        next.set(event.fileId, { actorId: event.actorId, actorName: event.actorName })
        return next
      })
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
