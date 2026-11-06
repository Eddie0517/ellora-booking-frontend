import { BaseMapper } from '@/lib/mapper/base-mapper'
import { pickField, safeString } from '@/lib/mapper/field-helpers'
import type { ProfileDto, UpdateProfileDto } from '../types/profile.dto'
import type { Profile } from '../types/profile.model'

export class ProfileMapper extends BaseMapper<ProfileDto, Profile> {
  toModel(dto: ProfileDto | null | undefined): Profile {
    const role = safeString(pickField(dto, ['role']))
    return {
      id: safeString(pickField(dto, ['id'])),
      email: safeString(pickField(dto, ['email'])),
      fullName: safeString(pickField(dto, ['fullName'])),
      phone: safeString(pickField(dto, ['phone'])),
      avatarUrl: safeString(pickField(dto, ['avatarUrl'])) || null,
      role: role === 'ADMIN' || role === 'SALON_OWNER' ? role : 'CUSTOMER',
    }
  }
  toUpdateDto(profile: Pick<Profile, 'fullName' | 'phone'>): UpdateProfileDto {
    return { fullName: profile.fullName.trim(), phone: profile.phone.trim() }
  }
}
export const profileMapper = new ProfileMapper()
