export const SALON_ENDPOINTS = {
  list: '/salons',
  detail: (id: string) => `/salons/${encodeURIComponent(id)}`,
  services: (id: string) => `/salons/${encodeURIComponent(id)}/services`,
  employees: (id: string) => `/salons/${encodeURIComponent(id)}/staff`,
  workingHours: (id: string) => `/salons/${encodeURIComponent(id)}/working-hours`,
  closures: (id: string) => `/salons/${encodeURIComponent(id)}/closures`,
  availability: (id: string) => `/salons/${encodeURIComponent(id)}/availability`,
  reviews: (id: string) => `/salons/${encodeURIComponent(id)}/reviews`,
} as const
