// src/app/providers/index.tsx
import { type ReactNode } from 'react'

import { AuthProvider } from '@/features/auth/authStore'

import { GlobalSocketManager } from '../GlobalSocketManager'
import { RoleChangeNotification } from '../RoleChangeNotification'
import { QueryProvider } from './QueryProvider'
import { SocketProvider } from './SocketProvider'

interface Props {
  children: ReactNode
}

export function AppProviders({ children }: Props) {
  return (
    <QueryProvider>
      <SocketProvider>
        <AuthProvider>
          <GlobalSocketManager />
          <RoleChangeNotification />
          {children}
        </AuthProvider>
      </SocketProvider>
    </QueryProvider>
  )
}