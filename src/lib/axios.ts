import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'
import { profileMapper } from '@/features/auth/mappers/profile.mapper'
import type { ProfileDto } from '@/features/auth/types/profile.dto'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  user: ProfileDto
  tokenType: string
  expiresIn: number
}

// Backend controllers use the /api/v1 prefix.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  timeout: 20_000,
})

let refreshing: Promise<string> | null = null

export function refreshSession(): Promise<string> {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = localStorage.getItem('ellora.refreshToken') || useAuthStore.getState().refreshToken
      if (!refreshToken) throw new Error('Phiên đăng nhập đã hết hạn.')
      const rotate = async () => {
        const currentRefresh = localStorage.getItem('ellora.refreshToken') || useAuthStore.getState().refreshToken
        const currentAccess = localStorage.getItem('ellora.token')
        if (currentRefresh !== refreshToken && currentAccess) {
          const user = useAuthStore.getState().user
          if (user && currentRefresh) useAuthStore.getState().setSession(currentAccess, user, currentRefresh)
          return currentAccess
        }
        const { data } = await axios.post<TokenResponse>(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: currentRefresh })
        useAuthStore.getState().setSession(data.accessToken, profileMapper.toModel(data.user), data.refreshToken)
        return data.accessToken
      }
      return navigator.locks ? navigator.locks.request('ellora-auth-refresh', rotate) : rotate()
    })().finally(() => {
      refreshing = null
    })
  }
  return refreshing
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ellora.token') || useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    if (error.response?.status === 401 && config && !config._retry && !String(config.url).includes('/auth/')) {
      config._retry = true
      try {
        const token = await refreshSession()
        config.headers.Authorization = `Bearer ${token}`
        return api(config)
      } catch {
        // If refresh fails on 401, clear credentials
        useAuthStore.getState().clear()
      }
    }
    return Promise.reject(error)
  }
)

export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data?.detail) return data.detail
    if (data?.title) return data.title
    if (data?.message) return data.message
    if (typeof data === 'string' && data.trim()) return data

    // If server responded with an HTTP status code but no structured body
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.'
        case 401:
          return 'Thông tin xác thực không hợp lệ hoặc phiên đăng nhập đã hết hạn.'
        case 403:
          return 'Bạn không có quyền thực hiện thao tác này.'
        case 404:
          return 'Không tìm thấy tài nguyên yêu cầu.'
        case 409:
          return 'Dữ liệu bị trùng lặp hoặc xung đột.'
        case 429:
          return 'Quá nhiều yêu cầu. Vui lòng đợi trong giây lát rồi thử lại.'
        case 500:
        case 502:
        case 503:
          return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
        default:
          return `Lỗi máy chủ (${error.response.status}). Vui lòng thử lại.`
      }
    }

    // Only if there is genuinely no response from server (network error, CORS block, timeout)
    if (error.code === 'ECONNABORTED') {
      return 'Kết nối máy chủ bị quá thời gian (timeout). Vui lòng thử lại.'
    }
    return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại.'
  }
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.'
}
