export interface SalonDto {
  id?: number | string | null
  name?: string | null
  description?: string | null
  address?: string | null
  city?: string | null
  district?: string | null
  logoUrl?: string | null
  imageUrls?: string[] | null
  averageRating?: number | string | null
  totalReviews?: number | string | null
  latitude?: number | string | null
  longitude?: number | string | null
  distanceKm?: number | string | null
  subscriptionTier?: string | null
}

export interface ServiceDto {
  id?: number | string | null
  name?: string | null
  description?: string | null
  price?: number | string | null
  durationMinutes?: number | string | null
  imageUrl?: string | null
}

export interface EmployeeDto {
  id?: number | string | null
  fullName?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface WorkingHourDto {
  dayOfWeek?: string | null
  openTime?: string | null
  closeTime?: string | null
  closed?: boolean | null
}
export interface SalonReviewDto { id?: number | string | null; customerName?: string | null; rating?: number | string | null; comment?: string | null; createdAt?: string | null; salonReply?: string | null; salonRepliedAt?: string | null }
