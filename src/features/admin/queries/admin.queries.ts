import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'

export const ADMIN_QUERY_KEYS = {
  all: ['admin'] as const,
  summary: ['admin', 'summary'] as const,
  revenue: (from: string, to: string, groupBy: string) => ['admin', 'revenue', from, to, groupBy] as const,
  users: (keyword: string, page: number) => ['admin', 'users', keyword, page] as const,
}
export const ADMIN_SALON_KEYS = {
  all: ['admin', 'salons'] as const,
  pending: (page: number, status?: string) => ['admin', 'salons', 'pending', page, status || 'ALL'] as const,
  detail: (id: string) => ['admin', 'salons', id] as const,
}
export const ADMIN_SUPPORT_KEYS = { all: ['admin', 'support'] as const }
export const ADMIN_CHANGE_KEYS = {
  all: ['admin', 'changes'] as const,
  page: (page: number) => ['admin', 'changes', page] as const,
}
export const ADMIN_DISPUTE_KEYS = {
  all: ['admin', 'disputes'] as const,
  list: (status: string, page: number) => ['admin', 'disputes', status, page] as const,
  detail: (id: string) => ['admin', 'disputes', 'detail', id] as const,
}

export const useAdminSummary = () =>
  useQuery({ queryKey: ADMIN_QUERY_KEYS.summary, queryFn: adminApi.summary })

export const useAdminRevenue = (from: string, to: string, groupBy: 'day' | 'week' | 'month' | 'year') =>
  useQuery({
    queryKey: ADMIN_QUERY_KEYS.revenue(from, to, groupBy),
    queryFn: () => adminApi.revenue(from, to, groupBy),
    enabled: Boolean(from && to && from <= to),
  })

export const useAdminUsers = (keyword: string, page: number) =>
  useQuery({ queryKey: ADMIN_QUERY_KEYS.users(keyword, page), queryFn: () => adminApi.users(keyword, page) })

export const useLockAdminUser = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, locked }: { id: string; locked: boolean }) => adminApi.lockUser(id, locked),
    onSuccess: () => client.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.all }),
  })
}

export const usePendingSalons = (
  page: number = 0,
  status?: string,
  options?: { refetchInterval?: number; enabled?: boolean }
) =>
  useQuery({
    queryKey: ADMIN_SALON_KEYS.pending(page, status),
    queryFn: () => adminApi.pendingSalons(page, status),
    ...options,
  })

export const usePendingSalon = (id: string) =>
  useQuery({ queryKey: ADMIN_SALON_KEYS.detail(id), queryFn: () => adminApi.salon(id), enabled: !!id })

export const useDecideSalon = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) => adminApi.decideSalon(id, action),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ADMIN_SALON_KEYS.all })
      client.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.summary })
    },
  })
}

export const useAdminSupport = () =>
  useQuery({ queryKey: ADMIN_SUPPORT_KEYS.all, queryFn: adminApi.support })

export const useUpdateAdminSupport = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: adminApi.updateSupport,
    onSuccess: (contact) => client.setQueryData(ADMIN_SUPPORT_KEYS.all, contact),
  })
}

export const useSalonChanges = (page: number) =>
  useQuery({ queryKey: ADMIN_CHANGE_KEYS.page(page), queryFn: () => adminApi.salonChanges(page) })

export const useDecideSalonChange = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      adminApi.decideChange(id, action),
    onSuccess: () => client.invalidateQueries({ queryKey: ADMIN_CHANGE_KEYS.all }),
  })
}

export const useAdminDisputes = (
  status: string,
  page: number,
  options?: { refetchInterval?: number; enabled?: boolean }
) =>
  useQuery({
    queryKey: ADMIN_DISPUTE_KEYS.list(status, page),
    queryFn: () => adminApi.disputes(status, page),
    ...options,
  })

export const useAdminDispute = (id: string) =>
  useQuery({ queryKey: ADMIN_DISPUTE_KEYS.detail(id), queryFn: () => adminApi.dispute(id), enabled: !!id })

export const useResolveAdminDispute = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, outcome, note }: { id: string; outcome: 'UPHELD' | 'REOPENED'; note: string }) =>
      adminApi.resolveDispute(id, outcome, note),
    onSuccess: () => client.invalidateQueries({ queryKey: ADMIN_DISPUTE_KEYS.all }),
  })
}
