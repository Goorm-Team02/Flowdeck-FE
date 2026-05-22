// app/providers/index.tsx
import { type ReactNode } from 'react'

import { QueryProvider } from './QueryProvider'
import { SocketProvider } from './SocketProvider'

interface Props {
  children: ReactNode
}

export function AppProviders({ children }: Props) {
  return (
    <QueryProvider>
      <SocketProvider>{children}</SocketProvider>
    </QueryProvider>
  )
}
