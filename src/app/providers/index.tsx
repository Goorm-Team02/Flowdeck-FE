// app/providers/index.tsx
import { type ReactNode } from 'react'

import { QueryProvider } from './QueryProvider'

interface Props {
  children: ReactNode
}

export function AppProviders({ children }: Props) {
  return <QueryProvider>{children}</QueryProvider>
}
