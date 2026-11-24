import type { Salon } from '../types/salon.model'

export function getTierRank(tier?: string | null): number {
  if (tier === 'VIP') return 3
  if (tier === 'STANDARD') return 2
  return 1
}

export function compareSalonsPriority(a: Salon, b: Salon): number {
  // 1. Subscription Tier: VIP (3) > STANDARD (2) > None / Free (1)
  const tierA = getTierRank(a.subscriptionTier)
  const tierB = getTierRank(b.subscriptionTier)
  if (tierB !== tierA) {
    return tierB - tierA
  }

  // 2. Star Rating (descending): If no reviews / unrated, rating is 0
  const ratingA = typeof a.rating === 'number' && Number.isFinite(a.rating) ? a.rating : 0
  const ratingB = typeof b.rating === 'number' && Number.isFinite(b.rating) ? b.rating : 0
  if (Math.abs(ratingB - ratingA) > 0.001) {
    return ratingB - ratingA
  }

  // 3. Total Review Count (descending)
  const reviewsA = typeof a.reviewCount === 'number' ? a.reviewCount : 0
  const reviewsB = typeof b.reviewCount === 'number' ? b.reviewCount : 0
  if (reviewsB !== reviewsA) {
    return reviewsB - reviewsA
  }

  // 4. Stable tie-breaker by ID
  return (b.id || '').localeCompare(a.id || '')
}
