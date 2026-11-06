import { useQuery } from '@tanstack/react-query'
import { salonApi, type SalonSearchParams } from '../api/salon.api'

export const SALON_QUERY_KEYS = {
  all: ['salons'] as const,
  list: (params: SalonSearchParams) => ['salons', 'list', params] as const,
  detail: (id: string) => ['salons', 'detail', id] as const,
  services: (id: string) => ['salons', 'services', id] as const,
  employees: (id: string) => ['salons', 'employees', id] as const,
  hours: (id: string) => ['salons', 'hours', id] as const,
  closures: (id: string, from: string, to: string) => ['salons', 'closures', id, from, to] as const,
  availability: (id: string, date: string, serviceId: string, employeeId?: string | null) => ['salons', 'availability', id, date, serviceId, employeeId] as const,
  reviews: (id: string, page: number) => ['salons', 'reviews', id, page] as const,
}

export const useSalons = (params: SalonSearchParams) => useQuery({ queryKey: SALON_QUERY_KEYS.list(params), queryFn: () => salonApi.search(params) })
export const useSalon = (id: string) => useQuery({ queryKey: SALON_QUERY_KEYS.detail(id), queryFn: () => salonApi.detail(id), enabled: !!id })
export const useSalonServices = (id: string) => useQuery({ queryKey: SALON_QUERY_KEYS.services(id), queryFn: () => salonApi.services(id), enabled: !!id })
export const useSalonEmployees = (id: string) => useQuery({ queryKey: SALON_QUERY_KEYS.employees(id), queryFn: () => salonApi.employees(id), enabled: !!id })
export const useSalonHours = (id: string) => useQuery({ queryKey: SALON_QUERY_KEYS.hours(id), queryFn: () => salonApi.workingHours(id), enabled: !!id })
export const useSalonClosures = (id: string, from: string, to: string) => useQuery({ queryKey: SALON_QUERY_KEYS.closures(id, from, to), queryFn: () => salonApi.closures(id, from, to), enabled: !!id && !!from && !!to })
export const useSalonAvailability = (id: string, date: string, serviceId: string, employeeId?: string | null) => useQuery({ queryKey: SALON_QUERY_KEYS.availability(id, date, serviceId, employeeId), queryFn: () => salonApi.availability(id, date, serviceId, employeeId), enabled: !!id && !!date && !!serviceId })
export const useSalonReviews = (id: string, page: number) => useQuery({ queryKey: SALON_QUERY_KEYS.reviews(id, page), queryFn: () => salonApi.reviews(id, page), enabled: !!id })
