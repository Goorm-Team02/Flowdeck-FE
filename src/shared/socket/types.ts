// ─── 연결 상태 ────────────────────────────────────────────────────────────────

export type SocketStatus = 'connecting' | 'connected' | 'disconnected'

// ─── Destination 상수 ─────────────────────────────────────────────────────────

export const TOPICS = {
  MESSAGES: (projectId: string) => `/topic/projects/${projectId}/messages`,
  PRESENCE: (projectId: string) => `/topic/projects/${projectId}/presence`,
  FILES: (projectId: string) => `/topic/projects/${projectId}/files`,
  MEMBERS: (projectId: string) => `/topic/projects/${projectId}/members`,
  FILE_EDITING: (projectId: string, fileId: number) =>
    `/topic/projects/${projectId}/files/${fileId}/editing`,
} as const

export const DESTINATIONS = {
  MESSAGE_SEND: (projectId: string) => `/app/projects/${projectId}/messages`,
  PRESENCE_JOIN: (projectId: string) => `/app/projects/${projectId}/presence/join`,
  PRESENCE_HEARTBEAT: (projectId: string) => `/app/projects/${projectId}/presence/heartbeat`,
  FILE_EDITING_START: (projectId: string, fileId: number) =>
    `/app/projects/${projectId}/files/${fileId}/editing/start`,
  FILE_EDITING_HEARTBEAT: (projectId: string, fileId: number) =>
    `/app/projects/${projectId}/files/${fileId}/editing/heartbeat`,
  FILE_EDITING_STOP: (projectId: string, fileId: number) =>
    `/app/projects/${projectId}/files/${fileId}/editing/stop`,
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

// ─── 멤버 이벤트 ─────────────────────────────────────────────────────────────

export type MemberEventType = 'KICKED' | 'ROLE_CHANGED'

export interface ProjectMemberEventResponse {
  eventType: MemberEventType
  memberId: number
  userId: string
  newRole?: 'OWNER' | 'EDITOR' | 'VIEWER'
}

// 개인 큐 — 본인 권한 변경 알림
export const PERSONAL_TOPICS = {
  MEMBER_ROLE: '/user/queue/project-members',
} as const

export type PersonalMemberEventType = 'MEMBER_ROLE_CHANGED'

export interface PersonalMemberRoleChangedResponse {
  eventType: PersonalMemberEventType
  projectId: string
  memberId: number
  userId: string
  previousRole: 'OWNER' | 'EDITOR' | 'VIEWER'
  currentRole: 'OWNER' | 'EDITOR' | 'VIEWER'
  actorId: number
  actorName: string
  occurredAt: string
}

// ─── 파일 편집 Presence ───────────────────────────────────────────────────────

export interface FileEditingPresenceResponse {
  projectId: string
  fileId: number
  editing: boolean
  editorId: number | null
  editorName: string | null
  editorSessionId: string | null
  lastSeenAt: string | null
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
