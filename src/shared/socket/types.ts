// ─── 공통 메시지 래퍼 ─────────────────────────────────────────────────────────

export interface StompMessage<T = unknown> {
  type: string
  data: T
}

// ─── 토픽 상수 ────────────────────────────────────────────────────────────────

export const TOPICS = {
  PING: '/topic/ping',
  PROJECT_CHAT: (projectId: string) => `/topic/project/${projectId}/chat`,
  PROJECT_PRESENCE: (projectId: string) => `/topic/project/${projectId}/presence`,
  FILE_EDIT: (projectId: string, fileId: string) =>
    `/topic/project/${projectId}/file/${fileId}/edit`,
} as const

export const DESTINATIONS = {
  CHAT_SEND: (projectId: string) => `/app/project/${projectId}/chat`,
  FILE_EDIT: (projectId: string, fileId: string) =>
    `/app/project/${projectId}/file/${fileId}/edit`,
  PRESENCE: (projectId: string) => `/app/project/${projectId}/presence`,
} as const

// ─── 연결 상태 ────────────────────────────────────────────────────────────────

export type SocketStatus = 'connecting' | 'connected' | 'disconnected'
