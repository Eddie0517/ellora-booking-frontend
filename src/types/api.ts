export interface APIResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PageDto<T> {
  items?: T[] | null
  page?: number | null
  pageSize?: number | null
  totalItems?: number | null
  totalPages?: number | null
  content?: T[] | null
  pageNumber?: number | null
  totalElements?: number | null
  last?: boolean | null
}

export interface PageModel<T> {
  content: T[]
  pageNumber: number
  totalElements: number
  last: boolean
}
