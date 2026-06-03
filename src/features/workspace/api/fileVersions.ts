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
  changeMessage: string,
): Promise<FileVersionInfo> {
  const res = await apiClient.post<ApiResponse<FileVersionInfo>>(
    `/api/projects/${projectId}/files/${fileId}/versions`,
    { changeMessage },
  )
  return res.data.data
}

export async function getFileVersions(projectId: string, fileId: number): Promise<FileVersion[]> {
  const res = await apiClient.get<ApiResponse<unknown>>(
    `/api/projects/${projectId}/files/${fileId}/versions`,
  )
  const data = res.data.data
  if (Array.isArray(data)) return data as FileVersion[]
  if (data && typeof data === 'object' && 'versions' in data) {
    const inner = (data as { versions: unknown }).versions
    return Array.isArray(inner) ? (inner as FileVersion[]) : []
  }
  return []
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
  const res = await apiClient.get<ApiResponse<{ versions: TimelineVersionCard[] }>>(
    `/api/projects/${projectId}/files/${fileId}/versions/timeline`,
  )
  return res.data.data.versions
}

export async function restoreFileVersion(
  projectId: string,
  fileId: number,
  versionId: number,
  baseRevision: number,
): Promise<FileDetail> {
  const res = await apiClient.post<ApiResponse<FileDetail>>(
    `/api/projects/${projectId}/files/${fileId}/versions/${versionId}/restore`,
    { baseRevision },
  )
  return res.data.data
}
