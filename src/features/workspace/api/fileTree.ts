import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'
import type { FileNode, FileSearchResult } from '../types'

export async function getFileTree(projectId: string): Promise<FileNode[]> {
  const res = await apiClient.get<ApiResponse<FileNode[]>>(`/api/projects/${projectId}/files`)
  return res.data.data
}

export async function searchFiles(projectId: string, keyword: string): Promise<FileSearchResult[]> {
  const res = await apiClient.get<ApiResponse<FileSearchResult[]>>(
    `/api/projects/${projectId}/files/search`,
    { params: { keyword } },
  )
  return res.data.data
}
