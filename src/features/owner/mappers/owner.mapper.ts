import { BaseMapper } from '@/lib/mapper/base-mapper'
import { pickField, safeArray, safeNumber, safeString } from '@/lib/mapper/field-helpers'
import type { BookingStatusDto, ClosureDto, OwnerBookingDto, OwnerEmployeeDto, OwnerReviewDto, OwnerSalonDto, OwnerServiceDto, OwnerSummaryDto, RevenuePointDto, RevenueReportDto, ReviewReplyDto, SalonChangeDto, SaveClosureDto, SaveEmployeeDto, SaveSalonDto, SaveServiceDto, WalkInBookingDto, WorkingHourDto } from '../types/owner.dto'
import type { Closure, OwnerBooking, OwnerEmployee, OwnerReview, OwnerSalon, OwnerService, OwnerSummary, RevenuePoint, RevenueReport, SalonChange, SaveEmployee, SaveSalon, SaveService, WalkInBooking, WorkingHour } from '../types/owner.model'

export class OwnerSummaryMapper extends BaseMapper<OwnerSummaryDto, OwnerSummary> {
  toModel(dto: OwnerSummaryDto | null | undefined): OwnerSummary {
    return {
      totalBookings: safeNumber(pickField(dto, ['totalBookings'])),
      pendingBookings: safeNumber(pickField(dto, ['pendingBookings'])),
      confirmedBookings: safeNumber(pickField(dto, ['confirmedBookings'])),
      completedBookings: safeNumber(pickField(dto, ['completedBookings'])),
      monthlyRevenue: safeNumber(pickField(dto, ['monthlyRevenue'])),
      monthlyCustomers: safeNumber(pickField(dto, ['monthlyCustomers'])),
      averageRating: safeNumber(pickField(dto, ['averageRating'])),
    }
  }
}
export class OwnerSalonMapper extends BaseMapper<OwnerSalonDto, OwnerSalon> {
  toModel(dto: OwnerSalonDto | null | undefined): OwnerSalon {
    const lat = safeNumber(pickField(dto, ['latitude']), NaN)
    const lng = safeNumber(pickField(dto, ['longitude']), NaN)
    return { id: safeString(pickField(dto, ['id'])), name: safeString(pickField(dto, ['name'])), description: safeString(pickField(dto, ['description'])), address: safeString(pickField(dto, ['address'])), city: safeString(pickField(dto, ['city'])), district: safeString(pickField(dto, ['district'])), phone: safeString(pickField(dto, ['phone'])), email: safeString(pickField(dto, ['email'])), latitude: Number.isFinite(lat) ? lat : null, longitude: Number.isFinite(lng) ? lng : null, logoUrl: safeString(pickField(dto, ['logoUrl'])) || null, imageUrls: safeArray<string>(pickField(dto, ['imageUrls'])), status: safeString(pickField(dto, ['status'])) }
  }
  toSaveDto(model: SaveSalon): SaveSalonDto {
    return {
      name: model.name.trim(),
      description: model.description.trim(),
      address: model.address.trim(),
      city: model.city.trim(),
      district: model.district.trim(),
      phone: model.phone.trim(),
      email: model.email.trim(),
      ...(model.logoUrl !== undefined ? { logoUrl: model.logoUrl } : {}),
      ...(model.latitude !== undefined ? { latitude: model.latitude } : {}),
      ...(model.longitude !== undefined ? { longitude: model.longitude } : {}),
    }
  }
}
export class SalonChangeMapper extends BaseMapper<SalonChangeDto, SalonChange> {
  toModel(dto: SalonChangeDto | null | undefined): SalonChange {
    return { id: safeString(pickField(dto, ['id'])), salonId: safeString(pickField(dto, ['salonId'])), salonName: safeString(pickField(dto, ['salonName'])), status: safeString(pickField(dto, ['status'])), kind: safeString(pickField(dto, ['kind'])), submittedAt: safeString(pickField(dto, ['submittedAt'])) }
  }
}
export class OwnerServiceMapper extends BaseMapper<OwnerServiceDto, OwnerService> {
  toModel(dto: OwnerServiceDto | null | undefined): OwnerService {
    return { categoryId: dto?.categoryId ?? null, id: safeString(pickField(dto, ['id'])), name: safeString(pickField(dto, ['name'])), description: safeString(pickField(dto, ['description'])), price: safeNumber(pickField(dto, ['price'])), durationMinutes: safeNumber(pickField(dto, ['durationMinutes'])), active: pickField(dto, ['active']) === true, imageUrl: safeString(pickField(dto, ['imageUrl'])) || null }
  }
  toSaveDto(model: SaveService): SaveServiceDto {
    return { name: model.name.trim(), description: model.description.trim(), price: model.price, durationMinutes: model.durationMinutes, categoryId: model.categoryId ?? null, imageUrl: model.imageUrl ?? null }
  }
}
export class OwnerEmployeeMapper extends BaseMapper<OwnerEmployeeDto, OwnerEmployee> {
  toModel(dto: OwnerEmployeeDto | null | undefined): OwnerEmployee {
    return { id: safeString(pickField(dto, ['id'])), fullName: safeString(pickField(dto, ['fullName'])), phone: safeString(pickField(dto, ['phone'])), bio: safeString(pickField(dto, ['bio'])), avatarUrl: safeString(pickField(dto, ['avatarUrl'])) || null, active: pickField(dto, ['active']) === true }
  }
  toSaveDto(model: SaveEmployee): SaveEmployeeDto {
    return { fullName: model.fullName.trim(), phone: model.phone.trim(), bio: model.bio.trim() }
  }
}
export class OwnerBookingMapper extends BaseMapper<OwnerBookingDto, OwnerBooking> {
  toModel(dto: OwnerBookingDto | null | undefined): OwnerBooking {
    return {
      id: safeString(pickField(dto, ['id'])),
      customerName: safeString(pickField(dto, ['walkInName', 'customerName'])),
      customerPhone: safeString(pickField(dto, ['walkInPhone', 'customerPhone'])),
      serviceName: safeString(pickField(dto, ['serviceName'])) || (dto?.serviceId ? `Dịch vụ #${dto.serviceId}` : ''),
      servicePrice: safeNumber(pickField(dto, ['servicePriceSnapshot', 'servicePrice'])),
      employeeName: safeString(pickField(dto, ['employeeName'])),
      scheduledAt: safeString(pickField(dto, ['scheduledAt'])),
      durationMinutes: safeNumber(pickField(dto, ['durationMinutes'])),
      status: safeString(pickField(dto, ['status'])),
      customerNote: safeString(pickField(dto, ['customerNote'])),
      salonNote: safeString(pickField(dto, ['salonNote'])),
      walkIn: pickField(dto, ['walkIn']) === true,
    }
  }
  toStatusDto(status: string, salonNote?: string): BookingStatusDto {
    return { status, ...(salonNote ? { salonNote: salonNote.trim() } : {}) }
  }
}
export class OwnerReviewMapper extends BaseMapper<OwnerReviewDto, OwnerReview> {
  toModel(dto: OwnerReviewDto | null | undefined): OwnerReview {
    return { id: safeString(pickField(dto, ['id'])), customerName: safeString(pickField(dto, ['customerName'])), employeeName: safeString(pickField(dto, ['employeeName'])), employeeAvatarUrl: safeString(pickField(dto, ['employeeAvatarUrl'])) || null, rating: safeNumber(pickField(dto, ['rating'])), comment: safeString(pickField(dto, ['comment'])), salonReply: safeString(pickField(dto, ['salonReply'])), salonRepliedAt: safeString(pickField(dto, ['salonRepliedAt'])), createdAt: safeString(pickField(dto, ['createdAt'])) }
  }
  toReplyDto(reply: string): ReviewReplyDto { return { reply: reply.trim() } }
}
export class RevenueMapper extends BaseMapper<RevenueReportDto, RevenueReport> {
  private point(dto: RevenuePointDto | null | undefined): RevenuePoint {
    return { date: safeString(pickField(dto, ['date'])), gross: safeNumber(pickField(dto, ['gross'])), fee: safeNumber(pickField(dto, ['fee'])), net: safeNumber(pickField(dto, ['net'])), bookings: safeNumber(pickField(dto, ['bookings'])) }
  }
  toModel(dto: RevenueReportDto | null | undefined): RevenueReport {
    return { gross: safeNumber(pickField(dto, ['gross'])), fee: safeNumber(pickField(dto, ['fee'])), net: safeNumber(pickField(dto, ['net'])), completedBookings: safeNumber(pickField(dto, ['completedBookings'])), estimatedBookings: safeNumber(pickField(dto, ['estimatedBookings'])), points: safeArray<RevenuePointDto>(pickField(dto, ['points'])).map(item => this.point(item)) }
  }
}
export const ownerSummaryMapper = new OwnerSummaryMapper()
export const ownerSalonMapper = new OwnerSalonMapper()
export const ownerServiceMapper = new OwnerServiceMapper()
export const ownerEmployeeMapper = new OwnerEmployeeMapper()
export const ownerBookingMapper = new OwnerBookingMapper()
export const salonChangeMapper = new SalonChangeMapper()
export const ownerReviewMapper = new OwnerReviewMapper()
export const revenueMapper = new RevenueMapper()
export class WorkingHourMapper extends BaseMapper<WorkingHourDto, WorkingHour> {
  toModel(dto: WorkingHourDto | null | undefined): WorkingHour { return { dayOfWeek: safeString(pickField(dto, ['dayOfWeek'])), openTime: safeString(pickField(dto, ['openTime'])) || null, closeTime: safeString(pickField(dto, ['closeTime'])) || null, closed: pickField(dto, ['closed']) === true } }
  toSaveDto(model: WorkingHour): WorkingHourDto { return { dayOfWeek: model.dayOfWeek, openTime: model.closed ? null : model.openTime, closeTime: model.closed ? null : model.closeTime, closed: model.closed } }
}
export class ClosureMapper extends BaseMapper<ClosureDto, Closure> {
  toModel(dto: ClosureDto | null | undefined): Closure { return { id: safeString(pickField(dto, ['id'])), date: safeString(pickField(dto, ['date'])), reason: safeString(pickField(dto, ['reason'])) } }
  toSaveDto(date: string, reason: string): SaveClosureDto { return { date, reason: reason.trim() } }
}
export class WalkInBookingMapper extends BaseMapper<WalkInBookingDto, WalkInBooking> {
  toModel(dto: WalkInBookingDto | null | undefined): WalkInBooking { return { serviceId: safeString(pickField(dto, ['serviceId'])), employeeId: safeString(pickField(dto, ['employeeId'])) || undefined, scheduledAt: safeString(pickField(dto, ['scheduledAt'])), customerName: safeString(pickField(dto, ['customerName'])), customerPhone: safeString(pickField(dto, ['customerPhone'])), customerNote: safeString(pickField(dto, ['customerNote'])) } }
  toSaveDto(model: WalkInBooking): WalkInBookingDto { return { serviceId: Number(model.serviceId), ...(model.employeeId ? { employeeId: Number(model.employeeId) } : {}), scheduledAt: model.scheduledAt, customerName: model.customerName.trim(), customerPhone: model.customerPhone.trim(), customerNote: model.customerNote.trim() } }
}
export const workingHourMapper = new WorkingHourMapper()
export const closureMapper = new ClosureMapper()
export const walkInBookingMapper = new WalkInBookingMapper()
