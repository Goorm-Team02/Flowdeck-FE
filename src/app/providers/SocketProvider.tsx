import { useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import type { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import { useSetAtom } from 'jotai'

import { tokenStorage } from '@/shared/api/client'
import { createStompClient } from '@/shared/socket/client'
import { SocketContext } from '@/shared/socket/context'
import { socketStatusAtom } from '@/shared/socket/socketStatusAtom'

interface Props {
  children: ReactNode
}

export function SocketProvider({ children }: Props) {
  const clientRef = useRef<Client | null>(null)
  const setStatus = useSetAtom(socketStatusAtom)

  const subscribe = useCallback(
    (topic: string, callback: (msg: IMessage) => void): StompSubscription | undefined =>
      clientRef.current?.subscribe(topic, callback),
    [],
  )

  const publish = useCallback((destination: string, body: unknown) => {
    clientRef.current?.publish({ destination, body: JSON.stringify(body) })
  }, [])

  useEffect(() => {
    const stompClient = createStompClient(tokenStorage.getAccess)
    clientRef.current = stompClient

    stompClient.onConnect = () => setStatus('connected')
    stompClient.onDisconnect = () => setStatus('disconnected')
    stompClient.onStompError = (frame) => {
      console.error('[STOMP] error', frame.headers['message'])
      setStatus('disconnected')
    }
    stompClient.onWebSocketError = (event) => {
      console.error('[STOMP] ws error', event)
      setStatus('disconnected')
    }

    setStatus('connecting')
    stompClient.activate()

    return () => {
      stompClient.deactivate()
      clientRef.current = null
      setStatus('disconnected')
    }
  }, [setStatus])

  return <SocketContext.Provider value={{ subscribe, publish }}>{children}</SocketContext.Provider>
}
