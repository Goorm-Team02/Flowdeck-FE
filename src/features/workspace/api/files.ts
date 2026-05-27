import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'
import type { FileDetail } from '../types'

export async function getFile(projectId: string, fileId: number): Promise<FileDetail> {
  const res = await apiClient.get<ApiResponse<FileDetail>>(
    `/api/projects/${projectId}/files/${fileId}`,
  )
  return res.data.data
}

export async function saveFile(
  projectId: string,
  fileId: number,
  content: string,
  baseRevision: number,
): Promise<FileDetail> {
  const res = await apiClient.put<ApiResponse<FileDetail>>(
    `/api/projects/${projectId}/files/${fileId}`,
    { content, baseRevision },
  )
  return res.data.data
}
