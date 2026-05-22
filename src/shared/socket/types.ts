// ─── 연결 상태 ────────────────────────────────────────────────────────────────

export type SocketStatus = 'connecting' | 'connected' | 'disconnected'

// ─── Destination 상수 ─────────────────────────────────────────────────────────

export const TOPICS = {
  MESSAGES: (projectId: string) => `/topic/projects/${projectId}/messages`,
  PRESENCE: (projectId: string) => `/topic/projects/${projectId}/presence`,
  FILES: (projectId: string) => `/topic/projects/${projectId}/files`,
} as const

export const DESTINATIONS = {
  MESSAGE_SEND: (projectId: string) => `/app/projects/${projectId}/messages`,
  PRESENCE_JOIN: (projectId: string) => `/app/projects/${projectId}/presence/join`,
  PRESENCE_HEARTBEAT: (projectId: string) => `/app/projects/${projectId}/presence/heartbeat`,
} as const

// ─── 채팅 ─────────────────────────────────────────────────────────────────────

export interface ProjectMessageCreateRequest {
  content: string
}

export type ChatEventType = 'CREATED' | 'DELETED'
export type MessageType = 'CHAT' | 'LOG'

export interface ProjectMessage {
  id: number
  userId: number
  senderName: string
  messageType: MessageType
  content: string
  createdAt: string
}

export interface ProjectMessageEventResponse {
  eventType: ChatEventType
  message: ProjectMessage | null
  messageId: number
}

// ─── Presence ─────────────────────────────────────────────────────────────────

export interface PresenceMember {
  userId: number
  userName: string
  sessionCount: number
  lastSeenAt: string
}

export interface ProjectPresenceResponse {
  projectId: string
  connectedCount: number
  members: PresenceMember[]
  occurredAt: string
}

// ─── 파일 이벤트 ──────────────────────────────────────────────────────────────

export type FileEventType =
  | 'FILE_CREATED'
  | 'FILE_SAVED'
  | 'FILE_RESTORED'
  | 'FILE_DELETED'
  | 'FILE_RENAMED'
  | 'FILE_MOVED'

export interface ProjectFileEventResponse {
  eventType: FileEventType
  projectId: string
  fileId: number
  actorId: number
  actorName: string
  editRevision: number
  currentVersion: number
  occurredAt: string
  // FILE_CREATED
  newName?: string
  newParentId?: number
  // FILE_RENAMED
  oldName?: string
  // FILE_MOVED
  oldParentId?: number
  // FILE_DELETED
  deletedFileIds?: number[]
}
