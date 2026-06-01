// src/app/providers/index.tsx
import { type ReactNode } from 'react'

import { QueryProvider } from './QueryProvider'
import { SocketProvider } from './SocketProvider'
import { AuthProvider } from '@/features/auth/authStore' 

interface Props {
  children: ReactNode
}

export function AppProviders({ children }: Props) {
  return (
    <QueryProvider>
      <SocketProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </SocketProvider>
    </QueryProvider>
  )
}