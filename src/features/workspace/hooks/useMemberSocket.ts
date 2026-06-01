import { useNavigate } from 'react-router-dom'

import { useQueryClient } from '@tanstack/react-query'

import { useSubscription } from '@/shared/hooks/useSubscription'
import type { ProjectMemberEventResponse } from '@/shared/socket/types'
import { TOPICS } from '@/shared/socket/types'

import { memberKeys } from '../lib/queryKeys'
import type { Member, MemberRole } from '../types'

// 현재 사용자 ID — 추후 auth 연동 시 실제 값으로 교체
const getCurrentUserId = () => 'user-001' as string | null

export function useMemberSocket(projectId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useSubscription(TOPICS.MEMBERS(projectId), (msg) => {
    const event: ProjectMemberEventResponse = JSON.parse(msg.body)
    const currentUserId = getCurrentUserId()

    if (event.eventType === 'KICKED') {
      if (currentUserId && event.userId === currentUserId) {
        queryClient.removeQueries({ queryKey: ['projects', projectId] })
        navigate('/')
      } else {
        queryClient.setQueryData<Member[]>(memberKeys.list(projectId), (prev = []) =>
          prev.filter((m) => m.memberId !== event.memberId),
        )
      }
    } else if (event.eventType === 'ROLE_CHANGED') {
      if (currentUserId && event.userId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: memberKeys.list(projectId) })
      } else {
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
}
