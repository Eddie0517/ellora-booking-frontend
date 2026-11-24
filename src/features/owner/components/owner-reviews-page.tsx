import { useState, type FormEvent } from 'react'
import { Star, MessageSquare, Award } from 'lucide-react'
import { useOwnerReviews, useReplyOwnerReview } from '../queries/owner.queries'

export function OwnerReviewsPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unanswered'>('all')
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const reviews = useOwnerReviews(page)
  const reply = useReplyOwnerReview()

  const visible = reviews.data?.content.filter((item) => filter === 'all' || !item.salonReply) ?? []

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!replyingId || !replyText.trim()) return
    try {
      await reply.mutateAsync({ id: replyingId, reply: replyText })
      setReplyingId(null)
      setReplyText('')
    } catch {
      /* Mutation error renders below. */
    }
  }

  const avgRating = reviews.data?.content.length
    ? (reviews.data.content.reduce((sum, item) => sum + item.rating, 0) / reviews.data.content.length).toFixed(1)
    : '—'

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 lg:px-8 space-y-8">
      {/* Page Header */}
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-[#8C3A5A]">Đánh giá khách hàng</h1>
        <p className="mt-1 text-sm text-gray-600">Theo dõi phản hồi và trả lời khách hàng.</p>
      </header>

      {/* 3 Summary Cards - Cùng tone màu chuẩn với hệ thống */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Điểm đánh giá */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Điểm trung bình
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Star size={18} className="fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#8C3A5A]">{avgRating}</span>
            <span className="text-sm font-semibold text-gray-400">/ 5.0</span>
          </div>
          <p className="mt-2 text-xs text-gray-500 font-medium">Trên trang hiện tại</p>
        </div>

        {/* Card 2: Phân bố đánh giá */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Phân bố số sao
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-brand">
              <Award size={18} />
            </div>
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.data?.content.filter((item) => item.rating === stars).length ?? 0
              const percent = reviews.data?.content.length ? (count / reviews.data.content.length) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-2.5 text-xs text-gray-600">
                  <span className="w-6 font-semibold">{stars} ★</span>
                  <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#8C3A5A] transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-5 text-right font-medium text-gray-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card 3: Tổng số đánh giá */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Tổng số đánh giá
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-pink-50 text-[#8C3A5A]">
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#8C3A5A]">
              {reviews.data?.totalElements ?? '—'}
            </span>
            <span className="text-sm font-semibold text-gray-400">lượt</span>
          </div>
          <p className="mt-2 text-xs text-gray-500 font-medium">Tổng phản hồi ghi nhận từ khách hàng</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-xl px-5 py-2 text-xs font-bold transition shadow-2xs ${
            filter === 'all'
              ? 'bg-[#8C3A5A] text-white shadow-xs'
              : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Tất cả
        </button>
        <button
          type="button"
          onClick={() => setFilter('unanswered')}
          className={`rounded-xl px-5 py-2 text-xs font-bold transition shadow-2xs ${
            filter === 'unanswered'
              ? 'bg-[#8C3A5A] text-white shadow-xs'
              : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Chưa trả lời
        </button>
      </div>

      {/* Review List */}
      {reviews.isPending ? (
        <p role="status" className="py-10 text-center text-sm text-gray-400">
          Đang tải đánh giá…
        </p>
      ) : reviews.isError ? (
        <p role="alert" className="py-10 text-center text-sm text-rose-600">
          Không tải được đánh giá.
        </p>
      ) : visible.length ? (
        <div className="space-y-4">
          {visible.map((item) => (
            <article key={item.id} className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap justify-between gap-5">
                <div>
                  <h2 className="font-bold text-gray-900">{item.customerName}</h2>
                  <p className="mt-1 text-xs text-gray-400">{item.createdAt.slice(0, 10)}</p>
                  <div className="mt-2.5 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= item.rating
                            ? 'fill-[#8C3A5A] text-[#8C3A5A]'
                            : 'text-gray-200'
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-2.5 text-xs text-gray-500 font-medium">
                    Nhân viên phục vụ: <span className="font-bold text-gray-700">{item.employeeName || 'Chưa gán'}</span>
                  </p>
                </div>

                <div className="min-w-[220px] flex-1">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    “{item.comment}”
                  </p>

                  {item.salonReply ? (
                    <div className="mt-4 rounded-2xl border border-rose-100/80 bg-rose-50/50 p-4 text-xs">
                      <strong className="font-bold text-[#8C3A5A]">Phản hồi của salon:</strong>
                      <p className="mt-1.5 whitespace-pre-wrap text-gray-700 leading-relaxed">{item.salonReply}</p>
                    </div>
                  ) : replyingId === item.id ? (
                    <form onSubmit={submit} className="mt-4">
                      <label className="block text-xs font-semibold text-gray-700">
                        Phản hồi khách hàng
                        <textarea
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          required
                          rows={3}
                          className="mt-1.5 w-full rounded-2xl border border-gray-200 p-3 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                      </label>
                      <div className="mt-2.5 flex gap-2">
                        <button
                          disabled={reply.isPending}
                          className="rounded-xl bg-primary-action px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-action/90"
                        >
                          Gửi phản hồi
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingId(null)}
                          className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setReplyingId(item.id)}
                      className="mt-4 text-xs font-bold text-[#8C3A5A] hover:underline"
                    >
                      Trả lời đánh giá
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-500 bg-white">
          Chưa có đánh giá phù hợp.
        </div>
      )}

      {reply.isError && <p role="alert" className="mt-4 text-xs font-bold text-red-700">Không gửi được phản hồi.</p>}

      {reviews.isSuccess && reviews.data.totalElements > 0 && (
        <nav aria-label="Phân trang đánh giá" className="mt-8 flex justify-center items-center gap-4 text-xs font-bold text-gray-600">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 disabled:opacity-40 hover:bg-gray-50"
          >
            Trang trước
          </button>
          <span>
            Trang {page + 1}
          </span>
          <button
            disabled={reviews.data.last}
            onClick={() => setPage(page + 1)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 disabled:opacity-40 hover:bg-gray-50"
          >
            Trang sau
          </button>
        </nav>
      )}
    </main>
  )
}
