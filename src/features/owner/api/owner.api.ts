import { api } from '@/lib/axios'
import type { APIResponse, PageModel } from '@/types/api'
import { OWNER_ENDPOINTS } from '../constants/owner.endpoints'
import {
  closureMapper,
  ownerBookingMapper,
  ownerEmployeeMapper,
  ownerReviewMapper,
  ownerSalonMapper,
  ownerServiceMapper,
  ownerSummaryMapper,
  salonChangeMapper,
  walkInBookingMapper,
  workingHourMapper,
} from '../mappers/owner.mapper'
import type {
  ClosureDto,
  OwnerBookingDto,
  OwnerEmployeeDto,
  OwnerSalonDto,
  OwnerServiceDto,
  OwnerSummaryDto,
  SalonChangeDto,
  WorkingHourDto,
} from '../types/owner.dto'
import type {
  Closure,
  OwnerBooking,
  OwnerEmployee,
  OwnerReview,
  OwnerSalon,
  OwnerService,
  OwnerSummary,
  RevenueReport,
  SalonChange,
  SaveEmployee,
  SaveSalon,
  SaveService,
  WalkInBooking,
  WorkingHour,
} from '../types/owner.model'

function unwrap<T>(resData: any): T {
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data !== undefined) {
    return resData.data as T
  }
  return resData as T
}

