import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  CalendarCheck2,
  Users2,
  Star,
  Clock4,
  CalendarClock,
  CheckCircle,
  Plus,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import {
  useOwnerSalon,
  useOwnerSummary,
  useOwnerBookings,
  useOwnerRevenue,
} from '../queries/owner.queries'
import { getMonthStartStr, getTodayStr } from '@/lib/date'

export function OwnerDashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month'>('day')
  const [bookingPage, setBookingPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const todayStr = useMemo(() => getTodayStr(), [])
  const monthStartStr = useMemo(() => getMonthStartStr(), [])

  const salon = useOwnerSalon()
  const summary = useOwnerSummary()
  const revenue = useOwnerRevenue(monthStartStr, todayStr, revenuePeriod)
  const bookings = useOwnerBookings(salon.data?.id ?? '', bookingPage)

  const rawSummary = summary.data

  // Calculate or display statistics
  const kpis = [
    {
      label: 'Doanh thu tháng này',
      value: rawSummary ? `${rawSummary.monthlyRevenue.toLocaleString('vi-VN')} ₫` : '0 ₫',
      sub: 'Tính theo lịch hoàn tất',
      Icon: TrendingUp,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      label: 'Lịch hẹn hoàn tất',
      value: rawSummary ? rawSummary.completedBookings.toLocaleString('vi-VN') : '0',
      sub: 'Tổng số lượt phục vụ xong',
      Icon: CalendarCheck2,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Khách đã dùng dịch vụ',
      value: rawSummary ? rawSummary.monthlyCustomers.toLocaleString('vi-VN') : '0',
      sub: 'Lượt khách trong tháng',
      Icon: Users2,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Đánh giá trung bình',
      value: rawSummary && rawSummary.averageRating > 0 ? `${rawSummary.averageRating.toFixed(1)} / 5` : '—',
      sub: 'Dựa trên phản hồi khách hàng',
      Icon: Star,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ]

  const statusMetrics = [
    {
      label: 'Lịch chờ xác nhận',
      value: rawSummary?.pendingBookings ?? 0,
      icon: Clock4,
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50/70 border-amber-100',
    },
    {
      label: 'Lịch đã xác nhận',
      value: rawSummary?.confirmedBookings ?? 0,
      icon: CheckCircle,
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50/70 border-blue-100',
    },
    {
      label: 'Tổng lượt đặt hẹn',
      value: rawSummary?.totalBookings ?? 0,
      icon: CalendarClock,
      textColor: 'text-brand',
      bgLight: 'bg-rose-50/70 border-pink-100',
    },
  ]

  // Filter recent bookings
  const bookingList = bookings.data?.content
  const filteredBookings = useMemo(() => {
    if (!bookingList) return []
    if (!searchQuery.trim()) return bookingList
    const q = searchQuery.toLowerCase()
    return bookingList.filter(
      (b) =>
        b.customerName?.toLowerCase().includes(q) ||
        b.customerPhone?.includes(q) ||
        b.serviceName?.toLowerCase().includes(q)
    )
  }, [bookingList, searchQuery])

  // Revenue chart helper points
  const revenuePoints = revenue.data?.points
  const maxGross = useMemo(() => {
    if (!revenuePoints || !revenuePoints.length) return 1
    return Math.max(...revenuePoints.map((p) => p.gross), 100_000)
  }, [revenuePoints])

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Phân tích dữ liệu
            </h1>
            <span className="rounded-full bg-rose-100/70 px-2.5 py-0.5 text-xs font-bold text-brand">
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi hiệu suất kinh doanh thực tế của cơ sở{' '}
            <strong className="text-gray-800 font-semibold">{salon.data?.name || '...'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void summary.refetch()
              void salon.refetch()
              void revenue.refetch()
              void bookings.refetch()
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition"
          >
            <RefreshCw size={14} className={summary.isFetching ? 'animate-spin' : ''} />
            <span>Làm mới số liệu</span>
          </button>

          <Link
            to="/owner/bookings"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-pink-500/20 hover:bg-brand-hover active:scale-95 transition"
          >
            <Plus size={16} />
            <span>Xem lịch đặt</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards (Elevated White Cards on Slate Canvas) */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.Icon
          return (
            <article
              key={kpi.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-pink-200/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl border ${kpi.bgColor}`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  Tháng này
                </span>
              </div>

              <div className="mt-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {kpi.label}
                </h2>
                <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  {summary.isPending ? '…' : kpi.value}
                </p>
                <p className="mt-1 text-xs text-gray-500 font-medium">{kpi.sub}</p>
              </div>
            </article>
          )
        })}
      </div>

      {/* Secondary Status Metrics */}
      <div className="grid gap-5 sm:grid-cols-3">
        {statusMetrics.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between rounded-2xl border p-4 shadow-2xs bg-white ${item.bgLight}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-white shadow-2xs ${item.textColor}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">{item.label}</p>
                  <p className={`text-2xl font-black ${item.textColor}`}>
                    {summary.isPending ? '…' : item.value}
                  </p>
                </div>
              </div>
              <Link
                to="/owner/bookings"
                className="text-xs font-semibold text-gray-400 hover:text-brand flex items-center gap-1 transition"
              >
                <span>Chi tiết</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Revenue Trend Visual Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Xu hướng doanh thu</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Từ {monthStartStr} đến {todayStr} · Doanh thu dịch vụ hoàn thành
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {(['day', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setRevenuePeriod(period)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  revenuePeriod === period
                    ? 'bg-white text-brand shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === 'day' ? 'Theo ngày' : period === 'week' ? 'Theo tuần' : 'Theo tháng'}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-6">
          {revenue.isPending ? (
            <div className="flex h-56 items-center justify-center text-sm text-gray-400">
              Đang tải biểu đồ doanh thu…
            </div>
          ) : !revenuePoints || revenuePoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="size-8 text-pink-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Chưa có dữ liệu doanh thu</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Các mốc doanh thu sẽ tự động hiển thị tại đây khi các lịch hẹn được chủ tiệm chuyển sang trạng thái Hoàn tất.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex h-48 items-end gap-2 sm:gap-3 overflow-x-auto pb-2 pt-6">
                {revenuePoints.slice(-14).map((pt, idx) => {
                  const heightPercent = Math.max(8, Math.round((pt.gross / maxGross) * 100))
                  return (
                    <div
                      key={idx}
                      className="group flex flex-1 flex-col items-center gap-1.5 min-w-[32px]"
                    >
                      <div className="relative w-full flex items-end justify-center h-36">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-pink-500 to-rose-400 transition-all duration-300 group-hover:from-pink-600 group-hover:to-rose-500 group-hover:shadow-md"
                        />
                        {/* Tooltip on hover */}
                        <div className="pointer-events-none absolute -top-10 z-10 hidden rounded-md bg-gray-900 px-2 py-1 text-[11px] font-bold text-white shadow-lg whitespace-nowrap group-hover:block">
                          {pt.gross.toLocaleString('vi-VN')} ₫ ({pt.bookings} lịch)
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 truncate max-w-full">
                        {String(pt.date).slice(5)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-gray-500 font-medium">
                <span>Tổng giá trị: <strong className="text-brand font-bold">{(revenue.data?.gross ?? 0).toLocaleString('vi-VN')} ₫</strong></span>
                <span>Số lịch hoàn thành: <strong className="text-gray-800 font-bold">{revenue.data?.completedBookings ?? 0}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings & Transactions Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Lịch hẹn & Giao dịch gần đây</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Danh sách tiếp nhận yêu cầu đặt chỗ từ khách hàng
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm khách hàng, dịch vụ..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-medium placeholder-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto pt-2">
          {bookings.isPending ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Đang tải danh sách lịch hẹn…
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-gray-700">Chưa có giao dịch lịch hẹn nào</p>
              <p className="text-xs text-gray-400 mt-1">
                Các lịch hẹn khách đặt qua website hoặc lịch walk-in sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-gray-400 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-3">Mã lịch</th>
                  <th className="py-3 px-3">Khách hàng</th>
                  <th className="py-3 px-3">Dịch vụ</th>
                  <th className="py-3 px-3">Kỹ thuật viên</th>
                  <th className="py-3 px-3">Thời gian hẹn</th>
                  <th className="py-3 px-3">Số tiền</th>
                  <th className="py-3 px-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const statusConfig =
                    b.status === 'COMPLETED'
                      ? { label: 'Hoàn tất', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                      : b.status === 'CONFIRMED'
                      ? { label: 'Đã xác nhận', pill: 'bg-blue-50 text-blue-700 border-blue-200' }
                      : b.status === 'PENDING'
                      ? { label: 'Chờ duyệt', pill: 'bg-amber-50 text-amber-700 border-amber-200' }
                      : { label: 'Đã hủy', pill: 'bg-gray-100 text-gray-600 border-gray-200' }

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-brand">
                        #{b.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-gray-900">{b.customerName || 'Khách hàng'}</p>
                        <p className="text-[11px] text-gray-400">{b.customerPhone || 'Không có SĐT'}</p>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-gray-700">
                        {b.serviceName}
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">
                        {b.employeeName || 'Bất kỳ chuyên viên'}
                      </td>
                      <td className="py-3.5 px-3 text-gray-600 font-medium">
                        {b.scheduledAt ? new Date(b.scheduledAt).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">
                        {(b.servicePrice || 0).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusConfig.pill}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {bookings.data && bookings.data.totalElements > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
            <span className="text-xs text-gray-500 font-medium">
              Hiển thị {filteredBookings.length} / {bookings.data.totalElements} lịch hẹn
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={bookingPage === 0}
                onClick={() => setBookingPage((p) => Math.max(0, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition"
              >
                <ChevronLeft size={14} />
                <span>Trước</span>
              </button>

              <span className="text-xs font-semibold text-gray-700 px-2">
                Trang {bookingPage + 1}
              </span>

              <button
                type="button"
                disabled={bookings.data.last}
                onClick={() => setBookingPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition"
              >
                <span>Sau</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
