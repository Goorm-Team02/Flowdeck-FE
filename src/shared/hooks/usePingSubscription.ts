import { useQueryClient } from '@tanstack/react-query'

import { TOPICS } from '@/shared/socket/types'

import { useSubscription } from './useSubscription'

interface PingPayload {
  timestamp: number
  message: string
}

// 소켓 콜백 → React Query 캐시 업데이트 패턴 예시
export function usePingSubscription() {
  const queryClient = useQueryClient()

  useSubscription(TOPICS.PING, (msg) => {
    const payload = JSON.parse(msg.body) as PingPayload
    queryClient.setQueryData(['ping'], payload)
  })
}
