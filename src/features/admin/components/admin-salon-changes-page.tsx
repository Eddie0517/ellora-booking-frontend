import { useState } from 'react'
import {
  RefreshCw,
  Check,
  X,
  FileEdit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useDecideSalonChange, useSalonChanges } from '../queries/admin.queries'
import { useConfirm } from '@/hooks/use-confirm'
import type { SalonChange, SalonChangeFields } from '../types/admin.model'

const fields: Array<{ key: keyof SalonChangeFields; label: string }> = [
  { key: 'name', label: 'Tên salon' },
  { key: 'description', label: 'Giới thiệu' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'city', label: 'Tỉnh / Thành phố' },
  { key: 'district', label: 'Quận / Huyện' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'email', label: 'Email liên hệ' },
  { key: 'latitude', label: 'Vĩ độ' },
  { key: 'longitude', label: 'Kinh độ' },
]

const display = (value: string | number | null) =>
  value === null || value === '' ? '—' : String(value)

function ChangePreview({ change }: { change: SalonChange }) {
  if (change.kind === 'PROFILE') {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Mục thông tin</th>
              <th className="py-2.5 px-3">Đang hiển thị</th>
              <th className="py-2.5 px-3">Đề nghị cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fields.map((field) => {
              const isDiff = change.current[field.key] !== change.proposed[field.key]
              return (
                <tr key={field.key} className={isDiff ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'}>
                  <td className="py-2.5 px-3 font-semibold text-gray-800">{field.label}</td>
                  <td className="py-2.5 px-3 text-gray-600">{display(change.current[field.key])}</td>
                  <td className={`py-2.5 px-3 ${isDiff ? 'font-bold text-brand' : 'text-gray-600'}`}>
                    {display(change.proposed[field.key])}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const current =
    change.kind === 'COVER'
      ? [change.currentLogoUrl].filter((url): url is string => !!url)
      : change.currentImageUrls
  const proposed =
    change.kind === 'COVER'
      ? [change.proposedLogoUrl].filter((url): url is string => !!url)
      : change.proposedImageUrls

  return (
    <div className="grid gap-4 sm:grid-cols-2 pt-2">
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Ảnh hiện tại</h4>
        <div className="flex flex-wrap gap-2">
          {current.length ? (
            current.map((url) => (
              <img key={url} src={url} alt="Hiện tại" className="size-28 rounded-lg object-cover border" />
            ))
          ) : (
            <p className="text-xs text-gray-400">Chưa có ảnh</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-pink-200 bg-rose-50/30 p-4">
        <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-2">Ảnh đề xuất mới</h4>
        <div className="flex flex-wrap gap-2">
          {proposed.length ? (
            proposed.map((url) => (
              <img key={url} src={url} alt="Đề xuất" className="size-28 rounded-lg object-cover border border-pink-200" />
            ))
          ) : (
            <p className="text-xs text-gray-400">Chưa có ảnh mới</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminSalonChangesPage() {
  const { confirm } = useConfirm()
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const changes = useSalonChanges(page)
  const decide = useDecideSalonChange()

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const isApprove = action === 'approve'
    const ok = await confirm({
      title: isApprove ? 'Duyệt yêu cầu cập nhật' : 'Từ chối yêu cầu cập nhật',
      description: isApprove
        ? 'Duyệt yêu cầu cập nhật thông tin salon này?'
        : 'Từ chối yêu cầu cập nhật này?',
      confirmText: isApprove ? 'Duyệt yêu cầu' : 'Từ chối',
      variant: isApprove ? 'default' : 'destructive',
    })
    if (!ok) return
    try {
      await decide.mutateAsync({ id, action })
      setSelectedId(null)
      setPage(0)
      setMessage(isApprove ? 'Đã duyệt cập nhật hồ sơ salon.' : 'Đã từ chối cập nhật.')
    } catch {
      setMessage('Không xử lý được yêu cầu. Vui lòng tải lại.')
    }
  }

  const changeList = changes.data?.content ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Duyệt cập nhật hồ sơ salon
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kiểm tra các yêu cầu thay đổi thông tin, hình ảnh và vị trí từ chủ salon
          </p>
        </div>

        <button
          type="button"
          onClick={() => void changes.refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition"
        >
          <RefreshCw size={14} className={changes.isFetching ? 'animate-spin' : ''} />
          <span>Tải lại</span>
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-pink-200 bg-rose-50/60 p-4 text-xs font-semibold text-brand">
          {message}
        </div>
      )}

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        {changes.isPending ? (
          <div className="py-16 text-center text-sm text-gray-400">Đang tải danh sách yêu cầu…</div>
        ) : changeList.length === 0 ? (
          <div className="py-16 text-center">
            <FileEdit className="size-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">Không có yêu cầu cập nhật nào đang chờ</p>
            <p className="text-xs text-gray-400 mt-1">Hồ sơ của tất cả các đối tác đã đồng bộ.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {changeList.map((change) => {
              const isExpanded = selectedId === change.id
              return (
                <article
                  key={change.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-pink-200 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{change.salonName}</h3>
                        <span className="rounded-md bg-rose-50 border border-pink-200 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                          {change.kind === 'PROFILE' ? 'Thông tin tiệm' : change.kind === 'COVER' ? 'Ảnh đại diện' : 'Bộ sưu tập'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 font-medium">
                        Gửi lúc: {change.submittedAt ? change.submittedAt.replace('T', ' ').slice(0, 16) : '—'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedId(isExpanded ? null : change.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-slate-100 transition self-start sm:self-auto"
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Xem nội dung'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                      <ChangePreview change={change} />

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          disabled={decide.isPending}
                          onClick={() => void handleAction(change.id, 'approve')}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
                        >
                          <Check size={14} />
                          <span>Duyệt cập nhật</span>
                        </button>

                        <button
                          type="button"
                          disabled={decide.isPending}
                          onClick={() => void handleAction(change.id, 'reject')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 active:scale-95 transition disabled:opacity-50"
                        >
                          <X size={14} />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {changes.data && changes.data.totalElements > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
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
                disabled={changes.data.last}
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
  )
}
