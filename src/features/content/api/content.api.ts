import { api } from '@/lib/axios'
import type { APIResponse, PageDto, PageModel } from '@/types/api'
import { contentDetailMapper, contentReviewMapper, contentSalonMapper } from '../mappers/content.mapper'
import type { ContentDetailDto, ContentReviewDto, ContentSalonDto } from '../types/content.dto'
import type { ContentDetail, ContentReview, ContentSalon } from '../types/content.model'

const base = '/admin/content'
export const contentApi = {
  async salons(page: number): Promise<PageModel<ContentSalon>> {
    const response = await api.get<APIResponse<PageDto<ContentSalonDto>>>(`${base}/salons`, { params: { page } })
    return contentSalonMapper.toPaginationModel(response.data.data)
  },
  async detail(id: string): Promise<ContentDetail> {
    const response = await api.get<APIResponse<ContentDetailDto>>(`${base}/salons/${id}`)
    return contentDetailMapper.toModel(response.data.data)
  },
  async reviews(id: string, page: number): Promise<PageModel<ContentReview>> {
    const response = await api.get<APIResponse<PageDto<ContentReviewDto>>>(`${base}/salons/${id}/reviews`, { params: { page } })
    return contentReviewMapper.toPaginationModel(response.data.data)
  },
  async uploadPhoto(salonId: string, kind: string, entityId: string, file: File, oldUrl?: string): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    if (oldUrl) form.append('oldUrl', oldUrl)
    const response = await api.post<APIResponse<string>>(`${base}/salons/${salonId}/photos/${kind}/${entityId}`, form)
    return response.data.data
  },
  async removePhoto(salonId: string, kind: string, entityId: string, url?: string): Promise<void> {
    await api.delete(`${base}/salons/${salonId}/photos/${kind}/${entityId}`, { params: url ? { url } : {} })
  },
  async editReview(id: string, rating: number, comment: string): Promise<void> {
    await api.put(`${base}/reviews/${id}`, contentReviewMapper.toEditDto(rating, comment))
  },
  async deleteReview(id: string): Promise<void> { await api.delete(`${base}/reviews/${id}`) },
  async editReply(id: string, reply: string): Promise<void> { await api.put(`${base}/reviews/${id}/reply`, contentReviewMapper.toReplyDto(reply)) },
  async deleteReply(id: string): Promise<void> { await api.delete(`${base}/reviews/${id}/reply`) },
}
