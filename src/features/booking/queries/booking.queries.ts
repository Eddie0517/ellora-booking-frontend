import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingApi } from '../api/booking.api'
import type { BookingDraft } from '../types/booking.model'
import { useAuthStore } from '@/store/auth.store'

export const BOOKING_QUERY_KEYS = { all: ['bookings'] as const, mine: (page: number) => ['bookings', 'mine', page] as const }
export const useCreateBooking = () => useMutation({ mutationFn: (draft: BookingDraft) => bookingApi.create(draft) })
export const useMyBookings = (page: number) => {
  const token = useAuthStore(state => state.token)
  return useQuery({ queryKey: BOOKING_QUERY_KEYS.mine(page), queryFn: () => bookingApi.mine(page), enabled: !!token })
}
export const useCompletionResponse = () => {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ id, completed, version, reason }: { id: string; completed: boolean; version: number; reason?: string }) => bookingApi.respondToCompletion(id, completed, version, reason), onSuccess: () => client.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all }) })
}

export const useBookingDetail = (id: string) => useQuery({ queryKey: ['bookings', 'detail', id], queryFn: () => bookingApi.detail(id), enabled: !!id, retry: false })
export const useCreateReview = () => useMutation({ mutationFn: ({ id, rating, comment }: { id: string; rating: number; comment: string }) => bookingApi.review(id, rating, comment) })
export const useCancelBookingById = () => { const client = useQueryClient(); return useMutation({ mutationFn: bookingApi.cancelById, onSuccess: () => client.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all }) }) }
export const useHideCancelledBookingById = () => { const client = useQueryClient(); return useMutation({ mutationFn: bookingApi.hideCancelledById, onSuccess: () => client.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.all }) }) }
