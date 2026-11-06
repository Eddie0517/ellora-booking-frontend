import { api } from '@/lib/axios'
import type { APIResponse, PageModel } from '@/types/api'
import { ADMIN_ENDPOINTS } from '../constants/admin.endpoints'
import {
  adminRevenueMapper,
  adminSummaryMapper,
  adminUserMapper,
  bookingDisputeMapper,
  pendingSalonMapper,
  salonChangeMapper,
  supportContactMapper,
} from '../mappers/admin.mapper'
import type {
  AdminRevenueReportDto,
  AdminSummaryDto,
  AdminUserDto,
  BookingDisputeDto,
  PendingSalonDto,
  SupportContactDto,
} from '../types/admin.dto'
import type {
  AdminRevenueReport,
  AdminSummary,
  AdminUser,
  BookingDispute,
  PendingSalon,
  SalonChange,
  SupportContact,
} from '../types/admin.model'

function unwrap<T>(resData: any): T {
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data !== undefined) {
    return resData.data as T
  }
  return resData as T
}

export const adminApi = {
  async summary(): Promise<AdminSummary> {
    const response = await api.get<APIResponse<AdminSummaryDto> | AdminSummaryDto>(ADMIN_ENDPOINTS.dashboard)
    return adminSummaryMapper.toModel(unwrap<AdminSummaryDto>(response.data))
  },

  async revenue(from: string, to: string, groupBy: 'day' | 'week' | 'month' | 'year'): Promise<AdminRevenueReport> {
    const response = await api.get<APIResponse<AdminRevenueReportDto> | AdminRevenueReportDto>(
      ADMIN_ENDPOINTS.revenue,
      { params: { from, to, groupBy } }
    )
    return adminRevenueMapper.toModel(unwrap<AdminRevenueReportDto>(response.data))
  },

  async users(keyword: string, page: number): Promise<PageModel<AdminUser>> {
    const response = await api.get<any>(ADMIN_ENDPOINTS.users, {
      params: { keyword: keyword || '', page, size: 20 },
    })
    return adminUserMapper.toPaginationModel(unwrap(response.data))
  },

  async lockUser(id: string, locked: boolean): Promise<AdminUser> {
    const response = await api.patch<APIResponse<AdminUserDto> | AdminUserDto>(
      ADMIN_ENDPOINTS.lockUser(id),
      adminUserMapper.toLockDto(locked)
    )
    return adminUserMapper.toModel(unwrap<AdminUserDto>(response.data))
  },

  async pendingSalons(page: number): Promise<PageModel<PendingSalon>> {
    const response = await api.get<any>(ADMIN_ENDPOINTS.pendingSalons, {
      params: { page, size: 20 },
    })
    return pendingSalonMapper.toPaginationModel(unwrap(response.data))
  },

  async salon(id: string): Promise<PendingSalon> {
    const response = await api.get<any>(`/salons/${encodeURIComponent(id)}`)
    return pendingSalonMapper.toModel(unwrap<PendingSalonDto>(response.data))
  },

  async decideSalon(id: string, action: 'approve' | 'reject'): Promise<void> {
    await api.post(ADMIN_ENDPOINTS.decideSalon(id, action), {})
  },

  async support(): Promise<SupportContact> {
    const response = await api.get<APIResponse<SupportContactDto> | SupportContactDto>(ADMIN_ENDPOINTS.publicSupport)
    return supportContactMapper.toModel(unwrap<SupportContactDto>(response.data))
  },

  async updateSupport(contact: SupportContact): Promise<SupportContact> {
    const response = await api.put<APIResponse<SupportContactDto> | SupportContactDto>(
      ADMIN_ENDPOINTS.adminSupport,
      supportContactMapper.toUpdateDto(contact)
    )
    return supportContactMapper.toModel(unwrap<SupportContactDto>(response.data))
  },

  async salonChanges(page: number): Promise<PageModel<SalonChange>> {
    const response = await api.get<any>(ADMIN_ENDPOINTS.salonChanges, {
      params: { page, size: 20 },
    })
    return salonChangeMapper.toPaginationModel(unwrap(response.data))
  },

  async decideChange(id: string, action: 'approve' | 'reject'): Promise<void> {
    await api.post(ADMIN_ENDPOINTS.decideChange(id, action), {})
  },

  async disputes(status: string, page: number): Promise<PageModel<BookingDispute>> {
    const response = await api.get<any>(ADMIN_ENDPOINTS.disputes, {
      params: { page, size: 20, ...(status ? { status } : {}) },
    })
    return bookingDisputeMapper.toPaginationModel(unwrap(response.data))
  },

  async dispute(id: string): Promise<BookingDispute> {
    const response = await api.get<any>(ADMIN_ENDPOINTS.dispute(id))
    return bookingDisputeMapper.toModel(unwrap<BookingDisputeDto>(response.data))
  },

  async resolveDispute(id: string, outcome: 'UPHELD' | 'REOPENED', note: string): Promise<BookingDispute> {
    const response = await api.patch<any>(
      ADMIN_ENDPOINTS.resolveDispute(id),
      bookingDisputeMapper.toResolveDto(outcome, note)
    )
    return bookingDisputeMapper.toModel(unwrap<BookingDisputeDto>(response.data))
  },
}
