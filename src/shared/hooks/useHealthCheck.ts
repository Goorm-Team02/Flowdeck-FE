import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/types/api'

interface HealthStatus {
  status: string
}

async function fetchHealth(): Promise<HealthStatus> {
  const res = await apiClient.get<ApiResponse<HealthStatus>>('/actuator/health')
  return res.data.data
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 1000 * 30,
    retry: false,
  })
}
