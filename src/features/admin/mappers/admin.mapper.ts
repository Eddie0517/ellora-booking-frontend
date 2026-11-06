import { BaseMapper } from '@/lib/mapper/base-mapper'
import { pickField, safeArray, safeNumber, safeString } from '@/lib/mapper/field-helpers'
import type {
  AdminRevenuePointDto,
  AdminRevenueReportDto,
  AdminSummaryDto,
  AdminUserDto,
  BookingDisputeDto,
  LockUserDto,
  PendingSalonDto,
  ResolveDisputeDto,
  SalonChangeDto,
  SalonChangeFieldsDto,
  SupportContactDto,
} from '../types/admin.dto'
import type {
  AdminRevenuePoint,
  AdminRevenueReport,
  AdminSummary,
  AdminUser,
  BookingDispute,
  PendingSalon,
  SalonChange,
  SalonChangeFields,
  SupportContact,
} from '../types/admin.model'

export class AdminSummaryMapper extends BaseMapper<AdminSummaryDto, AdminSummary> {
  toModel(dto: AdminSummaryDto | null | undefined): AdminSummary {
    return {
      totalSalons: safeNumber(pickField(dto, ['totalSalons', 'activeSalons'])),
      totalRevenue: safeNumber(pickField(dto, ['totalRevenue', 'gross'])),
      customers: safeNumber(pickField(dto, ['customers', 'totalUsers'])),
      activeSalons: safeNumber(pickField(dto, ['activeSalons'])),
      salonsAwaitingApproval: safeNumber(pickField(dto, ['salonsAwaitingApproval', 'pendingSalons'])),
      totalBookings: safeNumber(pickField(dto, ['totalBookings'])),
      completedBookings: safeNumber(pickField(dto, ['completedBookings'])),
      customersWithCompletedBooking: safeNumber(pickField(dto, ['customersWithCompletedBooking'])),
      returningCustomers: safeNumber(pickField(dto, ['returningCustomers'])),
      returningCustomerRate: safeNumber(pickField(dto, ['returningCustomerRate'])),
    }
  }
}

export class AdminRevenuePointMapper extends BaseMapper<AdminRevenuePointDto, AdminRevenuePoint> {
  toModel(dto: AdminRevenuePointDto | null | undefined): AdminRevenuePoint {
    return {
      date: safeString(pickField(dto, ['date'])),
      gross: safeNumber(pickField(dto, ['gross'])),
      fee: safeNumber(pickField(dto, ['fee'])),
      bookings: safeNumber(pickField(dto, ['bookings'])),
    }
  }
}

export class AdminRevenueMapper extends BaseMapper<AdminRevenueReportDto, AdminRevenueReport> {
  private readonly pointMapper = new AdminRevenuePointMapper()

  toModel(dto: AdminRevenueReportDto | null | undefined): AdminRevenueReport {
    const rawPoints = pickField(dto, ['points'])
    const pointsList = safeArray<AdminRevenuePointDto>(rawPoints)
    return {
      from: safeString(pickField(dto, ['from'])),
      to: safeString(pickField(dto, ['to'])),
      groupBy: safeString(pickField(dto, ['groupBy']), 'day'),
      gross: safeNumber(pickField(dto, ['gross'])),
      fee: safeNumber(pickField(dto, ['fee'])),
      completedBookings: safeNumber(pickField(dto, ['completedBookings'])),
      estimatedBookings: safeNumber(pickField(dto, ['estimatedBookings'])),
      points: this.pointMapper.toListModel(pointsList),
    }
  }
}

export class AdminUserMapper extends BaseMapper<AdminUserDto, AdminUser> {
  toModel(dto: AdminUserDto | null | undefined): AdminUser {
    return {
      id: safeString(pickField(dto, ['id'])),
      fullName: safeString(pickField(dto, ['fullName'])),
      email: safeString(pickField(dto, ['email'])),
      phone: safeString(pickField(dto, ['phone'])),
      role: safeString(pickField(dto, ['role'])),
      enabled: pickField(dto, ['enabled']) === true,
      locked: pickField(dto, ['locked']) === true,
      createdAt: safeString(pickField(dto, ['createdAt'])),
    }
  }
  toLockDto(locked: boolean): LockUserDto {
    return { locked }
  }
}

export class PendingSalonMapper extends BaseMapper<PendingSalonDto, PendingSalon> {
  toModel(dto: PendingSalonDto | null | undefined): PendingSalon {
    return {
      id: safeString(pickField(dto, ['id'])),
      name: safeString(pickField(dto, ['name'])),
      address: safeString(pickField(dto, ['address'])),
      city: safeString(pickField(dto, ['city'])),
      district: safeString(pickField(dto, ['district'])),
      phone: safeString(pickField(dto, ['phone'])),
      email: safeString(pickField(dto, ['email'])),
      description: safeString(pickField(dto, ['description'])),
      ownerName: safeString(pickField(dto, ['ownerName'])),
      status: safeString(pickField(dto, ['status'])),
    }
  }
}

