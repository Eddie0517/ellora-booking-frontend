import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ConfirmProvider } from '@/components/providers/confirm-provider'
import { Toaster } from '@/components/ui/sonner'

export function AppProviders({ children }: PropsWithChildren) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfirmProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ConfirmProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
