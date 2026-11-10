import { useState, type FormEvent } from 'react'
import { useOwnerRevenue } from '../queries/owner.queries'

const vnDate = () => {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const value = (type: string) => parts.find(item => item.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}
const format = (date: Date) => date.toISOString().slice(0, 10)
export function OwnerAnalyticsPage() {
  const today = vnDate()
  const [draftFrom, setDraftFrom] = useState(`${today.slice(0, 7)}-01`)
  const [draftTo, setDraftTo] = useState(today)
  const [draftGroup, setDraftGroup] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [filters, setFilters] = useState({ from: draftFrom, to: draftTo, groupBy: draftGroup })
  const report = useOwnerRevenue(filters.from, filters.to, filters.groupBy)
  const preset = (period: 'day' | 'week' | 'month' | 'year') => {
    const start = new Date(`${today}T00:00:00Z`)
    if (period === 'week') start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7))
    if (period === 'month') start.setUTCDate(1)
    if (period === 'year') start.setUTCMonth(0, 1)
    const next = { from: format(start), to: today, groupBy: period === 'year' ? 'month' as const : 'day' as const }
    setDraftFrom(next.from); setDraftTo(next.to); setDraftGroup(next.groupBy); setFilters(next)
  }
  const submit = (event: FormEvent) => { event.preventDefault(); if (draftFrom <= draftTo) setFilters({ from: draftFrom, to: draftTo, groupBy: draftGroup }) }
  return <main className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8"><header className="mb-8"><h1 className="text-2xl font-bold text-[#8C3A5A]">Phân tích doanh thu</h1><p className="mt-2 text-sm text-gray-600">Theo dõi doanh thu dịch vụ, phí nền tảng và số lịch đã hoàn thành.</p></header><section className="rounded-2xl border border-gray-100 bg-white p-6"><h2 className="font-serif text-2xl font-semibold">Doanh thu và phí nền tảng</h2><p className="mt-2 text-sm text-gray-600">Tính theo lịch đã hoàn thành, giờ Việt Nam. Số tiền còn lại chưa trừ chi phí vận hành.</p><div className="mt-6 flex flex-wrap gap-2">{(['day', 'week', 'month', 'year'] as const).map((period, i) => <button key={period} onClick={() => preset(period)} className="rounded-lg border px-4 py-2 text-sm">{['Hôm nay', 'Tuần này', 'Tháng này', 'Năm nay'][i]}</button>)}</div><form onSubmit={submit} className="mt-5 flex flex-wrap items-end gap-4"><label className="text-sm">Từ ngày<input required type="date" value={draftFrom} onChange={event => setDraftFrom(event.target.value)} className="mt-2 block rounded-lg border p-2" /></label><label className="text-sm">Đến ngày<input required min={draftFrom} type="date" value={draftTo} onChange={event => setDraftTo(event.target.value)} className="mt-2 block rounded-lg border p-2" /></label><label className="text-sm">Gộp theo<select value={draftGroup} onChange={event => setDraftGroup(event.target.value as typeof draftGroup)} className="mt-2 block rounded-lg border p-2"><option value="day">Ngày</option><option value="week">Tuần</option><option value="month">Tháng</option><option value="year">Năm</option></select></label><button className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white shadow-xs hover:bg-brand-dark transition">Xem báo cáo</button></form>{draftFrom > draftTo && <p role="alert" className="mt-3 text-red-700">Ngày bắt đầu không được lớn hơn ngày kết thúc.</p>}{report.isPending ? <p className="mt-6" role="status">Đang tải báo cáo…</p> : report.isError ? <p className="mt-6" role="alert">Không tải được báo cáo.</p> : <><div className="mt-6 grid gap-4 sm:grid-cols-3">{[['Doanh thu dịch vụ', report.data.gross], ['Phí nền tảng phải trả', report.data.fee], ['Tiệm còn lại', report.data.net]].map(([label, amount]) => <article key={label} className="rounded-xl border p-5"><p className="text-sm text-gray-600">{label}</p><strong className="mt-3 block text-2xl text-[#8C3A5A]">{Number(amount).toLocaleString('vi-VN')} ₫</strong></article>)}</div><p className="mt-5 text-sm">{report.data.completedBookings} lịch hoàn thành · {filters.from} – {filters.to}</p>{report.data.estimatedBookings > 0 && <p className="mt-2 text-sm text-gray-500">Có {report.data.estimatedBookings} lịch cũ dùng số liệu ước tính.</p>}<details className="mt-5"><summary className="cursor-pointer font-semibold">Xem số liệu chi tiết</summary><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr><th className="p-3">Kỳ bắt đầu</th><th className="p-3">Lịch</th><th className="p-3">Doanh thu</th><th className="p-3">Phí</th><th className="p-3">Còn lại</th></tr></thead><tbody>{report.data.points.map(point => <tr key={point.date} className="border-t"><td className="p-3">{point.date}</td><td className="p-3">{point.bookings}</td><td className="p-3">{point.gross.toLocaleString('vi-VN')} ₫</td><td className="p-3">{point.fee.toLocaleString('vi-VN')} ₫</td><td className="p-3">{point.net.toLocaleString('vi-VN')} ₫</td></tr>)}</tbody></table></div></details></>}</section></main>
}
