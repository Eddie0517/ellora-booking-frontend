import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ConfirmProvider } from '@/components/providers/confirm-provider'
import { Toaster } from '@/components/ui/sonner'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfirmProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ConfirmProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
