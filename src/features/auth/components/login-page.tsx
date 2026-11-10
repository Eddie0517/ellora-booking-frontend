import { useState, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  ShieldCheck,
  Clock,
  Star,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { jwtAuth } from '../api/jwt'
import { apiError } from '@/lib/axios'
import { useAuthStore } from '@/store/auth.store'

export function LoginPage() {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('ellora_remembered_email') || ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem('ellora_remembered_email'))
    } catch {
      return true
    }
  })
  const [capsLockActive, setCapsLockActive] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)

  const navigate = useNavigate()

  const currentUser = useAuthStore((state) => state.user)
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (currentUser.role === 'SALON_OWNER') {
        navigate('/owner/dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [currentUser, navigate])

  // Check Caps Lock key status
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'))
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const user = await jwtAuth.login(email.trim(), password)

      // Save or remove remembered email
      if (rememberMe) {
        localStorage.setItem('ellora_remembered_email', email.trim())
      } else {
        localStorage.removeItem('ellora_remembered_email')
      }

      toast.success('Đăng nhập thành công!', {
        description: `Chào mừng bạn quay lại, ${user.fullName || 'quý khách'}!`,
      })

      navigate(
        user.role === 'ADMIN'
          ? '/admin/dashboard'
          : user.role === 'SALON_OWNER'
          ? '/owner/dashboard'
          : '/'
      )
    } catch (err) {
      const msg = apiError(err)
      setError(msg)
      toast.error('Đăng nhập không thành công', {
        description: msg,
      })
    } finally {
      setBusy(false)
    }
  }

  const handleQuickFill = (demoEmail: string, demoPass: string = '123456') => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
    toast.info('Đã tự động điền thông tin tài khoản demo')
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
      toast.success('Đăng nhập bằng Google thành công!', {
        description: `Chào mừng bạn đến với Ellora, ${user.fullName || 'quý khách'}!`,
      })
      navigate(
        user.role === 'ADMIN'
          ? '/admin/dashboard'
          : user.role === 'SALON_OWNER'
          ? '/owner/dashboard'
          : '/'
      )
    } catch (err) {
      const msg = apiError(err)
      setError(msg)
      toast.error('Đăng nhập Google không thành công', {
        description: msg,
      })
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleError = () => {
    toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.')
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-12 overflow-x-hidden font-sans">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Editorial Visuals & Brand Storytelling (Desktop Only)       */}
      {/* ========================================================================= */}
      <div className="relative hidden bg-[#14080e] lg:col-span-5 lg:flex lg:flex-col lg:justify-between p-10 xl:p-14 text-white overflow-hidden selection:bg-rose-500 selection:text-white">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full bg-rose-600/25 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-rose-900/35 blur-3xl" />

        {/* Textured Photo Overlay */}
        <img
          src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80"
          alt="Ellora Luxury Nail Bar"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity scale-105"
        />
        {/* Soft gradient masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14080e] via-[#14080e]/70 to-[#14080e]/40" />
        <div className="absolute inset-0 bg-radial-[at_top_left] from-transparent via-[#14080e]/60 to-[#14080e]" />

        {/* TOP BRAND HEADER */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-2 transition-transform duration-300 group-hover:scale-105 shadow-inner">
              <img
                src="/ellora-icon.png"
                alt="Ellora Icon"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div>
              <span className="block text-xl font-extrabold tracking-wider text-white group-hover:text-rose-200 transition-colors">
                ELLORA
              </span>
              <span className="block text-[10px] font-semibold tracking-widest uppercase text-rose-300/80">
                Beauty & Nail Concierge
              </span>
            </div>
          </Link>
        </div>

        {/* MIDDLE CONTENT: Value Proposition & Social Proof */}
        <div className="relative z-10 max-w-md my-auto py-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-rose-200 mb-6 shadow-sm">
            <Sparkles size={14} className="text-pink-300 animate-pulse" />
            <span>Đặc quyền chăm sóc sắc đẹp dành riêng cho bạn</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.25] text-white">
            Khám Phá Phong Cách, <br />
            <span className="bg-gradient-to-r from-rose-200 via-pink-200 to-rose-300 bg-clip-text text-transparent">
              Chạm Đỉnh Tự Tin
            </span>
          </h2>

          <p className="mt-4 text-xs xl:text-sm leading-relaxed text-gray-300 font-normal">
            Kết nối hơn 500+ tiệm nail, spa và chuyên viên làm đẹp uy tín nhất. Đặt lịch giữ chỗ tức thì chỉ trong 30 giây, không chờ đợi và không cọc trước.
          </p>

          {/* Quick Value Points */}
          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3 transition-colors hover:bg-white/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300">
                <Clock size={16} />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white">Giữ chỗ tức thì 30s:</span>{' '}
                <span className="text-gray-300">Xác nhận tự động, hủy đổi giờ tiện lợi</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3 transition-colors hover:bg-white/10">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300">
                <ShieldCheck size={16} />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white">Tiêu chuẩn kiểm duyệt 5 sao:</span>{' '}
                <span className="text-gray-300">Kỹ thuật viên lành nghề, vệ sinh tối đa</span>
              </div>
            </div>
          </div>

          {/* Glass Testimonial Badge */}
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-rose-400/40 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Customer avatar"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-rose-400/40 object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                  alt="Customer avatar"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-rose-400/40 object-cover"
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80"
                  alt="Customer avatar"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" />
                  ))}
                  <span className="ml-1 text-xs font-bold text-white">4.9/5</span>
                </div>
                <p className="text-[11px] text-gray-300 truncate">
                  Từ 25.000+ quý cô sành điệu lựa chọn Ellora
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-400/90 border-t border-white/10 pt-5">
          <span>© 2026 Ellora Inc. All rights reserved.</span>
          <span className="text-rose-300/80 font-medium">Hotline CSKH: 1900 8888</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Clean, Elevated Login Form (All screens)                    */}
      {/* ========================================================================= */}
      <div className="relative flex flex-col justify-between min-h-screen px-4 py-8 sm:px-8 md:px-12 lg:col-span-7 lg:px-14 xl:px-20 bg-gradient-to-br from-white via-rose-50/25 to-pink-50/20 overflow-y-auto">
        {/* Subtle decorative background ambient glow */}
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-rose-100/40 blur-3xl -z-10" />

        {/* TOP BAR: Back Navigation + Sign Up Prompt */}
        <div className="flex items-center justify-between w-full max-w-lg mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all hover:border-pink-300 hover:bg-rose-50/60 hover:text-brand shadow-2xs"
          >
            <ArrowLeft size={14} />
            <span>Về trang chủ</span>
          </Link>

          <div className="text-xs text-gray-500">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand hover:text-brand-dark hover:underline ml-1"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Mobile Logo Only */}
          <div className="mb-6 text-center lg:hidden">
            <Link to="/" className="inline-block">
              <img
                src="/ellora-logoHeader.png"
                alt="Ellora"
                className="h-10 w-auto mx-auto object-contain"
              />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-7 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-semibold text-brand mb-3">
              <Sparkles size={13} className="text-brand shrink-0" />
              <span>Chào mừng bạn quay trở lại</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Đăng Nhập Tài Khoản
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
              Nhập thông tin xác thực để quản lý lịch hẹn và khám phá các ưu đãi đặc quyền hôm nay.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle size={16} className="text-brand shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-gray-400 hover:text-gray-600 -mr-1 -mt-1 p-1 rounded-md transition-colors"
                aria-label="Đóng thông báo"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={submit} className="space-y-4">
            {/* EMAIL INPUT */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Email đăng nhập
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-gray-200/90 bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10 shadow-2xs"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-gray-700"
                >
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand hover:text-brand-dark hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyDown}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-200/90 bg-white pl-10 pr-11 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Caps Lock Indicator */}
              {capsLockActive && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                  <AlertCircle size={12} />
                  <span>Phím Caps Lock đang bật</span>
                </div>
              )}
            </div>

            {/* REMEMBER ME CHECKBOX */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                />
                <span className="text-xs text-gray-600 font-medium">
                  Ghi nhớ đăng nhập
                </span>
              </label>

              {/* Test accounts preview toggle */}
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="text-[11px] text-gray-400 hover:text-brand hover:underline font-medium transition-colors"
              >
                {showDemoAccounts ? 'Ẩn tài khoản mẫu' : 'Gợi ý tài khoản mẫu'}
              </button>
            </div>

            {/* COLLAPSIBLE DEMO ACCOUNTS HELPER */}
            {showDemoAccounts && (
              <div className="rounded-2xl border border-pink-100 bg-pink-50/60 p-3 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-brand" />
                  <span>Chọn nhanh vai trò để kiểm thử hệ thống:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('customer@ellora.vn', '123456')}
                    className="rounded-xl border border-pink-200 bg-white py-1.5 px-2 text-[11px] font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors text-center shadow-2xs"
                  >
                    Khách hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('owner@ellora.vn', '123456')}
                    className="rounded-xl border border-pink-200 bg-white py-1.5 px-2 text-[11px] font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors text-center shadow-2xs"
                  >
                    Chủ salon
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@ellora.com', '123456')}
                    className="rounded-xl border border-pink-200 bg-white py-1.5 px-2 text-[11px] font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors text-center shadow-2xs"
                  >
                    Quản trị viên
                  </button>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={busy}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand via-rose-500 to-brand hover:from-brand-dark hover:to-brand-dark py-3.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg hover:shadow-brand/30 active:scale-[0.99] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <Loader2 size={17} className="animate-spin text-white" />
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/80" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/80 backdrop-blur-xs px-3 text-gray-400 font-medium">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* SOCIAL LOGIN: GOOGLE */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div className="flex w-full justify-center min-h-[44px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
                shape="rectangular"
                theme="outline"
                size="large"
                width="380"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                toast.info('Vui lòng cấu hình VITE_GOOGLE_CLIENT_ID trong file .env để đăng nhập với Google.')
              }}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200/90 bg-white py-3 px-4 text-xs sm:text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.99]"
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
              <span>Đăng nhập với Google</span>
            </button>
          )}

          {/* SALON PARTNER CALLOUT BANNER */}
          <div className="mt-7 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 transition-all hover:bg-rose-50/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-2xs border border-rose-100">
                  <Store size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Bạn là chủ Salon / Tiệm Nail?</p>
                  <p className="text-[11px] text-gray-500">
                    Gia nhập mạng lưới Ellora & tiếp cận hàng ngàn khách hàng
                  </p>
                </div>
              </div>
              <Link
                to="/for-business"
                className="shrink-0 text-xs font-semibold text-brand hover:text-brand-dark hover:underline inline-flex items-center gap-1"
              >
                <span>Đối tác</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* FOOTER & TERMS */}
        <div className="w-full max-w-lg mx-auto text-center pt-4">
          <p className="text-[11px] leading-relaxed text-gray-400">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link to="#" className="underline hover:text-gray-600 transition-colors">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link to="#" className="underline hover:text-gray-600 transition-colors">
              Chính sách bảo mật
            </Link>{' '}
            của Ellora.
          </p>
        </div>
      </div>
    </main>
  )
}
