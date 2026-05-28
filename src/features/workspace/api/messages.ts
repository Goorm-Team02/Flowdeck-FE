import { apiClient } from '@/shared/api/client'
import type { ProjectMessage } from '@/shared/socket/types'
import type { ApiResponse } from '@/shared/types/api'

interface MessageListResponse {
  messages: ProjectMessage[]
}

export async function getMessages(projectId: string): Promise<ProjectMessage[]> {
  const res = await apiClient.get<ApiResponse<MessageListResponse>>(
    `/api/projects/${projectId}/messages`,
  )
  return res.data.data.messages
}

export async function deleteMessage(projectId: string, messageId: number): Promise<void> {
  await apiClient.delete(`/api/projects/${projectId}/messages/${messageId}`)
}
