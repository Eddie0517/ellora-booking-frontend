export interface BookingRequestDto {
  salonId: number
  serviceId: number
  employeeId?: number
  scheduledAt: string
  customerNote?: string
  customerPhone?: string
}

export interface BookingDto {
  id?: number | string | null
  customerId?: string | null
  salonId?: number | string | null
  salonName?: string | null
  salonLogoUrl?: string | null
  customerName?: string | null
  customerPhone?: string | null
  serviceName?: string | null
  servicePrice?: number | string | null
  servicePriceSnapshot?: number | string | null
  scheduledAt?: string | null
  status?: string | null
  completionConfirmation?: string | null
  completionVersion?: number | null
  reviewed?: boolean | null
}

export interface CompletionResponseDto {
  completed: boolean
  completionVersion: number
  reason?: string
}
