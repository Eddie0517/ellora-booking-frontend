import { api } from '@/lib/axios'
import { REGISTRATION_ENDPOINTS } from '../constants/registration.endpoints'
import { registrationMapper } from '../mappers/registration.mapper'
import type { RegistrationDto } from '../types/registration.dto'
import type { Registration, RegistrationDraft } from '../types/registration.model'

export const registrationApi = {
  async mine(): Promise<Registration> { const response = await api.get<RegistrationDto>(REGISTRATION_ENDPOINTS.mine); return registrationMapper.toModel(response.data) },
  async create(draft: RegistrationDraft): Promise<Registration> { const response = await api.post<RegistrationDto>(REGISTRATION_ENDPOINTS.create, registrationMapper.toCreateDto(draft)); return registrationMapper.toModel(response.data) },
}
