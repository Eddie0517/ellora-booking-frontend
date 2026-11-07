export interface OwnerSummaryDto {
  totalBookings?: number | string | null
  pendingBookings?: number | string | null
  confirmedBookings?: number | string | null
  completedBookings?: number | string | null
  monthlyRevenue?: number | string | null
  monthlyCustomers?: number | string | null
  averageRating?: number | string | null
}

export interface OwnerSalonDto {
  id?: number | string | null
  name?: string | null
  address?: string | null
  city?: string | null
  status?: string | null
  description?: string | null
  district?: string | null
  phone?: string | null
  email?: string | null
  latitude?: number | null
  longitude?: number | null
  logoUrl?: string | null
  imageUrls?: string[] | null
}

export interface SaveSalonDto {
  name: string
  description: string
  address: string
  city: string
  district: string
  phone: string
  email: string
  logoUrl?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface SalonChangeDto {
  id?: number | string | null
  salonId?: number | string | null
  salonName?: string | null
  status?: string | null
  kind?: string | null
  submittedAt?: string | null
}

export interface OwnerServiceDto {
  categoryId?: number | null
  id?: number | string | null
  name?: string | null
  description?: string | null
  price?: number | string | null
  durationMinutes?: number | string | null
  active?: boolean | null
  imageUrl?: string | null
}

export interface OwnerEmployeeDto {
  id?: number | string | null
  fullName?: string | null
  phone?: string | null
  bio?: string | null
  avatarUrl?: string | null
  active?: boolean | null
}

export interface SaveServiceDto { categoryId?: number | null; imageUrl?: string | null; name: string; description: string; price: number; durationMinutes: number }
export interface SaveEmployeeDto { fullName: string; phone: string; bio: string }

export interface OwnerBookingDto {
  id?: number | string | null
  walkInName?: string | null
  walkInPhone?: string | null
  servicePriceSnapshot?: number | string | null
  serviceId?: number | null
  customerName?: string | null
  customerPhone?: string | null
  serviceName?: string | null
  servicePrice?: number | string | null
  employeeName?: string | null
  scheduledAt?: string | null
  completedAt?: string | null
  durationMinutes?: number | string | null
  status?: string | null
  customerNote?: string | null
  salonNote?: string | null
  walkIn?: boolean | null
}

export interface BookingStatusDto { status: string; salonNote?: string }
export interface OwnerReviewDto {
  id?: number | string | null
  customerName?: string | null
  employeeName?: string | null
  employeeAvatarUrl?: string | null
  rating?: number | string | null
  comment?: string | null
  salonReply?: string | null
  salonRepliedAt?: string | null
  createdAt?: string | null
}
export interface ReviewReplyDto { reply: string }
export interface RevenuePointDto { date?: string | null; gross?: number | string | null; fee?: number | string | null; net?: number | string | null; bookings?: number | string | null }
export interface RevenueReportDto {
  gross?: number | string | null; fee?: number | string | null; net?: number | string | null
  completedBookings?: number | string | null; estimatedBookings?: number | string | null
  points?: RevenuePointDto[] | null
}
export interface WorkingHourDto { dayOfWeek?: string | null; openTime?: string | null; closeTime?: string | null; closed?: boolean | null }
export interface ClosureDto { id?: number | string | null; date?: string | null; reason?: string | null }
export interface SaveClosureDto { date: string; reason: string }
export interface WalkInBookingDto { serviceId: number; employeeId?: number; scheduledAt: string; customerName: string; customerPhone: string; customerNote: string }
