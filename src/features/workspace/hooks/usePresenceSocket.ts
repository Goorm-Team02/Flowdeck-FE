import { useEffect } from 'react'

import { useSetAtom } from 'jotai'

import { useSocketClient } from '@/shared/hooks/useSocketClient'
import { useSubscription } from '@/shared/hooks/useSubscription'
import type { ProjectPresenceResponse } from '@/shared/socket/types'
import { DESTINATIONS, TOPICS } from '@/shared/socket/types'

import { presenceAtom } from '../stores/presenceAtom'

export function usePresenceSocket(projectId: string) {
  const setPresence = useSetAtom(presenceAtom)
  const { publish, status } = useSocketClient()

  useEffect(() => {
    if (status !== 'connected') return

    publish(DESTINATIONS.PRESENCE_JOIN(projectId), {})

    const id = setInterval(() => {
      publish(DESTINATIONS.PRESENCE_HEARTBEAT(projectId), {})
    }, 30_000)

    return () => clearInterval(id)
  }, [projectId, publish, status])

  useSubscription(TOPICS.PRESENCE(projectId), (msg) => {
    const event: ProjectPresenceResponse = JSON.parse(msg.body)
    setPresence({ count: event.connectedCount, members: event.members })
  })
}
