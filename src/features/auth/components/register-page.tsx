import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react'
import { jwtAuth } from '../api/jwt'
import { apiError } from '@/lib/axios'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      if (confirm) {
        await jwtAuth.confirm(email.trim(), code)
        navigate('/')
      } else {
        await jwtAuth.register(email.trim(), password, name, phone)
        setPassword('')
        setConfirm(true)
      }
    } catch (err) {
      setError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setBusy(true)
    setError('')
    try {
      await jwtAuth.resend(email.trim())
      setMessage('Mã xác nhận mới đã được gửi tới email của bạn.')
    } catch (err) {
      setError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-12">
      {/* Left Column: Brand Showcase (Desktop) */}
      <div className="relative hidden bg-gray-900 lg:col-span-5 lg:flex lg:flex-col lg:justify-between p-12 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
          alt="Không gian thư giãn"
          className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />

        <div className="relative z-10">
          <Link to="/">
            <span className="text-2xl font-bold tracking-tight text-white">Ellora</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mb-4 text-pink-300">
            <Sparkles size={20} />
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            Tận hưởng đặc quyền làm đẹp và quản lý lịch hẹn thông minh
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-gray-300">
            Trở thành hội viên để nhận các ưu đãi giảm giá độc quyền và tích điểm mỗi lần đặt lịch.
          </p>
        </div>

        <div className="relative z-10 text-xs text-gray-400">
          © 2026 Ellora Booking Platform
        </div>
      </div>

      {/* Right Column: Clean White Form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:col-span-7 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center sm:text-left">
            <Link to="/" className="inline-block mb-6 lg:hidden">
              <img
                src="/ellora-logoHeader.png"
                alt="Ellora"
                className="h-9 w-auto mx-auto object-contain"
              />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {confirm ? 'Xác Nhận Email' : 'Đăng Ký Tài Khoản'}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {confirm
                ? `Nhập mã xác thực gồm 6 chữ số đã được gửi tới ${email}.`
                : 'Bắt đầu hành trình chăm sóc móng và làm đẹp cùng Ellora.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs text-red-600">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-xs text-emerald-700">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {confirm ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700">Mã xác thực (6 số):</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="123456"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-center text-lg font-mono font-bold tracking-widest text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Họ và tên:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={2}
                    maxLength={150}
                    required
                    placeholder="Nguyễn Thị Mai"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Số điện thoại:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700">Mật khẩu:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    maxLength={100}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs placeholder:text-gray-400"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-50"
            >
              <span>{busy ? 'Đang xử lý...' : confirm ? 'Xác nhận mã' : 'Đăng ký tài khoản'}</span>
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          {confirm && (
            <div className="mt-4 text-center">
              <button
                type="button"
                disabled={busy}
                onClick={() => void resend()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
              >
                <RefreshCw size={13} />
                <span>Gửi lại mã xác nhận</span>
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
