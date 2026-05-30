import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

import type { Member, MemberRole } from '../types'

interface MemberListResponse {
  members: Member[]
}

export async function getMembers(projectId: string): Promise<Member[]> {
  const res = await apiClient.get<ApiResponse<MemberListResponse>>(
    `/api/projects/${projectId}/members`,
  )
  return res.data.data.members
}

export async function inviteMember(
  projectId: string,
  email: string,
  role: 'EDITOR' | 'VIEWER',
): Promise<Member> {
  const res = await apiClient.post<ApiResponse<Member>>(`/api/projects/${projectId}/members`, {
    email,
    role,
  } satisfies { email: string; role: MemberRole })
  return res.data.data
}

export async function updateMemberRole(
  projectId: string,
  memberId: number,
  role: MemberRole,
): Promise<Member> {
  const res = await apiClient.patch<ApiResponse<Member>>(
    `/api/projects/${projectId}/members/${memberId}`,
    { role } satisfies { role: MemberRole },
  )
  return res.data.data
}
