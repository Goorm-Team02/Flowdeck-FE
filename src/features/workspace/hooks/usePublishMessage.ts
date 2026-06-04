import { useCallback, useContext } from 'react'

import { SocketContext } from '@/shared/socket/context'
import { DESTINATIONS } from '@/shared/socket/types'

export function usePublishMessage(projectId: string) {
  const { publish } = useContext(SocketContext)

  return useCallback(
    (content: string) => {
      return publish(DESTINATIONS.MESSAGE_SEND(projectId), { content })
    },
    [projectId, publish],
  )
}
