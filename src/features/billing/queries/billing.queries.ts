import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { billingApi } from '../api/billing.api'

export const BILLING_QUERY_KEYS = {
  all: ['billing'] as const,
  config: ['billing', 'config'] as const,
  statements: (month: string, page: number) => ['billing', 'statements', month, page] as const,
  ownerBill: (month: string) => ['billing', 'owner', month] as const,
}

export const useBillingConfig = () =>
  useQuery({ queryKey: BILLING_QUERY_KEYS.config, queryFn: billingApi.getConfig })

export const useUpdateBillingRate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (percent: number) => billingApi.updateRate(percent),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all }),
  })
}

export const useUploadBillingQr = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => billingApi.uploadQr(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all }),
  })
}

export const useBillingStatements = (month: string, page: number) =>
  useQuery({
    queryKey: BILLING_QUERY_KEYS.statements(month, page),
    queryFn: () => billingApi.getStatements(month, page),
    enabled: !!month,
  })

export const useConfirmPayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ salonId, month, expectedDue }: { salonId: number; month: string; expectedDue: number }) =>
      billingApi.confirmPayment(salonId, month, expectedDue),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all }),
  })
}

export const useRemindPayment = () => {
  return useMutation({
    mutationFn: ({ salonId, month }: { salonId: number; month: string }) =>
      billingApi.remindPayment(salonId, month),
  })
}

export const useOwnerBill = (month: string) =>
  useQuery({
    queryKey: BILLING_QUERY_KEYS.ownerBill(month),
    queryFn: () => billingApi.getOwnerBill(month),
    enabled: !!month,
  })
