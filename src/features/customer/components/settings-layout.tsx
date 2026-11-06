import { useState } from 'react'
import { CalendarDays, ShieldCheck, UserRound, Sparkles, Search, LogOut, LifeBuoy, ChevronRight, CheckCircle2 } from 'lucide-react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { jwtAuth } from '@/features/auth/api/jwt'
import { toast } from 'sonner'
import { AlertDialog } from 'radix-ui'

const navLinks = [
  {
    to: '/setting/profile',
    label: 'Hồ sơ cá nhân',
    description: 'Thông tin cá nhân & liên hệ',
    Icon: UserRound,
  },
  {
    to: '/setting/security',
    label: 'Bảo mật tài khoản',
    description: 'Đổi mật khẩu & an toàn',
    Icon: ShieldCheck,
  },
  {
    to: '/setting/my-bookings',
    label: 'Lịch hẹn của tôi',
    description: 'Quản lý lịch & đánh giá',
    Icon: CalendarDays,
  },
]

export function SettingsLayout() {
  const user = useAuthStore((state) => state.user)
  const clear = useAuthStore((state) => state.clear)
  const location = useLocation()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await jwtAuth.logout()
      clear()
      toast.success('Đã đăng xuất thành công')
      window.location.assign('/login')
    } catch {
      clear()
      window.location.assign('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  const initial = user?.fullName?.trim() ? user.fullName.trim().charAt(0).toUpperCase() : 'U'

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50/40 via-white to-gray-50/30">
      {/* Top Ambient Glow */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="transition hover:text-brand">Trang chủ</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-800 font-medium">Tài khoản</span>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-brand font-semibold">
            {location.pathname.includes('security')
              ? 'Bảo mật'
              : location.pathname.includes('my-bookings')
              ? 'Lịch hẹn'
              : 'Hồ sơ'}
          </span>
        </nav>

        {/* Hero Customer Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-100/80 bg-white p-6 sm:p-8 shadow-xs shadow-rose-950/5">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-100/40 blur-3xl pointer-events-none" />
          <div className="absolute right-40 -bottom-16 h-48 w-48 rounded-full bg-pink-100/30 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* User Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-linear-to-tr from-brand to-rose-400 text-2xl sm:text-3xl font-bold text-white shadow-md shadow-brand/20 ring-4 ring-rose-50">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || 'User'}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <div
                  title="Tài khoản đang hoạt động"
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white"
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                    {user?.fullName || 'Khách hàng Ellora'}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                    <Sparkles size={11} />
                    <span>Thành viên</span>
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
                  <span>{user?.email}</span>
                  <span title="Email đã xác thực">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  </span>
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span>ID: <code className="font-mono text-gray-600 font-semibold">{user?.id || '---'}</code></span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">Tài khoản hoạt động</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
              <Link
                to="/search"
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/50 px-4 py-2 text-xs font-semibold text-brand transition hover:bg-rose-100/60 active:scale-95"
              >
                <Search size={14} />
                <span>Khám phá salon</span>
              </Link>
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-red-600 active:scale-95 shadow-2xs"
              >
                <LogOut size={14} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="mt-6 flex md:hidden overflow-x-auto no-scrollbar gap-2 pb-1">
          {navLinks.map(({ to, label, Icon }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'border border-rose-200 bg-brand text-white shadow-xs shadow-brand/20'
                    : 'border border-gray-200/80 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row lg:gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-72 shrink-0 space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-xs shadow-rose-950/5">
              <p className="px-3.5 pt-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Menu cài đặt
              </p>
              <nav className="flex flex-col gap-1.5" aria-label="Cài đặt tài khoản">
                {navLinks.map(({ to, label, description, Icon }) => {
                  const isActive = location.pathname.startsWith(to)
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`group relative flex items-center gap-3.5 rounded-2xl px-3.5 py-3 transition-all ${
                        isActive
                          ? 'border border-rose-100 bg-rose-50/70 text-brand font-semibold shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? 'bg-brand text-white shadow-xs shadow-brand/20'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-rose-50 group-hover:text-brand'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm tracking-tight ${isActive ? 'text-brand font-bold' : 'text-gray-900 font-semibold'}`}>
                          {label}
                        </p>
                        <p className="truncate text-[11px] text-gray-400 font-normal">
                          {description}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${
                          isActive ? 'text-brand translate-x-0.5' : 'text-gray-300 group-hover:text-gray-400'
                        }`}
                      />
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            {/* Help & Support Card */}
            <div className="rounded-3xl border border-rose-100/60 bg-linear-to-br from-rose-50/50 via-white to-pink-50/20 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-brand">
                  <LifeBuoy size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Bạn cần hỗ trợ?</h4>
                  <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                    Đội ngũ chăm sóc khách hàng của Ellora sẵn sàng giải đáp mọi thắc mắc của bạn.
                  </p>
                  <a
                    href="mailto:support@ellora.vn"
                    className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                  >
                    <span>support@ellora.vn</span>
                    <ChevronRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Dynamic Content Area */}
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(90vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl">
            <AlertDialog.Title className="text-base font-bold text-gray-900">
              Đăng xuất khỏi Ellora?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-xs leading-relaxed text-gray-500">
              Bạn sẽ cần đăng nhập lại bằng email và mật khẩu để tiếp tục đặt lịch và quản lý hồ sơ của mình.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel
                disabled={loggingOut}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </AlertDialog.Cancel>
              <AlertDialog.Action
                disabled={loggingOut}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault()
                  void handleLogout()
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loggingOut ? 'Đang đăng xuất...' : 'Xác nhận đăng xuất'}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
