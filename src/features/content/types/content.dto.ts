export interface ContentSalonDto { id?: number | string | null; name?: string | null; status?: string | null }
export interface ContentPhotoDto { kind?: string | null; id?: number | string | null; name?: string | null; url?: string | null }
export interface ContentDetailDto { id?: number | string | null; name?: string | null; gallery?: string[] | null; photos?: ContentPhotoDto[] | null }
export interface ContentReviewDto {
  id?: number | string | null
  customerName?: string | null
  createdAt?: string | null
  rating?: number | string | null
  comment?: string | null
  salonReply?: string | null
}
export interface EditReviewDto { rating: number; comment: string }
export interface EditReplyDto { reply: string }
