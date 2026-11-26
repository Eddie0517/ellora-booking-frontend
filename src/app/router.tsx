import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireRole } from '@/app/require-role'
import { RouteErrorBoundary } from '@/components/common/route-error-boundary'

/**
 * Bắt lỗi dynamic chunk load error khi ứng dụng vừa deploy phiên bản mới
 * Tự động tải lại trang để tải phiên bản JS bundle mới nhất
 */
async function safeLazy<T>(loader: () => Promise<T>): Promise<T> {
  try {
    return await loader()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const isChunkError =
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('ChunkLoadError')

    if (isChunkError) {
      const lastReload = Number(sessionStorage.getItem('ellora_lazy_chunk_reload') || 0)
      const now = Date.now()
      if (now - lastReload > 10000) {
        sessionStorage.setItem('ellora_lazy_chunk_reload', String(now))
        window.location.reload()
        return new Promise<T>(() => {})
      }
    }
    throw err
  }
}

function loadLazy<T extends Record<string, any>>(
  importer: () => Promise<T>,
  componentName: keyof T
) {
  return () =>
    safeLazy(async () => {
      const mod = await importer()
      return { Component: mod[componentName] }
    })
}

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    lazy: loadLazy(() => import('@/components/layout/main-layout'), 'MainLayout'),
    children: [
      { index: true, lazy: loadLazy(() => import('@/features/home/components/home-page'), 'HomePage') },
      { path: 'search', lazy: loadLazy(() => import('@/features/salon/components/search-page'), 'SearchPage') },
      { path: 'salon/:id', lazy: loadLazy(() => import('@/features/salon/components/salon-detail-page'), 'SalonDetailPage') },
      { path: 'for-business', lazy: loadLazy(() => import('@/features/business/components/for-business-page'), 'ForBusinessPage') },
      { path: 'business-registration', lazy: loadLazy(() => import('@/features/business/components/business-registration-page'), 'BusinessRegistrationPage') },
      { path: 'contact', lazy: loadLazy(() => import('@/features/home/components/contact-page'), 'ContactPage') },
      {
        element: <RequireRole roles={['CUSTOMER']} />,
        children: [
          { path: 'booking', lazy: loadLazy(() => import('@/features/booking/components/booking-page'), 'BookingPage') },
          {
            path: 'setting',
            lazy: loadLazy(() => import('@/features/customer/components/settings-layout'), 'SettingsLayout'),
            children: [
              { index: true, element: <Navigate to="profile" replace /> },
              { path: 'profile', lazy: loadLazy(() => import('@/features/customer/components/profile-page'), 'ProfilePage') },
              { path: 'security', lazy: loadLazy(() => import('@/features/customer/components/security-page'), 'SecurityPage') },
              { path: 'my-bookings', lazy: loadLazy(() => import('@/features/customer/components/my-bookings-page'), 'MyBookingsPage') },
            ],
          },
        ],
      },
    ],
  },
  {
    errorElement: <RouteErrorBoundary />,
    lazy: loadLazy(() => import('@/features/auth/components/login-page'), 'AuthPageLayout'),
    children: [
      { path: '/login', element: null },
      { path: '/register', element: null },
    ],
  },
  {
    path: '/forgot-password',
    errorElement: <RouteErrorBoundary />,
    lazy: loadLazy(() => import('@/features/auth/components/forgot-password-page'), 'ForgotPasswordPage'),
  },
  {
    element: <RequireRole roles={['SALON_OWNER']} />,
    errorElement: <RouteErrorBoundary />,
    children: [{
      path: '/owner',
      errorElement: <RouteErrorBoundary />,
      lazy: loadLazy(() => import('@/features/owner/components/owner-layout'), 'OwnerLayout'),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', lazy: loadLazy(() => import('@/features/owner/components/owner-dashboard-page'), 'OwnerDashboardPage') },
        { path: 'services', lazy: loadLazy(() => import('@/features/owner/components/owner-services-page'), 'OwnerServicesPage') },
        { path: 'staff', lazy: loadLazy(() => import('@/features/owner/components/owner-staff-page'), 'OwnerStaffPage') },
        { path: 'bookings', lazy: loadLazy(() => import('@/features/owner/components/owner-bookings-page'), 'OwnerBookingsPage') },
        { path: 'profile', lazy: loadLazy(() => import('@/features/owner/components/owner-profile-page'), 'OwnerProfilePage') },
        { path: 'photos', lazy: loadLazy(() => import('@/features/owner/components/owner-photos-page'), 'OwnerPhotosPage') },
        { path: 'hours', lazy: loadLazy(() => import('@/features/owner/components/owner-hours-page'), 'OwnerHoursPage') },
        { path: 'walk-in', lazy: loadLazy(() => import('@/features/owner/components/owner-walk-in-page'), 'OwnerWalkInPage') },
        { path: 'reviews', lazy: loadLazy(() => import('@/features/owner/components/owner-reviews-page'), 'OwnerReviewsPage') },
        { path: 'analytics', lazy: loadLazy(() => import('@/features/owner/components/owner-analytics-page'), 'OwnerAnalyticsPage') },
        { path: 'billing', lazy: loadLazy(() => import('@/features/owner/components/owner-billing-page'), 'OwnerBillingPage') },
        { path: 'subscription', lazy: loadLazy(() => import('@/features/subscription/components/owner-subscription-page'), 'OwnerSubscriptionPage') },
      ],
    }],
  },
  {
    element: <RequireRole roles={['ADMIN']} />,
    errorElement: <RouteErrorBoundary />,
    children: [{
      path: '/admin',
      errorElement: <RouteErrorBoundary />,
      lazy: loadLazy(() => import('@/features/admin/components/admin-layout'), 'AdminLayout'),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', lazy: loadLazy(() => import('@/features/admin/components/admin-dashboard-page'), 'AdminDashboardPage') },
        { path: 'users', lazy: loadLazy(() => import('@/features/admin/components/admin-users-page'), 'AdminUsersPage') },
        { path: 'approvals', lazy: loadLazy(() => import('@/features/admin/components/admin-approvals-page'), 'AdminApprovalsPage') },
        { path: 'support', lazy: loadLazy(() => import('@/features/admin/components/admin-support-page'), 'AdminSupportPage') },
        { path: 'salon-changes', lazy: loadLazy(() => import('@/features/admin/components/admin-salon-changes-page'), 'AdminSalonChangesPage') },
        { path: 'disputes', lazy: loadLazy(() => import('@/features/admin/components/admin-disputes-page'), 'AdminDisputesPage') },
        { path: 'booking-disputes', lazy: loadLazy(() => import('@/features/admin/components/admin-disputes-page'), 'AdminDisputesPage') },
        { path: 'subscriptions', lazy: loadLazy(() => import('@/features/subscription/components/admin-subscriptions-page'), 'AdminSubscriptionsPage') },
        { path: 'billing', lazy: loadLazy(() => import('@/features/admin/components/admin-billing-page'), 'AdminBillingPage') },
        { path: 'content', lazy: loadLazy(() => import('@/features/content/components/admin-content-page'), 'AdminContentPage') },
      ],
    }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
