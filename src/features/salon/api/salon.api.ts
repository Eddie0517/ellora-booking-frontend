import { api } from '@/lib/axios'
import type { PageDto, PageModel } from '@/types/api'
import { SALON_ENDPOINTS } from '../constants/salon.endpoints'
import { salonMapper } from '../mappers/salon.mapper'
import type { EmployeeDto, SalonDto, SalonReviewDto, ServiceDto, WorkingHourDto } from '../types/salon.dto'
import type { Salon, SalonEmployee, SalonReview, SalonService, WorkingHour } from '../types/salon.model'

export interface SalonSearchParams {
  keyword?: string
  location?: string
  date?: string
  time?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  sort?: 'newest' | 'rating' | 'distance'
  page?: number
  size?: number
}

export const salonApi = {
  async search(params: SalonSearchParams): Promise<PageModel<Salon>> {
    const queryParams: Record<string, unknown> = {
      page: (params.page ?? 0) + 1,
      pageSize: params.size,
    }
    if (params.keyword?.trim()) queryParams.keyword = params.keyword.trim()
    if (params.location?.trim()) queryParams.city = params.location.trim()
    if (params.date?.trim()) queryParams.date = params.date.trim()
    if (params.time?.trim()) queryParams.time = params.time.trim()
    if (params.latitude !== undefined && !Number.isNaN(params.latitude)) queryParams.latitude = params.latitude
    if (params.longitude !== undefined && !Number.isNaN(params.longitude)) queryParams.longitude = params.longitude
    if (params.radiusKm !== undefined) queryParams.radiusKm = params.radiusKm
    if (params.sort) queryParams.sort = params.sort

    const response = await api.get<PageDto<SalonDto>>(SALON_ENDPOINTS.list, { params: queryParams })
    return salonMapper.toPageModel(response.data)
  },
  async detail(id: string): Promise<Salon> {
    const response = await api.get<SalonDto>(SALON_ENDPOINTS.detail(id))
    return salonMapper.toModel(response.data)
  },
  async services(id: string): Promise<SalonService[]> {
    const response = await api.get<ServiceDto[] | { data: ServiceDto[] }>(SALON_ENDPOINTS.services(id))
    const list: ServiceDto[] = Array.isArray(response.data) ? response.data : ((response.data as any)?.data ?? [])
    return list.map((item: ServiceDto) => salonMapper.toServiceModel(item))
  },
  async employees(id: string): Promise<SalonEmployee[]> {
    const response = await api.get<EmployeeDto[]>(SALON_ENDPOINTS.employees(id))
    return (response.data ?? []).map(item => salonMapper.toEmployeeModel(item))
  },
  async workingHours(id: string): Promise<WorkingHour[]> {
    const response = await api.get<WorkingHourDto[]>(SALON_ENDPOINTS.workingHours(id))
    return (response.data ?? []).map(item => salonMapper.toWorkingHourModel(item))
  },
  async closures(id: string, from: string, to: string): Promise<string[]> {
    const response = await api.get<string[]>(SALON_ENDPOINTS.closures(id), { params: { from, to } })
    return (response.data ?? []).map(value => String(value))
  },
  async availability(id: string, date: string, serviceId: string, employeeId?: string | null): Promise<string[]> {
    const response = await api.get<string[]>(SALON_ENDPOINTS.availability(id), {
      params: { date, serviceId, ...(employeeId ? { employeeId } : {}) },
    })
    return response.data ?? []
  },
  async reviews(id: string, page: number): Promise<PageModel<SalonReview>> {
    const response = await api.get<PageDto<SalonReviewDto>>(SALON_ENDPOINTS.reviews(id), { params: { page, pageSize: 20 } })
    return salonMapper.toReviewPageModel(response.data)
  },
}
