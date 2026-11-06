import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Store,
  Clock,
  CalendarCheck,
  CheckCircle2,
  Percent,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import {
  useAdminSummary,
  useAdminRevenue,
  usePendingSalons,
  useDecideSalon,
} from '../queries/admin.queries'
import { useConfirm } from '@/hooks/use-confirm'
import {
  getMonthStartStr,
  getTodayStr,
  getWeekStartStr,
  getYearStartStr,
} from '@/lib/date'

export function AdminDashboardPage() {
  const { confirm } = useConfirm()
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [timePreset, setTimePreset] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [tablePage, setTablePage] = useState(0)

  // Calculate date ranges
  const { fromDate, toDate } = useMemo(() => {
    const to = getTodayStr()
    let from = to
    if (timePreset === 'day') from = to
    else if (timePreset === 'week') from = getWeekStartStr()
    else if (timePreset === 'month') from = getMonthStartStr()
    else if (timePreset === 'year') from = getYearStartStr()

    return { fromDate: from, toDate: to }
  }, [timePreset])

  const summary = useAdminSummary()
  const revenue = useAdminRevenue(fromDate, toDate, groupBy)
  const pendingSalons = usePendingSalons(0)
  const decideSalon = useDecideSalon()

  const rawSummary = summary.data

  const kpis = [
    {
      label: 'Khách hàng',
      value: rawSummary ? rawSummary.customers.toLocaleString('vi-VN') : '0',
      sub: 'Tài khoản khách hàng đăng ký',
      Icon: Users,
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Salon hoạt động',
      value: rawSummary ? rawSummary.activeSalons.toLocaleString('vi-VN') : '0',
      sub: 'Cơ sở đã được duyệt & mở cửa',
      Icon: Store,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Salon chờ duyệt',
      value: rawSummary ? rawSummary.salonsAwaitingApproval.toLocaleString('vi-VN') : '0',
      sub: 'Đăng ký mới cần xét duyệt',
      Icon: Clock,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Tổng lượt đặt hẹn',
      value: rawSummary ? rawSummary.totalBookings.toLocaleString('vi-VN') : '0',
      sub: 'Toàn bộ booking trên sàn',
      Icon: CalendarCheck,
      bgColor: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      label: 'Lịch đã hoàn thành',
      value: rawSummary ? rawSummary.completedBookings.toLocaleString('vi-VN') : '0',
      sub: 'Lịch hẹn đã phục vụ xong',
      Icon: CheckCircle2,
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'Tỷ lệ khách quay lại',
      value: rawSummary ? `${rawSummary.returningCustomerRate.toFixed(1)}%` : '0%',
      sub: 'Khách có từ 2 lịch hoàn thành',
      Icon: Percent,
      bgColor: 'bg-violet-50 text-violet-600 border-violet-100',
    },
  ]

  const points = useMemo(() => revenue.data?.points ?? [], [revenue.data?.points])
  const maxGross = useMemo(() => {
    if (!points.length) return 1
    return Math.max(...points.map((p) => p.gross), 100_000)
  }, [points])

  const handleApprove = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Duyệt salon đối tác',
      description: `Duyệt và cấp quyền đối tác cho salon "${name}"?`,
      confirmText: 'Duyệt salon',
    })
    if (!ok) return
    try {
      await decideSalon.mutateAsync({ id, action: 'approve' })
    } catch {}
  }

  const handleReject = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Từ chối đăng ký salon',
      description: `Từ chối đăng ký của salon "${name}"?`,
      confirmText: 'Từ chối',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      await decideSalon.mutateAsync({ id, action: 'reject' })
    } catch {}
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Tổng quan hệ thống
            </h1>
            <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
              Admin
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Giám sát thời gian thực người dùng, đối tác salon và dòng tiền giao dịch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void summary.refetch()
              void revenue.refetch()
              void pendingSalons.refetch()
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition"
          >
            <RefreshCw size={14} className={summary.isFetching ? 'animate-spin' : ''} />
            <span>Làm mới số liệu</span>
          </button>
        </div>
      </div>

      {/* KPI 6 Stat Cards (Distinct High Elevation Cards) */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  Hệ thống
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

      {/* Revenue Section (Interactive Bar Chart + Breakdown) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Doanh thu phí nền tảng</h2>
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-brand">
                Platform Billing
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Từ {fromDate} đến {toDate} · Phí áp dụng theo ngày lịch hẹn hoàn tất
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time Presets */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              {(
                [
                  ['day', 'Hôm nay'],
                  ['week', 'Tuần này'],
                  ['month', 'Tháng này'],
                  ['year', 'Năm nay'],
                ] as const
              ).map(([preset, label]) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTimePreset(preset)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    timePreset === preset
                      ? 'bg-white text-brand shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Group By Selector */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-100"
            >
              <option value="day">Gộp theo ngày</option>
              <option value="week">Gộp theo tuần</option>
              <option value="month">Gộp theo tháng</option>
              <option value="year">Gộp theo năm</option>
            </select>
          </div>
        </div>

        {/* 3 Metric Cards for Revenue */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4">
            <span className="text-xs font-semibold text-gray-500">Tổng giá trị dịch vụ</span>
            <p className="mt-1 text-2xl font-black text-gray-900">
              {revenue.isPending ? '…' : `${(revenue.data?.gross ?? 0).toLocaleString('vi-VN')} ₫`}
            </p>
          </div>

          <div className="rounded-xl border border-pink-100 bg-rose-50/40 p-4">
            <span className="text-xs font-semibold text-brand">Phí nền tảng phát sinh</span>
            <p className="mt-1 text-2xl font-black text-brand">
              {revenue.isPending ? '…' : `${(revenue.data?.fee ?? 0).toLocaleString('vi-VN')} ₫`}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4">
            <span className="text-xs font-semibold text-gray-500">Lịch hoàn thành</span>
            <p className="mt-1 text-2xl font-black text-gray-900">
              {revenue.isPending ? '…' : (revenue.data?.completedBookings ?? 0).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Interactive Visual Bar Chart */}
        <div>
          {revenue.isPending ? (
            <div className="flex h-56 items-center justify-center text-sm text-gray-400">
              Đang tải biểu đồ doanh thu nền tảng…
            </div>
          ) : points.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="size-8 text-pink-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Chưa có giao dịch trong khoảng thời gian này</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Hãy thử chọn khoảng thời gian khác hoặc kiểm tra lại các booking đã hoàn thành.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex h-48 items-end gap-2 sm:gap-3 overflow-x-auto pb-2 pt-6">
                {points.slice(-14).map((pt, idx) => {
                  const grossHeight = Math.max(8, Math.round((pt.gross / maxGross) * 100))
                  const feeHeight = Math.max(4, Math.round((pt.fee / maxGross) * 100))
                  return (
                    <div
                      key={idx}
                      className="group flex flex-1 flex-col items-center gap-1.5 min-w-[32px]"
                    >
                      <div className="relative w-full flex items-end justify-center gap-1 h-36">
                        {/* Gross bar */}
                        <div
                          style={{ height: `${grossHeight}%` }}
                          className="w-full max-w-[14px] rounded-t-sm bg-slate-300 transition-all duration-300 group-hover:bg-slate-400"
                        />
                        {/* Fee bar */}
                        <div
                          style={{ height: `${feeHeight}%` }}
                          className="w-full max-w-[14px] rounded-t-sm bg-brand transition-all duration-300 group-hover:bg-pink-600 shadow-xs"
                        />
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute -top-12 z-10 hidden rounded-md bg-gray-900 px-2 py-1 text-[11px] font-bold text-white shadow-lg whitespace-nowrap group-hover:block">
                          Dịch vụ: {pt.gross.toLocaleString('vi-VN')} ₫ | Phí: {pt.fee.toLocaleString('vi-VN')} ₫ ({pt.bookings} lịch)
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 truncate max-w-full">
                        {String(pt.date).slice(5)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-slate-300" />
                  Doanh thu dịch vụ (Gross)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-brand" />
                  Phí nền tảng (Platform Fee)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Breakdown Table with Pagination */}
        {points.length > 0 && (
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Bảng phân rã chi tiết theo kỳ</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-gray-400 uppercase font-bold text-[11px] tracking-wider">
                    <th className="py-2.5 px-3">Kỳ bắt đầu</th>
                    <th className="py-2.5 px-3">Lịch hoàn thành</th>
                    <th className="py-2.5 px-3">Doanh thu dịch vụ</th>
                    <th className="py-2.5 px-3">Phí nền tảng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {points.slice(tablePage * 5, (tablePage + 1) * 5).map((pt, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-semibold text-gray-800">{pt.date}</td>
                      <td className="py-3 px-3 font-medium text-gray-600">{pt.bookings}</td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        {pt.gross.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3 font-bold text-brand">
                        {pt.fee.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {points.length > 5 && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-gray-500">
                  Trang {tablePage + 1} / {Math.ceil(points.length / 5)}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={tablePage === 0}
                    onClick={() => setTablePage((p) => Math.max(0, p - 1))}
                    className="rounded-lg border px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={(tablePage + 1) * 5 >= points.length}
                    onClick={() => setTablePage((p) => p + 1)}
                    className="rounded-lg border px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pending Salon Approvals Section */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Salon đăng ký chờ xét duyệt</h2>
              {pendingSalons.data && pendingSalons.data.totalElements > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5">
                  {pendingSalons.data.totalElements} đơn
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Xem xét hồ sơ đối tác và kích hoạt hoạt động trên sàn Ellora
            </p>
          </div>

          <Link
            to="/admin/approvals"
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            <span>Xem toàn bộ</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto pt-3">
          {pendingSalons.isPending ? (
            <div className="py-8 text-center text-sm text-gray-400">Đang tải hồ sơ chờ duyệt…</div>
          ) : !pendingSalons.data?.content.length ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-gray-700">Không có salon nào đang chờ duyệt</p>
              <p className="text-xs text-gray-400 mt-1">
                Tất cả hồ sơ đăng ký kinh doanh đã được xử lý xong.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-gray-400 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-3">Tên salon</th>
                  <th className="py-3 px-3">Chủ sở hữu</th>
                  <th className="py-3 px-3">Địa chỉ & Khu vực</th>
                  <th className="py-3 px-3">Liên hệ</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingSalons.data.content.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-bold text-gray-900">{s.name}</td>
                    <td className="py-3 px-3 text-gray-700 font-medium">{s.ownerName || 'Chủ tiệm'}</td>
                    <td className="py-3 px-3 text-gray-500">
                      {s.address}, {s.district ? `${s.district}, ` : ''}{s.city}
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-mono text-[11px]">
                      {s.phone || s.email || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={decideSalon.isPending}
                          onClick={() => void handleApprove(s.id, s.name)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          disabled={decideSalon.isPending}
                          onClick={() => void handleReject(s.id, s.name)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 active:scale-95 transition disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
