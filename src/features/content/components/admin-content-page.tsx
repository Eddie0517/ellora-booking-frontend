import { useState } from 'react'
import { useContentDetail, useContentMutations, useContentReviews, useContentSalons } from '../queries/content.queries'
import { useConfirm } from '@/hooks/use-confirm'
import type { ContentPhoto, ContentReview } from '../types/content.model'

function PhotoEditor({ salonId, photo, onSaved }: { salonId: string; photo: ContentPhoto; onSaved: (message: string) => void }) {
  const { confirm } = useConfirm()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const mutations = useContentMutations()
  const busy = mutations.upload.isPending || mutations.remove.isPending
  const upload = async () => {
    if (!file) return
    try {
      await mutations.upload.mutateAsync({
        salonId,
        kind: photo.kind,
        entityId: photo.id,
        file,
        ...(photo.url ? { oldUrl: photo.url } : {}),
      })
      setFile(null)
      setError('')
      onSaved('Đã lưu ảnh.')
    } catch {
      setError('Không lưu được ảnh.')
    }
  }
  const remove = async () => {
    if (!photo.url) return
    const ok = await confirm({
      title: 'Xóa ảnh',
      description: 'Bạn có chắc chắn muốn xóa ảnh này?',
      confirmText: 'Xóa ảnh',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      await mutations.remove.mutateAsync({ salonId, kind: photo.kind, entityId: photo.id, url: photo.url })
      setError('')
      onSaved('Đã xóa ảnh.')
    } catch {
      setError('Không xóa được ảnh.')
    }
  }
  return (
    <div className="rounded-xl border border-rose-100 p-4">
      {photo.url && <img src={photo.url} alt={photo.name} className="mb-3 aspect-[4/3] w-full rounded-lg object-cover" />}
      <label className="block text-sm font-medium">
        {photo.name || 'Chọn ảnh'}
        <input
          type="file"
          accept="image/jpeg,image/png"
          disabled={busy}
          onChange={(event) => {
            const next = event.target.files?.[0]
            setFile(next && ['image/jpeg', 'image/png'].includes(next.type) && next.size <= 5 * 1024 * 1024 ? next : null)
            setError(next && (next.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(next.type)) ? 'Chỉ nhận ảnh JPG/PNG tối đa 5 MB.' : '')
            event.target.value = ''
          }}
          className="mt-2 block max-w-full text-xs"
        />
      </label>
      <p className="mt-2 text-xs text-gray-500">JPG hoặc PNG, tối đa 5 MB.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {file && (
          <button type="button" disabled={busy} onClick={() => void upload()} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white">
            Lưu ảnh
          </button>
        )}
        {photo.url && (
          <button type="button" disabled={busy} onClick={() => void remove()} className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700">
            Xóa ảnh
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}

function ReviewEditor({ review, onSaved }: { review: ContentReview; onSaved: (message: string) => void }) {
  const { confirm } = useConfirm()
  const [rating, setRating] = useState(review.rating)
  const [comment, setComment] = useState(review.comment)
  const [reply, setReply] = useState(review.salonReply)
  const [error, setError] = useState('')
  const mutations = useContentMutations()
  const busy = mutations.editReview.isPending || mutations.deleteReview.isPending || mutations.editReply.isPending || mutations.deleteReply.isPending
  const run = async (action: 'edit' | 'delete' | 'reply' | 'deleteReply') => {
    if (action === 'edit' && (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 1000)) {
      setError('Điểm từ 1 đến 5 sao, nhận xét tối đa 1000 ký tự.')
      return
    }
    if (action === 'reply' && (!reply.trim() || reply.length > 1000)) {
      setError('Phản hồi từ 1 đến 1000 ký tự.')
      return
    }
    if (action === 'delete') {
      const ok = await confirm({
        title: 'Xóa đánh giá',
        description: 'Xóa đánh giá của khách và phản hồi kèm theo? Không thể hoàn tác.',
        confirmText: 'Xóa đánh giá',
        variant: 'destructive',
      })
      if (!ok) return
    }
    if (action === 'deleteReply') {
      const ok = await confirm({
        title: 'Xóa phản hồi',
        description: 'Bạn có chắc chắn muốn xóa phản hồi của tiệm?',
        confirmText: 'Xóa phản hồi',
        variant: 'destructive',
      })
      if (!ok) return
    }
    try {
      if (action === 'edit') await mutations.editReview.mutateAsync({ id: review.id, rating, comment })
      if (action === 'delete') await mutations.deleteReview.mutateAsync(review.id)
      if (action === 'reply') await mutations.editReply.mutateAsync({ id: review.id, reply })
      if (action === 'deleteReply') await mutations.deleteReply.mutateAsync(review.id)
      setError('')
      onSaved('Đã cập nhật nội dung.')
    } catch {
      setError('Không cập nhật được nội dung.')
    }
  }
  return (
    <article className="rounded-2xl border border-rose-100 bg-white p-6">
      <h3 className="font-semibold text-gray-900">
        {review.customerName} <span className="font-normal text-gray-500">· {review.createdAt.slice(0, 16)}</span>
      </h3>
      <div className="mt-4 grid gap-4 md:grid-cols-[140px_1fr]">
        <label className="text-sm font-medium text-gray-700">
          Số sao của khách
          <select value={rating} onChange={(event) => setRating(Number(event.target.value))} disabled={busy} className="mt-2 block w-full rounded-lg border border-slate-200 p-2 text-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={star}>{star} sao</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Đánh giá của khách
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} disabled={busy} rows={3} className="mt-2 block w-full rounded-lg border border-slate-200 p-3 text-sm" />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void run('edit')} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Lưu đánh giá
        </button>
        <button type="button" disabled={busy} onClick={() => void run('delete')} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700">
          Xóa đánh giá
        </button>
      </div>
      <label className="mt-5 block text-sm font-medium text-gray-700">
        Phản hồi của tiệm
        <textarea value={reply} onChange={(event) => setReply(event.target.value)} maxLength={1000} disabled={busy} rows={3} className="mt-2 block w-full rounded-lg border border-slate-200 p-3 text-sm" />
      </label>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" disabled={busy || !reply.trim()} onClick={() => void run('reply')} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Lưu phản hồi
        </button>
        <button type="button" disabled={busy || !review.salonReply} onClick={() => void run('deleteReply')} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700">
          Xóa phản hồi
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </article>
  )
}

export function AdminContentPage() {
  const [salonPage, setSalonPage] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [reviewPage, setReviewPage] = useState(0)
  const [message, setMessage] = useState('')
  const salons = useContentSalons(salonPage)
  const selected = useContentDetail(selectedId)
  const reviews = useContentReviews(selectedId, reviewPage)

  return (
    <section className="space-y-7">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Quản lý nội dung</h1>
        <p className="mt-2 text-sm text-gray-600">Quản lý hình ảnh, đánh giá và phản hồi của các tiệm.</p>
      </header>

      {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-700">{message}</p>}

      <section className="rounded-2xl border border-rose-100 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Chọn tiệm</h2>
        {salons.isPending ? (
          <p role="status" className="text-sm text-gray-500">Đang tải danh sách…</p>
        ) : salons.isError ? (
          <p role="alert" className="text-sm text-red-600">Không tải được danh sách tiệm.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {salons.data.content.map((salon) => (
                <button
                  key={salon.id}
                  onClick={() => {
                    setSelectedId(salon.id)
                    setReviewPage(0)
                    setMessage('')
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    selectedId === salon.id ? 'border-brand bg-brand text-white' : 'border-rose-100 text-gray-700 hover:bg-rose-50/50'
                  }`}
                >
                  #{salon.id} · {salon.name} · {salon.status}
                </button>
              ))}
              {salons.data.content.length === 0 && <p className="text-sm text-gray-500">Chưa có tiệm.</p>}
            </div>
            <nav className="mt-5 flex gap-5 text-sm font-medium">
              <button disabled={salonPage === 0} onClick={() => setSalonPage(salonPage - 1)} className="text-gray-600 hover:text-gray-900 disabled:opacity-40">
                Trang trước
              </button>
              <span>Trang {salonPage + 1}</span>
              <button disabled={salons.data.last} onClick={() => setSalonPage(salonPage + 1)} className="text-gray-600 hover:text-gray-900 disabled:opacity-40">
                Trang sau
              </button>
            </nav>
          </>
        )}
      </section>

      {selectedId && (
        selected.isPending ? (
          <p role="status" className="text-sm text-gray-500">Đang tải nội dung tiệm…</p>
        ) : selected.isError ? (
          <p role="alert" className="text-sm text-red-600">Không tải được nội dung tiệm.</p>
        ) : (
          <>
            <section className="rounded-2xl border border-rose-100 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900">Ảnh · {selected.data.name}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selected.data.photos.map((photo) => (
                  <PhotoEditor key={`${photo.kind}-${photo.id}`} salonId={selectedId} photo={photo} onSaved={setMessage} />
                ))}
              </div>
              <h3 className="mt-8 font-semibold text-gray-900">Bộ ảnh tiệm</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selected.data.gallery.map((url) => (
                  <PhotoEditor key={url} salonId={selectedId} photo={{ kind: 'gallery', id: selectedId, name: 'Thay ảnh', url }} onSaved={setMessage} />
                ))}
                {selected.data.gallery.length < 10 && (
                  <PhotoEditor salonId={selectedId} photo={{ kind: 'gallery', id: selectedId, name: 'Thêm ảnh tiệm', url: null }} onSaved={setMessage} />
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Đánh giá và phản hồi</h2>
              {reviews.isPending ? (
                <p role="status" className="text-sm text-gray-500">Đang tải đánh giá…</p>
              ) : reviews.isError ? (
                <p role="alert" className="text-sm text-red-600">Không tải được đánh giá.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {reviews.data.content.map((review) => (
                      <ReviewEditor
                        key={`${review.id}-${review.rating}-${review.comment}-${review.salonReply}`}
                        review={review}
                        onSaved={setMessage}
                      />
                    ))}
                    {reviews.data.content.length === 0 && <p className="text-sm text-gray-500">Chưa có đánh giá.</p>}
                  </div>
                  <nav className="mt-5 flex justify-center gap-5 text-sm font-medium">
                    <button disabled={reviewPage === 0} onClick={() => setReviewPage(reviewPage - 1)} className="text-gray-600 hover:text-gray-900 disabled:opacity-40">
                      Trang trước
                    </button>
                    <span>Trang {reviewPage + 1}</span>
                    <button disabled={reviews.data.last} onClick={() => setReviewPage(reviewPage + 1)} className="text-gray-600 hover:text-gray-900 disabled:opacity-40">
                      Trang sau
                    </button>
                  </nav>
                </>
              )}
            </section>
          </>
        )
      )}
    </section>
  )
}
