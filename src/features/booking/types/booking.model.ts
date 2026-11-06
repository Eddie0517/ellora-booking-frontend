export interface BookingReceipt {
  customerId: string
  id: string
  salonId: string
  salonName: string
  salonLogoUrl: string | null
  customerName: string
  serviceName: string
  servicePrice: number
  scheduledAt: string
  status: string
  completionConfirmation: string | null
  completionVersion: number
  reviewed: boolean
}

export interface BookingDraft {
  salonId: string
  serviceId: string
  employeeId: string | null
  date: string
  time: string
  customerNote: string
  customerPhone: string
}
