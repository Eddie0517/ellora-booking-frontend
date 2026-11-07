import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { registrationApi } from '../api/registration.api'
import type { RegistrationDraft } from '../types/registration.model'
import { useAuthStore } from '@/store/auth.store'

export const REGISTRATION_QUERY_KEYS = { all: ['registration'] as const, mine: ['registration', 'mine'] as const }
export const useRegistration = () => { const token = useAuthStore(state => state.token); return useQuery({ queryKey: REGISTRATION_QUERY_KEYS.mine, queryFn: registrationApi.mine, enabled: !!token, retry: false }) }
export const useCreateRegistration = () => { const client = useQueryClient(); return useMutation({ mutationFn: (draft: RegistrationDraft) => registrationApi.create(draft), onSuccess: (data) => { client.setQueryData(REGISTRATION_QUERY_KEYS.mine, data); client.invalidateQueries({ queryKey: REGISTRATION_QUERY_KEYS.mine }); } }) }
