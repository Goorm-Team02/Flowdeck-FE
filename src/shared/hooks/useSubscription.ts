import { useEffect, useRef } from 'react'
import type { IMessage } from '@stomp/stompjs'

import { useSocketClient } from './useSocketClient'

export function useSubscription(topic: string, onMessage: (message: IMessage) => void) {
  const { subscribe, status } = useSocketClient()
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  })

  useEffect(() => {
    if (status !== 'connected') return

    const subscription = subscribe(topic, (msg) => onMessageRef.current(msg))

    return () => {
      subscription?.unsubscribe()
    }
  }, [subscribe, status, topic])
}
