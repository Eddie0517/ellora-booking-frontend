import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../api/content.api'

const keys = { all: ['admin', 'content'] as const, salons: (page: number) => ['admin', 'content', 'salons', page] as const, detail: (id: string) => ['admin', 'content', 'detail', id] as const, reviews: (id: string, page: number) => ['admin', 'content', 'reviews', id, page] as const }
export const useContentSalons = (page: number) => useQuery({ queryKey: keys.salons(page), queryFn: () => contentApi.salons(page) })
export const useContentDetail = (id: string) => useQuery({ queryKey: keys.detail(id), queryFn: () => contentApi.detail(id), enabled: Boolean(id) })
export const useContentReviews = (id: string, page: number) => useQuery({ queryKey: keys.reviews(id, page), queryFn: () => contentApi.reviews(id, page), enabled: Boolean(id) })
export function useContentMutations() {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: keys.all })
  return {
    upload: useMutation({ mutationFn: ({ salonId, kind, entityId, file, oldUrl }: { salonId: string; kind: string; entityId: string; file: File; oldUrl?: string }) => contentApi.uploadPhoto(salonId, kind, entityId, file, oldUrl), onSuccess: refresh }),
    remove: useMutation({ mutationFn: ({ salonId, kind, entityId, url }: { salonId: string; kind: string; entityId: string; url?: string }) => contentApi.removePhoto(salonId, kind, entityId, url), onSuccess: refresh }),
    editReview: useMutation({ mutationFn: ({ id, rating, comment }: { id: string; rating: number; comment: string }) => contentApi.editReview(id, rating, comment), onSuccess: refresh }),
    deleteReview: useMutation({ mutationFn: contentApi.deleteReview, onSuccess: refresh }),
    editReply: useMutation({ mutationFn: ({ id, reply }: { id: string; reply: string }) => contentApi.editReply(id, reply), onSuccess: refresh }),
    deleteReply: useMutation({ mutationFn: contentApi.deleteReply, onSuccess: refresh }),
  }
}
