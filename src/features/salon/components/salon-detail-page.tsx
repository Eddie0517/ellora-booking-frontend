import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  MapPin,
  Navigation,
  Star,
  Clock,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  useSalon,
  useSalonHours,
  useSalonReviews,
  useSalonServices,
} from '../queries/salon.queries'

const dayNames: Record<string, string> = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
}

function WorkingHoursSection({ salonId }: { salonId: string }) {
  const hours = useSalonHours(salonId)

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-brand" />
        <h2 className="text-lg font-bold text-gray-900">Giờ hoạt động</h2>
      </div>

      {hours.isPending ? (
        <p className="text-sm text-gray-400">Đang tải lịch mở cửa...</p>
      ) : hours.isError ? (
        <p className="text-sm text-red-500">Không tải được giờ mở cửa.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {hours.data.map((day) => (
            <div
              key={day.dayOfWeek}
              className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 px-3.5 py-2.5 text-xs"
            >
              <span className="font-medium text-gray-700">
                {dayNames[day.dayOfWeek] ?? day.dayOfWeek}
              </span>
              <span
                className={
                  day.closed
                    ? 'font-semibold text-rose-500'
                    : 'font-semibold text-gray-900'
                }
              >
                {day.closed
                  ? 'Đóng cửa'
                  : `${day.openTime?.slice(0, 5)} - ${day.closeTime?.slice(0, 5)}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ReviewSection({
  salonId,
  rating,
  count,
}: {
  salonId: string
  rating: number
  count: number
}) {
  const [page, setPage] = useState(0)
  const reviews = useSalonReviews(salonId, page)

  return (
    <section id="reviews" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Đánh giá từ khách hàng</h2>
          <p className="text-xs text-gray-500 mt-0.5">Nhận xét thực tế từ những khách đã trải nghiệm</p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 border border-amber-100">
          <Star className="fill-amber-400 text-amber-400" size={18} />
          <strong className="text-lg font-bold text-gray-900">{rating.toFixed(1)}</strong>
          <span className="text-xs text-gray-500">({count} đánh giá)</span>
        </div>
      </div>

      {reviews.isPending ? (
        <p className="py-8 text-center text-sm text-gray-400">Đang tải đánh giá...</p>
      ) : reviews.isError ? (
        <p className="py-8 text-center text-sm text-red-500">Không tải được đánh giá.</p>
      ) : (
        <div className="pt-6">
          {reviews.data.content.length > 0 ? (
            <div className="space-y-4">
              {reviews.data.content.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 transition hover:bg-white hover:shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-brand">
                        {review.customerName
                          .split(' ')
                          .filter(Boolean)
                          .map((w) => w[0])
                          .slice(-2)
                          .join('') || 'KH'}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {review.customerName}
                        </h3>
                        <time className="text-[11px] text-gray-400">
                          {review.createdAt.slice(0, 10)}
                        </time>
                      </div>
                    </div>

                    <div className="flex gap-0.5" aria-label={`${review.rating} sao`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={
                            star <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {review.comment}
                  </p>

                  {review.salonReply && (
                    <div className="mt-3 rounded-lg border-l-2 border-brand bg-white p-3 text-xs text-gray-600 shadow-2xs">
                      <p className="font-semibold text-brand">Phản hồi từ salon:</p>
                      <p className="mt-1 leading-relaxed text-gray-700">{review.salonReply}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">Chưa có đánh giá nào cho salon này.</p>
          )}

          {reviews.data.totalElements > reviews.data.content.length && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                <span>Trước</span>
              </button>
              <span className="text-xs text-gray-500">
                Trang {page + 1}
              </span>
              <button
                type="button"
                disabled={reviews.data.last}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
              >
                <span>Sau</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export function SalonDetailPage() {
  const { id = '' } = useParams()
  const salon = useSalon(id)
  const services = useSalonServices(id)

  if (salon.isPending) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="h-10 w-10 mx-auto animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500">Đang tải thông tin salon...</p>
      </div>
    )
  }

  if (salon.isError || !salon.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-base font-semibold text-red-600">Không thể tải thông tin salon.</p>
        <Link
          to="/search"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Quay lại tìm kiếm</span>
        </Link>
      </div>
    )
  }

  const item = salon.data
  const address = [...new Set([item.address, item.district, item.city].filter(Boolean))].join(', ')
  const destination = item.coordinates ? `${item.coordinates.lat},${item.coordinates.lng}` : address
  const directionsUrl = destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    : null

  const images = item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80']

  return (
    <div className="bg-white pb-24 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          className="mb-5 flex items-center gap-2 text-xs text-gray-500"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="transition hover:text-brand">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/search" className="transition hover:text-brand">
            Khám phá salon
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900 truncate max-w-xs">{item.name}</span>
        </nav>

        {/* Bento Gallery 5-Photo Showcase */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-sm">
          <Link
            to="/search"
            aria-label="Quay lại danh sách"
            className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-gray-700 backdrop-blur-md shadow-2xs transition hover:bg-white"
          >
            <ArrowLeft size={14} />
            <span>Quay lại</span>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[340px] sm:h-[420px] md:h-[480px]">
            {/* Main Primary Image */}
            <div className="md:col-span-2 md:row-span-2 h-full overflow-hidden">
              <img
                src={images[0]}
                alt={`Không gian chính tại ${item.name}`}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Supporting Images */}
            {[1, 2, 3, 4].map((idx) => {
              const imgUrl = images[idx] || images[0]
              return (
                <div key={idx} className="hidden md:block h-full overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`${item.name} - Ảnh ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content Layout with 2 Columns */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Left Column: Details, Services, Hours, Reviews */}
          <div className="space-y-10 lg:col-span-8">
            {/* Salon Header Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                {item.subscriptionBadge && (
                  <span className="rounded-full border border-pink-200 bg-rose-50 px-3 py-1 text-xs font-bold text-brand">
                    {item.subscriptionBadge}
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{item.rating > 0 ? item.rating.toFixed(1) : '5.0'}</span>
                </span>
                <a
                  href="#reviews"
                  className="text-xs text-gray-500 underline decoration-gray-300 hover:text-brand"
                >
                  ({item.reviewCount} đánh giá)
                </a>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {item.name}
              </h1>

              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin size={16} className="shrink-0 text-brand" />
                <span>{address || 'Đang cập nhật địa chỉ'}</span>
              </p>

              {item.description && (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Giới thiệu salon
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            {/* Service Menu Section */}
            <section id="services" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Bảng giá dịch vụ</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Chọn dịch vụ để bắt đầu đặt lịch</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-brand">
                  <Sparkles size={14} />
                  <span>Giá niêm yết minh bạch</span>
                </div>
              </div>

              {services.isPending ? (
                <div className="space-y-3 pt-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-20 animate-pulse rounded-xl bg-gray-50" />
                  ))}
                </div>
              ) : services.isError ? (
                <p className="py-6 text-center text-sm text-red-500">Không tải được dịch vụ.</p>
              ) : services.data.length > 0 ? (
                <div className="divide-y divide-gray-100 pt-2">
                  {services.data.map((service) => (
                    <article
                      key={service.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 transition hover:bg-gray-50/60 rounded-xl px-2"
                    >
                      <div className="flex gap-3.5">
                        {service.imageUrl && (
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="h-16 w-16 shrink-0 rounded-xl object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">{service.name}</h3>
                          {service.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>{service.durationMinutes} phút</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                        <span className="text-base font-bold text-brand">
                          {service.price.toLocaleString('vi-VN')} ₫
                        </span>
                        <Link
                          to={`/booking?salonId=${item.id}&serviceId=${service.id}`}
                          className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-brand-dark active:scale-[0.98]"
                        >
                          Chọn dịch vụ
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-gray-400">
                  Salon chưa cập nhật dịch vụ nào.
                </p>
              )}
            </section>

            {/* Working Hours */}
            <WorkingHoursSection salonId={id} />

            {/* Location & Map Section */}
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-brand" />
                  <h2 className="text-lg font-bold text-gray-900">Vị trí & Chỉ đường</h2>
                </div>
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    <Navigation size={13} />
                    <span>Mở Google Maps</span>
                  </a>
                )}
              </div>

              {item.coordinates && (
                <div className="overflow-hidden rounded-xl border border-gray-100 mb-4">
                  <iframe
                    title={`Bản đồ ${item.name}`}
                    src={`https://maps.google.com/maps?q=${item.coordinates.lat},${item.coordinates.lng}&z=15&output=embed`}
                    loading="lazy"
                    className="h-56 w-full border-0"
                  />
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Địa chỉ:</strong> {address}
              </p>
            </section>

            {/* Customer Reviews Section */}
            <ReviewSection
              key={id}
              salonId={id}
              rating={item.rating}
              count={item.reviewCount}
            />
          </div>

          {/* Right Sticky Booking Dock (Desktop) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-6 shadow-md shadow-pink-950/5">
              <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-brand">
                Trực tuyến 24/7
              </span>

              <h2 className="mt-3 text-xl font-bold text-gray-900">
                Đặt lịch tại {item.name}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                Chọn dịch vụ, nhân viên yêu thích và thời gian thuận tiện nhất cho bạn.
              </p>

              <div className="my-5 border-t border-gray-100" />

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Xác nhận lịch tức thì qua tin nhắn</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Không cần đặt cọc trước</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Hỗ trợ đổi giờ hẹn linh hoạt</span>
                </div>
              </div>

              <Link
                to={`/booking?salonId=${item.id}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-center text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98]"
              >
                <Calendar size={16} />
                <span>Đặt lịch hẹn ngay</span>
              </Link>

              {directionsUrl && (
                <div className="mt-5 border-t border-gray-100 pt-4 text-center">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand"
                  >
                    <Navigation size={13} />
                    <span>Xem hướng dẫn chỉ đường tới tiệm</span>
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
