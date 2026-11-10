import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '../api/subscription.api'
import type { Tier } from '../types/subscription.model'

export const SUBSCRIPTION_KEYS = { all: ['subscription'] as const, plans: ['subscription', 'plans'] as const, owner: ['subscription', 'owner'] as const, ownerRequests: (page: number) => ['subscription', 'owner', 'requests', page] as const, adminPlans: ['subscription', 'admin', 'plans'] as const, adminRequests: (status: string, page: number) => ['subscription', 'admin', 'requests', status, page] as const }
export const usePlans = () => useQuery({ queryKey: SUBSCRIPTION_KEYS.plans, queryFn: subscriptionApi.plans })
export const useOwnerSubscription = () => useQuery({ queryKey: SUBSCRIPTION_KEYS.owner, queryFn: subscriptionApi.owner, refetchInterval: 10000 })
export const useOwnerSubscriptionRequests = (page: number) => useQuery({ queryKey: SUBSCRIPTION_KEYS.ownerRequests(page), queryFn: () => subscriptionApi.ownerRequests(page) })
export const useAdminPlans = () => useQuery({ queryKey: SUBSCRIPTION_KEYS.adminPlans, queryFn: subscriptionApi.adminPlans })
export const useAdminSubscriptionRequests = (status: string, page: number) => useQuery({ queryKey: SUBSCRIPTION_KEYS.adminRequests(status, page), queryFn: () => subscriptionApi.adminRequests(status, page), refetchInterval: 10000 })
export const useSubscriptionMutation = () => {
  const client = useQueryClient()
  const invalidate = () => client.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.all })
  return {
    request: useMutation({ mutationFn: ({ tier, price }: { tier: Tier; price: number }) => subscriptionApi.request(tier, price), onSuccess: invalidate }),
    prepare: useMutation({ mutationFn: subscriptionApi.prepare, onSuccess: invalidate }),
    cancelRequest: useMutation({ mutationFn: subscriptionApi.cancelRequest, onSuccess: invalidate }),
    syncOwnerPayment: useMutation({ mutationFn: subscriptionApi.syncOwnerPayment, onSuccess: invalidate }),
    syncAdminPayment: useMutation({ mutationFn: subscriptionApi.syncAdminPayment, onSuccess: invalidate }),
    savePlan: useMutation({
      mutationFn: ({ tier, price, enabled, description, features }: {
        tier: Tier
        price: number | null
        enabled: boolean
        description?: string
        features?: string[]
      }) => subscriptionApi.savePlan(tier, price, enabled, description, features),
      onSuccess: invalidate,
    }),
    decide: useMutation({ mutationFn: ({ id, status, note }: { id: string; status: 'APPROVED' | 'REJECTED'; note: string }) => subscriptionApi.decide(id, status, note), onSuccess: invalidate }),
  }
}
