// ─── Member ───────────────────────────────────────────────────────────────────

export type MemberRole = 'OWNER' | 'EDITOR' | 'VIEWER'

export interface Member {
  memberId: number
  userId: string
  email: string
  name: string
  role: MemberRole
  joinedAt: string
}

// ─── File ─────────────────────────────────────────────────────────────────────

export type FileNodeType = 'FILE' | 'FOLDER'

export interface FileNode {
  id: number
  name: string
  type: FileNodeType
  parentId: number | null
  editRevision?: number
  currentVersion?: number
  children?: FileNode[]
}

export interface FileSearchResult {
  id: number
  name: string
  type: FileNodeType
  path: string
}

export interface FileDetail {
  id: number
  name: string
  type: FileNodeType
  parentId: number | null
  editRevision: number
  currentVersion: number
  content: string
}

export interface FileVersion {
  id: number
  version: number
  authorName: string
  savedAt: string
}

export interface FileVersionDetail extends FileVersion {
  content: string
}

export type DiffLineType = 'ADDED' | 'REMOVED' | 'UNCHANGED'

export interface DiffLine {
  type: DiffLineType
  oldLineNumber: number | null
  newLineNumber: number | null
  content: string
}

export interface FileVersionDiff {
  fromVersion: number
  toVersion: number
  addedLines: number
  removedLines: number
  changes: DiffLine[]
}

export interface TimelineVersionCard {
  versionId: number
  versionNumber: number
  changeMessage: string
  createdBy: number
  createdByName: string
  createdAt: string
}
