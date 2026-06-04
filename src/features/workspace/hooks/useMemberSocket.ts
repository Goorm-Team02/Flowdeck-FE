import { useNavigate } from 'react-router-dom'

import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'

import { currentUserAtom } from '@/features/auth/stores/currentUserAtom'
import { forcedLogout } from '@/shared/api/client'
import { useSubscription } from '@/shared/hooks/useSubscription'
import type { ProjectMemberEventResponse } from '@/shared/socket/types'
import { TOPICS } from '@/shared/socket/types'

import { memberKeys } from '../lib/queryKeys'
import { roleChangeNotificationAtom } from '../stores/memberModalAtom'
import type { Member, MemberRole } from '../types'

export function useMemberSocket(projectId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const currentUser = useAtomValue(currentUserAtom)
  const setRoleChangeNotification = useSetAtom(roleChangeNotificationAtom)

  useSubscription(TOPICS.MEMBERS(projectId), (msg) => {
    const event: ProjectMemberEventResponse = JSON.parse(msg.body)
    const currentUserId = currentUser?.publicId || currentUser?.userId || null
    console.log('[MemberSocket] event:', event.eventType, 'userId:', event.userId, 'currentUserId:', currentUserId)

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
        const members = queryClient.getQueryData<Member[]>(memberKeys.list(projectId))
        const previousRole = members?.find((m) => m.memberId === event.memberId)?.role

        if (previousRole && event.newRole) {
          setRoleChangeNotification({ previousRole, currentRole: event.newRole })
          setTimeout(() => forcedLogout(), 3000)
        }

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
