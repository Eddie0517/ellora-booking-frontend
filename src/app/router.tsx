import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireRole } from '@/app/require-role'

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => ({ Component: (await import('@/components/layout/main-layout')).MainLayout }),
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/features/home/components/home-page')).HomePage }) },
      { path: 'search', lazy: async () => ({ Component: (await import('@/features/salon/components/search-page')).SearchPage }) },
      { path: 'salon/:id', lazy: async () => ({ Component: (await import('@/features/salon/components/salon-detail-page')).SalonDetailPage }) },
      { path: 'for-business', lazy: async () => ({ Component: (await import('@/features/business/components/for-business-page')).ForBusinessPage }) },
      { path: 'business-registration', lazy: async () => ({ Component: (await import('@/features/business/components/business-registration-page')).BusinessRegistrationPage }) },
      {
        element: <RequireRole roles={['CUSTOMER']} />,
        children: [
          { path: 'booking', lazy: async () => ({ Component: (await import('@/features/booking/components/booking-page')).BookingPage }) },
          {
            path: 'setting',
            lazy: async () => ({ Component: (await import('@/features/customer/components/settings-layout')).SettingsLayout }),
            children: [
              { index: true, element: <Navigate to="profile" replace /> },
              { path: 'profile', lazy: async () => ({ Component: (await import('@/features/customer/components/profile-page')).ProfilePage }) },
              { path: 'security', lazy: async () => ({ Component: (await import('@/features/customer/components/security-page')).SecurityPage }) },
              { path: 'my-bookings', lazy: async () => ({ Component: (await import('@/features/customer/components/my-bookings-page')).MyBookingsPage }) },
            ],
          },
        ],
      },
    ],
  },
  { path: '/login', lazy: async () => ({ Component: (await import('@/features/auth/components/login-page')).LoginPage }) },
  { path: '/register', lazy: async () => ({ Component: (await import('@/features/auth/components/register-page')).RegisterPage }) },
  { path: '/forgot-password', lazy: async () => ({ Component: (await import('@/features/auth/components/forgot-password-page')).ForgotPasswordPage }) },
  {
    element: <RequireRole roles={['SALON_OWNER']} />,
    children: [{
      path: '/owner',
      lazy: async () => ({ Component: (await import('@/features/owner/components/owner-layout')).OwnerLayout }),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-dashboard-page')).OwnerDashboardPage }) },
        { path: 'services', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-services-page')).OwnerServicesPage }) },
        { path: 'staff', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-staff-page')).OwnerStaffPage }) },
        { path: 'bookings', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-bookings-page')).OwnerBookingsPage }) },
        { path: 'profile', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-profile-page')).OwnerProfilePage }) },
        { path: 'photos', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-photos-page')).OwnerPhotosPage }) },
        { path: 'hours', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-hours-page')).OwnerHoursPage }) },
        { path: 'walk-in', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-walk-in-page')).OwnerWalkInPage }) },
        { path: 'reviews', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-reviews-page')).OwnerReviewsPage }) },
        { path: 'analytics', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-analytics-page')).OwnerAnalyticsPage }) },
        { path: 'billing', lazy: async () => ({ Component: (await import('@/features/owner/components/owner-billing-page')).OwnerBillingPage }) },
        { path: 'subscription', lazy: async () => ({ Component: (await import('@/features/subscription/components/owner-subscription-page')).OwnerSubscriptionPage }) },
      ],
    }],
  },
  {
    element: <RequireRole roles={['ADMIN']} />,
    children: [{
      path: '/admin',
      lazy: async () => ({ Component: (await import('@/features/admin/components/admin-layout')).AdminLayout }),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', lazy: async () => ({ Component: (await import('@/features/admin/components/admin-dashboard-page')).AdminDashboardPage }) },
        { path: 'users', lazy: async () => ({ Component: (await import('@/features/admin/components/admin-users-page')).AdminUsersPage }) },
        { path: 'approvals', lazy: async () => ({ Component: (await import('@/features/admin/components/admin-approvals-page')).AdminApprovalsPage }) },
        { path: 'support', lazy: async () => ({ Component: (await import('@/features/admin/components/admin-support-page')).AdminSupportPage }) },
        { path: 'salon-changes', lazy: async () => ({ Component: (await import('@/features/admin/components/admin-salon-changes-page')).AdminSalonChangesPage }) },
        { path: 'booking-disputes', lazy: async () => ({ Component: (await import('@/features/admin/components/admin-disputes-page')).AdminDisputesPage }) },
        { path: 'subscriptions', lazy: async () => ({ Component: (await import('@/features/subscription/components/admin-subscriptions-page')).AdminSubscriptionsPage }) },
        { path: 'billing', lazy: async () => ({ Component: (await import('@/features/admin/components/admin-billing-page')).AdminBillingPage }) },
        { path: 'content', lazy: async () => ({ Component: (await import('@/features/content/components/admin-content-page')).AdminContentPage }) },
      ],
    }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
