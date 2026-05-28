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
  lineNumber: number
  content: string
}

export interface FileVersionDiff {
  from: number
  to: number
  lines: DiffLine[]
}
