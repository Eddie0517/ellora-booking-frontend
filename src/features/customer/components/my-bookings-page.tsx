import { useState, useMemo, type FormEvent } from 'react'
import {
  CalendarDays,
  Clock,
  Search,
  Star,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Store,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ThumbsUp,
  Tag,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertDialog } from 'radix-ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  useBookingDetail,
  useCancelBookingById,
  useCompletionResponse,
  useCreateReview,
  useHideCancelledBookingById,
  useMyBookings,
} from '@/features/booking/queries/booking.queries'
import { useAuthStore } from '@/store/auth.store'
import { apiError } from '@/lib/axios'

const statusMap: Record<string, { label: string; style: string; dot: string; description: string }> = {
  PENDING: {
    label: 'Chờ xác nhận',
    style: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
    description: 'Salon đang kiểm tra lịch và sẽ sớm gửi xác nhận.',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    style: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500',
    description: 'Lịch hẹn đã được salon đồng ý. Vui lòng đến trước 5-10 phút.',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
    description: 'Dịch vụ đã hoàn tất. Hãy chia sẻ cảm nhận của bạn để giúp salon nâng cao chất lượng.',
  },
  CANCELLED: {
    label: 'Đã hủy',
    style: 'bg-gray-100 text-gray-600 border-gray-200/80',
    dot: 'bg-gray-400',
    description: 'Lịch hẹn này đã bị hủy.',
  },
  DISPUTED: {
    label: 'Đang khiếu nại',
    style: 'bg-rose-50 text-brand border-pink-200/80',
    dot: 'bg-rose-500',
    description: 'Ý kiến phản ánh của bạn đang được ban quản trị Ellora hỗ trợ giải quyết.',
  },
}

const filterTabs = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
]

const quickReviewTags = [
  'Tay nghề tỉ mỉ',
  'Không gian sạch đẹp',
  'Đúng giờ',
  'Nhân viên thân thiện',
  'Mẫu móng chuẩn hình',
  'Giá cả hợp lý',
]

function formatDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return dateStr
  }
}

