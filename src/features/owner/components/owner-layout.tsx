import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Scissors,
  Store,
  Users,
  X,
  BadgeDollarSign,
  LogOut,
  ChevronRight,
  Bell,
  Volume2,
  VolumeX,
  AlertTriangle,
  CreditCard,
  Lock,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useOwnerBookings, useOwnerSalon, useOwnerSummary } from '../queries/owner.queries'
import { useBillingStatus, useOwnerBill } from '@/features/billing/queries/billing.queries'
import { vnMonth } from '@/features/billing/types/billing.model'
import { useAuthStore } from '@/store/auth.store'
import { jwtAuth } from '@/features/auth/api/jwt'
import { SuspendedSalonBadge } from '@/features/salon/components/suspended-salon-badge'

/**
 * Phát âm thanh chuông "ting ting" thông báo khi có đơn đặt lịch mới bằng Web Audio API
 */
function playTingTingChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Tiếng ting 1: Tần số E6 (~1318.5 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1318.5, now)
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.3)

    // Tiếng ting 2: Tần số cao hơn A6 (~1760 Hz) - tạo âm thanh "ting ting" kép vui tai
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1760, now + 0.12)
    gain2.gain.setValueAtTime(0.35, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.5)
  } catch (err) {
    console.warn('Could not play notification chime:', err)
  }
}

const links = [
  { to: '/owner/dashboard', label: 'Tổng quan', Icon: LayoutDashboard },
  { to: '/owner/profile', label: 'Hồ sơ salon', Icon: Store },
  { to: '/owner/hours', label: 'Giờ mở cửa', Icon: Clock3 },
  { to: '/owner/bookings', label: 'Lịch hẹn', Icon: CalendarDays },
  { to: '/owner/services', label: 'Dịch vụ & Bảng giá', Icon: Scissors },
  { to: '/owner/staff', label: 'Kỹ thuật viên', Icon: Users },
  { to: '/owner/reviews', label: 'Đánh giá khách', Icon: MessageSquare },
  { to: '/owner/photos', label: 'Hình ảnh tiệm', Icon: Scissors },
  { to: '/owner/analytics', label: 'Báo cáo doanh thu', Icon: LayoutDashboard },
  { to: '/owner/billing', label: 'Phí sàn & Thanh toán', Icon: BadgeDollarSign },
  { to: '/owner/subscription', label: 'Gói dịch vụ', Icon: BadgeDollarSign },
  { to: '/for-business', label: 'Dành cho đối tác', Icon: Building2 },
]

