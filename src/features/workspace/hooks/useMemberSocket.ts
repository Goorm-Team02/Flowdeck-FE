import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQueryClient } from '@tanstack/react-query'

import { SocketContext } from '@/shared/socket/context'
import type { ProjectMemberEventResponse } from '@/shared/socket/types'
import { TOPICS } from '@/shared/socket/types'

import { memberKeys } from '../lib/queryKeys'
import type { Member, MemberRole } from '../types'

// 현재 사용자 ID — 추후 auth 연동 시 실제 값으로 교체
const getCurrentUserId = () => null as string | null

export function useMemberSocket(projectId: string) {
  const { subscribe } = useContext(SocketContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    const currentUserId = getCurrentUserId()

    const sub = subscribe(TOPICS.MEMBERS(projectId), (msg) => {
      const event: ProjectMemberEventResponse = JSON.parse(msg.body)

      if (event.eventType === 'KICKED') {
        if (currentUserId && event.userId === currentUserId) {
          // 본인이 제거됨 — 해당 프로젝트 캐시만 정리 후 목록으로 이동
          queryClient.removeQueries({ queryKey: ['projects', projectId] })
          navigate('/')
        } else {
          // 다른 멤버가 제거됨 — 캐시에서 즉시 삭제
          queryClient.setQueryData<Member[]>(memberKeys.list(projectId), (prev = []) =>
            prev.filter((m) => m.memberId !== event.memberId),
          )
        }
      } else if (event.eventType === 'ROLE_CHANGED') {
        if (currentUserId && event.userId === currentUserId) {
          // 본인 권한 변경 — 최신 권한을 서버에서 재조회
          queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) })
        } else {
          // 다른 멤버 권한 변경 — 캐시 즉시 반영
          queryClient.setQueryData<Member[]>(memberKeys.list(projectId), (prev = []) =>
            prev.map((m) =>
              m.memberId === event.memberId && event.newRole
                ? { ...m, role: event.newRole as MemberRole }
                : m,
            ),
          )
        }
      }
    })

    return () => sub?.unsubscribe()
  }, [projectId, subscribe, queryClient, navigate])
}
