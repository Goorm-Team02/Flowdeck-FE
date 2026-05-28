import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

export interface FileVersionInfo {
  fileId: number
  version: number
  savedAt: string
}

export async function createFileVersion(
  projectId: string,
  fileId: number,
): Promise<FileVersionInfo> {
  const res = await apiClient.post<ApiResponse<FileVersionInfo>>(
    `/api/projects/${projectId}/files/${fileId}/versions`,
  )
  return res.data.data
}
