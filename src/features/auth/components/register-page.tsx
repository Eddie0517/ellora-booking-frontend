import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { jwtAuth } from '../api/jwt'
import { apiError } from '@/lib/axios'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Không nhận được thông tin xác thực từ Google.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const user = await jwtAuth.loginWithGoogle(credentialResponse.credential)
      toast.success('Đăng nhập bằng Google thành công!')
      navigate(
        user.role === 'ADMIN'
          ? '/admin/dashboard'
          : user.role === 'SALON_OWNER'
          ? '/owner/dashboard'
          : '/'
      )
    } catch (err) {
      setError(apiError(err))
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleError = () => {
    toast.error('Đăng ký bằng Google thất bại. Vui lòng thử lại.')
  }

  return (
    <main className="grid min-h-screen bg-[#f2e4ea] lg:grid-cols-12 font-sans">
      {/* Left Column: Generated Nail Salon Photo & Ellora Logo */}
      <div className="relative hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-between p-8 xl:p-10 overflow-hidden bg-rose-100">
        <img
          src="/ellora-auth-salon.jpg"
          alt="Ellora Nail Salon"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/75 via-white/30 to-transparent" />

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center rounded-2xl bg-white/85 backdrop-blur-md px-4 py-2.5 shadow-sm ring-1 ring-white/60 transition-transform duration-200 hover:scale-[1.02]"
          >
            <img
              src="/ellora-logoHeader.png"
              alt="Ellora"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>
      </div>

      {/* Right Column: Centered Card Frame */}
      <div className="relative flex items-center justify-center px-4 py-10 sm:px-6 lg:col-span-7 bg-gradient-to-br from-[#eedce4] via-[#f5e9ef] to-[#e5cdd8] overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-rose-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-pink-300/30 blur-3xl" />

        <div className="relative z-10 w-full max-w-[420px] rounded-3xl border border-white/90 bg-white p-8 sm:p-10 shadow-[0_25px_65px_-12px_rgba(95,35,60,0.24),0_8px_24px_-6px_rgba(95,35,60,0.12)]">
          {/* Top Centered Logo & Heading */}
          <div className="text-center mb-7">
            <Link to="/" className="inline-block mb-3">
              <img
                src="/ellora-logoHeader.png"
                alt="Ellora"
                className="h-11 w-auto mx-auto object-contain"
              />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {confirm ? 'Xác Nhận Email' : 'Đăng Ký Tài Khoản'}
            </h1>
            {confirm && (
              <p className="mt-1.5 text-xs text-gray-500">
                Nhập mã xác thực 6 chữ số đã gửi tới {email}.
              </p>
            )}
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-xs text-emerald-700">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {confirm ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mã xác thực (6 số)
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="123456"
                  className="w-full rounded-full border border-rose-100/80 bg-[#f6eef2] px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-gray-900 outline-none transition-all focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      minLength={2}
                      maxLength={150}
                      required
                      placeholder="Nguyễn Thị Mai"
                      className="w-full rounded-full border border-rose-100/80 bg-[#f6eef2] pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full rounded-full border border-rose-100/80 bg-[#f6eef2] pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="w-full rounded-full border border-rose-100/80 bg-[#f6eef2] pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      maxLength={100}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-full border border-rose-100/80 bg-[#f6eef2] pl-11 pr-11 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand hover:bg-brand-dark py-3.5 text-sm font-bold text-white shadow-md shadow-brand/25 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {busy ? (
                <>
                  <Loader2 size={17} className="animate-spin text-white" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{confirm ? 'Xác nhận mã' : 'Đăng ký'}</span>
              )}
            </button>
          </form>

          {confirm ? (
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
          ) : (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/80" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-500 font-medium">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              {/* Google Login */}
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div className="flex w-full justify-center min-h-[44px]">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="continue_with"
                    shape="pill"
                    theme="outline"
                    size="large"
                    width="340"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toast.info('Vui lòng cấu hình VITE_GOOGLE_CLIENT_ID trong file .env để tiếp tục với Google.')
                  }}
                  className="flex w-full items-center justify-center gap-2.5 rounded-full border border-gray-200 bg-white py-3 px-4 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-all active:scale-[0.99]"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Tiếp tục với Google</span>
                </button>
              )}
            </>
          )}

          {/* Footer Link inside Card */}
          <p className="mt-6 text-center text-xs text-gray-600">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="font-bold text-brand hover:text-brand-dark hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
