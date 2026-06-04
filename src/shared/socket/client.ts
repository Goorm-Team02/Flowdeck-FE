import { Client } from '@stomp/stompjs'

function toWebSocketUrl(url: string): string {
  const parsed = new URL(url, window.location.origin)
  parsed.protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
  parsed.pathname = '/ws'
  parsed.search = ''
  parsed.hash = ''
  return parsed.toString()
}

function resolveWebSocketUrl(): string {
  const explicitWsUrl = import.meta.env.VITE_WS_URL
  if (explicitWsUrl) return explicitWsUrl

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) return toWebSocketUrl(apiBaseUrl)

  return toWebSocketUrl(window.location.origin)
}

const WS_URL = resolveWebSocketUrl()

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
