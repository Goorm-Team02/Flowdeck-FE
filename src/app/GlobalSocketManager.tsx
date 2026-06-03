import { useContext, useEffect } from 'react'

import { useAuthStore } from '@/features/auth/authStore'
import { useMemberRoleSocket } from '@/features/workspace/hooks/useMemberRoleSocket'
import { SocketContext } from '@/shared/socket/context'

export function GlobalSocketManager() {
  const { isLoggedIn } = useAuthStore()
  const { connect, disconnect } = useContext(SocketContext)

  useEffect(() => {
    if (isLoggedIn) {
      connect()
    } else {
      disconnect()
    }
  }, [isLoggedIn, connect, disconnect])

  useMemberRoleSocket()

  return null
}
