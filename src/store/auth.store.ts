import { create } from 'zustand'
import type { Profile } from '@/features/auth/types/profile.model'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: Profile | null
  setSession: (token: string, user: Profile, refreshToken?: string) => void
  clear: () => void
}

const STORAGE_KEYS = {
  token: 'ellora.token',
  refreshToken: 'ellora.refreshToken',
  user: 'ellora.user',
} as const

function getSaved<T>(key: string, isJson = false): T | null {
  try {
    const val = localStorage.getItem(key) || sessionStorage.getItem(key)
    if (!val) return null
    return isJson ? JSON.parse(val) : (val as unknown as T)
  } catch {
    return null
  }
}

function persist(key: string, value: string | null) {
  try {
    if (value !== null) {
      localStorage.setItem(key, value)
      sessionStorage.setItem(key, value)
    } else {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    }
  } catch {}
}

const initialToken = getSaved<string>(STORAGE_KEYS.token)
const initialRefresh = getSaved<string>(STORAGE_KEYS.refreshToken)
const initialUser = getSaved<Profile>(STORAGE_KEYS.user, true)

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  refreshToken: initialRefresh,
  user: initialUser,
  setSession: (token, user, refreshToken) => {
    const refresh = refreshToken ?? get().refreshToken
    persist(STORAGE_KEYS.token, token)
    persist(STORAGE_KEYS.user, JSON.stringify(user))
    if (refresh) persist(STORAGE_KEYS.refreshToken, refresh)
    set({ token, user, refreshToken: refresh })
  },
  clear: () => {
    persist(STORAGE_KEYS.token, null)
    persist(STORAGE_KEYS.refreshToken, null)
    persist(STORAGE_KEYS.user, null)
    set({ token: null, refreshToken: null, user: null })
  },
}))
