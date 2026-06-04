import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', {
    email,
    password,
  })
  return res.data.data
}
