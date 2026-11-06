import { useState, type FormEvent } from 'react'
import {
  AlertCircle,
  RefreshCw,
  User,
  Store,
  Calendar,
} from 'lucide-react'
import {
  useAdminDispute,
  useAdminDisputes,
  useResolveAdminDispute,
} from '../queries/admin.queries'

const statusLabels: Record<string, { label: string; badge: string }> = {
  OPEN: { label: 'Chờ giải quyết', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  UPHELD: { label: 'Giữ hoàn tất', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REOPENED: { label: 'Trả về thực hiện', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
}

export function AdminDisputesPage() {
  const [status, setStatus] = useState('OPEN')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [outcome, setOutcome] = useState<'UPHELD' | 'REOPENED'>('UPHELD')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  const cases = useAdminDisputes(status, page)
  const detail = useAdminDispute(selectedId)
  const resolve = useResolveAdminDispute()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedId || !note.trim()) return
    try {
      await resolve.mutateAsync({ id: selectedId, outcome, note })
      setNote('')
      setMessage('Đã lưu kết luận xử lý phản ánh thành công.')
    } catch {
      setMessage('Không lưu được kết luận. Vui lòng thử lại.')
    }
  }

  const caseList = cases.data?.content ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Phản ánh & Khiếu nại lịch hẹn
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Xử lý tranh chấp giữa khách hàng và tiệm nail khi có phản ánh về dịch vụ hoàn thành
          </p>
        </div>

        <button
          type="button"
          onClick={() => void cases.refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition"
        >
          <RefreshCw size={14} className={cases.isFetching ? 'animate-spin' : ''} />
          <span>Tải lại</span>
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-pink-200 bg-rose-50/60 p-4 text-xs font-semibold text-brand">
          {message}
        </div>
      )}

      {/* Grid: Cases List + Detail */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Cases */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Danh sách khiếu nại</h2>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(0)
                  setSelectedId('')
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-gray-700"
              >
                <option value="OPEN">Chờ xử lý</option>
                <option value="">Tất cả trạng thái</option>
                <option value="UPHELD">Giữ hoàn tất</option>
                <option value="REOPENED">Trả về thực hiện</option>
              </select>
            </div>

            {cases.isPending ? (
              <div className="py-12 text-center text-sm text-gray-400">Đang tải phản ánh…</div>
            ) : caseList.length === 0 ? (
              <div className="py-12 text-center">
                <AlertCircle className="size-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Không có phản ánh nào</p>
                <p className="text-xs text-gray-400 mt-1">Hệ thống đang hoạt động ổn định.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {caseList.map((item) => {
                  const isSelected = item.id === selectedId
                  const badgeConfig = statusLabels[item.status] ?? {
                    label: item.status,
                    badge: 'bg-gray-100 text-gray-700 border-gray-200',
                  }
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id)
                        setNote('')
                      }}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-brand bg-rose-50/40 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:border-pink-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand">
                          #{item.bookingId}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeConfig.badge}`}
                        >
                          {badgeConfig.label}
                        </span>
                      </div>

                      <h3 className="mt-2 text-sm font-bold text-gray-900">{item.salonName}</h3>
                      <p className="text-xs text-gray-600 font-medium">
                        Khách: {item.customerName} · {item.serviceName}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-gray-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{item.reason}"
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {cases.data && cases.data.totalElements > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-gray-500">Trang {page + 1}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-lg border px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={cases.data.last}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border px-2.5 py-1 text-xs font-semibold disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Dispute Detail & Resolution Form */}
        <div className="lg:col-span-7">
          <div className="sticky top-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Chi tiết khiếu nại & Kết luận</h2>

            {!selectedId ? (
              <div className="py-20 text-center text-xs text-gray-400">
                Chọn một khiếu nại từ danh sách bên trái để xem đầy đủ dữ liệu đặt lịch và đưa ra kết luận.
              </div>
            ) : detail.isPending ? (
              <div className="py-20 text-center text-sm text-gray-400">Đang tải hồ sơ khiếu nại…</div>
            ) : detail.isError || !detail.data ? (
              <div className="py-20 text-center text-sm text-red-600">Không tải được chi tiết.</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Header summary */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-brand">
                      Khiếu nại #{detail.data.id} · Lịch #{detail.data.bookingId}
                    </span>
                    <span className="text-gray-400">
                      Gửi lúc: {detail.data.createdAt ? detail.data.createdAt.replace('T', ' ').slice(0, 16) : '—'}
                    </span>
                  </div>
                  <div className="mt-3 rounded-xl bg-amber-50/70 border border-amber-200/70 p-3.5 text-amber-900">
                    <span className="font-bold block mb-1">Lý do khách hàng khiếu nại:</span>
                    <p className="whitespace-pre-wrap leading-relaxed">{detail.data.reason}</p>
                  </div>
                </div>

                {/* Booking & Parties info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1.5">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                      <User size={14} className="text-blue-500" />
                      Thông tin khách hàng
                    </span>
                    <p>Họ tên: <strong className="text-gray-900">{detail.data.customerName}</strong></p>
                    <p>SĐT: {detail.data.customerPhone || 'Chưa cập nhật'}</p>
                    <p>Email: {detail.data.customerEmail || 'Chưa cập nhật'}</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1.5">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                      <Store size={14} className="text-brand" />
                      Thông tin tiệm & Chủ salon
                    </span>
                    <p>Tiệm: <strong className="text-gray-900">{detail.data.salonName}</strong></p>
                    <p>Chủ tiệm: {detail.data.ownerName || 'Chưa rõ'}</p>
                    <p>SĐT: {detail.data.salonPhone || detail.data.ownerPhone || '—'}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                    <Calendar size={14} className="text-emerald-500" />
                    Dịch vụ đã đặt
                  </span>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>{detail.data.serviceName} ({detail.data.durationMinutes} phút)</span>
                    <strong className="text-brand text-sm">{detail.data.servicePrice.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                  <p className="text-gray-500">Kỹ thuật viên thực hiện: {detail.data.employeeName || 'Bất kỳ'}</p>
                </div>

                {/* Admin Resolution Form or Logged Verdict */}
                {detail.data.status === 'OPEN' ? (
                  <form onSubmit={submit} className="border-t border-slate-100 pt-5 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Đưa ra kết luận của Quản trị viên</h3>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Hướng giải quyết:
                      </label>
                      <select
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value as 'UPHELD' | 'REOPENED')}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-100"
                      >
                        <option value="UPHELD">Giữ trạng thái Hoàn thành (Bác khiếu nại)</option>
                        <option value="REOPENED">Trả về Đang thực hiện (Salon cần xử lý lại cho khách)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Ghi chú kết luận chi tiết (bắt buộc):
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập căn cứ xử lý sau khi đã trao đổi với khách hàng và salon..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs placeholder-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resolve.isPending}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-pink-500/20 hover:bg-brand-hover active:scale-95 transition disabled:opacity-50"
                    >
                      <span>{resolve.isPending ? 'Đang lưu…' : 'Lưu kết luận giải quyết'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="border-t border-slate-100 pt-4 rounded-xl bg-slate-50/70 p-4 border space-y-2">
                    <span className="font-bold text-emerald-800 text-xs">Kết luận đã được Quản trị viên xử lý:</span>
                    <p className="text-gray-800 whitespace-pre-wrap">{detail.data.adminNote || 'Không có ghi chú'}</p>
                    <p className="text-gray-400 text-[11px]">
                      Giải quyết lúc: {detail.data.resolvedAt ? detail.data.resolvedAt.replace('T', ' ').slice(0, 16) : '—'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
