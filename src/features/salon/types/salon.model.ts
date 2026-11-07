export interface Salon {
  id: string
  name: string
  description: string
  address: string
  city: string
  district: string
  images: string[]
  logoUrl: string | null
  showcaseImages: string[]
  rating: number
  reviewCount: number
  coordinates: { lat: number; lng: number } | null
  distanceKm: number | null
  subscriptionTier: 'VIP' | 'STANDARD' | null
  subscriptionBadge: string | null
}

export interface SalonService {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  imageUrl: string | null
}

export interface SalonEmployee {
  id: string
  name: string
  bio: string
  avatarUrl: string | null
}

export interface WorkingHour {
  dayOfWeek: string
  openTime: string | null
  closeTime: string | null
  closed: boolean
}
export interface SalonReview { id: string; customerName: string; rating: number; comment: string; createdAt: string; salonReply: string; salonRepliedAt: string }
