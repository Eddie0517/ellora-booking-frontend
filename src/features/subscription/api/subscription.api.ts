import { api } from '@/lib/axios'
import type { PageDto, PageModel } from '@/types/api'
import { SUBSCRIPTION_ENDPOINTS } from '../constants/subscription.endpoints'
import { ownerSubscriptionMapper, planMapper, requestMapper } from '../mappers/subscription.mapper'
import type { OwnerSubscriptionDto, PlanDto, SubscriptionRequestDto } from '../types/subscription.dto'
import type { OwnerSubscription, Plan, SubscriptionRequest, Tier } from '../types/subscription.model'

export const subscriptionApi = {
  async plans(): Promise<Plan[]> { const response = await api.get<PlanDto[]>(SUBSCRIPTION_ENDPOINTS.plans); return planMapper.toListModel(response.data) },
  async owner(): Promise<OwnerSubscription> { const response = await api.get<OwnerSubscriptionDto>(SUBSCRIPTION_ENDPOINTS.owner); return ownerSubscriptionMapper.toModel(response.data) },
  async ownerRequests(page: number): Promise<PageModel<SubscriptionRequest>> { const response = await api.get<PageDto<SubscriptionRequestDto>>(SUBSCRIPTION_ENDPOINTS.ownerRequests, { params: { page, size: 20 } }); return requestMapper.toPaginationModel(response.data) },
  async request(tier: Tier, expectedPrice: number): Promise<SubscriptionRequest> { const response = await api.post<SubscriptionRequestDto>(SUBSCRIPTION_ENDPOINTS.ownerRequests, requestMapper.toCreateDto(tier, expectedPrice)); return requestMapper.toModel(response.data) },
  async prepare(id: string): Promise<SubscriptionRequest> { const response = await api.post<SubscriptionRequestDto>(SUBSCRIPTION_ENDPOINTS.prepare(id), {}); return requestMapper.toModel(response.data) },
  async cancelRequest(id: string): Promise<void> { await api.delete(SUBSCRIPTION_ENDPOINTS.cancelRequest(id)) },
  async syncOwnerPayment(id: string): Promise<SubscriptionRequest> { const response = await api.post<SubscriptionRequestDto>(SUBSCRIPTION_ENDPOINTS.syncOwnerPayment(id), {}); return requestMapper.toModel(response.data) },
  async syncAdminPayment(id: string): Promise<SubscriptionRequest> { const response = await api.post<SubscriptionRequestDto>(SUBSCRIPTION_ENDPOINTS.syncAdminPayment(id), {}); return requestMapper.toModel(response.data) },
  async adminPlans(): Promise<Plan[]> { const response = await api.get<PlanDto[]>(SUBSCRIPTION_ENDPOINTS.adminPlans); return planMapper.toListModel(response.data) },
  async savePlan(tier: Tier, monthlyPrice: number | null, enabled: boolean, description?: string, features?: string[]): Promise<Plan> { const response = await api.put<PlanDto>(SUBSCRIPTION_ENDPOINTS.adminPlan(tier), planMapper.toSaveDto(monthlyPrice, enabled, description, features)); return planMapper.toModel(response.data) },
  async adminRequests(status: string, page: number): Promise<PageModel<SubscriptionRequest>> { const response = await api.get<PageDto<SubscriptionRequestDto>>(SUBSCRIPTION_ENDPOINTS.adminRequests, { params: { page, size: 20, ...(status ? { status } : {}) } }); return requestMapper.toPaginationModel(response.data) },
  async decide(id: string, status: 'APPROVED' | 'REJECTED', note: string): Promise<SubscriptionRequest> { const response = await api.patch<SubscriptionRequestDto>(SUBSCRIPTION_ENDPOINTS.adminRequest(id), requestMapper.toDecideDto(status, note)); return requestMapper.toModel(response.data) },
}
