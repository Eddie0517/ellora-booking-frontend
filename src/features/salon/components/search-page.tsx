import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, SlidersHorizontal, SearchX, Sparkles, Map as MapIcon, LayoutGrid } from 'lucide-react'
import { SalonCard } from './salon-card'
import { SalonSearchForm } from './salon-search-form'
import { SalonSearchMap } from './salon-search-map'
import { useSalons } from '../queries/salon.queries'
import { useAuthStore } from '@/store/auth.store'

const quickFilters = [
  { label: 'Tất cả', value: '' },
  { label: 'Nail Art', value: 'nail art' },
  { label: 'Sơn Gel', value: 'sơn gel' },
  { label: 'Chăm sóc móng', value: 'chăm sóc' },
  { label: 'Spa thư giãn', value: 'spa' },
]

export function SearchPage() {
  const user = useAuthStore((state) => state.user)
  if (user?.role === 'SALON_OWNER') {
    return <Navigate to="/owner/dashboard" replace />
  }

  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number(params.get('page') ?? 0) || 0)
  const keyword = params.get('keyword') ?? ''
  const location = params.get('location') ?? ''
  const date = params.get('date') ?? ''
  const time = params.get('time') ?? ''
  const sort = (params.get('sort') as 'newest' | 'rating' | 'distance') || undefined
  const latStr = params.get('latitude')
  const lngStr = params.get('longitude')
  const latitude = latStr ? Number(latStr) : undefined
  const longitude = lngStr ? Number(lngStr) : undefined
  const radiusKm = params.get('radiusKm') ? Number(params.get('radiusKm')) : undefined
  const [activeFilter, setActiveFilter] = useState(keyword)
  const [showMap, setShowMap] = useState(true)

  const salons = useSalons({
    keyword,
    location,
    date: date || undefined,
    time: time || undefined,
    sort,
    latitude,
    longitude,
    radiusKm,
    page,
    size: 12,
  })

  const move = (n: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(page + n))
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleQuickFilter = (val: string) => {
    setActiveFilter(val)
    const next = new URLSearchParams(params)
    if (val) {
      next.set('keyword', val)
    } else {
      next.delete('keyword')
    }
    next.set('page', '0')
    setParams(next)
  }

  const resetFilters = () => {
    setActiveFilter('')
    setParams(new URLSearchParams())
  }

  const totalPages = salons.data ? Math.ceil(salons.data.totalElements / 12) || 1 : 1

  return (
    <div className="bg-white min-h-[80vh] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Title & Search Header */}
        <div className="mb-8 flex flex-col items-start gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
              <Sparkles size={14} />
              <span>Khám phá điểm đến làm đẹp</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tìm Tiệm Nail & Salon Phù Hợp
            </h1>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Lựa chọn hàng trăm salon uy tín với giá niêm yết rõ ràng và đặt hẹn dễ dàng.
            </p>
          </div>

          <div className="w-full pt-2">
            <SalonSearchForm
              key={params.toString()}
              initialKeyword={keyword}
              initialLocation={location}
            />
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mr-1">
              <SlidersHorizontal size={13} />
              <span>Lọc nhanh:</span>
            </span>
            {quickFilters.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => handleQuickFilter(f.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeFilter === f.value || (!activeFilter && !f.value)
                    ? 'bg-brand text-white shadow-2xs'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-rose-50/50 hover:text-brand'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <p className="text-sm text-gray-600">
            {salons.isPending ? (
              'Đang tải danh sách salon...'
            ) : salons.data ? (
              <>
                Tìm thấy <span className="font-semibold text-gray-900">{salons.data.totalElements}</span> salon phù hợp
                {keyword ? ` cho "${keyword}"` : ''}
              </>
            ) : null}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                showMap
                  ? 'border-brand bg-brand text-white shadow-2xs'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-pink-200 hover:bg-rose-50/50 hover:text-brand'
              }`}
            >
              {showMap ? <LayoutGrid size={13} /> : <MapIcon size={13} />}
              <span>{showMap ? 'Ẩn bản đồ' : 'Xem bản đồ'}</span>
            </button>

            <span className="text-xs text-gray-400">
              Trang {page + 1} / {totalPages}
            </span>
          </div>
        </div>

        {/* Main Content Area: Split layout with sticky map on right */}
        <div className={showMap ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : ""}>
          {/* Left Column: Salon List */}
          <div className={showMap ? "lg:col-span-7 xl:col-span-7" : ""}>
            {salons.isPending ? (
              <div className={`grid gap-6 ${showMap ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
                  />
                ))}
              </div>
            ) : salons.isError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-600">
                Không tải được danh sách salon. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.
              </div>
            ) : salons.data && salons.data.content.length > 0 ? (
              <>
                <div className={`grid gap-6 ${showMap ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {salons.data.content.map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <nav
                    className="mt-12 flex items-center justify-center gap-3"
                    aria-label="Phân trang danh sách salon"
                  >
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => move(-1)}
                      className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft size={16} />
                      <span>Trang trước</span>
                    </button>

                    <div className="flex items-center gap-1 px-2 text-xs font-semibold text-gray-800">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
                        {page + 1}
                      </span>
                      <span className="text-gray-400">/ {totalPages}</span>
                    </div>

                    <button
                      type="button"
                      disabled={salons.data.last}
                      onClick={() => move(1)}
                      className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <span>Trang sau</span>
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 py-16 px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-brand">
                  <SearchX size={26} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  Chưa tìm thấy salon nào phù hợp
                </h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Hãy thử tìm kiếm với từ khóa khác, điều chỉnh bộ lọc hoặc xóa các tiêu chí tìm kiếm.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98]"
                >
                  Xóa bộ lọc & xem tất cả salon
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Compact Sticky Overview Map */}
          {showMap && (
            <div className="order-first lg:order-last lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24">
              <SalonSearchMap
                salons={salons.data?.content ?? []}
                heightClassName="h-[380px] lg:h-[calc(100vh-140px)] lg:max-h-[620px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
