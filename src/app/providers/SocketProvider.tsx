import { useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

import type { IMessage, StompSubscription } from '@stomp/stompjs'
import { useSetAtom } from 'jotai'

import { tokenStorage } from '@/shared/api/client'
import { createStompClient } from '@/shared/socket/client'
import { SocketContext } from '@/shared/socket/context'
import { socketStatusAtom } from '@/shared/socket/socketStatusAtom'

interface Props {
  children: ReactNode
}

export function SocketProvider({ children }: Props) {
  const setStatus = useSetAtom(socketStatusAtom)

  const clientRef = useRef(createStompClient(tokenStorage.getAccess))

  const connect = useCallback(() => {
    if (clientRef.current.active) return

    clientRef.current.onConnect = () => setStatus('connected')
    clientRef.current.onDisconnect = () => setStatus('disconnected')
    clientRef.current.onStompError = (frame) => {
      console.error('[STOMP] error', frame.headers['message'])
      setStatus('disconnected')
    }
    clientRef.current.onWebSocketError = (event) => {
      console.error('[STOMP] ws error', event)
      setStatus('disconnected')
    }
    clientRef.current.onWebSocketClose = () => setStatus('disconnected')

    setStatus('connecting')
    clientRef.current.activate()
  }, [setStatus])

  const disconnect = useCallback(() => {
    clientRef.current.deactivate()
    setStatus('disconnected')
  }, [setStatus])

  const subscribe = useCallback(
    (topic: string, callback: (msg: IMessage) => void): StompSubscription | undefined => {
      if (!clientRef.current.connected) {
        console.warn('[STOMP] subscribe skipped because socket is not connected', topic)
        return undefined
      }

      return clientRef.current.subscribe(topic, callback)
    },
    [],
  )

  const publish = useCallback((destination: string, body: unknown) => {
    if (!clientRef.current.connected) {
      console.warn('[STOMP] publish skipped because socket is not connected', destination)
      return false
    }

    clientRef.current.publish({ destination, body: JSON.stringify(body) })
    return true
  }, [])

  return (
    <SocketContext.Provider value={{ connect, disconnect, subscribe, publish }}>
      {children}
    </SocketContext.Provider>
  )
}
