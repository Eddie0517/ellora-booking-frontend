import type { PageDto, PageModel } from '@/types/api'
import { pickField, safeArray, safeNumber, safeString } from '@/lib/mapper/field-helpers'
import { BaseMapper } from '@/lib/mapper/base-mapper'
import type { EmployeeDto, SalonDto, SalonReviewDto, ServiceDto, WorkingHourDto } from '../types/salon.dto'
import type { Salon, SalonEmployee, SalonReview, SalonService, WorkingHour } from '../types/salon.model'

export class SalonMapper extends BaseMapper<SalonDto, Salon> {
  toModel(dto: SalonDto | null | undefined): Salon {
    const lat = safeNumber(pickField(dto, ['latitude']), NaN)
    const lng = safeNumber(pickField(dto, ['longitude']), NaN)
    const logoUrl = safeString(pickField(dto, ['logoUrl'])) || null
    const showcaseImages = safeArray<string>(pickField(dto, ['imageUrls'])).map((u) => safeString(u))
    const validImages = showcaseImages.filter(Boolean)
    const images = validImages.length ? validImages : (logoUrl ? [logoUrl] : ['/salon-placeholder.svg'])
    const tier = safeString(pickField(dto, ['subscriptionTier']))
    const subscriptionTier = tier === 'VIP' || tier === 'STANDARD' ? tier : null
    return {
      id: safeString(pickField(dto, ['id'])),
      name: safeString(pickField(dto, ['name'])),
      description: safeString(pickField(dto, ['description'])),
      address: safeString(pickField(dto, ['address'])),
      city: safeString(pickField(dto, ['city'])),
      district: safeString(pickField(dto, ['district'])),
      logoUrl,
      showcaseImages,
      images: images.length ? [...new Set(images)] : ['/salon-placeholder.svg'],
      rating: safeNumber(pickField(dto, ['averageRating'])),
      reviewCount: safeNumber(pickField(dto, ['totalReviews'])),
      coordinates: Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null,
      distanceKm: safeNumber(pickField(dto, ['distanceKm']), NaN) >= 0 ? safeNumber(pickField(dto, ['distanceKm'])) : null,
      subscriptionTier,
      subscriptionBadge: subscriptionTier === 'VIP' ? 'Shop đối tác' : subscriptionTier === 'STANDARD' ? 'Shop yêu thích' : null,
    }
  }
  toPageModel(dto: PageDto<SalonDto> | null | undefined): PageModel<Salon> {
    const page = dto?.page ?? 1
    return { content: safeArray<SalonDto>(dto?.items).map(item => this.toModel(item)), pageNumber: page - 1, totalElements: dto?.totalItems ?? 0, last: page >= (dto?.totalPages ?? 0) }
  }
  toServiceModel(dto: ServiceDto | null | undefined): SalonService {
    return {
      id: safeString(pickField(dto, ['id'])),
      name: safeString(pickField(dto, ['name'])),
      description: safeString(pickField(dto, ['description'])),
      price: safeNumber(pickField(dto, ['price'])),
      durationMinutes: safeNumber(pickField(dto, ['durationMinutes'])),
      imageUrl: safeString(pickField(dto, ['imageUrl'])) || null,
    }
  }
  toEmployeeModel(dto: EmployeeDto | null | undefined): SalonEmployee {
    return {
      id: safeString(pickField(dto, ['id'])),
      name: safeString(pickField(dto, ['fullName'])),
      bio: safeString(pickField(dto, ['bio'])),
      avatarUrl: safeString(pickField(dto, ['avatarUrl'])) || null,
    }
  }
  toWorkingHourModel(dto: WorkingHourDto | null | undefined): WorkingHour {
    return {
      dayOfWeek: safeString(pickField(dto, ['dayOfWeek'])),
      openTime: safeString(pickField(dto, ['openTime'])) || null,
      closeTime: safeString(pickField(dto, ['closeTime'])) || null,
      closed: pickField(dto, ['closed']) === true,
    }
  }
  toReviewModel(dto: SalonReviewDto | null | undefined): SalonReview {
    return { id: safeString(pickField(dto, ['id'])), customerName: safeString(pickField(dto, ['customerName'])), rating: safeNumber(pickField(dto, ['rating'])), comment: safeString(pickField(dto, ['comment'])), createdAt: safeString(pickField(dto, ['createdAt'])), salonReply: safeString(pickField(dto, ['salonReply'])), salonRepliedAt: safeString(pickField(dto, ['salonRepliedAt'])) }
  }
  toReviewPageModel(dto: PageDto<SalonReviewDto> | null | undefined): PageModel<SalonReview> {
    return { content: safeArray<SalonReviewDto>(dto?.items).map(item => this.toReviewModel(item)), pageNumber: dto?.page ?? 0, totalElements: dto?.totalItems ?? 0, last: (dto?.page ?? 0) + 1 >= (dto?.totalPages ?? 0) }
  }
}

export const salonMapper = new SalonMapper()
