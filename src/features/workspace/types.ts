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
