export const BOOKING_ENDPOINTS = {
  create: '/bookings',
  detail: (id: string) => `/bookings/${encodeURIComponent(id)}`,
  reviews: '/reviews',
  status: (id: string) => `/bookings/${encodeURIComponent(id)}/status`,
  mine: '/bookings/my',
  completion: (id: string) => `/bookings/${encodeURIComponent(id)}/completion-response`,
} as const
