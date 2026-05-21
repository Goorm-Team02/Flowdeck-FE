// app/providers/QueryProvider.tsx
import { type ReactNode, useState } from 'react'

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { isApiError, isNetworkError } from '@/shared/api/errors'

interface Props {
  children: ReactNode
}

function handleGlobalError(error: unknown) {
  if (isNetworkError(error)) {
    console.warn('[Network]', error.message)
    return
  }
  if (isApiError(error) && error.status >= 500) {
    console.error('[Server Error]', error.code, error.message)
  }
}

export function QueryProvider({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleGlobalError }),
        mutationCache: new MutationCache({ onError: handleGlobalError }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            gcTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