export function OwnerLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const salon = useOwnerSalon()
  const billingStatus = useBillingStatus()
  const user = useAuthStore((state) => state.user)

  const isOverdueLocked = Boolean(billingStatus.data?.isOverdueLocked || salon.data?.isOverdue)

  // Cấu hình chuông âm thanh (lưu trạng thái trong localStorage)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('ellora_owner_sound_enabled')
    return saved !== 'false'
  })
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const notifDropdownRef = useRef<HTMLDivElement>(null)

  const toggleSound = () => {
    const nextState = !soundEnabled
    setSoundEnabled(nextState)
    localStorage.setItem('ellora_owner_sound_enabled', String(nextState))
    if (nextState) {
      playTingTingChime()
      toast.success('Đã bật chuông thông báo đơn mới (ting ting) 🔔')
    } else {
      toast.info('Đã tắt chuông thông báo 🔕')
    }
  }

  // Tự động kiểm tra lịch hẹn chưa xác nhận (PENDING) và nhắc nhở phí sàn định kỳ
  const salonId = salon.data?.id ?? ''
  const currentVnMonth = vnMonth()
  const pendingBookingsQuery = useOwnerBookings(salonId, 0, 'PENDING', {
    refetchInterval: 6000,
    enabled: !!salonId,
  })
  const summaryQuery = useOwnerSummary({
    refetchInterval: 6000,
    enabled: !!salonId,
  })
  const ownerBillQuery = useOwnerBill(currentVnMonth, {
    refetchInterval: 6000,
    enabled: !!salonId,
  })

  const pendingCount =
    summaryQuery.data?.pendingBookings ??
    pendingBookingsQuery.data?.totalElements ??
    pendingBookingsQuery.data?.content?.length ??
    0
  const hasBillingReminder = Boolean(
    ownerBillQuery.data &&
      ownerBillQuery.data.due > 0 &&
      ownerBillQuery.data.remindedAt
  )
  const totalNotifCount = pendingCount + (hasBillingReminder ? 1 : 0)
  const hasPendingBookings = totalNotifCount > 0

  // Theo dõi thông báo nhắc nợ phí sàn mới từ Admin
  useEffect(() => {
    const bill = ownerBillQuery.data
    if (!bill || bill.due <= 0 || !bill.remindedAt) return

    const storageKey = `ellora_seen_reminder_${bill.salonId}_${bill.month}`
    const lastSeen = localStorage.getItem(storageKey)
    if (lastSeen === bill.remindedAt) return

    localStorage.setItem(storageKey, bill.remindedAt)
    if (soundEnabled) {
      playTingTingChime()
    }
    toast.warning(`🔔 Nhắc nhở thanh toán phí sàn tháng ${bill.month}!`, {
      description: `Quản trị viên nhắc thanh toán khoản phí nền tảng ${bill.due.toLocaleString('vi-VN')} ₫.`,
      action: {
        label: 'Thanh toán ngay',
        onClick: () => navigate('/owner/billing'),
      },
    })
  }, [ownerBillQuery.data, soundEnabled, navigate])

  // Theo dõi đơn mới để phát tiếng chuông ting ting
  const seenBookingIdsRef = useRef<Set<string>>(new Set())
  const isFirstLoadRef = useRef(true)

  useEffect(() => {
    const items = pendingBookingsQuery.data?.content
    if (!items) return

    const currentIds = new Set(items.map((b) => String(b.id)))

    if (isFirstLoadRef.current) {
      seenBookingIdsRef.current = currentIds
      isFirstLoadRef.current = false
      return
    }

    let hasNewArrival = false
    for (const b of items) {
      const idStr = String(b.id)
      if (!seenBookingIdsRef.current.has(idStr)) {
        hasNewArrival = true
        break
      }
    }

    if (hasNewArrival) {
      seenBookingIdsRef.current = currentIds
      if (soundEnabled) {
        playTingTingChime()
      }
      toast.info('🛎️ Bạn có lịch hẹn mới từ khách hàng!', {
        description: 'Vui lòng kiểm tra và xác nhận lịch hẹn.',
        action: {
          label: 'Xem ngay',
          onClick: () => navigate('/owner/bookings'),
        },
      })
    } else {
      seenBookingIdsRef.current = currentIds
    }
  }, [pendingBookingsQuery.data?.content, soundEnabled, navigate])

  // Đóng popover thông báo khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false)
      }
    }
    if (showNotifDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifDropdown])

  const logout = async () => {
    await jwtAuth.logout()
    useAuthStore.getState().clear()
    window.location.assign('/login')
  }

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'O'
  const isSuspended = salon.data?.status === 'SUSPENDED'

  // Component cụm Nút Bật/Tắt chuông + Chuông thông báo
  const notificationCluster = (
    <div className="relative flex items-center gap-2.5" ref={notifDropdownRef}>
      {/* Nút bật/tắt chuông */}
      <button
        type="button"
        onClick={toggleSound}
        className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-95 ${
          soundEnabled
            ? 'border-pink-200 bg-white text-gray-800 hover:border-pink-300 hover:bg-rose-50/50'
            : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
        title={soundEnabled ? 'Chuông đang bật (nhấp để tắt)' : 'Chuông đang tắt (nhấp để bật)'}
      >
        {soundEnabled ? (
          <Volume2 size={14} className="text-emerald-500 animate-pulse" />
        ) : (
          <VolumeX size={14} className="text-gray-400" />
        )}
        <span>{soundEnabled ? 'Đã bật chuông' : 'Đã tắt chuông'}</span>
      </button>

      {/* Nút Chuông thông báo + Badge */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowNotifDropdown((prev) => !prev)}
          className={`relative rounded-xl border p-2 transition-all active:scale-90 ${
            showNotifDropdown
              ? 'border-brand bg-rose-50 text-brand'
              : 'border-gray-200/80 bg-white text-gray-600 hover:border-pink-200 hover:bg-rose-50/50 hover:text-brand shadow-2xs'
          }`}
          aria-label="Thông báo lịch hẹn"
        >
          <Bell size={18} className={hasPendingBookings ? 'animate-bounce text-brand' : ''} />

          {/* Badge số lượng đơn mới e.g. +7 */}
          {hasPendingBookings && (
            <span className="absolute -top-1.5 -right-2 flex min-w-5 items-center justify-center rounded-full bg-[#8C3A5A] px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              +{totalNotifCount}
            </span>
          )}
        </button>

        {/* Dropdown danh sách đơn mới */}
        {showNotifDropdown && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-brand" />
                <h4 className="text-sm font-bold text-gray-900">Thông báo của tiệm</h4>
              </div>
              {hasPendingBookings ? (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-brand">
                  {totalNotifCount} thông báo
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                  0 mới
                </span>
              )}
            </div>

            <div className="mt-2 divide-y divide-gray-100 max-h-72 overflow-y-auto no-scrollbar">
              {hasBillingReminder && ownerBillQuery.data && (
                <div
                  onClick={() => {
                    setShowNotifDropdown(false)
                    navigate('/owner/billing')
                  }}
                  className="py-2.5 px-2.5 mb-1 bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl cursor-pointer transition flex items-start justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-900 truncate flex items-center gap-1">
                      <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                      <span>Nhắc thanh toán phí sàn T{ownerBillQuery.data.month}</span>
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Admin nhắc thanh toán công nợ kỳ {ownerBillQuery.data.month}
                    </p>
                    {ownerBillQuery.data.remindedAt && (
                      <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                        {new Date(ownerBillQuery.data.remindedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-[#8C3A5A]">
                      {ownerBillQuery.data.due.toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="block mt-0.5 text-[9px] font-bold uppercase text-white bg-[#8C3A5A] px-1.5 py-0.5 rounded">
                      Thanh toán
                    </span>
                  </div>
                </div>
              )}

              {(!pendingBookingsQuery.data?.content || pendingBookingsQuery.data.content.length === 0) && !hasBillingReminder ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-rose-50 text-brand">
                    <Bell size={20} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    Hiện chưa có thông báo hoặc lịch hẹn mới cần xác nhận.
                  </p>
                </div>
              ) : (
                (pendingBookingsQuery.data?.content ?? []).slice(0, 5).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setShowNotifDropdown(false)
                      navigate('/owner/bookings')
                    }}
                    className="py-2.5 px-2 hover:bg-rose-50/60 rounded-xl cursor-pointer transition flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate group-hover:text-brand transition-colors">
                        {b.customerName || 'Khách đặt lịch'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{b.serviceName}</p>
                      <p className="text-[10px] text-brand font-semibold mt-0.5">
                        {b.scheduledAt ? b.scheduledAt.replace('T', ' ').slice(0, 16) : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-gray-800">
                        {b.servicePrice ? `${Number(b.servicePrice).toLocaleString('vi-VN')} đ` : 'Chưa định giá'}
                      </span>
                      <span className="block mt-0.5 text-[9px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                        Chờ duyệt
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 border-t border-gray-100 pt-2.5">
              <Link
                to="/owner/bookings"
                onClick={() => setShowNotifDropdown(false)}
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gray-50 py-2 text-xs font-bold text-brand hover:bg-rose-50 transition"
              >
                <span>Xem tất cả lịch hẹn ({pendingCount})</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 lg:flex">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 hover:opacity-90 transition cursor-pointer"
          title="Tải lại trang quản lý Salon"
        >
          <img src="/ellora-logoHeader.png" alt="Ellora" className="h-7 w-auto object-contain" />
          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-brand">Salon</span>
        </button>

        <div className="flex items-center gap-2">
          {notificationCluster}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
            aria-label="Mở menu quản trị"
          >
            {hasPendingBookings && (
              <span className="absolute top-1.5 right-1.5 flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-80" />
                <span className="relative inline-flex size-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              </span>
            )}
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Owner Sidebar Navigation */}
      <aside
        className={`${
          open ? 'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl' : 'hidden'
        } border-r border-slate-200/80 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:justify-between`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2.5 hover:opacity-90 transition cursor-pointer"
              title="Tải lại trang quản lý Salon"
            >
              <img src="/ellora-logoHeader.png" alt="Ellora" className="h-8 w-auto object-contain" />
              <span className="rounded-md bg-rose-50 border border-pink-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                Chủ salon
              </span>
            </button>
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

          {/* Active Salon Card */}
          <div className="p-4">
            <div
              className={`rounded-2xl border p-3.5 shadow-2xs transition-colors ${
                isSuspended
                  ? 'border-rose-200 bg-gradient-to-br from-rose-50/90 via-red-50/30 to-white'
                  : 'border-pink-100/80 bg-gradient-to-br from-rose-50/70 via-pink-50/30 to-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Cơ sở quản lý
                </span>
                <div className="flex items-center gap-1">
                  {isOverdueLocked && (
                    <span className="rounded-md bg-red-100 border border-red-300 px-1.5 py-0.5 text-[9px] font-bold text-red-700">
                      Nợ phí quá hạn
                    </span>
                  )}
                  <SuspendedSalonBadge status={salon.data?.status} />
                </div>
              </div>
              <p className="mt-1.5 truncate text-sm font-bold text-gray-900">
                {salon.data?.name ?? (salon.isError ? 'Chưa cấu hình salon' : 'Đang tải thông tin…')}
              </p>
              {salon.data?.address && (
                <p className="mt-0.5 truncate text-xs text-gray-500 font-medium">
                  {salon.data.address}
                </p>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 px-3 py-2" aria-label="Quản lý salon">
            {links.map(({ to, label, Icon }) => {
              const isBookings = to === '/owner/bookings'
              const showPendingDot = isBookings && hasPendingBookings
              const isBilling = to === '/owner/billing'
              const showOverdueBadge = isBilling && isOverdueLocked

              return (
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
                      {/* Chấm đỏ phát sáng ở góc trên bên trái ô Lịch hẹn khi có lịch chưa xác nhận */}
                      {showPendingDot && (
                        <span
                          className="absolute -top-1 -left-1 flex size-3.5 items-center justify-center z-10"
                          title="Có lịch hẹn đang chờ xác nhận"
                        >
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-80" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444,0_0_4px_#ef4444] ring-2 ring-white" />
                        </span>
                      )}

                      <div className="flex items-center gap-3.5">
                        <Icon
                          size={19}
                          className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? 'text-brand' : 'text-gray-400 group-hover:text-brand'
                          }`}
                        />
                        <span>{label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {showOverdueBadge && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs animate-pulse">
                            Cần nộp!
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight size={15} className="text-brand shrink-0 animate-in fade-in" />
                        )}
                      </div>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="border-t border-slate-100 p-4 bg-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'Chủ tiệm'}
                  className="size-10 rounded-full object-cover shadow-xs ring-1 ring-pink-100"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-brand text-white font-bold text-sm shadow-xs">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {user?.fullName || 'Chủ tiệm'}
                </p>
                <p className="truncate text-xs font-medium text-gray-500">
                  {user?.email || 'owner@ellora.vn'}
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
        </div>
      </aside>

      {/* Main Page Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header with Sound Toggle & Notification Bell */}
        <header className="sticky top-0 z-30 hidden lg:flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-400">
              Quản lý:
            </span>
            <span className="text-sm font-bold text-gray-800">
              {salon.data?.name || 'Salon Nail'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {notificationCluster}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {isOverdueLocked && location.pathname === '/owner/billing' && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-red-900 shadow-xs animate-in fade-in">
              <AlertTriangle className="size-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-sm text-red-800">
                  Cơ sở đang bị tạm ngưng hoạt động do quá hạn thanh toán phí sàn
                </h4>
                <p className="mt-1 text-red-700 font-medium">
                  Cửa hàng của bạn đã bị tạm ẩn khỏi tìm kiếm và không nhận được lịch hẹn mới. Vui lòng thanh toán khoản phí bên dưới qua PayOS (VietQR) để tự động mở lại cửa hàng ngay lập tức.
                </p>
              </div>
            </div>
          )}

          {isOverdueLocked && location.pathname !== '/owner/billing' ? (
            <div className="mx-auto max-w-2xl py-12 text-center animate-in fade-in zoom-in-95">
              <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-red-100 text-red-600 shadow-lg shadow-red-200/50 mb-6">
                <Lock size={40} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 mb-3">
                <AlertTriangle size={14} />
                Tài khoản cơ sở bị khóa tạm thời
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Quá hạn thanh toán phí dịch vụ nền tảng
              </h2>
              <p className="mt-3 text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                Salon <strong>{salon.data?.name || 'của bạn'}</strong> hiện đã vượt quá hạn thanh toán đối soát hoa hồng định kỳ. Hệ thống đã tạm thời khóa các tính năng quản lý, ẩn salon khỏi danh sách tìm kiếm và ngừng nhận lịch đặt hẹn mới.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/owner/billing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/25 hover:bg-red-700 active:scale-95 transition"
                >
                  <CreditCard size={18} />
                  <span>Đến trang Thanh toán phí sàn ngay (PayOS)</span>
                </Link>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
