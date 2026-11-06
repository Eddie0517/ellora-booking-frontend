import { api, type TokenResponse } from '@/lib/axios'
import { profileMapper } from '../mappers/profile.mapper'
import { useAuthStore } from '@/store/auth.store'
import { queryClient } from '@/lib/query-client'

function save(data: TokenResponse) { const user = profileMapper.toModel(data.user); useAuthStore.getState().setSession(data.accessToken, user, data.refreshToken); return user }
export const jwtAuth = {
  async register(email: string, password: string, fullName: string, phone: string) { await api.post('/auth/register', { email, password, fullName, phone: phone || null }) },
  async confirm(email: string, code: string) { const { data } = await api.post<TokenResponse>('/auth/verify-email', { email, code }); return save(data) },
  async resend(email: string) { await api.post('/auth/resend-verification', { email }) },
  async login(email: string, password: string) { const { data } = await api.post<TokenResponse>('/auth/login', { email, password }); return save(data) },
  async logout() { try { await api.post('/auth/logout', { refreshToken: useAuthStore.getState().refreshToken }) } finally { useAuthStore.getState().clear(); queryClient.clear() } },
  async requestPasswordReset(email: string) { await api.post('/auth/forgot-password', { email }) },
  async confirmPasswordReset(email: string, confirmationCode: string, newPassword: string) { await api.post('/auth/confirm-forgot-password', { email, confirmationCode, newPassword }) },
  async changePassword(currentPassword: string, newPassword: string) { await api.post('/auth/change-password', { currentPassword, newPassword }) },
}
