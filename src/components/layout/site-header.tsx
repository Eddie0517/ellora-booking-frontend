import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, X, Sparkles, User, Calendar, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { jwtAuth } from '@/features/auth/api/jwt'

const navigationLinks = [
  { to: '/', label: 'Trang chủ' },
  { to: '/search', label: 'Khám phá salon' },
  { to: '/for-business', label: 'Dành cho đối tác' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { pathname } = useLocation()
  const user = useAuthStore((state) => state.user)
  const clear = useAuthStore((state) => state.clear)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const logout = async () => {
    await jwtAuth.logout()
    clear()
    window.location.assign('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'ADMIN') return '/admin/dashboard'
    if (user.role === 'SALON_OWNER') return '/owner/dashboard'
    return '/setting/profile'
  }

  const isTransparent = !isScrolled && !open

  const isSalonOwner = user?.role === 'SALON_OWNER'
  const visibleNavLinks = navigationLinks.filter((item) => {
    if (isSalonOwner && item.to === '/search') return false
    return true
  })

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isTransparent
          ? 'border-b border-transparent bg-transparent shadow-none'
          : 'border-b border-rose-100/70 bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)]'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          aria-label="Trang chủ Ellora"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90 py-0.5"
          onClick={() => setOpen(false)}
        >
          <img
            src="/ellora-logoHeader.png"
            alt="Ellora"
            className="h-13 sm:h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Global Quick Search Pill (Desktop - hidden for salon owner) */}
        {pathname !== '/' && !isSalonOwner ? (
          <Link
            to="/search"
            className="hidden lg:flex items-center gap-2.5 rounded-full border border-gray-200/90 bg-gray-50/90 px-4 py-2.5 text-sm text-gray-500 transition-all hover:border-pink-300 hover:bg-white hover:text-gray-900 shadow-2xs"
          >
            <Search size={16} className="text-brand" />
            <span>Tìm salon, phong cách nail hoặc khu vực...</span>
          </Link>
        ) : null}

        {/* Desktop Navigation Links & Auth */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Điều hướng chính">
          <div className="flex items-center gap-7">
            {visibleNavLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `text-[15px] font-medium transition-colors hover:text-brand relative py-1 ${
                    isActive ? 'text-brand font-semibold' : 'text-gray-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {user ? (
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-3 rounded-full border border-gray-200/90 p-1.5 pr-4 text-sm font-medium text-gray-700 transition hover:border-pink-200 hover:bg-rose-50/50 shadow-2xs"
                aria-label="Mở menu tài khoản"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'User'}
                    className="h-9 w-9 rounded-full object-cover shadow-xs ring-1 ring-pink-100"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-xs">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="max-w-[130px] truncate text-sm font-semibold text-gray-800">
                  {user.fullName}
                </span>
              </button>

              {/* Profile Dropdown */}
              <div className="invisible absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="text-xs font-medium text-gray-400">Tài khoản</p>
                  <p className="truncate text-sm font-semibold text-gray-900">{user.fullName}</p>
                </div>

                <div className="py-1">
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-rose-50 hover:text-brand"
                  >
                    {user.role === 'CUSTOMER' ? <User size={16} /> : <LayoutDashboard size={16} />}
                    <span>{user.role === 'CUSTOMER' ? 'Trang cá nhân' : 'Bảng điều khiển'}</span>
                  </Link>

                  {user.role === 'CUSTOMER' && (
                    <Link
                      to="/setting/my-bookings"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-rose-50 hover:text-brand"
                    >
                      <Calendar size={16} />
                      <span>Lịch hẹn của tôi</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5">
              <Link
                to="/login"
                className="rounded-full border border-gray-200/90 px-5 py-2.5 text-[15px] font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] shadow-2xs"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-[15px] font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98]"
              >
                <Sparkles size={15} />
                <span>Đăng ký</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="rounded-xl border border-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-50 md:hidden shadow-2xs"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {open && (
        <div className="border-b border-gray-100 bg-white px-4 py-5 shadow-xl md:hidden">
          <div className="flex flex-col gap-1.5">
            {visibleNavLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-rose-50 hover:text-brand"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 mb-1">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || 'User'}
                      className="h-10 w-10 rounded-full object-cover shadow-xs ring-1 ring-pink-100"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-xs">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{user.fullName}</p>
                    <p className="truncate text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Link
                  to={getDashboardLink()}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-rose-50"
                  onClick={() => setOpen(false)}
                >
                  {user.role === 'CUSTOMER' ? 'Trang cá nhân' : 'Bảng điều khiển'}
                </Link>
                {user.role === 'CUSTOMER' && (
                  <Link
                    to="/setting/my-bookings"
                    className="rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-rose-50"
                    onClick={() => setOpen(false)}
                  >
                    Lịch hẹn của tôi
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-brand px-4 py-2.5 text-center text-sm font-medium text-white shadow-xs transition hover:bg-brand-dark"
                  onClick={() => setOpen(false)}
                >
                  Đăng ký tài khoản
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
