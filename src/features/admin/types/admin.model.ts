export interface AdminSummary {
  totalSalons: number
  totalRevenue: number
  customers: number
  activeSalons: number
  salonsAwaitingApproval: number
  totalBookings: number
  completedBookings: number
  customersWithCompletedBooking: number
  returningCustomers: number
  returningCustomerRate: number
}
export interface AdminUser {
  id: string
  fullName: string
  email: string
  phone: string
  role: string
  enabled: boolean
  locked: boolean
  createdAt: string
}
export interface PendingSalon {
  id: string
  name: string
  address: string
  city: string
  district: string
  phone: string
  email: string
  description: string
  ownerName: string
  status: string
  contractUrl?: string | null
  contractFileName?: string | null
  contractFileType?: string | null
  contractUploadedAt?: string | null
  isOverdue?: boolean
}
export interface SupportContact {
  email: string
  phone: string
  facebookUrl: string
}
export interface SalonChangeFields {
  name: string
  description: string
  address: string
  city: string
  district: string
  phone: string
  email: string
  latitude: number | null
  longitude: number | null
}
export interface SalonChange {
  id: string
  salonId: string
  salonName: string
  kind: string
  status: string
  submittedAt: string
  current: SalonChangeFields
  proposed: SalonChangeFields
  currentLogoUrl: string | null
  proposedLogoUrl: string | null
  currentImageUrls: string[]
  proposedImageUrls: string[]
}
export interface BookingDispute {
  id: string
  bookingId: string
  completionVersion: number
  status: string
  reason: string
  createdAt: string
  resolvedAt: string | null
  resolvedBy: string | null
  adminNote: string
  customerName: string
  customerPhone: string
  customerEmail: string
  salonId: string
  salonName: string
  salonPhone: string
  salonEmail: string
  salonAddress: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  serviceName: string
  servicePrice: number
  scheduledAt: string
  durationMinutes: number
  employeeName: string
  bookingStatus: string
  completedAt: string | null
}

export interface AdminRevenuePoint {
  date: string
  gross: number
  fee: number
  bookings: number
}

export interface AdminRevenueReport {
  from: string
  to: string
  groupBy: string
  gross: number
  fee: number
  completedBookings: number
  estimatedBookings: number
  points: AdminRevenuePoint[]
}
