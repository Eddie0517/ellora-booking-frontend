import { api } from '@/lib/axios'
import type { PageDto, PageModel } from '@/types/api'
import { BOOKING_ENDPOINTS } from '../constants/booking.endpoints'
import { bookingMapper } from '../mappers/booking.mapper'
import type { BookingDto } from '../types/booking.dto'
import type { BookingDraft, BookingReceipt } from '../types/booking.model'

export const bookingApi = {
  async detail(id: string): Promise<BookingReceipt> { const response = await api.get<BookingDto>(BOOKING_ENDPOINTS.detail(id)); return bookingMapper.toModel(response.data) },
  async cancelById(id: string): Promise<void> { await api.put(BOOKING_ENDPOINTS.status(id), { status: 'CANCELLED' }) },
  async hideCancelledById(id: string): Promise<void> { await api.delete(BOOKING_ENDPOINTS.detail(id)) },
  async review(bookingId: string, rating: number, comment: string): Promise<void> { await api.post(BOOKING_ENDPOINTS.reviews, { bookingId: Number(bookingId), rating, comment: comment.trim() }) },
  async create(draft: BookingDraft): Promise<BookingReceipt> {
    const response = await api.post<BookingDto>(BOOKING_ENDPOINTS.create, bookingMapper.toCreateDto(draft))
    return bookingMapper.toModel(response.data)
  },
  async mine(page = 0): Promise<PageModel<BookingReceipt>> {
    const response = await api.get<PageDto<BookingDto>>(BOOKING_ENDPOINTS.mine, { params: { page, pageSize: 10 } })
    return bookingMapper.toPaginationModel(response.data)
  },
  async respondToCompletion(id: string, completed: boolean, version: number, reason?: string): Promise<BookingReceipt> {
    const response = await api.post<BookingDto>(BOOKING_ENDPOINTS.completion(id), bookingMapper.toCompletionDto(completed, version, reason))
    return bookingMapper.toModel(response.data)
  },
}
