import { useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { forcedLogout } from '@/shared/api/client'
import { useSubscription } from '@/shared/hooks/useSubscription'
import { PERSONAL_TOPICS } from '@/shared/socket/types'
import type { PersonalMemberRoleChangedResponse } from '@/shared/socket/types'

import { memberKeys } from '../lib/queryKeys'
import { roleChangeNotificationAtom } from '../stores/memberModalAtom'
import type { Member } from '../types'

export function useMemberRoleSocket() {
  const queryClient = useQueryClient()
  const setRoleChangeNotification = useSetAtom(roleChangeNotificationAtom)

  useSubscription(PERSONAL_TOPICS.MEMBER_ROLE, (msg) => {
    const event: PersonalMemberRoleChangedResponse = JSON.parse(msg.body)
    if (event.eventType !== 'MEMBER_ROLE_CHANGED') return

    // 해당 프로젝트의 멤버 캐시에서 현재 사용자 역할을 즉시 업데이트
    queryClient.setQueryData<Member[]>(memberKeys.list(event.projectId), (prev = []) =>
      prev.map((m) =>
        String(m.userId) === String(event.userId) ? { ...m, role: event.currentRole } : m,
      ),
    )

    setRoleChangeNotification({
      previousRole: event.previousRole,
      currentRole: event.currentRole,
    })

    setTimeout(() => {
      forcedLogout()
    }, 3000)
  })
}
