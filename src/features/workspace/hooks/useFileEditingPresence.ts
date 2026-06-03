import { useEffect, useRef } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'

import { currentUserAtom } from '@/features/auth/stores/currentUserAtom'
import { useSocketClient } from '@/shared/hooks/useSocketClient'
import { DESTINATIONS, TOPICS } from '@/shared/socket/types'
import type { FileEditingPresenceResponse } from '@/shared/socket/types'

import { fileEditorsAtom } from '../stores/fileEditorAtom'

const HEARTBEAT_INTERVAL = 10_000

export function useFileEditingPresence(
  projectId: string,
  fileId: number | null,
  isViewer: boolean,
) {
  const { publish, subscribe, status } = useSocketClient()
  const currentUser = useAtomValue(currentUserAtom)
  const setFileEditors = useSetAtom(fileEditorsAtom)

  const isMyEditorRef = useRef(false)
  // cleanup 시작 후 도착하는 메시지에서 재claim하지 않도록 플래그
  const isActiveRef = useRef(false)
  const currentUserRef = useRef(currentUser)
  useEffect(() => {
    currentUserRef.current = currentUser
  })

  useEffect(() => {
    if (!fileId || isViewer || status !== 'connected') return

    isActiveRef.current = true
    const topic = TOPICS.FILE_EDITING(projectId, fileId)

    const subscription = subscribe(topic, (msg) => {
      const res: FileEditingPresenceResponse = JSON.parse(msg.body)

      setFileEditors((prev) => {
        const next = new Map(prev)
        if (res.editing && res.editorId !== null) {
          next.set(fileId, { actorId: res.editorId, actorName: res.editorName ?? '' })
        } else {
          next.delete(fileId)
        }
        return next
      })

      const user = currentUserRef.current
      isMyEditorRef.current =
        res.editing &&
        user !== null &&
        user.numericId !== -1 &&
        res.editorId === user.numericId

      // 편집자가 없어진 경우 자동으로 claim 시도
      // (isActiveRef = false면 이미 다른 파일로 이동 중이므로 skip)
      if (!res.editing && isActiveRef.current) {
        publish(DESTINATIONS.FILE_EDITING_START(projectId, fileId), {})
      }
    })

    publish(DESTINATIONS.FILE_EDITING_START(projectId, fileId), {})

    return () => {
      // stop 발행 전에 false로 설정해 cleanup 중 도착하는 브로드캐스트에서 재claim 방지
      isActiveRef.current = false
      publish(DESTINATIONS.FILE_EDITING_STOP(projectId, fileId), {})
      subscription?.unsubscribe()
      setFileEditors((prev) => {
        const next = new Map(prev)
        next.delete(fileId)
        return next
      })
      isMyEditorRef.current = false
    }
  }, [projectId, fileId, isViewer, status, subscribe, publish, setFileEditors])

  // 10초마다 heartbeat (서버에서 내가 편집자로 확인된 경우만)
  useEffect(() => {
    if (!fileId || isViewer || status !== 'connected') return

    const id = setInterval(() => {
      if (isMyEditorRef.current) {
        publish(DESTINATIONS.FILE_EDITING_HEARTBEAT(projectId, fileId), {})
      }
    }, HEARTBEAT_INTERVAL)

    return () => clearInterval(id)
  }, [projectId, fileId, isViewer, status, publish])
}
