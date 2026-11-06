import type { PageDto, PageModel } from '@/types/api'

export abstract class BaseMapper<Dto, Model> {
  abstract toModel(dto: Dto | null | undefined): Model

  toListModel(items: Dto[] | null | undefined): Model[] {
    const raw = (items && typeof items === 'object' && 'data' in items && Array.isArray((items as { data: unknown }).data))
      ? (items as { data: Dto[] }).data
      : items
    return (Array.isArray(raw) ? raw : []).map(item => this.toModel(item))
  }

  toPaginationModel(page: PageDto<Dto> | null | undefined): PageModel<Model> {
    // If wrapped in ApiResponse { success: true, data: { content: [...] } }
    const raw: any = (page && typeof page === 'object' && 'data' in page && (page as { data: unknown }).data)
      ? (page as { data: unknown }).data
      : page

    return {
      content: this.toListModel(raw?.items ?? raw?.content),
      pageNumber: raw?.page ?? raw?.pageNumber ?? 0,
      totalElements: raw?.totalItems ?? raw?.totalElements ?? 0,
      last: raw?.last ?? (((raw?.page ?? raw?.pageNumber ?? 0) + 1) >= (raw?.totalPages ?? 1)),
    }
  }
}
