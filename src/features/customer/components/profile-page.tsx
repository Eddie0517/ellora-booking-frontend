import { useState, type FormEvent } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Save,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react'
import { useProfile, useUpdateProfile } from '@/features/auth/queries/profile.queries'
import { apiError } from '@/lib/axios'
import { toast } from 'sonner'

export function ProfilePage() {
  const profile = useProfile()
  const update = useUpdateProfile()
  const [draft, setDraft] = useState<{ fullName: string; phone: string } | null>(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  if (profile.isPending) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-3xl bg-gray-100" />
        <div className="h-80 rounded-3xl bg-gray-100" />
      </div>
    )
  }

  if (profile.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-red-500" />
        <h3 className="mt-3 text-sm font-bold text-red-900">Không tải được thông tin hồ sơ</h3>
        <p className="mt-1 text-xs text-red-600">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.</p>
        <button
          type="button"
          onClick={() => void profile.refetch()}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const value = draft ?? { fullName: profile.data.fullName, phone: profile.data.phone || '' }
  const isDirty = draft !== null && (
    draft.fullName !== profile.data.fullName ||
    draft.phone !== (profile.data.phone || '')
  )

  const copyId = async () => {
    if (!profile.data.id) return
    try {
      await navigator.clipboard.writeText(profile.data.id)
      setCopiedId(true)
      toast.success('Đã sao chép mã tài khoản')
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      toast.error('Không thể sao chép mã tài khoản')
    }
  }

  const handleReset = () => {
    setDraft(null)
    setMessage('')
    setIsError(false)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)
    try {
      await update.mutateAsync({
        fullName: value.fullName.trim(),
        phone: value.phone.trim(),
      })
      setDraft(null)
      const successText = 'Hồ sơ cá nhân đã được cập nhật thành công.'
      setMessage(successText)
      toast.success(successText)
    } catch (error) {
      setIsError(true)
      const errorText = apiError(error)
      setMessage(errorText)
      toast.error(errorText)
    }
  }

  const initial = profile.data.fullName?.trim() ? profile.data.fullName.trim().charAt(0).toUpperCase() : 'U'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Hồ Sơ Cá Nhân
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Xem và cập nhật thông tin cá nhân của bạn để các salon dễ dàng liên hệ và phục vụ chu đáo nhất.
        </p>
      </div>

      {/* Account Overview Card */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs shadow-rose-950/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-brand to-rose-400 text-xl font-bold text-white shadow-xs">
              {profile.data.avatarUrl ? (
                <img
                  src={profile.data.avatarUrl}
                  alt={profile.data.fullName}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900">{profile.data.fullName}</span>
                <span className="rounded-full bg-rose-50 border border-pink-200/80 px-2 py-0.5 text-[10px] font-bold text-brand">
                  Khách hàng
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{profile.data.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-600">
            <span className="text-gray-400">Mã KH:</span>
            <span className="font-mono font-bold text-gray-800">{profile.data.id || 'N/A'}</span>
            <button
              type="button"
              onClick={() => void copyId()}
              className="ml-1 rounded-lg p-1 text-gray-400 hover:bg-white hover:text-brand transition"
              title="Sao chép ID"
            >
              {copiedId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <form
        onSubmit={submit}
        className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs shadow-rose-950/5 space-y-6"
      >
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-sm font-bold text-gray-900">Thông tin liên lạc & Định danh</h3>
          <p className="mt-0.5 text-xs text-gray-400">
            Hãy chắc chắn thông tin số điện thoại chính xác để nhận thông báo lịch làm móng.
          </p>
        </div>

        {/* Input: Full Name */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="fullName" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <User size={13} className="text-brand" />
              <span>Họ và tên</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-gray-400">
              {value.fullName.length}/150
            </span>
          </div>
          <input
            id="fullName"
            type="text"
            value={value.fullName}
            onChange={(e) => setDraft({ ...value, fullName: e.target.value })}
            required
            minLength={2}
            maxLength={150}
            placeholder="Ví dụ: Nguyễn Thị Mai"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/10 shadow-2xs"
          />
        </div>

        {/* Input: Email (Disabled) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Mail size={13} className="text-brand" />
              <span>Địa chỉ email</span>
            </label>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
              <ShieldCheck size={11} className="text-gray-400" />
              <span>Cố định</span>
            </span>
          </div>
          <input
            id="email"
            value={profile.data.email}
            disabled
            className="w-full rounded-2xl border border-gray-200/60 bg-gray-50/80 px-4 py-3 text-sm text-gray-500 cursor-not-allowed select-none"
          />
          <p className="flex items-center gap-1 text-[11px] text-gray-400">
            <Info size={11} />
            <span>Email gắn liền với tài khoản đăng nhập của bạn và không thể sửa đổi trực tiếp.</span>
          </p>
        </div>

        {/* Input: Phone */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Phone size={13} className="text-brand" />
            <span>Số điện thoại liên hệ</span>
          </label>
          <input
            id="phone"
            type="tel"
            maxLength={20}
            value={value.phone}
            onChange={(e) => setDraft({ ...value, phone: e.target.value })}
            placeholder="Ví dụ: 0912 345 678"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/10 shadow-2xs"
          />
          <p className="text-[11px] text-gray-400">
            Số điện thoại sẽ được gửi tới salon khi bạn xác nhận đặt lịch hẹn để nhân viên tiện đón tiếp.
          </p>
        </div>

        {/* Feedback message banner */}
        {message && (
          <div
            role="alert"
            className={`flex items-center gap-2.5 rounded-2xl p-3.5 text-xs border transition-all ${
              isError
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {isError ? (
              <AlertCircle size={16} className="shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Privacy Note Card */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={16} className="mt-0.5 text-brand shrink-0" />
            <div className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-900">Cam kết bảo mật dữ liệu:</strong> Ellora cam kết bảo mật toàn diện thông tin cá nhân của bạn theo tiêu chuẩn quốc tế và không chia sẻ cho bên thứ ba vì mục đích tiếp thị.
            </div>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
          <div>
            {isDirty && (
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                <AlertCircle size={13} />
                <span>Bạn có chỉnh sửa chưa lưu</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={update.isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95"
              >
                <RotateCcw size={13} />
                <span>Hủy thay đổi</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!isDirty || update.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-xs shadow-brand/20 transition hover:bg-brand-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              <span>{update.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