export const ownerApi = {
  async uploadImage(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const response = await api.post<{ url: string } | APIResponse<string>>(OWNER_ENDPOINTS.media, form)
    const raw = unwrap<{ url: string } | string>(response.data)
    return typeof raw === 'string' ? raw : (raw as { url: string }).url
  },

  async salon(): Promise<OwnerSalon> {
    const response = await api.get<APIResponse<OwnerSalonDto> | OwnerSalonDto>(OWNER_ENDPOINTS.salon)
    return ownerSalonMapper.toModel(unwrap<OwnerSalonDto>(response.data))
  },

  async salonChange(): Promise<SalonChange | null> {
    const response = await api.get<APIResponse<SalonChangeDto | null>>(OWNER_ENDPOINTS.salonChange)
    const data = unwrap<SalonChangeDto | null>(response.data)
    return data ? salonChangeMapper.toModel(data) : null
  },

  async saveSalon(value: SaveSalon): Promise<OwnerSalon> {
    const response = await api.put<APIResponse<OwnerSalonDto> | OwnerSalonDto>(
      OWNER_ENDPOINTS.salon,
      ownerSalonMapper.toSaveDto(value)
    )
    return ownerSalonMapper.toModel(unwrap<OwnerSalonDto>(response.data))
  },

  async summary(): Promise<OwnerSummary> {
    const response = await api.get<APIResponse<OwnerSummaryDto> | OwnerSummaryDto>(OWNER_ENDPOINTS.summary)
    return ownerSummaryMapper.toModel(unwrap<OwnerSummaryDto>(response.data))
  },

  async services(): Promise<OwnerService[]> {
    const response = await api.get<APIResponse<OwnerServiceDto[]> | OwnerServiceDto[]>(OWNER_ENDPOINTS.services)
    return ownerServiceMapper.toListModel(unwrap<OwnerServiceDto[]>(response.data)).filter(service => service.active)
  },

  async employees(): Promise<OwnerEmployee[]> {
    const response = await api.get<APIResponse<OwnerEmployeeDto[]> | OwnerEmployeeDto[]>(OWNER_ENDPOINTS.employees)
    return ownerEmployeeMapper.toListModel(unwrap<OwnerEmployeeDto[]>(response.data)).filter(employee => employee.active)
  },

  async saveService(value: SaveService, id?: string): Promise<void> {
    const payload = ownerServiceMapper.toSaveDto(value)
    if (id) await api.put(OWNER_ENDPOINTS.service(id), payload)
    else await api.post(OWNER_ENDPOINTS.services, payload)
  },

  async saveEmployee(value: SaveEmployee, id?: string): Promise<void> {
    const payload = ownerEmployeeMapper.toSaveDto(value)
    if (id) await api.put(OWNER_ENDPOINTS.employee(id), payload)
    else await api.post(OWNER_ENDPOINTS.employees, payload)
  },

  async removeService(id: string): Promise<void> {
    await api.delete(OWNER_ENDPOINTS.service(id))
  },

  async removeEmployee(id: string): Promise<void> {
    await api.delete(OWNER_ENDPOINTS.employee(id))
  },

  async bookings(salonId: string, page: number, status?: string): Promise<PageModel<OwnerBooking>> {
    const response = await api.get<any>(OWNER_ENDPOINTS.bookings, {
      params: {
        ...(salonId ? { salonId } : {}),
        page,
        size: 20,
        ...(status ? { status } : {}),
      },
    })
    const raw = unwrap<any>(response.data)
    if (Array.isArray(raw)) {
      const items = raw.map((item) => ownerBookingMapper.toModel(item))
      return {
        content: items.slice(page * 20, (page + 1) * 20),
        pageNumber: page,
        totalElements: items.length,
        last: (page + 1) * 20 >= items.length,
      }
    }
    return ownerBookingMapper.toPaginationModel(raw)
  },

  async updateBookingStatus(id: string, status: string, salonNote?: string): Promise<OwnerBooking> {
    const response = await api.put<APIResponse<OwnerBookingDto> | OwnerBookingDto>(
      OWNER_ENDPOINTS.bookingStatus(id),
      { status, note: salonNote, cancellationReason: status === 'CANCELLED' ? salonNote : undefined }
    )
    return ownerBookingMapper.toModel(unwrap<OwnerBookingDto>(response.data))
  },

  async reviews(page: number): Promise<PageModel<OwnerReview>> {
    const salon = await this.salon()
    const response = await api.get<any>(`/salons/${encodeURIComponent(salon.id)}/reviews`, {
      params: { page, size: 10, pageSize: 10 },
    })
    return ownerReviewMapper.toPaginationModel(unwrap(response.data))
  },

  async replyReview(id: string, reply: string): Promise<void> {
    await api.post(`/reviews/${encodeURIComponent(id)}/reply`, ownerReviewMapper.toReplyDto(reply))
  },

  async revenue(from: string, to: string, groupBy: 'day' | 'week' | 'month' | 'year'): Promise<RevenueReport> {
    const response = await api.get<OwnerBookingDto[]>(OWNER_ENDPOINTS.bookings, { params: { status: 'COMPLETED' } })
    const bookings = unwrap<OwnerBookingDto[]>(response.data)
    const totals = new Map<string, { gross: number; bookings: number }>()
    const dateParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    })
    for (const booking of bookings) {
      if (!booking.completedAt) continue
      const completed = new Date(booking.completedAt)
      if (Number.isNaN(completed.getTime())) continue
      const parts = dateParts.formatToParts(completed)
      const part = (type: string) => parts.find(item => item.type === type)?.value ?? ''
      const day = `${part('year')}-${part('month')}-${part('day')}`
      if (day < from || day > to) continue
      let period = day
      if (groupBy === 'week') {
        const start = new Date(`${day}T00:00:00Z`)
        start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7))
        period = start.toISOString().slice(0, 10)
      } else if (groupBy === 'month') period = `${day.slice(0, 7)}-01`
      else if (groupBy === 'year') period = `${day.slice(0, 4)}-01-01`
      const entry = totals.get(period) ?? { gross: 0, bookings: 0 }
      entry.gross += Number(booking.servicePriceSnapshot ?? 0)
      entry.bookings += 1
      totals.set(period, entry)
    }
    const points = [...totals.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, gross: value.gross, fee: 0, net: value.gross, bookings: value.bookings }))
    const gross = points.reduce((sum, point) => sum + point.gross, 0)
    return { gross, fee: 0, net: gross, completedBookings: points.reduce((sum, point) => sum + point.bookings, 0), estimatedBookings: 0, points }
  },

  async workingHours(): Promise<WorkingHour[]> {
    const response = await api.get<APIResponse<WorkingHourDto[]> | WorkingHourDto[]>(OWNER_ENDPOINTS.workingHours)
    return workingHourMapper.toListModel(unwrap<WorkingHourDto[]>(response.data))
  },

  async saveWorkingHours(hours: WorkingHour[]): Promise<WorkingHour[]> {
    const response = await api.put<APIResponse<WorkingHourDto[]> | WorkingHourDto[]>(
      OWNER_ENDPOINTS.workingHours,
      hours.map((hour) => workingHourMapper.toSaveDto(hour))
    )
    return workingHourMapper.toListModel(unwrap<WorkingHourDto[]>(response.data))
  },

  async closures(): Promise<Closure[]> {
    const response = await api.get<APIResponse<ClosureDto[]> | ClosureDto[]>(OWNER_ENDPOINTS.closures)
    return closureMapper.toListModel(unwrap<ClosureDto[]>(response.data))
  },

  async closeDate(date: string, reason: string): Promise<Closure> {
    const response = await api.post<APIResponse<ClosureDto> | ClosureDto>(
      OWNER_ENDPOINTS.closures,
      closureMapper.toSaveDto(date, reason)
    )
    return closureMapper.toModel(unwrap<ClosureDto>(response.data))
  },

  async reopenDate(id: string): Promise<void> {
    await api.delete(OWNER_ENDPOINTS.closure(id))
  },

  async createWalkIn(value: WalkInBooking): Promise<OwnerBooking> {
    const response = await api.post<APIResponse<OwnerBookingDto> | OwnerBookingDto>(
      OWNER_ENDPOINTS.walkIns,
      walkInBookingMapper.toSaveDto(value)
    )
    return ownerBookingMapper.toModel(unwrap<OwnerBookingDto>(response.data))
  },

  async uploadPhoto(kind: 'cover' | 'services' | 'employees', id: string, file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const response = await api.post<APIResponse<string> | string>(OWNER_ENDPOINTS.photo(kind, id), form)
    return unwrap<string>(response.data)
  },

  async removePhoto(kind: 'cover' | 'services' | 'employees', id: string): Promise<void> {
    await api.delete(OWNER_ENDPOINTS.photo(kind, id))
  },

  async uploadGallery(id: string, files: File[]): Promise<string[]> {
    const form = new FormData()
    files.forEach((file) => form.append('files', file))
    const response = await api.post<APIResponse<string[]> | string[]>(OWNER_ENDPOINTS.galleryBatch(id), form)
    return unwrap<string[]>(response.data)
  },

  async removeGallery(url: string): Promise<void> {
    await api.delete(OWNER_ENDPOINTS.gallery, { params: { url } })
  },
}
