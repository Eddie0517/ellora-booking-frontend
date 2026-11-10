import { useState, type FormEvent } from 'react'
import {
  Check,
  Plus,
  Trash2,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  Crown,
} from 'lucide-react'
import {
  useAdminPlans,
  useAdminSubscriptionRequests,
  useSubscriptionMutation,
} from '../queries/subscription.queries'
import type { Plan, SubscriptionRequest, Tier } from '../types/subscription.model'
import { formatPaymentDate } from '../utils/format-payment-date'

interface PlanFormState {
  price: string
  enabled: boolean
  description: string
  features: string[]
  newFeature: string
}

function PlanConfigCard({
  plan,
  onSave,
  isSaving,
}: {
  plan: Plan
  onSave: (payload: { price: number | null; enabled: boolean; description: string; features: string[] }) => Promise<void>
  isSaving: boolean
}) {
  const [form, setForm] = useState<PlanFormState>({
    price: plan.monthlyPrice?.toString() ?? '',
    enabled: plan.enabled,
    description: plan.description ?? '',
    features: plan.features && plan.features.length > 0 ? [...plan.features] : [],
    newFeature: '',
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isVip = plan.tier === 'VIP'

  const handleAddFeature = () => {
    const trimmed = form.newFeature.trim()
    if (!trimmed) return
    if (form.features.includes(trimmed)) {
      setForm((prev) => ({ ...prev, newFeature: '' }))
      return
    }
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, trimmed],
      newFeature: '',
    }))
  }

  const handleRemoveFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaveSuccess(false)
    await onSave({
      price: form.price === '' ? null : Number(form.price),
      enabled: form.enabled,
      description: form.description,
      features: form.features,
    })
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all ${
        isVip
          ? 'border-amber-300 bg-gradient-to-b from-amber-50/50 to-white'
          : 'border-slate-200/90 bg-white'
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isVip
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isVip ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{plan.displayName}</h3>
              <p className="text-xs text-gray-500">Mã gói: <span className="font-mono">{plan.tier}</span></p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-medium text-gray-600">
              {form.enabled ? 'Đang mở bán' : 'Đang đóng'}
            </span>
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            />
          </label>
        </div>

        {/* Pricing */}
        <div className="mt-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
            Giá một tháng (₫)
          </label>
          <div className="mt-1.5 relative rounded-lg">
            <input
              type="number"
              min={0}
              step={1000}
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="VD: 199000"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-3 pr-12 text-sm font-semibold text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-400">
              VNĐ
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
            Mô tả gói
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Mô tả tóm tắt giá trị của gói..."
            rows={2}
            className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Features / Benefits List */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
              Danh sách quyền lợi ({form.features.length})
            </label>
            <span className="text-[11px] text-gray-400">Hiển thị trực quan cho Salon</span>
          </div>

          <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
            {form.features.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-gray-400">
                Chưa có quyền lợi nào. Hãy thêm ít nhất một quyền lợi bên dưới.
              </p>
            ) : (
              form.features.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-gray-800 transition hover:bg-slate-100/80"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="shrink-0 text-gray-400 hover:text-red-500 transition"
                    title="Xóa quyền lợi"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add new feature input */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={form.newFeature}
              onChange={(e) => setForm((p) => ({ ...p, newFeature: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFeature()
                }
              }}
              placeholder="Nhập quyền lợi mới rồi nhấn Thêm..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-gray-800 focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              disabled={!form.newFeature.trim()}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-40 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        {saveSuccess ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <Check className="h-4 w-4" /> Đã cập nhật gói thành công
          </span>
        ) : (
          <span className="text-xs text-gray-400">Thay đổi áp dụng ngay</span>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-dark transition disabled:opacity-50"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu cấu hình gói'}
        </button>
      </div>
    </form>
  )
}

function DecisionModal({
  request,
  onClose,
  onDecide,
  onSync,
  isSyncing,
  isDeciding,
}: {
  request: SubscriptionRequest
  onClose: () => void
  onDecide: (status: 'APPROVED' | 'REJECTED', note: string) => Promise<void>
  onSync: () => Promise<void>
  isSyncing: boolean
  isDeciding: boolean
}) {
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [note, setNote] = useState('')

  const isPaid =
    Boolean(request.paymentReportedAt) &&
    (request.receivedAmount ?? 0) >= request.quotedPrice

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'APPROVED' && !isPaid) return
    if (status === 'REJECTED' && !note.trim()) return
    await onDecide(status, note)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Chi tiết yêu cầu #{request.id}
            </h3>
            <p className="text-xs text-gray-500">Salon: <span className="font-semibold text-gray-800">{request.salonName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info summary */}
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs">
          <div>
            <span className="text-gray-500">Gói yêu cầu:</span>
            <p className="mt-0.5 font-bold text-gray-900">{request.tier}</p>
          </div>
          <div>
            <span className="text-gray-500">Giá thanh toán:</span>
            <p className="mt-0.5 font-bold text-brand">
              {request.quotedPrice.toLocaleString('vi-VN')} ₫
            </p>
          </div>
          <div>
            <span className="text-gray-500">Trạng thái yêu cầu:</span>
            <p className="mt-0.5 font-semibold text-gray-800">{request.status}</p>
          </div>
          <div>
            <span className="text-gray-500">Ngày gửi:</span>
            <p className="mt-0.5 font-medium text-gray-700">
              {request.createdAt ? formatPaymentDate(request.createdAt) : 'N/A'}
            </p>
          </div>
        </div>

        {/* PayOS Status card */}
        <div
          className={`mt-4 rounded-xl border p-4 text-xs ${
            isPaid
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
              : 'border-amber-200 bg-amber-50/70 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              Trạng thái thanh toán PayOS:
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-semibold text-[11px] ${
                isPaid ? 'bg-emerald-200/80 text-emerald-800' : 'bg-amber-200/80 text-amber-800'
              }`}
            >
              {isPaid ? 'Đã nhận thanh toán' : 'Chưa nhận thanh toán'}
            </span>
          </div>

          <div className="mt-2.5 space-y-1 text-gray-600 text-[11px]">
            <p>
              Mã giao dịch / Order Code:{' '}
              <span className="font-mono font-medium text-gray-800">
                {request.payosOrderCode || 'Chưa khởi tạo'}
              </span>
            </p>
            {request.paymentReference && (
              <p>
                Tham chiếu ngân hàng:{' '}
                <span className="font-mono font-medium text-gray-800">
                  {request.paymentReference}
                </span>
              </p>
            )}
            <p>
              Số tiền đã nhận:{' '}
              <span className="font-semibold text-gray-900">
                {request.receivedAmount
                  ? `${request.receivedAmount.toLocaleString('vi-VN')} ₫`
                  : '0 ₫'}
              </span>
            </p>
            {request.paymentReportedAt && (
              <p>
                Thời gian PayOS ghi nhận:{' '}
                <span className="text-gray-800">
                  {formatPaymentDate(request.paymentReportedAt)}
                </span>
              </p>
            )}
          </div>

          {/* Sync button */}
          {!isPaid && (
            <div className="mt-3 flex items-center justify-between border-t border-amber-200/60 pt-2.5">
              <span className="text-[11px] text-amber-800">
                Kiểm tra đối soát trạng thái mới nhất từ cổng PayOS:
              </span>
              <button
                type="button"
                onClick={() => void onSync()}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50 transition"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Đang kiểm tra...' : 'Kiểm tra PayOS'}
              </button>
            </div>
          )}
        </div>

        {/* Decision form if PENDING */}
        {request.status === 'PENDING' ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Quyết định xét duyệt
            </h4>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Thao tác</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-gray-800 focus:border-brand focus:outline-none"
              >
                <option value="APPROVED">Duyệt và kích hoạt gói</option>
                <option value="REJECTED">Từ chối yêu cầu</option>
              </select>
            </div>

            {status === 'APPROVED' && !isPaid && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  <strong>Chưa thể kích hoạt:</strong> Giao dịch chưa được PayOS xác nhận đã chuyển tiền. Nút kích hoạt sẽ tự mở khi PayOS báo nhận đủ tiền.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700">
                {status === 'REJECTED' ? 'Lý do từ chối (bắt buộc)' : 'Ghi chú duyệt'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required={status === 'REJECTED'}
                maxLength={500}
                placeholder={
                  status === 'REJECTED'
                    ? 'Nhập lý do từ chối để thông báo cho đối tác...'
                    : 'Ghi chú nội bộ (nếu có)...'
                }
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-slate-50 transition"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isDeciding || (status === 'APPROVED' && !isPaid)}
                className={`rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  status === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isDeciding
                  ? 'Đang xử lý...'
                  : status === 'APPROVED'
                  ? 'Xác nhận kích hoạt gói'
                  : 'Xác nhận từ chối'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Ghi chú xét duyệt
            </h4>
            <p className="mt-1 rounded-lg bg-slate-50 p-3 text-xs italic text-gray-600">
              {request.reviewNote || 'Không có ghi chú xét duyệt.'}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-900 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminSubscriptionsPage() {
  const [filter, setFilter] = useState('PENDING')
  const [page, setPage] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const plans = useAdminPlans()
  const requests = useAdminSubscriptionRequests(filter, page)
  const mutations = useSubscriptionMutation()

  const handleSavePlan = async (
    tier: Tier,
    payload: { price: number | null; enabled: boolean; description: string; features: string[] }
  ) => {
    try {
      await mutations.savePlan.mutateAsync({
        tier,
        price: payload.price,
        enabled: payload.enabled,
        description: payload.description,
        features: payload.features,
      })
      setNotification({ type: 'success', text: `Đã lưu cấu hình cho gói ${tier}.` })
      setTimeout(() => setNotification(null), 4000)
    } catch {
      setNotification({ type: 'error', text: `Không lưu được gói ${tier}. Vui lòng thử lại.` })
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleDecide = async (status: 'APPROVED' | 'REJECTED', note: string) => {
    if (!selectedRequest) return
    try {
      await mutations.decide.mutateAsync({ id: selectedRequest.id, status, note })
      setNotification({
        type: 'success',
        text: `Đã ${status === 'APPROVED' ? 'kích hoạt' : 'từ chối'} yêu cầu #${selectedRequest.id}.`,
      })
      setSelectedRequest(null)
      setTimeout(() => setNotification(null), 4000)
    } catch {
      setNotification({ type: 'error', text: 'Có lỗi xảy ra khi xử lý yêu cầu.' })
      setTimeout(() => setNotification(null), 4000)
    }
  }

  const handleSyncPayment = async () => {
    if (!selectedRequest) return
    try {
      const updated = await mutations.syncAdminPayment.mutateAsync(selectedRequest.id)
      setSelectedRequest(updated)
      if (updated.paymentReportedAt) {
        setNotification({ type: 'success', text: 'PayOS đã xác nhận nhận tiền thành công!' })
      } else {
        setNotification({ type: 'error', text: 'PayOS chưa ghi nhận giao dịch thanh toán thành công.' })
      }
      setTimeout(() => setNotification(null), 4000)
    } catch {
      setNotification({ type: 'error', text: 'Không kiểm tra được PayOS vào lúc này.' })
      setTimeout(() => setNotification(null), 4000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Quản trị gói đăng ký Salon
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cấu hình biểu phí, mô tả và danh sách quyền lợi cho từng gói. Duyệt kích hoạt các salon đã thanh toán qua PayOS.
          </p>
        </div>
      </header>

      {/* Global alert */}
      {notification && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl p-4 text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600" />
          )}
          {notification.text}
        </div>
      )}

      {/* Section 1: Plan Configurations */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cấu hình gói dịch vụ</h2>
            <p className="text-xs text-gray-500">
              Chỉnh sửa mức giá, trạng thái kinh doanh, và danh sách quyền lợi từng dòng
            </p>
          </div>
        </div>

        {plans.isPending ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-gray-500">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gray-400 mb-2" />
            Đang tải dữ liệu cấu hình các gói...
          </div>
        ) : plans.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Không tải được danh sách gói. Vui lòng thử lại.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {plans.data.map((plan) => (
              <PlanConfigCard
                key={`${plan.tier}-${plan.monthlyPrice}-${plan.enabled}`}
                plan={plan}
                onSave={(payload) => handleSavePlan(plan.tier, payload)}
                isSaving={mutations.savePlan.isPending}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Subscription Requests */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Danh sách yêu cầu đăng ký</h2>
            <p className="text-xs text-gray-500">
              Kiểm tra tình trạng thanh toán PayOS và quyết định kích hoạt gói cho salon
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-600">Trạng thái:</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setPage(0)
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand focus:outline-none"
            >
              <option value="PENDING">Chờ duyệt (PENDING)</option>
              <option value="">Tất cả trạng thái</option>
              <option value="APPROVED">Đã duyệt (APPROVED)</option>
              <option value="REJECTED">Đã từ chối (REJECTED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>
        </div>

        {requests.isPending ? (
          <div className="p-8 text-center text-sm text-gray-500">
            <RefreshCw className="mx-auto h-5 w-5 animate-spin text-gray-400 mb-2" />
            Đang tải danh sách yêu cầu...
          </div>
        ) : requests.isError ? (
          <div className="p-6 text-sm text-red-600">Không tải được danh sách yêu cầu.</div>
        ) : requests.data.content.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Không có yêu cầu đăng ký nào trong mục này.
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Mã & Salon</th>
                    <th className="py-3 px-4">Gói & Giá niêm yết</th>
                    <th className="py-3 px-4">Thanh toán PayOS</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Ngày gửi</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.data.content.map((item) => {
                    const isPaid =
                      Boolean(item.paymentReportedAt) &&
                      (item.receivedAmount ?? 0) >= item.quotedPrice

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          <div>#{item.id} · {item.salonName}</div>
                          <div className="text-[10px] font-normal text-gray-400">Salon ID: {item.salonId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block font-bold ${
                              item.tier === 'VIP' ? 'text-amber-700' : 'text-gray-900'
                            }`}
                          >
                            {item.tier}
                          </span>
                          <span className="text-gray-500 ml-1">
                            · {item.quotedPrice.toLocaleString('vi-VN')} ₫
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isPaid ? (
                              <>
                                <Check className="h-3 w-3" /> Đã nhận tiền
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-3 w-3" /> Chờ thanh toán
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                              item.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : item.status === 'CANCELLED'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {item.status === 'APPROVED'
                              ? 'Đã duyệt'
                              : item.status === 'REJECTED'
                              ? 'Đã từ chối'
                              : item.status === 'CANCELLED'
                              ? 'Đã hủy'
                              : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">
                          {item.createdAt ? formatPaymentDate(item.createdAt) : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 hover:text-brand transition shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
              <span className="text-gray-500">
                Trang <span className="font-semibold text-gray-900">{page + 1}</span> (tổng số {requests.data.totalElements} yêu cầu)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Trang trước
                </button>
                <button
                  type="button"
                  disabled={requests.data.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Trang sau
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Decision Modal */}
      {selectedRequest && (
        <DecisionModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDecide={handleDecide}
          onSync={handleSyncPayment}
          isSyncing={mutations.syncAdminPayment.isPending}
          isDeciding={mutations.decide.isPending}
        />
      )}
    </div>
  )
}
