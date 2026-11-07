import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  ShieldCheck,
  Users,
  CheckSquare,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { jwtAuth } from '@/features/auth/api/jwt'

const links = [
  { to: '/admin/dashboard', label: 'Tổng quan hệ thống', Icon: LayoutDashboard },
  { to: '/admin/users', label: 'Quản lý người dùng', Icon: Users },
  { to: '/admin/approvals', label: 'Xét duyệt salon', Icon: CheckSquare },
  { to: '/admin/salon-changes', label: 'Duyệt cập nhật', Icon: RefreshCw },
  { to: '/admin/disputes', label: 'Phản ánh lịch hẹn', Icon: AlertCircle },
  { to: '/admin/support', label: 'Thông tin hỗ trợ', Icon: HelpCircle },
  { to: '/admin/content', label: 'Kiểm duyệt nội dung', Icon: CheckSquare },
  { to: '/admin/billing', label: 'Đối soát & Phí sàn', Icon: LayoutDashboard },
  { to: '/admin/subscriptions', label: 'Gói dịch vụ', Icon: Users },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  const logout = async () => {
    await jwtAuth.logout()
    useAuthStore.getState().clear()
    window.location.assign('/login')
  }

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 lg:flex">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <img src="/ellora-logoHeader.png" alt="Ellora" className="h-7 w-auto object-contain" />
          <span className="rounded-md bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
          aria-label="Mở menu admin"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Admin Sidebar Navigation */}
      <aside
        className={`${
          open ? 'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl' : 'hidden'
        } border-r border-slate-200/80 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:justify-between`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <img src="/ellora-logoHeader.png" alt="Ellora" className="h-8 w-auto object-contain" />
              <span className="rounded-md bg-gray-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Admin Console
              </span>
            </Link>
            {open && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition"
                aria-label="Đóng menu"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Admin Role Status Card */}
          <div className="p-4">
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-gray-50/50 to-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Vai trò hệ thống
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-brand">
                  <ShieldCheck size={14} />
                  Toàn quyền
                </span>
              </div>
              <p className="mt-1.5 truncate text-sm font-bold text-gray-900">
                Trung tâm Quản trị Ellora
              </p>
              <p className="mt-0.5 text-xs text-gray-500 font-medium">
                Kiểm duyệt & Giám sát dịch vụ
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 px-3 py-2" aria-label="Điều hướng quản trị">
            {links.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.96] ${
                    isActive
                      ? 'bg-rose-50/90 text-brand shadow-2xs font-bold border-l-4 border-brand pl-3'
                      : 'text-gray-600 hover:bg-rose-50/40 hover:text-brand hover:translate-x-1.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <Icon
                        size={19}
                        className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-brand' : 'text-gray-400 group-hover:text-brand'
                        }`}
                      />
                      <span>{label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight size={15} className="text-brand shrink-0 animate-in fade-in" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="border-t border-slate-100 p-4 bg-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white font-bold text-sm shadow-xs">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {user?.fullName || 'Quản trị viên'}
                </p>
                <p className="truncate text-xs font-medium text-gray-500">
                  {user?.email || 'admin@ellora.vn'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void logout()}
              title="Đăng xuất"
              className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 active:scale-90 transition-all duration-150"
              aria-label="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 py-2 text-xs font-semibold text-gray-600 hover:bg-slate-100 hover:text-brand active:scale-[0.98] transition"
          >
            <ExternalLink size={13} />
            <span>Xem trang người dùng</span>
          </Link>
        </div>
      </aside>

      {/* Main Page Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
