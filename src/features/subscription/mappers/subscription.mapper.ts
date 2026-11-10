import { BaseMapper } from '@/lib/mapper/base-mapper'
import { pickField, safeNumber, safeString } from '@/lib/mapper/field-helpers'
import type { CreateSubscriptionDto, DecideSubscriptionDto, OwnerSubscriptionDto, PlanDto, SavePlanDto, SubscriptionRequestDto } from '../types/subscription.dto'
import type { OwnerSubscription, Plan, SubscriptionRequest, Tier } from '../types/subscription.model'

const safeTier = (value: unknown): Tier => value === 'VIP' ? 'VIP' : 'STANDARD'
export class PlanMapper extends BaseMapper<PlanDto, Plan> {
  toModel(dto: PlanDto | null | undefined): Plan {
    const price = safeNumber(pickField(dto, ['monthlyPrice']), NaN)
    const rawFeatures = pickField(dto, ['features'])
    const features: string[] = Array.isArray(rawFeatures)
      ? rawFeatures.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
      : []
    return {
      tier: safeTier(pickField(dto, ['tier'])),
      displayName: safeString(pickField(dto, ['displayName'])),
      badgeLabel: safeString(pickField(dto, ['badgeLabel'])),
      monthlyPrice: Number.isFinite(price) ? price : null,
      currency: safeString(pickField(dto, ['currency']), 'VND'),
      enabled: pickField(dto, ['enabled']) === true,
      registrationAvailable: pickField(dto, ['registrationAvailable']) === true,
      description: safeString(pickField(dto, ['description'])),
      features,
    }
  }
  toSaveDto(monthlyPrice: number | null, enabled: boolean, description?: string, features?: string[]): SavePlanDto {
    return { monthlyPrice, enabled, description, features }
  }
}
export class SubscriptionRequestMapper extends BaseMapper<SubscriptionRequestDto, SubscriptionRequest> {
  toModel(dto: SubscriptionRequestDto | null | undefined): SubscriptionRequest {
    const received = safeNumber(pickField(dto, ['receivedAmount']), NaN)
    return { id: safeString(pickField(dto, ['id'])), salonId: safeString(pickField(dto, ['salonId'])), salonName: safeString(pickField(dto, ['salonName'])), tier: safeTier(pickField(dto, ['tier'])), quotedPrice: safeNumber(pickField(dto, ['quotedPrice'])), status: safeString(pickField(dto, ['status'])), createdAt: safeString(pickField(dto, ['createdAt'])), reviewedAt: safeString(pickField(dto, ['reviewedAt'])), reviewNote: safeString(pickField(dto, ['reviewNote'])), startsAt: safeString(pickField(dto, ['startsAt'])), expiresAt: safeString(pickField(dto, ['expiresAt'])), paymentQrUrl: safeString(pickField(dto, ['paymentQrUrl'])) || null, transferContent: safeString(pickField(dto, ['transferContent'])), paymentReportedAt: safeString(pickField(dto, ['paymentReportedAt'])), paymentReference: safeString(pickField(dto, ['paymentReference'])), paymentConfirmedAt: safeString(pickField(dto, ['paymentConfirmedAt'])), receivedAmount: Number.isFinite(received) ? received : null, payosOrderCode: safeString(pickField(dto, ['payosOrderCode'])), payosPaymentLinkId: safeString(pickField(dto, ['payosPaymentLinkId'])), payosCheckoutUrl: safeString(pickField(dto, ['payosCheckoutUrl'])), payosQrCode: safeString(pickField(dto, ['payosQrCode'])) }
  }
  toCreateDto(tier: Tier, expectedPrice: number): CreateSubscriptionDto { return { tier, expectedPrice } }
  toDecideDto(status: 'APPROVED' | 'REJECTED', note: string): DecideSubscriptionDto { return { status, ...(note.trim() ? { note: note.trim() } : {}) } }
}
export class OwnerSubscriptionMapper extends BaseMapper<OwnerSubscriptionDto, OwnerSubscription> {
  toModel(dto: OwnerSubscriptionDto | null | undefined): OwnerSubscription {
    const tier = pickField(dto, ['effectiveTier'])
    return { salonId: safeString(pickField(dto, ['salonId'])), effectiveTier: tier === 'VIP' || tier === 'STANDARD' ? tier : null, badgeLabel: safeString(pickField(dto, ['badgeLabel'])), startsAt: safeString(pickField(dto, ['startsAt'])), expiresAt: safeString(pickField(dto, ['expiresAt'])), pendingRequest: pickField(dto, ['pendingRequest']) ? requestMapper.toModel(pickField(dto, ['pendingRequest'])) : null }
  }
}
export const planMapper = new PlanMapper()
export const requestMapper = new SubscriptionRequestMapper()
export const ownerSubscriptionMapper = new OwnerSubscriptionMapper()
