export const SUBSCRIPTION_ENDPOINTS = {
  plans: '/salon-plans', owner: '/owner/subscription', ownerRequests: '/owner/subscription/requests',
  prepare: (id: string) => `/owner/subscription/requests/${encodeURIComponent(id)}/prepare-payment`,
  syncOwnerPayment: (id: string) => `/owner/subscription/requests/${encodeURIComponent(id)}/sync-payment`,
  syncAdminPayment: (id: string) => `/admin/subscription-requests/${encodeURIComponent(id)}/sync-payment`,
  adminPlans: '/admin/subscription-plans',
  adminPlan: (tier: string) => `/admin/subscription-plans/${encodeURIComponent(tier)}`,
  adminRequests: '/admin/subscription-requests',
  adminRequest: (id: string) => `/admin/subscription-requests/${encodeURIComponent(id)}`,
} as const
