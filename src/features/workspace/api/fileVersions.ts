import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

import type {
  FileDetail,
  FileVersion,
  FileVersionDetail,
  FileVersionDiff,
  TimelineVersionCard,
} from '../types'

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

export async function getFileVersions(projectId: string, fileId: number): Promise<FileVersion[]> {
  const res = await apiClient.get<ApiResponse<FileVersion[]>>(
    `/api/projects/${projectId}/files/${fileId}/versions`,
  )
  return res.data.data
}

export async function getFileVersion(
  projectId: string,
  fileId: number,
  versionId: number,
): Promise<FileVersionDetail> {
  const res = await apiClient.get<ApiResponse<FileVersionDetail>>(
    `/api/projects/${projectId}/files/${fileId}/versions/${versionId}`,
  )
  return res.data.data
}

export async function getFileVersionDiff(
  projectId: string,
  fileId: number,
  from: number,
  to: number,
): Promise<FileVersionDiff> {
  const res = await apiClient.get<ApiResponse<FileVersionDiff>>(
    `/api/projects/${projectId}/files/${fileId}/versions/diff`,
    { params: { from, to } },
  )
  return res.data.data
}

export async function getFileVersionTimeline(
  projectId: string,
  fileId: number,
): Promise<TimelineVersionCard[]> {
  const res = await apiClient.get<ApiResponse<TimelineVersionCard[]>>(
    `/api/projects/${projectId}/files/${fileId}/versions/timeline`,
  )
  return res.data.data
}

export async function restoreFileVersion(
  projectId: string,
  fileId: number,
  versionId: number,
): Promise<FileDetail> {
  const res = await apiClient.post<ApiResponse<FileDetail>>(
    `/api/projects/${projectId}/files/${fileId}/versions/${versionId}/restore`,
  )
  return res.data.data
}
