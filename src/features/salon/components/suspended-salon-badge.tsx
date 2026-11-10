import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  Phone,
  Mail,
  ExternalLink,
  X,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import { useAdminSupport } from '@/features/admin/queries/admin.queries'

interface SuspendedSalonBadgeProps {
  status?: string | null
  className?: string
  badgeVariant?: 'pill' | 'inline'
}

export function SuspendedSalonBadge({
  status,
  className = '',
  badgeVariant = 'inline',
}: SuspendedSalonBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const support = useAdminSupport()

  const supportEmail = support.data?.email || 'ellorabooking77@gmail.com'
  const supportPhone = support.data?.phone || '0369589161'
  const supportFacebook =
    support.data?.facebookUrl ||
    'https://www.facebook.com/profile.php?id=100090024755289'

  const normalizedStatus = status?.toUpperCase()

  const calculatePosition = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const width = 340
    const isDesktop = window.innerWidth >= 1024

    if (isDesktop) {
      const top = Math.max(16, Math.min(window.innerHeight - 380, rect.top - 12))
      const left = Math.min(window.innerWidth - width - 16, rect.right + 12)
      setPopoverPos({ top, left })
    } else {
      const top = Math.min(window.innerHeight - 380, rect.bottom + 8)
      const left = Math.max(16, Math.min(window.innerWidth - width - 16, rect.left - 60))
      setPopoverPos({ top, left })
    }
  }

  const handleMouseEnter = () => {
    if (normalizedStatus !== 'SUSPENDED') return
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    calculatePosition()
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 250)
  }

  const handlePopoverMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handlePopoverMouseLeave = () => {
    setIsOpen(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (normalizedStatus === 'SUSPENDED') {
      e.stopPropagation()
      calculatePosition()
      setIsOpen((prev) => !prev)
    }
  }

  // Update position on window resize/scroll
  useEffect(() => {
    if (!isOpen) return
    const update = () => calculatePosition()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen])

  // Non-suspended badges
  if (normalizedStatus === 'ACTIVE') {
    return (
      <span
        className={`flex items-center gap-1 text-[11px] font-semibold text-emerald-600 ${className}`}
      >
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Hoạt động
      </span>
    )
  }

  if (normalizedStatus === 'PENDING_APPROVAL') {
    return (
      <span
        className={`flex items-center gap-1 text-[11px] font-semibold text-amber-600 ${className}`}
      >
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        Chờ xét duyệt
      </span>
    )
  }

  if (normalizedStatus === 'REJECTED') {
    return (
      <span
        className={`flex items-center gap-1 text-[11px] font-semibold text-gray-500 ${className}`}
      >
        <span className="size-1.5 rounded-full bg-gray-400" />
        Đã từ chối
      </span>
    )
  }

  // Suspended Status Badge with Interactive Popover
  const isPill = badgeVariant === 'pill'

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`group relative inline-flex items-center gap-1.5 rounded-full transition-all cursor-pointer ${
          isPill
            ? 'border border-rose-200 bg-rose-50/90 px-2.5 py-0.5 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100'
            : 'text-[11px] font-bold text-rose-600 hover:text-rose-700'
        } ${className}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-rose-600 shadow-[0_0_6px_#e11d48]" />
        </span>
        <span className="underline decoration-rose-300 underline-offset-2">
          Đang bị đình chỉ
        </span>
      </button>

      {/* Floating Suspension Notice Window */}
      {isOpen &&
        popoverPos &&
        createPortal(
          <div
            style={{
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
            }}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
            className="fixed z-[9999] w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-rose-200/90 bg-white p-4.5 shadow-2xl shadow-rose-950/10 animate-in fade-in zoom-in-95 duration-200 text-left font-sans"
            role="dialog"
            aria-label="Thông báo cơ sở bị đình chỉ"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    Cơ sở đang bị đình chỉ
                  </h4>
                  <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
                    Thông báo từ Ban Quản trị
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-slate-100 hover:text-gray-600 transition"
                aria-label="Đóng thông báo"
              >
                <X size={15} />
              </button>
            </div>

            {/* Explanation Message */}
            <div className="mt-3 rounded-xl bg-rose-50/70 border border-rose-100 p-3 text-xs leading-relaxed text-gray-700">
              <div className="flex items-start gap-1.5">
                <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                <p>
                  Salon hiện đang bị <strong>tạm dừng hoạt động</strong> trên hệ thống
                  Ellora theo quyết định của Quản trị viên. Trong thời gian này, khách hàng
                  không thể tìm thấy hoặc đặt lịch mới tại cơ sở.
                </p>
              </div>
            </div>

            {/* Ellora Contact Support Details */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                Thông tin liên hệ hỗ trợ Ellora
              </p>

              <div className="space-y-1.5 text-xs">
                {/* Phone */}
                <a
                  href={`tel:${supportPhone}`}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone size={14} className="text-brand shrink-0" />
                    <span className="text-gray-600 font-medium">Hotline hỗ trợ:</span>
                  </div>
                  <span className="font-bold text-gray-900 group-hover:text-brand transition">
                    {supportPhone}
                  </span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${supportEmail}`}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={14} className="text-brand shrink-0" />
                    <span className="text-gray-600 font-medium">Email:</span>
                  </div>
                  <span className="font-semibold text-gray-900 truncate max-w-[170px] group-hover:text-brand transition">
                    {supportEmail}
                  </span>
                </a>

                {/* Facebook */}
                {supportFacebook && (
                  <a
                    href={supportFacebook}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ExternalLink size={14} className="text-brand shrink-0" />
                      <span className="text-gray-600 font-medium">Kênh hỗ trợ:</span>
                    </div>
                    <span className="font-semibold text-brand group-hover:underline">
                      Hỗ trợ trực tuyến ↗
                    </span>
                  </a>
                )}
              </div>

              {/* Working hours notice */}
              <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-400 font-medium px-1">
                <Clock size={11} className="shrink-0" />
                <span>Thời gian hỗ trợ: 8:00 - 22:00 (Hàng ngày)</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
