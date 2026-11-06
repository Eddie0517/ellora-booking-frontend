import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Sparkles } from 'lucide-react'
import { jwtAuth } from '../api/jwt'
import { apiError } from '@/lib/axios'

type Step = 'email' | 'otp' | 'password' | 'done'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const sendCode = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await jwtAuth.requestPasswordReset(email.trim())
      setStep('otp')
      setMessage('Mã xác nhận gồm 6 chữ số đã được gửi tới email của bạn.')
    } catch (cause) {
      setError(apiError(cause))
    } finally {
      setBusy(false)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (step === 'email') {
      await sendCode()
      return
    }
    if (step === 'otp') {
      setStep('password')
      return
    }
    if (step !== 'password') return
    if (password !== confirmation) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.')
      return
    }
    setBusy(true)
    try {
      await jwtAuth.confirmPasswordReset(email.trim(), code, password)
      setPassword('')
      setConfirmation('')
      setCode('')
      setStep('done')
    } catch (cause) {
      setError(apiError(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 shadow-lg shadow-pink-950/5">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <img
              src="/ellora-logoHeader.png"
              alt="Ellora"
              className="h-9 w-auto mx-auto object-contain"
            />
          </Link>

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-brand mb-4">
            <KeyRound size={22} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {step === 'otp'
              ? 'Xác Thực Mã OTP'
              : step === 'password'
              ? 'Tạo Mật Khẩu Mới'
              : step === 'done'
              ? 'Thành Công!'
              : 'Đặt Lại Mật Khẩu'}
          </h1>

          <p className="mt-2 text-xs text-gray-500">
            {step === 'email'
              ? 'Nhập địa chỉ email tài khoản của bạn để nhận mã khôi phục.'
              : step === 'otp'
              ? `Nhập mã 6 chữ số vừa gửi tới ${email}.`
              : step === 'password'
              ? 'Thiết lập mật khẩu mới an toàn cho tài khoản của bạn.'
              : 'Mật khẩu của bạn đã được cập nhật thành công.'}
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {step === 'done' ? (
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark"
            >
              <Sparkles size={16} />
              <span>Đăng nhập ngay</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {step === 'email' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700">Email:</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs"
                />
              </div>
            )}

            {step === 'otp' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700">Mã xác thực (6 số):</label>
                <input
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  required
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="123456"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-center text-lg font-mono font-bold tracking-widest text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs"
                />
              </div>
            )}

            {step === 'password' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Mật khẩu mới:</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Tối thiểu 8 ký tự"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Xác nhận mật khẩu mới:</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Nhập lại mật khẩu mới"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-50"
            >
              <span>
                {busy
                  ? 'Đang xử lý...'
                  : step === 'email'
                  ? 'Gửi mã khôi phục'
                  : step === 'otp'
                  ? 'Tiếp tục'
                  : 'Cập nhật mật khẩu'}
              </span>
            </button>

            {step === 'otp' && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void sendCode()}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Gửi lại mã xác nhận
                </button>
              </div>
            )}
          </form>
        )}

        <div className="mt-8 border-t border-gray-100 pt-5 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand"
          >
            <ArrowLeft size={13} />
            <span>Quay lại trang đăng nhập</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
