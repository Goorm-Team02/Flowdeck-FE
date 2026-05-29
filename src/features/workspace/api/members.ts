import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

import type { Member } from '../types'

interface MemberListResponse {
  members: Member[]
}

export async function getMembers(projectId: string): Promise<Member[]> {
  const res = await apiClient.get<ApiResponse<MemberListResponse>>(
    `/api/projects/${projectId}/members`,
  )
  return res.data.data.members
}
