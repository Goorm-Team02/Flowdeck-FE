import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

export interface ProjectDetail {
  id: string
  title: string
  description: string
  visibility: 'PUBLIC' | 'PRIVATE'
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  const res = await apiClient.get<ApiResponse<ProjectDetail>>(`/api/projects/${projectId}`)
  return res.data.data
}
