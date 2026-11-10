import { useState, useRef } from 'react'
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  RefreshCw,
  Building2,
  Clock,
  ShieldCheck,
  Ban,
  FileText,
  UploadCloud,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { useDecideSalon, usePendingSalons } from '../queries/admin.queries'
import { SuspendedSalonBadge } from '@/features/salon/components/suspended-salon-badge'
import { useConfirm } from '@/hooks/use-confirm'

const STATUS_TABS = [
  { id: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { id: 'ALL', label: 'Tất cả (Lịch sử)' },
  { id: 'ACTIVE', label: 'Đã duyệt' },
  { id: 'SUSPENDED', label: 'Đã từ chối / Đình chỉ' },
]

export function AdminApprovalsPage() {
  const { confirm } = useConfirm()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL')
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [contractError, setContractError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pending = usePendingSalons(page, statusFilter)
  const decide = useDecideSalon()

  const detail = pending.data?.content.find((item) => item.id === selectedId)

  const handleSelectSalon = (id: string) => {
    setSelectedId(id)
    setContractFile(null)
    setContractError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      setContractError('Dung lượng file tối đa là 15MB.')
      return
    }
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      setContractError('Định dạng không hỗ trợ. Vui lòng tải file PDF hoặc hình ảnh (PNG, JPG).')
      return
    }
    setContractFile(file)
    setContractError(null)
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedId) return
    const isApprove = action === 'approve'

    if (isApprove && !contractFile && !detail?.contractUrl) {
      setContractError('Bắt buộc phải tải lên file hợp đồng (ảnh hoặc PDF) đã ký trước khi duyệt.')
      return
    }

    const ok = await confirm({
      title: isApprove ? 'Duyệt hồ sơ salon' : 'Từ chối / Đình chỉ salon',
      description: isApprove
        ? `Duyệt hồ sơ và cấp quyền hoạt động cho salon này${contractFile ? ` kèm hợp đồng "${contractFile.name}"` : ''}?`
        : 'Bạn có chắc chắn muốn từ chối hoặc đình chỉ quyền hoạt động của salon này?',
      confirmText: isApprove ? 'Duyệt salon' : 'Xác nhận đình chỉ',
      variant: isApprove ? 'default' : 'destructive',
    })
    if (!ok) return

    try {
      await decide.mutateAsync({ id: selectedId, action, contractFile: contractFile || undefined })
      setSelectedId('')
      setContractFile(null)
      setContractError(null)
      setPage(0)
      setMessage(isApprove ? 'Đã duyệt salon và lưu hợp đồng thành công!' : 'Đã cập nhật trạng thái từ chối/đình chỉ salon.')
    } catch {
      setMessage('Không xử lý được đăng ký. Vui lòng kiểm tra lại file hợp đồng và thử lại.')
    }
  }

  const salonList = pending.data?.content ?? []

  const renderBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <ShieldCheck size={12} />
            Đã duyệt
          </span>
        )
      case 'SUSPENDED':
        return <SuspendedSalonBadge status="SUSPENDED" badgeVariant="pill" />
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
            <Ban size={12} />
            Từ chối
          </span>
        )
      case 'PENDING_APPROVAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            <Clock size={12} />
            Chờ duyệt
          </span>
        )
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Xét duyệt & Lịch sử đăng ký salon
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kiểm tra hồ sơ pháp lý, lịch sử xét duyệt và quản lý quyền mở tiệm trên hệ thống Ellora
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

      {/* Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id)
                setPage(0)
                setSelectedId('')
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-gray-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">
                Danh sách hồ sơ ({pending.data?.totalElements ?? 0})
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                Bộ lọc: {STATUS_TABS.find((t) => t.id === statusFilter)?.label}
              </span>
            </div>

            {pending.isPending ? (
              <div className="py-12 text-center text-sm text-gray-400">Đang tải hồ sơ…</div>
            ) : salonList.length === 0 ? (
              <div className="py-12 text-center">
                <Store className="size-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Không tìm thấy hồ sơ nào</p>
                <p className="text-xs text-gray-400 mt-1">Không có đơn đăng ký nào theo bộ lọc đã chọn.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {salonList.map((salon) => {
                  const isSelected = salon.id === selectedId
                  return (
                    <article
                      key={salon.id}
                      onClick={() => handleSelectSalon(salon.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-brand bg-rose-50/40 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:border-pink-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-gray-900">{salon.name}</h3>
                            {renderBadge(salon.status)}
                          </div>
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
                  Trang {page + 1} / {Math.max(1, Math.ceil((pending.data?.totalElements || 0) / 20) || 1)}
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
                Chọn một salon ở danh sách bên trái để xem hồ sơ và lịch sử xử lý.
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="mb-2">{renderBadge(detail.status)}</div>
                  <h3 className="text-xl font-bold text-gray-900">{detail.name}</h3>
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

                {/* Contract Section */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-900">
                      <FileText size={15} className="text-brand" />
                      Hợp đồng đối tác (Bắt buộc khi duyệt)
                    </span>
                    {detail.contractUrl && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Đã có hợp đồng
                      </span>
                    )}
                  </div>

                  {detail.contractUrl && (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white p-2.5 text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={16} className="text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-gray-800 truncate">{detail.contractFileName || 'Hop-dong-salon.pdf'}</p>
                          <p className="text-[10px] text-gray-400">
                            Tải lên: {detail.contractUploadedAt ? new Date(detail.contractUploadedAt).toLocaleDateString('vi-VN') : 'Đã lưu'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={detail.contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline shrink-0 ml-2"
                      >
                        <span>Xem file</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {/* Upload Input */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {contractFile ? (
                      <div className="flex items-center justify-between rounded-lg border border-pink-200 bg-pink-50/50 p-2.5 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={16} className="text-brand shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-gray-900 truncate">{contractFile.name}</p>
                            <p className="text-[10px] text-gray-500">{(contractFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setContractFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 ml-2"
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 text-xs text-gray-600 hover:border-brand hover:bg-rose-50/30 transition"
                      >
                        <UploadCloud size={20} className="text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          {detail.contractUrl ? 'Tải lên hợp đồng mới thay thế' : 'Chọn file hợp đồng (PDF hoặc ảnh)'}
                        </span>
                        <span className="text-[10px] text-gray-400">PDF, PNG, JPG (tối đa 15MB)</span>
                      </button>
                    )}

                    {contractError && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">
                        <AlertCircle size={12} />
                        {contractError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Notice & Actions */}
                {detail.status === 'ACTIVE' && (
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-emerald-800 space-y-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>Salon đã được duyệt và đang hoạt động bình thường.</span>
                    </div>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => void handleAction('reject')}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <Ban size={14} />
                      <span>Đình chỉ hoạt động salon này</span>
                    </button>
                  </div>
                )}

                {(detail.status === 'SUSPENDED' || detail.status === 'REJECTED') && (
                  <div className="rounded-xl bg-rose-50/70 border border-rose-200 p-3 text-xs text-rose-800 space-y-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Ban size={16} className="text-rose-600" />
                      <span>Hồ sơ đã bị từ chối hoặc đang bị đình chỉ.</span>
                    </div>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => void handleAction('approve')}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <Check size={14} />
                      <span>Mở lại / Cấp phép cho salon này</span>
                    </button>
                  </div>
                )}

                {detail.status === 'PENDING_APPROVAL' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={decide.isPending || (!contractFile && !detail.contractUrl)}
                      onClick={() => void handleAction('approve')}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
                    >
                      <Check size={16} />
                      <span>Duyệt hồ sơ & Lưu hợp đồng</span>
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
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
