import { BaseMapper } from '@/lib/mapper/base-mapper'
import { pickField, safeArray, safeNumber, safeString } from '@/lib/mapper/field-helpers'
import type { ContentDetailDto, ContentPhotoDto, ContentReviewDto, ContentSalonDto, EditReplyDto, EditReviewDto } from '../types/content.dto'
import type { ContentDetail, ContentPhoto, ContentReview, ContentSalon } from '../types/content.model'

class ContentSalonMapper extends BaseMapper<ContentSalonDto, ContentSalon> {
  toModel(dto: ContentSalonDto | null | undefined): ContentSalon { return { id: safeString(pickField(dto, ['id'])), name: safeString(pickField(dto, ['name'])), status: safeString(pickField(dto, ['status'])) } }
}
class ContentDetailMapper extends BaseMapper<ContentDetailDto, ContentDetail> {
  private photo(dto: ContentPhotoDto): ContentPhoto { return { kind: safeString(pickField(dto, ['kind'])), id: safeString(pickField(dto, ['id'])), name: safeString(pickField(dto, ['name'])), url: safeString(pickField(dto, ['url'])) || null } }
  toModel(dto: ContentDetailDto | null | undefined): ContentDetail { return { id: safeString(pickField(dto, ['id'])), name: safeString(pickField(dto, ['name'])), gallery: safeArray<string>(pickField(dto, ['gallery'])), photos: safeArray<ContentPhotoDto>(pickField(dto, ['photos'])).map(item => this.photo(item)) } }
}
class ContentReviewMapper extends BaseMapper<ContentReviewDto, ContentReview> {
  toModel(dto: ContentReviewDto | null | undefined): ContentReview { return { id: safeString(pickField(dto, ['id'])), customerName: safeString(pickField(dto, ['customerName'])), createdAt: safeString(pickField(dto, ['createdAt'])), rating: safeNumber(pickField(dto, ['rating'])), comment: safeString(pickField(dto, ['comment'])), salonReply: safeString(pickField(dto, ['salonReply'])) } }
  toEditDto(rating: number, comment: string): EditReviewDto { return { rating, comment: comment.trim() } }
  toReplyDto(reply: string): EditReplyDto { return { reply: reply.trim() } }
}
export const contentSalonMapper = new ContentSalonMapper()
export const contentDetailMapper = new ContentDetailMapper()
export const contentReviewMapper = new ContentReviewMapper()
