import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ownerApi } from '../api/owner.api'
import type { SaveEmployee, SaveSalon, SaveService, WalkInBooking, WorkingHour } from '../types/owner.model'

export const OWNER_QUERY_KEYS = {
  all: ['owner'] as const,
  salon: ['owner', 'salon'] as const,
  salonChange: ['owner', 'salon', 'change'] as const,
  summary: ['owner', 'summary'] as const,
  services: ['owner', 'services'] as const,
  employees: ['owner', 'employees'] as const,
  bookings: (salonId: string, page: number, status?: string) => ['owner', 'bookings', salonId, page, status] as const,
  reviews: (page: number) => ['owner', 'reviews', page] as const,
  revenue: (from: string, to: string, groupBy: string) => ['owner', 'revenue', from, to, groupBy] as const,
  workingHours: ['owner', 'working-hours'] as const,
  closures: ['owner', 'closures'] as const,
}
export const useOwnerSalon = () => useQuery({ queryKey: OWNER_QUERY_KEYS.salon, queryFn: ownerApi.salon })
export const useOwnerSalonChange = () => useQuery({ queryKey: OWNER_QUERY_KEYS.salonChange, queryFn: ownerApi.salonChange })
export const useSaveOwnerSalon = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: (value: SaveSalon) => ownerApi.saveSalon(value), onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.all }) })
}
export const useOwnerSummary = () => useQuery({ queryKey: OWNER_QUERY_KEYS.summary, queryFn: ownerApi.summary })
export const useOwnerServices = () => useQuery({ queryKey: OWNER_QUERY_KEYS.services, queryFn: ownerApi.services })
export const useOwnerEmployees = () => useQuery({ queryKey: OWNER_QUERY_KEYS.employees, queryFn: ownerApi.employees })
export const useOwnerBookings = (salonId: string, page: number, status?: string) => useQuery({ queryKey: OWNER_QUERY_KEYS.bookings(salonId, page, status), queryFn: () => ownerApi.bookings(salonId, page, status), enabled: !!salonId })
export const useOwnerReviews = (page: number) => useQuery({ queryKey: OWNER_QUERY_KEYS.reviews(page), queryFn: () => ownerApi.reviews(page) })
export const useOwnerRevenue = (from: string, to: string, groupBy: 'day' | 'week' | 'month' | 'year') => useQuery({ queryKey: OWNER_QUERY_KEYS.revenue(from, to, groupBy), queryFn: () => ownerApi.revenue(from, to, groupBy), enabled: !!from && !!to && from <= to })
export const useWorkingHours = () => useQuery({ queryKey: OWNER_QUERY_KEYS.workingHours, queryFn: ownerApi.workingHours })
export const useClosures = () => useQuery({ queryKey: OWNER_QUERY_KEYS.closures, queryFn: ownerApi.closures })
export function useWorkingHoursMutations() {
  const client = useQueryClient()
  return {
    save: useMutation({ mutationFn: (hours: WorkingHour[]) => ownerApi.saveWorkingHours(hours), onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.all }) }),
    close: useMutation({ mutationFn: ({ date, reason }: { date: string; reason: string }) => ownerApi.closeDate(date, reason), onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.closures }) }),
    reopen: useMutation({ mutationFn: ownerApi.reopenDate, onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.closures }) }),
  }
}
export const useCreateWalkIn = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: (value: WalkInBooking) => ownerApi.createWalkIn(value), onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.all }) })
}
export function useOwnerPhotoMutations() {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.all })
  return {
    upload: useMutation({ mutationFn: ({ kind, id, file }: { kind: 'cover' | 'services' | 'employees'; id: string; file: File }) => ownerApi.uploadPhoto(kind, id, file), onSuccess: refresh }),
    remove: useMutation({ mutationFn: ({ kind, id }: { kind: 'cover' | 'services' | 'employees'; id: string }) => ownerApi.removePhoto(kind, id), onSuccess: refresh }),
    uploadGallery: useMutation({ mutationFn: ({ id, files }: { id: string; files: File[] }) => ownerApi.uploadGallery(id, files), onSuccess: refresh }),
    removeGallery: useMutation({ mutationFn: ownerApi.removeGallery, onSuccess: refresh }),
    uploadShowcaseSlot: useMutation({ mutationFn: ({ slotIndex, file }: { slotIndex: number; file: File }) => ownerApi.uploadShowcaseSlot(slotIndex, file), onSuccess: refresh }),
    removeShowcaseSlot: useMutation({ mutationFn: (slotIndex: number) => ownerApi.removeShowcaseSlot(slotIndex), onSuccess: refresh }),
  }
}
export const useReplyOwnerReview = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ id, reply }: { id: string; reply: string }) => ownerApi.replyReview(id, reply), onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.all }) })
}
export const useUpdateOwnerBooking = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ id, status, salonNote }: { id: string; status: string; salonNote?: string }) => ownerApi.updateBookingStatus(id, status, salonNote), onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.all }) })
}
export const useSaveOwnerService = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ value, id }: { value: SaveService; id?: string }) => ownerApi.saveService(value, id), onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.services }) })
}
export const useSaveOwnerEmployee = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ value, id }: { value: SaveEmployee; id?: string }) => ownerApi.saveEmployee(value, id), onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.employees }) })
}
export const useRemoveOwnerService = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: ownerApi.removeService, onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.services }) })
}
export const useRemoveOwnerEmployee = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: ownerApi.removeEmployee, onSuccess: () => client.invalidateQueries({ queryKey: OWNER_QUERY_KEYS.employees }) })
}

export const useUploadOwnerImage = () => useMutation({ mutationFn: ownerApi.uploadImage })
