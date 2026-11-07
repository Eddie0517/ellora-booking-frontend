import { api } from '@/lib/axios'
import { AUTH_ENDPOINTS } from '../constants/auth.endpoints'
import { profileMapper } from '../mappers/profile.mapper'
import type { ProfileDto } from '../types/profile.dto'
import type { Profile } from '../types/profile.model'

export const profileApi = {
  async me(): Promise<Profile> {
    const response = await api.get<ProfileDto>(AUTH_ENDPOINTS.profile)
    return profileMapper.toModel(response.data)
  },
  async update(profile: Pick<Profile, 'fullName' | 'phone'> & { avatarUrl?: string | null }): Promise<Profile> {
    const response = await api.put<ProfileDto>(AUTH_ENDPOINTS.profile, profileMapper.toUpdateDto(profile))
    return profileMapper.toModel(response.data)
  },
  async uploadAvatar(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'avatars')
    const response = await api.post<{ url: string }>('/media/upload', form)
    return response.data.url
  },
}
