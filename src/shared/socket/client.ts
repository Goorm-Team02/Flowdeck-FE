import { Client } from '@stomp/stompjs'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws'

export function createStompClient(getToken: () => string | null): Client {
  return new Client({
    brokerURL: WS_URL,
    connectHeaders: {},
    reconnectDelay: 5_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    debug: import.meta.env.DEV ? (msg) => console.debug('[STOMP]', msg) : () => {},
    beforeConnect: async function (this: Client) {
      const token = getToken()
      this.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {}
    },
  })
}
