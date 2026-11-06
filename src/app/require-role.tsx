import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { Profile } from '@/features/auth/types/profile.model'

export function RequireRole({ roles }: { roles: Profile['role'][] }) {
  const user = useAuthStore(state => state.user)
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  if (!roles.includes(user.role)) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'SALON_OWNER' ? '/owner/dashboard' : '/'} replace />
  return <Outlet />
}
