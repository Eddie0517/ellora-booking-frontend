export interface BillingConfig {
  currentPercent: number
  nextPercent: number
  effectiveMonth: string
  qrUrl: string | null
}

export interface PlatformBill {
  salonId: number
  salonName: string
  month: string
  gross: number
  percent: number
  fee: number
  paid: number
  due: number
  dueDate: string
  status: 'NO_FEE' | 'PAID' | 'OVERDUE' | 'UNPAID'
  transferContent: string
  qrUrl: string | null
  paidAt?: string | null
  remindedAt?: string | null
}

export const billStatusMap: Record<PlatformBill['status'], { label: string; color: string }> = {
  NO_FEE: { label: 'Không phát sinh phí', color: 'bg-gray-100 text-gray-700' },
  PAID: { label: 'Đã thanh toán', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  OVERDUE: { label: 'Quá hạn', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  UNPAID: { label: 'Chưa thanh toán', color: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export const vnDate = (): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const val = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${val('year')}-${val('month')}-${val('day')}`
}

export const vnMonth = (): string => vnDate().slice(0, 7)
