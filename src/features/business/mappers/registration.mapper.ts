import { BaseMapper } from '@/lib/mapper/base-mapper'
import { pickField, safeString } from '@/lib/mapper/field-helpers'
import type { RegistrationDto, RegistrationRequestDto } from '../types/registration.dto'
import type { Registration, RegistrationDraft } from '../types/registration.model'

export class RegistrationMapper extends BaseMapper<RegistrationDto, Registration> {
  toModel(dto: RegistrationDto | null | undefined): Registration {
    return { id: safeString(pickField(dto, ['id'])), name: safeString(pickField(dto, ['name'])), address: safeString(pickField(dto, ['address'])), city: safeString(pickField(dto, ['city'])), district: safeString(pickField(dto, ['district'])), status: safeString(pickField(dto, ['status'])) }
  }
  toCreateDto(draft: RegistrationDraft): RegistrationRequestDto { return { name: draft.name.trim(), address: draft.address.trim(), city: draft.city.trim(), district: draft.district.trim(), phone: draft.phone.trim(), email: draft.email.trim(), description: draft.description.trim() } }
}
export const registrationMapper = new RegistrationMapper()
