import { useContext } from 'react'
import { useAtomValue } from 'jotai'

import { SocketContext } from '@/shared/socket/context'
import { socketStatusAtom } from '@/shared/socket/socketStatusAtom'

export function useSocketClient() {
  const { subscribe, publish } = useContext(SocketContext)
  const status = useAtomValue(socketStatusAtom)
  return { subscribe, publish, status }
}
