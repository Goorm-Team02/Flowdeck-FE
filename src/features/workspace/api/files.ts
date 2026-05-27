import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'
import type { FileDetail, FileNode, FileNodeType } from '../types'

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

export async function createFile(
  projectId: string,
  parentId: number | null,
  name: string,
  type: FileNodeType,
): Promise<FileNode> {
  const res = await apiClient.post<ApiResponse<FileNode>>(`/api/projects/${projectId}/files`, {
    parentId,
    name,
    type,
  })
  return res.data.data
}

export async function renameFile(
  projectId: string,
  fileId: number,
  name: string,
): Promise<FileNode> {
  const res = await apiClient.patch<ApiResponse<FileNode>>(
    `/api/projects/${projectId}/files/${fileId}`,
    { name },
  )
  return res.data.data
}

export async function deleteFile(
  projectId: string,
  fileId: number,
  expectedRevision: number,
): Promise<void> {
  await apiClient.delete(`/api/projects/${projectId}/files/${fileId}`, {
    params: { expectedRevision },
  })
}

export async function moveFile(
  projectId: string,
  fileId: number,
  newParentId: number | null,
): Promise<FileNode> {
  const res = await apiClient.patch<ApiResponse<FileNode>>(
    `/api/projects/${projectId}/files/${fileId}/move`,
    { newParentId },
  )
  return res.data.data
}
