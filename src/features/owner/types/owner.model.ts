export interface OwnerSummary {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  monthlyRevenue: number
  monthlyCustomers: number
  averageRating: number
}
export interface OwnerSalon { id: string; name: string; description: string; address: string; city: string; district: string; phone: string; email: string; latitude: number | null; longitude: number | null; logoUrl: string | null; imageUrls: string[]; status: string }
export interface SaveSalon { name: string; description: string; address: string; city: string; district: string; phone: string; email: string; latitude?: number | null; longitude?: number | null }
export interface SalonChange { id: string; salonId: string; salonName: string; status: string; kind: string; submittedAt: string }
export interface OwnerService { categoryId: number | null; id: string; name: string; description: string; price: number; durationMinutes: number; active: boolean; imageUrl: string | null }
export interface OwnerEmployee { id: string; fullName: string; phone: string; bio: string; avatarUrl: string | null; active: boolean }
export interface SaveService { categoryId?: number | null; imageUrl?: string | null; name: string; description: string; price: number; durationMinutes: number }
export interface SaveEmployee { fullName: string; phone: string; bio: string }
export interface OwnerBooking {
  id: string
  customerName: string
  customerPhone: string
  serviceName: string
  servicePrice: number
  employeeName: string
  scheduledAt: string
  durationMinutes: number
  status: string
  customerNote: string
  salonNote: string
  walkIn: boolean
}
export interface OwnerReview {
  id: string
  customerName: string
  employeeName: string
  employeeAvatarUrl: string | null
  rating: number
  comment: string
  salonReply: string
  salonRepliedAt: string
  createdAt: string
}
export interface RevenuePoint { date: string; gross: number; fee: number; net: number; bookings: number }
export interface RevenueReport { gross: number; fee: number; net: number; completedBookings: number; estimatedBookings: number; points: RevenuePoint[] }
export interface WorkingHour { dayOfWeek: string; openTime: string | null; closeTime: string | null; closed: boolean }
export interface Closure { id: string; date: string; reason: string }
export interface WalkInBooking { serviceId: string; employeeId?: string; scheduledAt: string; customerName: string; customerPhone: string; customerNote: string }
