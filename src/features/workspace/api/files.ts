import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

import type { FileDetail, FileNode, FileNodeType } from '../types'

type RawNode = Record<string, unknown>

function normalizeNode(raw: RawNode): FileNode {
  return {
    id: (raw.fileId ?? raw.id) as number,
    name: raw.name as string,
    type: raw.type as FileNode['type'],
    parentId: raw.parentId as number | null,
    editRevision: raw.editRevision as number | undefined,
    currentVersion: raw.currentVersion as number | undefined,
    children: (raw.children as RawNode[] | undefined)?.map(normalizeNode),
  }
}

function normalizeDetail(raw: RawNode): FileDetail {
  return {
    id: (raw.fileId ?? raw.id) as number,
    name: raw.name as string,
    type: raw.type as FileDetail['type'],
    parentId: raw.parentId as number | null,
    editRevision: raw.editRevision as number,
    currentVersion: raw.currentVersion as number,
    content: (raw.content ?? '') as string,
  }
}

export async function getFile(projectId: string, fileId: number): Promise<FileDetail> {
  const res = await apiClient.get<ApiResponse<RawNode>>(
    `/api/projects/${projectId}/files/${fileId}`,
  )
  return normalizeDetail(res.data.data)
}

export async function saveFile(
  projectId: string,
  fileId: number,
  content: string,
  baseRevision: number,
): Promise<FileDetail> {
  const res = await apiClient.put<ApiResponse<RawNode>>(
    `/api/projects/${projectId}/files/${fileId}`,
    { content, baseRevision },
  )
  return normalizeDetail(res.data.data)
}

export async function createFile(
  projectId: string,
  parentId: number | null,
  name: string,
  type: FileNodeType,
): Promise<FileNode> {
  const res = await apiClient.post<ApiResponse<RawNode>>(`/api/projects/${projectId}/files`, {
    parentId,
    name,
    type,
  })
  return normalizeNode(res.data.data)
}

export async function renameFile(
  projectId: string,
  fileId: number,
  name: string,
): Promise<FileNode> {
  const res = await apiClient.patch<ApiResponse<RawNode>>(
    `/api/projects/${projectId}/files/${fileId}`,
    { name },
  )
  return normalizeNode(res.data.data)
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
  const res = await apiClient.patch<ApiResponse<RawNode>>(
    `/api/projects/${projectId}/files/${fileId}/move`,
    { parentId: newParentId },
  )
  return normalizeNode(res.data.data)
}
