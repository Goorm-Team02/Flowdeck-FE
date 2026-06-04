import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

import type { FileNode, FileSearchResult } from '../types'

// 서버가 fileId로 내려보내는 필드를 id로 정규화
function normalizeNode(raw: Record<string, unknown>): FileNode {
  return {
    id: (raw.fileId ?? raw.id) as number,
    name: raw.name as string,
    type: raw.type as FileNode['type'],
    parentId: raw.parentId as number | null,
    editRevision: raw.editRevision as number | undefined,
    currentVersion: raw.currentVersion as number | undefined,
    children: (raw.children as Record<string, unknown>[] | undefined)?.map(normalizeNode),
  }
}

export async function getFileTree(projectId: string): Promise<FileNode[]> {
  const res = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
    `/api/projects/${projectId}/files`,
  )
  return (res.data.data ?? []).map(normalizeNode)
}

export async function searchFiles(projectId: string, keyword: string): Promise<FileSearchResult[]> {
  const res = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
    `/api/projects/${projectId}/files/search`,
    { params: { keyword } },
  )
  return (res.data.data ?? []).map((raw) => ({
    id: (raw.fileId ?? raw.id) as number,
    name: raw.name as string,
    type: raw.type as FileSearchResult['type'],
    path: raw.path as string,
  }))
}
