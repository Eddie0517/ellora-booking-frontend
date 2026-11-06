export interface PlanDto { tier?: string | null; displayName?: string | null; badgeLabel?: string | null; monthlyPrice?: number | string | null; currency?: string | null; enabled?: boolean | null; registrationAvailable?: boolean | null }
export interface SubscriptionRequestDto {
  id?: number | string | null; salonId?: number | string | null; salonName?: string | null; tier?: string | null
  quotedPrice?: number | string | null; status?: string | null; createdAt?: string | null; reviewedAt?: string | null
  reviewNote?: string | null; startsAt?: string | null; expiresAt?: string | null
  paymentQrUrl?: string | null; transferContent?: string | null; paymentReportedAt?: string | null
  paymentReference?: string | null; paymentConfirmedAt?: string | null; receivedAmount?: number | string | null
  payosOrderCode?: number | string | null; payosPaymentLinkId?: string | null; payosCheckoutUrl?: string | null; payosQrCode?: string | null
}
export interface OwnerSubscriptionDto { salonId?: number | string | null; effectiveTier?: string | null; badgeLabel?: string | null; startsAt?: string | null; expiresAt?: string | null; pendingRequest?: SubscriptionRequestDto | null }
export interface CreateSubscriptionDto { tier: 'STANDARD' | 'VIP'; expectedPrice: number }
export interface SavePlanDto { monthlyPrice: number | null; enabled: boolean }
export interface DecideSubscriptionDto { status: 'APPROVED' | 'REJECTED'; note?: string }