export class SupportContactMapper extends BaseMapper<SupportContactDto, SupportContact> {
  toModel(dto: SupportContactDto | null | undefined): SupportContact {
    return {
      email: safeString(pickField(dto, ['email'])),
      phone: safeString(pickField(dto, ['phone'])),
      facebookUrl: safeString(pickField(dto, ['facebookUrl'])),
    }
  }
  toUpdateDto(model: SupportContact): SupportContactDto {
    return {
      email: model.email.trim(),
      phone: model.phone.trim(),
      facebookUrl: model.facebookUrl.trim(),
    }
  }
}

export class SalonChangeMapper extends BaseMapper<SalonChangeDto, SalonChange> {
  toModel(dto: SalonChangeDto | null | undefined): SalonChange {
    return {
      id: safeString(pickField(dto, ['id'])),
      salonId: safeString(pickField(dto, ['salonId'])),
      salonName: safeString(pickField(dto, ['salonName'])),
      kind: safeString(pickField(dto, ['kind'])),
      status: safeString(pickField(dto, ['status'])),
      submittedAt: safeString(pickField(dto, ['submittedAt'])),
      current: this.toFields(pickField(dto, ['current'])),
      proposed: this.toFields(pickField(dto, ['proposed'])),
      currentLogoUrl: safeString(pickField(dto, ['currentLogoUrl'])) || null,
      proposedLogoUrl: safeString(pickField(dto, ['proposedLogoUrl'])) || null,
      currentImageUrls: safeArray<string>(pickField(dto, ['currentImageUrls'])),
      proposedImageUrls: safeArray<string>(pickField(dto, ['proposedImageUrls'])),
    }
  }

  private toFields(dto: SalonChangeFieldsDto | null | undefined): SalonChangeFields {
    const lat = safeNumber(pickField(dto, ['latitude']), NaN)
    const lng = safeNumber(pickField(dto, ['longitude']), NaN)
    return {
      name: safeString(pickField(dto, ['name'])),
      description: safeString(pickField(dto, ['description'])),
      address: safeString(pickField(dto, ['address'])),
      city: safeString(pickField(dto, ['city'])),
      district: safeString(pickField(dto, ['district'])),
      phone: safeString(pickField(dto, ['phone'])),
      email: safeString(pickField(dto, ['email'])),
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
    }
  }
}

export class BookingDisputeMapper extends BaseMapper<BookingDisputeDto, BookingDispute> {
  toModel(dto: BookingDisputeDto | null | undefined): BookingDispute {
    return {
      id: safeString(pickField(dto, ['id'])),
      bookingId: safeString(pickField(dto, ['bookingId'])),
      completionVersion: safeNumber(pickField(dto, ['completionVersion'])),
      status: safeString(pickField(dto, ['status'])),
      reason: safeString(pickField(dto, ['reason'])),
      createdAt: safeString(pickField(dto, ['createdAt'])),
      resolvedAt: safeString(pickField(dto, ['resolvedAt'])) || null,
      resolvedBy: safeString(pickField(dto, ['resolvedBy'])) || null,
      adminNote: safeString(pickField(dto, ['adminNote'])),
      customerName: safeString(pickField(dto, ['customerName'])),
      customerPhone: safeString(pickField(dto, ['customerPhone'])),
      customerEmail: safeString(pickField(dto, ['customerEmail'])),
      salonId: safeString(pickField(dto, ['salonId'])),
      salonName: safeString(pickField(dto, ['salonName'])),
      salonPhone: safeString(pickField(dto, ['salonPhone'])),
      salonEmail: safeString(pickField(dto, ['salonEmail'])),
      salonAddress: safeString(pickField(dto, ['salonAddress'])),
      ownerName: safeString(pickField(dto, ['ownerName'])),
      ownerPhone: safeString(pickField(dto, ['ownerPhone'])),
      ownerEmail: safeString(pickField(dto, ['ownerEmail'])),
      serviceName: safeString(pickField(dto, ['serviceName'])),
      servicePrice: safeNumber(pickField(dto, ['servicePrice'])),
      scheduledAt: safeString(pickField(dto, ['scheduledAt'])),
      durationMinutes: safeNumber(pickField(dto, ['durationMinutes'])),
      employeeName: safeString(pickField(dto, ['employeeName'])),
      bookingStatus: safeString(pickField(dto, ['bookingStatus'])),
      completedAt: safeString(pickField(dto, ['completedAt'])) || null,
    }
  }

  toResolveDto(outcome: 'UPHELD' | 'REOPENED', note: string): ResolveDisputeDto {
    return { outcome, note: note.trim() }
  }
}

export const adminSummaryMapper = new AdminSummaryMapper()
export const adminRevenueMapper = new AdminRevenueMapper()
export const adminUserMapper = new AdminUserMapper()
export const pendingSalonMapper = new PendingSalonMapper()
export const supportContactMapper = new SupportContactMapper()
export const salonChangeMapper = new SalonChangeMapper()
export const bookingDisputeMapper = new BookingDisputeMapper()
