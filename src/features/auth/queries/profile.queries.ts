import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profile.api'
import { useAuthStore } from '@/store/auth.store'

export const PROFILE_QUERY_KEYS = { all: ['profile'] as const, me: ['profile', 'me'] as const }

export const useProfile = () => {
  const token = useAuthStore(state => state.token)
  const authUser = useAuthStore(state => state.user)
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.me,
    queryFn: profileApi.me,
    enabled: !!token,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    placeholderData: authUser ?? undefined,
  })
}

export const useUpdateProfile = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: profile => {
      const token = useAuthStore.getState().token
      if (token) useAuthStore.getState().setSession(token, profile)
      client.setQueryData(PROFILE_QUERY_KEYS.me, profile)
    },
  })
}

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
  })
}
