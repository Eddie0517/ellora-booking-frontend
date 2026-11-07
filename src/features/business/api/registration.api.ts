import { api } from '@/lib/axios'
import { REGISTRATION_ENDPOINTS } from '../constants/registration.endpoints'
import { registrationMapper } from '../mappers/registration.mapper'
import type { RegistrationDto } from '../types/registration.dto'
import type { Registration, RegistrationDraft } from '../types/registration.model'

export const registrationApi = {
  async mine(): Promise<Registration | null> {
    try {
      const response = await api.get<RegistrationDto>(REGISTRATION_ENDPOINTS.mine)
      return registrationMapper.toModel(response.data)
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const res = (error as { response?: { status?: number } }).response
        if (res?.status === 404) {
          return null
        }
      }
      throw error
    }
  },
  async create(draft: RegistrationDraft): Promise<Registration> {
    const response = await api.post<RegistrationDto>(REGISTRATION_ENDPOINTS.create, registrationMapper.toCreateDto(draft))
    return registrationMapper.toModel(response.data)
  },
}
