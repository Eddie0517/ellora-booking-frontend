import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      retry: (failureCount, error) => {
        const status = 'status' in error && typeof error.status === 'number' ? error.status : null
        return status !== null && status >= 400 && status < 500 ? false : failureCount < 2
      },
    },
  },
})
