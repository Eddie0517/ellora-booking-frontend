import { api } from '@/lib/axios'
import type { BillingConfig, BillingStatus, PlatformBill } from '../types/billing.model'
import type { PageModel } from '@/types/api'

function unwrap<T>(resData: any): T {
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data !== undefined) {
    return resData.data as T
  }
  return resData as T
}

export const billingApi = {
  async getConfig(): Promise<BillingConfig> {
    const res = await api.get<BillingConfig>('/admin/billing/config')
    return unwrap<BillingConfig>(res.data)
  },

  async updateRate(percent: number): Promise<BillingConfig> {
    const res = await api.put<BillingConfig>('/admin/billing/config', { percent })
    return unwrap<BillingConfig>(res.data)
  },

  async uploadQr(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post<any>('/admin/billing/qr', form)
    const raw = unwrap<any>(res.data)
    return typeof raw === 'string' ? raw : raw.qrUrl ?? raw.url
  },

  async getStatements(month: string, page: number): Promise<PageModel<PlatformBill>> {
    const res = await api.get<any>('/admin/billing/statements', { params: { month, page, size: 20 } })
    const raw = unwrap<any>(res.data)
    const items: PlatformBill[] = raw.items ?? raw.content ?? []
    return {
      content: items,
      pageNumber: raw.page ?? raw.pageNumber ?? page,
      totalElements: raw.totalItems ?? raw.totalElements ?? items.length,
      last: raw.page !== undefined ? raw.page + 1 >= (raw.totalPages ?? 1) : raw.last ?? true,
    }
  },

  async confirmPayment(salonId: number, month: string, expectedDue: number): Promise<PlatformBill> {
    const res = await api.post<any>(`/admin/billing/statements/${salonId}/confirm`, { expectedDue }, { params: { month } })
    return unwrap<PlatformBill>(res.data)
  },

  async remindPayment(salonId: number, month: string): Promise<void> {
    await api.post(`/admin/billing/statements/${salonId}/remind`, {}, { params: { month } })
  },

  async getOwnerBill(month: string): Promise<PlatformBill> {
    const res = await api.get<any>('/owner/billing', { params: { month } })
    return unwrap<PlatformBill>(res.data)
  },

  async preparePayment(month: string): Promise<PlatformBill> {
    const res = await api.post<any>('/owner/billing/prepare-payment', {}, { params: { month } })
    return unwrap<PlatformBill>(res.data)
  },

  async syncPayment(month: string): Promise<PlatformBill> {
    const res = await api.post<any>('/owner/billing/sync-payment', {}, { params: { month } })
    return unwrap<PlatformBill>(res.data)
  },

  async getBillingStatus(): Promise<BillingStatus> {
    const res = await api.get<any>('/owner/billing/status')
    return unwrap<BillingStatus>(res.data)
  },
}
