import { useState, type FormEvent } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Check,
  ShieldAlert,
} from 'lucide-react'
import { jwtAuth } from '@/features/auth/api/jwt'
import { toast } from 'sonner'

export function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  // Password strength calculation
  const hasMinLength = newPassword.length >= 8
  const hasLetter = /[a-zA-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword)
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword

  let strengthScore = 0
  if (hasMinLength) strengthScore += 1
  if (hasLetter) strengthScore += 1
  if (hasNumber) strengthScore += 1
  if (hasSpecial) strengthScore += 1

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: '', color: 'bg-gray-200', text: '' }
    if (strengthScore <= 2) return { label: 'Mật khẩu yếu', color: 'bg-red-500', text: 'text-red-600' }
    if (strengthScore === 3) return { label: 'Mật khẩu trung bình', color: 'bg-amber-500', text: 'text-amber-600' }
    return { label: 'Mật khẩu mạnh & an toàn', color: 'bg-emerald-500', text: 'text-emerald-600' }
  }

  const strength = getStrengthLabel()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      setError(true)
      const err = 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.'
      setMessage(err)
      toast.error(err)
      return
    }

    if (newPassword.length < 8) {
      setError(true)
      const err = 'Mật khẩu mới phải có tối thiểu 8 ký tự.'
      setMessage(err)
      toast.error(err)
      return
    }

    setSaving(true)
    setMessage('')
    try {
      await jwtAuth.changePassword(currentPassword, newPassword)
      setError(false)
      const successText = 'Đổi mật khẩu thành công. Tài khoản của bạn đã được bảo vệ với mật khẩu mới.'
      setMessage(successText)
      toast.success(successText)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (cause) {
      setError(true)
      const errText = cause instanceof Error ? cause.message : 'Không đổi được mật khẩu.'
      setMessage(errText)
      toast.error(errText)
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = currentPassword.trim().length > 0 && hasMinLength && isMatch && !saving

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Bảo Mật Tài Khoản
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Cập nhật mật khẩu để bảo vệ an toàn cho tài khoản và lịch sử đặt hẹn của bạn.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form Card (3 cols on desktop) */}
        <div className="lg:col-span-3">
          <form
            onSubmit={submit}
            className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs shadow-rose-950/5 space-y-5"
          >
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Đổi mật khẩu đăng nhập</h3>
              <p className="mt-0.5 text-xs text-gray-400">
                Nhập mật khẩu hiện tại và tạo mật khẩu mới an toàn hơn.
              </p>
            </div>

            {/* Current Password */}
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Lock size={13} className="text-brand" />
                <span>Mật khẩu hiện tại</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  placeholder="Nhập mật khẩu bạn đang dùng"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/10 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <KeyRound size={13} className="text-brand" />
                <span>Mật khẩu mới</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/10 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicator */}
              {newPassword.length > 0 && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strengthScore / 4) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                    <span className="text-gray-400">{newPassword.length} ký tự</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Shield size={13} className="text-brand" />
                <span>Xác nhận mật khẩu mới</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/10 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Checklist criteria */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-2 text-xs">
              <p className="font-semibold text-gray-700">Yêu cầu bảo mật:</p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                  {hasMinLength ? <Check size={14} className="text-emerald-600" /> : <span className="h-1.5 w-1.5 rounded-full bg-gray-300 ml-1" />}
                  <span>Ít nhất 8 ký tự</span>
                </div>
                <div className={`flex items-center gap-2 ${isMatch ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                  {isMatch ? <Check size={14} className="text-emerald-600" /> : <span className="h-1.5 w-1.5 rounded-full bg-gray-300 ml-1" />}
                  <span>Mật khẩu xác nhận khớp</span>
                </div>
              </div>
            </div>

            {/* Feedback message banner */}
            {message && (
              <div
                role="alert"
                className={`flex items-center gap-2.5 rounded-2xl p-3.5 text-xs border ${
                  error
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                {error ? <AlertCircle size={16} className="shrink-0 text-red-600" /> : <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}
                <span className="font-medium">{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-xs shadow-brand/20 transition hover:bg-brand-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <KeyRound size={14} />
                <span>{saving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Recommendations Sidebar (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-rose-100/80 bg-linear-to-br from-rose-50/60 via-white to-pink-50/30 p-6 shadow-xs shadow-rose-950/5 space-y-4">
            <div className="flex items-center gap-2.5 text-brand">
              <ShieldAlert size={20} />
              <h3 className="text-sm font-bold text-gray-900">Khuyến nghị an toàn</h3>
            </div>

            <ul className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-brand">
                  1
                </span>
                <span>
                  <strong>Mật khẩu độc nhất:</strong> Không sử dụng lại mật khẩu bạn đang dùng cho tài khoản ngân hàng hoặc mạng xã hội.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-brand">
                  2
                </span>
                <span>
                  <strong>Không chia sẻ mã xác thực:</strong> Nhân viên Ellora hoặc chủ salon sẽ không bao giờ hỏi mật khẩu của bạn.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-brand">
                  3
                </span>
                <span>
                  <strong>Đổi mật khẩu định kỳ:</strong> Nên đổi mật khẩu 3 - 6 tháng một lần để đảm bảo an toàn tối đa.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xs flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Bảo vệ kết nối</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Mọi dữ liệu truyền tải đều được mã hóa SSL/TLS 256-bit chuẩn an toàn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
