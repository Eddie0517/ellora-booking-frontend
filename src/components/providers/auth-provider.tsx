import { useEffect, useState, type PropsWithChildren } from 'react'
import { refreshSession } from '@/lib/axios'
import { useAuthStore } from '@/store/auth.store'

export function AuthProvider({ children }: PropsWithChildren) {
  const store = useAuthStore.getState()
  // If user and token already exist from persistence, we can render immediately without blocking
  const hasExistingSession = Boolean(store.token && store.user)
  const [ready, setReady] = useState(hasExistingSession || !store.refreshToken)

  useEffect(() => {
    let active = true
    const current = useAuthStore.getState()

    // If there is a refresh token but no user/token in memory, attempt refresh
    if (current.refreshToken && (!current.user || !current.token)) {
      void refreshSession()
        .catch(() => {
          // If refresh fails and there is no active session at all, clear
          if (!current.token && !current.user) {
            useAuthStore.getState().clear()
          }
        })
        .finally(() => {
          if (active) setReady(true)
        })
    }

    return () => {
      active = false
    }
  }, [])

  return ready ? (
    children
  ) : (
    <div className="flex min-h-screen items-center justify-center bg-white" role="status">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-pink-200 border-t-[#D84A6B]" />
        <span className="text-sm font-medium text-gray-500">Đang tải Ellora…</span>
      </div>
    </div>
  )
}
