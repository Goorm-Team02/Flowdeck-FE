import { createContext } from 'react'

import type { IMessage, StompSubscription } from '@stomp/stompjs'

export interface SocketContextValue {
  connect: () => void
  disconnect: () => void
  subscribe: (topic: string, callback: (msg: IMessage) => void) => StompSubscription | undefined
  publish: (destination: string, body: unknown) => boolean
}

export const SocketContext = createContext<SocketContextValue>({
  connect: () => {},
  disconnect: () => {},
  subscribe: () => undefined,
  publish: () => false,
})
