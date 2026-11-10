import { useState, type FormEvent } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Save,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { useProfile, useUpdateProfile } from '@/features/auth/queries/profile.queries'
import { apiError } from '@/lib/axios'
import { toast } from 'sonner'

export function ProfilePage() {
  const profile = useProfile()
  const update = useUpdateProfile()

  const [draft, setDraft] = useState<{ fullName: string; phone: string; avatarUrl?: string | null } | null>(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

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

  const value = draft ?? {
    fullName: profile.data.fullName,
    phone: profile.data.phone || '',
    avatarUrl: profile.data.avatarUrl,
  }

  const isDirty = draft !== null && (
    draft.fullName !== profile.data.fullName ||
    draft.phone !== (profile.data.phone || '') ||
    draft.avatarUrl !== profile.data.avatarUrl
  )

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
        avatarUrl: value.avatarUrl,
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

      {/* Profile Form Card */}
      <form
        onSubmit={submit}
        className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs shadow-rose-950/5 space-y-6"
      >
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-sm font-bold text-gray-900">Thông tin liên lạc & Định danh</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Các trường đánh dấu sao đỏ là bắt buộc.
          </p>
        </div>

        {/* Global Feedback Banner */}
        {message && (
          <div
            className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-medium border ${
              isError
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {isError ? (
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            )}
            <div className="flex-1">{message}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <User size={14} className="text-gray-400" />
              <span>Họ và tên của bạn</span>
              <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={150}
              value={value.fullName}
              onChange={(e) =>
                setDraft({
                  ...value,
                  fullName: e.target.value,
                })
              }
              placeholder="Nhập họ và tên đầy đủ"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Phone size={14} className="text-gray-400" />
              <span>Số điện thoại</span>
            </label>
            <input
              type="tel"
              maxLength={20}
              value={value.phone}
              onChange={(e) =>
                setDraft({
                  ...value,
                  phone: e.target.value,
                })
              }
              placeholder="Ví dụ: 0912 345 678"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
            <p className="text-[11px] text-gray-400">
              Dùng để tiệm làm móng liên hệ xác nhận lịch hẹn của bạn.
            </p>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-gray-700">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                <span>Địa chỉ Email</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <ShieldCheck size={12} />
                Đã xác thực
              </span>
            </label>
            <input
              type="email"
              disabled
              value={profile.data.email}
              className="w-full rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed shadow-2xs"
            />
            <p className="text-[11px] text-gray-400">
              Email đăng nhập chính thức, không thể thay đổi tại đây.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || update.isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <RotateCcw size={14} />
            <span>Khôi phục</span>
          </button>

          <button
            type="submit"
            disabled={!isDirty || update.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            <span>{update.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
