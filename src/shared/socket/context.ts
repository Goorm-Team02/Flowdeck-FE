import { createContext } from 'react'
import type { IMessage, StompSubscription } from '@stomp/stompjs'

export interface SocketContextValue {
  subscribe: (topic: string, callback: (msg: IMessage) => void) => StompSubscription | undefined
  publish: (destination: string, body: unknown) => void
}

export const SocketContext = createContext<SocketContextValue>({
  subscribe: () => undefined,
  publish: () => {},
})