export function MyBookingsPage() {
  const user = useAuthStore((state) => state.user)
  const [page, setPage] = useState(0)
  const bookings = useMyBookings(page)

  const [activeTab, setActiveTab] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [id, setId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [message, setMessage] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [hideOpen, setHideOpen] = useState(false)
  const [hideError, setHideError] = useState('')

  const detail = useBookingDetail(id)
  const review = useCreateReview()
  const cancel = useCancelBookingById()
  const hide = useHideCancelledBookingById()
  const completion = useCompletionResponse()

  const submitReview = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    try {
      await review.mutateAsync({ id, rating, comment })
      const text = 'Cảm ơn bạn! Đánh giá đã được gửi tới salon.'
      setMessage(text)
      toast.success(text)
      setComment('')
      void detail.refetch()
    } catch (error) {
      const err = apiError(error)
      setMessage(err)
      toast.error(err)
    }
  }

  const respond = async (completed: boolean) => {
    if (!detail.data) return
    setMessage('')
    try {
      await completion.mutateAsync({
        id,
        completed,
        version: detail.data.completionVersion,
        reason: completed ? undefined : disputeReason,
      })
      setDisputeReason('')
      setShowDisputeForm(false)
      const text = completed
        ? 'Đã xác nhận hoàn thành dịch vụ.'
        : 'Đã gửi phản ánh của bạn đến ban quản trị Ellora.'
      setMessage(text)
      toast.success(text)
      void detail.refetch()
    } catch (error) {
      const err = apiError(error)
      setMessage(err)
      toast.error(err)
    }
  }

  // Filter bookings based on active tab and search query
  const filteredBookings = useMemo(() => {
    if (!bookings.data?.content) return []
    return bookings.data.content.filter((b) => {
      const matchesTab = activeTab === 'ALL' || b.status === activeTab
      const query = searchTerm.trim().toLowerCase()
      if (!query) return matchesTab
      const matchesSearch =
        b.id.toString().includes(query) ||
        (b.salonName && b.salonName.toLowerCase().includes(query)) ||
        (b.serviceName && b.serviceName.toLowerCase().includes(query))
      return matchesTab && matchesSearch
    })
  }, [bookings.data, activeTab, searchTerm])

  const handleOpenDetail = (bookingId: string) => {
    setId(bookingId)
    setMessage('')
    setComment('')
    setRating(5)
    setShowDisputeForm(false)
  }

  const handleQuickTagClick = (tag: string) => {
    setComment((prev) => (prev ? `${prev}, ${tag}` : tag))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Lịch Hẹn Của Tôi
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Theo dõi trạng thái, xác nhận hoàn thành hoặc gửi đánh giá cho dịch vụ bạn đã trải nghiệm.
        </p>
      </div>

      {/* Toolbar: Filter Tabs & Search Bar */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 rounded-2xl bg-gray-100/80 border border-gray-200/60">
            {filterTabs.map((tab) => {
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm hoặc mã hẹn..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.isPending ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-3xl bg-gray-100 border border-gray-200/50" />
          ))}
        </div>
      ) : bookings.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <h3 className="mt-3 text-sm font-bold text-red-900">Không thể tải danh sách lịch hẹn</h3>
          <p className="mt-1 text-xs text-red-600">Đã xảy ra lỗi khi đồng bộ dữ liệu với máy chủ.</p>
          <button
            type="button"
            onClick={() => void bookings.refetch()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Tải lại trang
          </button>
        </div>
      ) : bookings.data.content.length === 0 ? (
        /* Zero State (No Bookings Ever) */
        <div className="rounded-3xl border border-dashed border-rose-200/80 bg-linear-to-b from-rose-50/30 to-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-brand shadow-xs">
            <CalendarDays size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900">Bạn chưa có lịch hẹn nào</h3>
          <p className="mt-1.5 text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Khám phá hàng trăm salon làm móng hàng đầu gần bạn và đặt chỗ nhanh chóng chỉ trong vài thao tác.
          </p>
          <Link
            to="/search"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-xs shadow-brand/20 transition hover:bg-brand-dark active:scale-95"
          >
            <Sparkles size={14} />
            <span>Khám phá salon ngay</span>
          </Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty Filter State */
        <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xs">
          <CalendarDays size={28} className="mx-auto text-gray-300" />
          <p className="mt-2 text-sm font-semibold text-gray-700">Không tìm thấy lịch hẹn phù hợp</p>
          <p className="mt-0.5 text-xs text-gray-400">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.</p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('ALL')
              setSearchTerm('')
            }}
            className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
          >
            Xem tất cả lịch hẹn
          </button>
        </div>
      ) : (
        /* Booking Cards Grid */
        <div className="space-y-3.5">
          {filteredBookings.map((booking) => {
            const st = statusMap[booking.status] || {
              label: booking.status,
              style: 'bg-gray-100 text-gray-700 border-gray-200',
              dot: 'bg-gray-400',
              description: '',
            }

            return (
              <div
                key={booking.id}
                className="group relative rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs shadow-rose-950/5 transition-all hover:border-rose-200/80 hover:shadow-md hover:shadow-rose-950/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-gray-400">
                        #{booking.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${st.style}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        <span>{st.label}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-brand transition-colors">
                        {booking.salonName || 'Salon làm đẹp'}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-gray-600 flex items-center gap-1.5">
                        <Tag size={12} className="text-brand" />
                        <span>{booking.serviceName || 'Dịch vụ làm đẹp'}</span>
                        {booking.servicePrice ? (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="font-semibold text-gray-900">
                              {booking.servicePrice.toLocaleString('vi-VN')} ₫
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-brand" />
                        <span>{formatDateTime(booking.scheduledAt)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {booking.status === 'COMPLETED' && !booking.reviewed && (
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(booking.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
                      >
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>Đánh giá</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenDetail(booking.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800 active:scale-95 shadow-2xs"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {bookings.data.totalElements > 10 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50 shadow-2xs transition"
              >
                <ChevronLeft size={14} />
                <span>Trang trước</span>
              </button>
              <span className="text-xs text-gray-500 font-medium">
                Trang {page + 1} / {Math.ceil(bookings.data.totalElements / 10) || 1}
              </span>
              <button
                type="button"
                disabled={bookings.data.last}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50 shadow-2xs transition"
              >
                <span>Trang sau</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Detail Modal Dialog */}
      <Dialog open={!!id} onOpenChange={(open) => { if (!open) setId('') }}>
        <DialogContent className="max-w-xl p-6 sm:p-7 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>Chi tiết lịch hẹn</span>
              {id && <span className="font-mono text-xs text-gray-400 font-normal">#{id}</span>}
            </DialogTitle>
          </DialogHeader>

          {detail.isPending ? (
            <div className="py-12 space-y-3 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-100 rounded-lg" />
              <div className="h-20 bg-gray-100 rounded-2xl" />
              <div className="h-10 bg-gray-100 rounded-lg" />
            </div>
          ) : detail.isError ? (
            <div className="py-8 text-center text-xs text-red-600">
              <AlertCircle size={28} className="mx-auto mb-2 text-red-500" />
              <span>Không tìm thấy thông tin chi tiết lịch hẹn này.</span>
            </div>
          ) : detail.data.customerId !== user?.id ? (
            <div className="py-8 text-center text-xs text-red-600">
              <span>Lịch hẹn này không thuộc tài khoản của bạn.</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Salon & Status Banner */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-brand" />
                    <h4 className="text-sm font-bold text-gray-900">{detail.data.salonName}</h4>
                  </div>
                  {detail.data.salonId && (
                    <Link
                      to={`/salon/${detail.data.salonId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
                    >
                      <span>Xem salon</span>
                      <ExternalLink size={11} />
                    </Link>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Trạng thái:</span>
                  {statusMap[detail.data.status] && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        statusMap[detail.data.status].style
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusMap[detail.data.status].dot}`} />
                      <span>{statusMap[detail.data.status].label}</span>
                    </span>
                  )}
                </div>
                {statusMap[detail.data.status]?.description && (
                  <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
                    {statusMap[detail.data.status].description}
                  </p>
                )}
              </div>

              {/* Service & Time details */}
              <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-gray-100 bg-white p-4 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Dịch vụ đã chọn</span>
                  <p className="font-bold text-gray-900">{detail.data.serviceName}</p>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Giá dịch vụ</span>
                  <p className="font-bold text-brand text-sm">
                    {detail.data.servicePrice ? `${detail.data.servicePrice.toLocaleString('vi-VN')} ₫` : 'Theo hóa đơn salon'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Thời gian hẹn</span>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <Clock size={12} className="text-brand" />
                    <span>{formatDateTime(detail.data.scheduledAt)}</span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Khách hàng</span>
                  <p className="font-medium text-gray-800">{detail.data.customerName || user?.fullName}</p>
                </div>
              </div>

              {/* Message banner */}
              {message && (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-brand flex items-center gap-2"
                >
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Completion Action Card (if awaiting customer) */}
              {detail.data.status === 'COMPLETED' &&
                detail.data.completionConfirmation === 'AWAITING_CUSTOMER' && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <ThumbsUp size={15} className="text-amber-600" />
                      <span>Xác nhận trải nghiệm của bạn:</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Salon đã hoàn tất dịch vụ. Bạn có hài lòng với kết quả làm móng không?
                    </p>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        type="button"
                        disabled={completion.isPending}
                        onClick={() => void respond(true)}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {completion.isPending ? 'Đang gửi...' : 'Đã hoàn thành tốt ✓'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDisputeForm(!showDisputeForm)}
                        className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        {showDisputeForm ? 'Đóng phản ánh' : 'Chưa hài lòng? Phản ánh'}
                      </button>
                    </div>

                    {showDisputeForm && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          void respond(false)
                        }}
                        className="mt-3 space-y-2 pt-3 border-t border-amber-200/60"
                      >
                        <label className="block text-xs font-medium text-gray-700">
                          Nêu rõ vấn đề bạn gặp phải:
                          <textarea
                            required
                            maxLength={1000}
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            placeholder="Mô tả trải nghiệm chưa ưng ý để đội ngũ Ellora hỗ trợ bạn..."
                            rows={3}
                            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-900 outline-none focus:border-brand"
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={completion.isPending || !disputeReason.trim()}
                          className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Gửi phản ánh đến Ellora
                        </button>
                      </form>
                    )}
                  </div>
                )}

              {/* Review section if completed */}
              {detail.data.status === 'COMPLETED' && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-brand" />
                      <span>Đánh giá dịch vụ</span>
                    </h4>
                    {detail.data.reviewed && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Đã gửi đánh giá
                      </span>
                    )}
                  </div>

                  {!detail.data.reviewed ? (
                    <form onSubmit={submitReview} className="space-y-3 pt-1">
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition"
                            aria-label={`Đánh giá ${star} sao`}
                          >
                            <Star
                              size={20}
                              className={
                                star <= rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-gray-700">
                          {rating} / 5 sao
                        </span>
                      </div>

                      {/* Quick Tag Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {quickReviewTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleQuickTagClick(tag)}
                            className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-600 hover:border-pink-300 hover:bg-rose-50 hover:text-brand transition"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>

                      {/* Comment Input */}
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ cảm nhận chi tiết của bạn về tay nghề, thái độ và không gian tiệm..."
                        rows={3}
                        required
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-900 outline-none focus:border-brand shadow-2xs"
                      />

                      <button
                        type="submit"
                        disabled={review.isPending || !comment.trim()}
                        className="rounded-full bg-brand px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition disabled:opacity-40"
                      >
                        {review.isPending ? 'Đang gửi...' : 'Gửi nhận xét'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Cảm ơn bạn đã đóng góp đánh giá quý báu cho salon!
                    </p>
                  )}
                </div>
              )}

              {/* Bottom Actions for Cancellation or Removal */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                {['PENDING', 'CONFIRMED'].includes(detail.data.status) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelError('')
                      setCancelOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition"
                  >
                    <XCircle size={15} />
                    <span>Hủy lịch hẹn này</span>
                  </button>
                )}

                {detail.data.status === 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setHideError('')
                      setHideOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition"
                  >
                    <Trash2 size={15} />
                    <span>Xóa khỏi danh sách</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setId('')}
                  className="ml-auto rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Booking AlertDialog */}
      <AlertDialog.Root
        open={cancelOpen}
        onOpenChange={(next) => {
          if (cancel.isPending) return
          setCancelOpen(next)
          if (next) setCancelError('')
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl">
            <AlertDialog.Title className="text-base font-bold text-gray-900">
              Hủy lịch hẹn #{id}?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-xs leading-relaxed text-gray-500">
              Salon sẽ nhận được thông báo hủy lịch từ bạn. Bạn có thể đặt lại lịch khác bất cứ lúc nào.
            </AlertDialog.Description>
            {cancelError && (
              <p role="alert" className="mt-3 text-xs text-red-600 font-semibold">
                {cancelError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel
                disabled={cancel.isPending}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Không hủy
              </AlertDialog.Cancel>
              <AlertDialog.Action
                disabled={cancel.isPending}
                onClick={async (event: React.MouseEvent) => {
                  event.preventDefault()
                  setCancelError('')
                  try {
                    await cancel.mutateAsync(id)
                    setCancelOpen(false)
                    toast.success('Đã hủy lịch hẹn thành công.')
                    void detail.refetch()
                  } catch (error) {
                    setCancelError(apiError(error))
                  }
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancel.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Hide Cancelled Booking AlertDialog */}
      <AlertDialog.Root
        open={hideOpen}
        onOpenChange={(next) => {
          if (hide.isPending) return
          setHideOpen(next)
          if (next) setHideError('')
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl">
            <AlertDialog.Title className="text-base font-bold text-gray-900">
              Xóa lịch hẹn #{id} khỏi danh sách?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-xs leading-relaxed text-gray-500">
              Lịch hẹn đã hủy này sẽ không còn hiển thị trong danh sách của bạn.
            </AlertDialog.Description>
            {hideError && (
              <p role="alert" className="mt-3 text-xs text-red-600 font-semibold">
                {hideError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel
                disabled={hide.isPending}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Giữ lại
              </AlertDialog.Cancel>
              <AlertDialog.Action
                disabled={hide.isPending}
                onClick={async (event: React.MouseEvent) => {
                  event.preventDefault()
                  setHideError('')
                  try {
                    await hide.mutateAsync(id)
                    setHideOpen(false)
                    setId('')
                    setPage(0)
                    toast.success('Đã xóa lịch hẹn khỏi danh sách.')
                  } catch (error) {
                    setHideError(apiError(error))
                  }
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {hide.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
