import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'

export function MainLayout() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  // Tài khoản Admin chỉ được sử dụng trang quản trị (Admin Console), không được truy cập trang chủ và các navbar của trang chủ
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Tài khoản Chủ salon luôn ở trong luồng quản lý Salon, ngoại trừ trang Dành cho đối tác (/for-business)
  if (user?.role === 'SALON_OWNER' && location.pathname !== '/for-business') {
    return <Navigate to="/owner/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 antialiased selection:bg-rose-100 selection:text-brand-dark">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
