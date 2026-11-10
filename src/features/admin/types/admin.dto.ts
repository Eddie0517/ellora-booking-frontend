export interface AdminSummaryDto {
  totalUsers?: number | null
  totalSalons?: number | null
  pendingSalons?: number | null
  totalRevenue?: number | null
  gross?: number | string | null
  customers?: number | string | null
  activeSalons?: number | string | null
  salonsAwaitingApproval?: number | string | null
  totalBookings?: number | string | null
  completedBookings?: number | string | null
  customersWithCompletedBooking?: number | string | null
  returningCustomers?: number | string | null
  returningCustomerRate?: number | string | null
}
export interface AdminUserDto {
  id?: string | null
  fullName?: string | null
  email?: string | null
  phone?: string | null
  role?: string | null
  enabled?: boolean | null
  locked?: boolean | null
  createdAt?: string | null
}
export interface LockUserDto { locked: boolean }

export interface PendingSalonDto {
  id?: number | string | null
  name?: string | null
  address?: string | null
  city?: string | null
  district?: string | null
  phone?: string | null
  email?: string | null
  description?: string | null
  ownerName?: string | null
  status?: string | null
  contractUrl?: string | null
  contractFileName?: string | null
  contractFileType?: string | null
  contractUploadedAt?: string | null
  isOverdue?: boolean | null
}

export interface SupportContactDto {
  email?: string | null
  phone?: string | null
  facebookUrl?: string | null
}

export interface SalonChangeFieldsDto {
  name?: string | null
  description?: string | null
  address?: string | null
  city?: string | null
  district?: string | null
  phone?: string | null
  email?: string | null
  latitude?: number | null
  longitude?: number | null
}
export interface SalonChangeDto {
  id?: number | string | null
  salonId?: number | string | null
  salonName?: string | null
  kind?: string | null
  status?: string | null
  submittedAt?: string | null
  current?: SalonChangeFieldsDto | null
  proposed?: SalonChangeFieldsDto | null
  currentLogoUrl?: string | null
  proposedLogoUrl?: string | null
  currentImageUrls?: string[] | null
  proposedImageUrls?: string[] | null
}
export interface BookingDisputeDto {
  id?: number | string | null
  bookingId?: number | string | null
  completionVersion?: number | string | null
  status?: string | null
  reason?: string | null
  createdAt?: string | null
  resolvedAt?: string | null
  resolvedBy?: string | null
  adminNote?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  salonId?: number | string | null
  salonName?: string | null
  salonPhone?: string | null
  salonEmail?: string | null
  salonAddress?: string | null
  ownerName?: string | null
  ownerPhone?: string | null
  ownerEmail?: string | null
  serviceName?: string | null
  servicePrice?: number | string | null
  scheduledAt?: string | null
  durationMinutes?: number | string | null
  employeeName?: string | null
  bookingStatus?: string | null
  completedAt?: string | null
}
export interface ResolveDisputeDto { outcome: 'UPHELD' | 'REOPENED'; note: string }

export interface AdminRevenuePointDto {
  date?: string | null
  gross?: number | string | null
  fee?: number | string | null
  bookings?: number | string | null
}

export interface AdminRevenueReportDto {
  from?: string | null
  to?: string | null
  groupBy?: string | null
  gross?: number | string | null
  fee?: number | string | null
  completedBookings?: number | string | null
  estimatedBookings?: number | string | null
  points?: AdminRevenuePointDto[] | null
}
