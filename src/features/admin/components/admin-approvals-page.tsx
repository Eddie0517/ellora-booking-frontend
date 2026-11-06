import { useState } from 'react'
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  RefreshCw,
  Building2,
} from 'lucide-react'
import { useDecideSalon, usePendingSalons } from '../queries/admin.queries'
import { useConfirm } from '@/hooks/use-confirm'

export function AdminApprovalsPage() {
  const { confirm } = useConfirm()
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')

  const pending = usePendingSalons(page)
  const decide = useDecideSalon()

  const detail = pending.data?.content.find((item) => item.id === selectedId)

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedId) return
    const isApprove = action === 'approve'
    const ok = await confirm({
      title: isApprove ? 'Duyệt hồ sơ salon' : 'Từ chối đơn đăng ký',
      description: isApprove
        ? 'Duyệt hồ sơ và cấp quyền mở tiệm cho salon này?'
        : 'Từ chối đơn đăng ký salon này?',
      confirmText: isApprove ? 'Duyệt salon' : 'Từ chối',
      variant: isApprove ? 'default' : 'destructive',
    })
    if (!ok) return

    try {
      await decide.mutateAsync({ id: selectedId, action })
      setSelectedId('')
      setPage(0)
      setMessage(isApprove ? 'Đã duyệt salon thành công!' : 'Đã từ chối đăng ký salon.')
    } catch {
      setMessage('Không xử lý được đăng ký. Vui lòng thử lại.')
    }
  }

  const salonList = pending.data?.content ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Xét duyệt đăng ký salon
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kiểm tra hồ sơ pháp lý, địa chỉ và cấp quyền chủ tiệm trên hệ thống Ellora
          </p>
        </div>

        <button
          type="button"
          onClick={() => void pending.refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition"
        >
          <RefreshCw size={14} className={pending.isFetching ? 'animate-spin' : ''} />
          <span>Tải lại</span>
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-pink-200 bg-rose-50/60 p-4 text-xs font-semibold text-brand">
          {message}
        </div>
      )}

      {/* Main Grid: List of Salons + Detail Panel */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left: Salons List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Danh sách chờ duyệt ({pending.data?.totalElements ?? 0})
            </h2>

            {pending.isPending ? (
              <div className="py-12 text-center text-sm text-gray-400">Đang tải hồ sơ…</div>
            ) : salonList.length === 0 ? (
              <div className="py-12 text-center">
                <Store className="size-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Không có hồ sơ nào đang chờ duyệt</p>
                <p className="text-xs text-gray-400 mt-1">Toàn bộ đăng ký salon đã được giải quyết.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {salonList.map((salon) => {
                  const isSelected = salon.id === selectedId
                  return (
                    <article
                      key={salon.id}
                      onClick={() => setSelectedId(salon.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-brand bg-rose-50/40 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:border-pink-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">{salon.name}</h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <MapPin size={13} className="text-gray-400 shrink-0" />
                            <span>
                              {salon.address}, {salon.district ? `${salon.district}, ` : ''}{salon.city}
                            </span>
                          </p>
                          <p className="mt-1 text-[11px] text-gray-400">
                            Chủ tiệm: <strong className="text-gray-700 font-semibold">{salon.ownerName || 'Chưa rõ'}</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-brand transition"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {pending.data && pending.data.totalElements > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <span className="text-xs text-gray-500 font-medium">
                  Trang {page + 1}
                </span>

                <div className="flex items-center gap-2">
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
                    disabled={pending.data.last}
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

        {/* Right: Selected Detail Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Chi tiết hồ sơ đăng ký</h2>

            {!detail ? (
              <div className="py-16 text-center text-xs text-gray-400">
                Chọn một salon ở danh sách bên trái để xem hồ sơ và phê duyệt.
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    Chờ duyệt
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">{detail.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{detail.description || 'Chưa có phần giới thiệu.'}</p>
                </div>

                <div className="space-y-2.5 text-xs border-y border-slate-100 py-4">
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Building2 size={15} className="text-gray-400 shrink-0" />
                    <span>Chủ cơ sở: <strong className="font-semibold text-gray-900">{detail.ownerName || 'Chủ tiệm'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Mail size={15} className="text-gray-400 shrink-0" />
                    <span>Email: {detail.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Phone size={15} className="text-gray-400 shrink-0" />
                    <span>Số điện thoại: {detail.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <MapPin size={15} className="text-gray-400 shrink-0" />
                    <span>Địa chỉ: {detail.address}, {detail.district ? `${detail.district}, ` : ''}{detail.city}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={decide.isPending}
                    onClick={() => void handleAction('approve')}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>Duyệt hồ sơ</span>
                  </button>

                  <button
                    type="button"
                    disabled={decide.isPending}
                    onClick={() => void handleAction('reject')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 active:scale-95 transition disabled:opacity-50"
                  >
                    <X size={16} />
                    <span>Từ chối</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
