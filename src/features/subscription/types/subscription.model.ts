export type Tier = 'STANDARD' | 'VIP'
export interface Plan { tier: Tier; displayName: string; badgeLabel: string; monthlyPrice: number | null; currency: string; enabled: boolean; registrationAvailable: boolean }
export interface SubscriptionRequest {
  id: string; salonId: string; salonName: string; tier: Tier; quotedPrice: number; status: string
  createdAt: string; reviewedAt: string; reviewNote: string; startsAt: string; expiresAt: string
  paymentQrUrl: string | null; transferContent: string; paymentReportedAt: string; paymentReference: string
  paymentConfirmedAt: string; receivedAmount: number | null
  payosOrderCode: string; payosPaymentLinkId: string; payosCheckoutUrl: string; payosQrCode: string
}
export interface OwnerSubscription { salonId: string; effectiveTier: Tier | null; badgeLabel: string; startsAt: string; expiresAt: string; pendingRequest: SubscriptionRequest | null }
