import { BaseMapper } from '@/lib/mapper/base-mapper'
import { pickField, safeNumber, safeString } from '@/lib/mapper/field-helpers'
import type { BookingDto, BookingRequestDto, CompletionResponseDto } from '../types/booking.dto'
import type { BookingDraft, BookingReceipt } from '../types/booking.model'

export class BookingMapper extends BaseMapper<BookingDto, BookingReceipt> {
  toModel(dto: BookingDto | null | undefined): BookingReceipt {
    return {
      customerId: safeString(pickField(dto, ['customerId'])),
      id: safeString(pickField(dto, ['id'])),
      salonId: safeString(pickField(dto, ['salonId'])),
      salonName: safeString(pickField(dto, ['salonName'])),
      salonLogoUrl: safeString(pickField(dto, ['salonLogoUrl'])) || null,
      customerName: safeString(pickField(dto, ['customerName'])),
      serviceName: safeString(pickField(dto, ['serviceName'])),
      servicePrice: safeNumber(pickField(dto, ['servicePriceSnapshot', 'servicePrice'])),
      scheduledAt: safeString(pickField(dto, ['scheduledAt'])),
      status: safeString(pickField(dto, ['status'])),
      completionConfirmation: safeString(pickField(dto, ['completionConfirmation'])) || null,
      completionVersion: safeNumber(pickField(dto, ['completionVersion'])),
      reviewed: pickField(dto, ['reviewed']) === true,
    }
  }
  toCreateDto(draft: BookingDraft): BookingRequestDto {
    return {
      salonId: Number(draft.salonId),
      serviceId: Number(draft.serviceId),
      ...(draft.employeeId ? { employeeId: Number(draft.employeeId) } : {}),
      scheduledAt: new Date(`${draft.date}T${draft.time}:00+07:00`).toISOString(),
      customerNote: draft.customerNote.trim(),
      customerPhone: draft.customerPhone.trim(),
    }
  }
  toCompletionDto(completed: boolean, completionVersion: number, reason?: string): CompletionResponseDto {
    return { completed, completionVersion, ...(reason ? { reason: reason.trim() } : {}) }
  }
}
export const bookingMapper = new BookingMapper()
