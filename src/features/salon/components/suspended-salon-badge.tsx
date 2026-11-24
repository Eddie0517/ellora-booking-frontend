import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  Phone,
  Mail,
  ExternalLink,
  X,
  Clock,
  ShieldAlert,
  Send,
  Check,
  Copy,
} from 'lucide-react'
import { useAdminSupport } from '@/features/admin/queries/admin.queries'

interface SuspendedSalonBadgeProps {
  status?: string | null
  className?: string
  badgeVariant?: 'pill' | 'inline'
  salonName?: string
}

export function SuspendedSalonBadge({
  status,
  className = '',
  badgeVariant = 'inline',
  salonName = '',
}: SuspendedSalonBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [appealMessage, setAppealMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const support = useAdminSupport()

  const supportEmail = support.data?.email || 'admin@ellora.vn'
  const fallbackSupportEmail = 'ellorabooking77@gmail.com'
  const supportPhone = support.data?.phone || '0369589161'
  const supportFacebook =
    support.data?.facebookUrl ||
    'https://www.facebook.com/profile.php?id=100090024755289'

  const normalizedStatus = status?.toUpperCase()

  const handleClick = (e: React.MouseEvent) => {
    if (normalizedStatus === 'SUSPENDED') {
      e.stopPropagation()
      setIsOpen(true)
    }
  }

  const handleSendEmail = (e: FormEvent) => {
    e.preventDefault()
    const subject = `[Yêu cầu mở lại tài khoản] Phản hồi từ Salon ${salonName ? `"${salonName}"` : ''}`
    const body = `Kính gửi Ban Quản Trị Ellora,\n\nTôi là chủ sở hữu cơ sở: ${salonName || '(Chưa điền tên)'}\nTrạng thái tài khoản: Tạm ngưng\n\nNội dung phản hồi / Giải trình:\n${appealMessage || 'Đề nghị Ban Quản trị xem xét mở lại hoạt động cho salon của chúng tôi.'}\n\nXin cảm ơn!`
    const mailtoUrl = `mailto:${supportEmail}?cc=${fallbackSupportEmail}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  // Suspended Status Badge with Interactive Modal
  const isPill = badgeVariant === 'pill'

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`group relative inline-flex items-center gap-1.5 rounded-full transition-all cursor-pointer ${
          isPill
            ? 'border border-rose-300 bg-rose-50/95 px-3 py-1 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100 hover:border-rose-400'
            : 'border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 shadow-2xs'
        } ${className}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Nhấp để xem chi tiết và gửi phản hồi tới Admin"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-rose-600 shadow-[0_0_6px_#e11d48]" />
        </span>
        <span>Tạm ngưng</span>
      </button>

      {/* Floating Appeal / Feedback Modal */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-left font-sans max-h-[90vh] overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Thông báo cơ sở tạm ngưng & Gửi phản hồi"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-xs">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                      Tài khoản salon tạm ngưng
                    </h3>
                    <p className="mt-0.5 text-xs text-rose-600 font-medium">
                      Thông báo chính thức từ Ban Quản trị Ellora
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-slate-100 hover:text-gray-700 transition cursor-pointer"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Explanation Box */}
              <div className="mt-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 p-4 text-xs leading-relaxed text-gray-700">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-900">
                      Salon {salonName ? `"${salonName}"` : ''} hiện đang ở trạng thái Tạm ngưng hoạt động.
                    </p>
                    <p className="mt-1 text-gray-600">
                      Trong thời gian này, salon tạm thời không hiển thị trên danh mục tìm kiếm công khai và khách hàng không thể đặt lịch hẹn mới. Bạn vẫn có thể truy cập trang quản trị và gửi giải trình/khiếu nại bên dưới.
                    </p>
                  </div>
                </div>
              </div>

              {/* Appeal Form via Email */}
              <form onSubmit={handleSendEmail} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800">
                    Nội dung phản hồi / Đề nghị mở lại cơ sở:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={appealMessage}
                    onChange={(e) => setAppealMessage(e.target.value)}
                    placeholder="Mô tả lý do hoặc thông tin giải trình của salon để Ban Quản trị Ellora xem xét kích hoạt lại..."
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-3.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 leading-relaxed"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand py-3 px-4 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition active:scale-95 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Gửi phản hồi qua Email tới Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-3 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95 cursor-pointer"
                    title="Sao chép địa chỉ email của admin"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? 'Đã sao chép' : 'Chép email'}</span>
                  </button>
                </div>
              </form>

              {/* Support Contact Info */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Thông tin hỗ trợ trực tiếp từ Ellora
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <a
                    href={`mailto:${supportEmail}`}
                    className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-2.5 hover:bg-rose-50/60 hover:border-pink-200 transition"
                  >
                    <Mail size={15} className="text-brand shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400">Email quản trị viên</p>
                      <p className="font-semibold text-gray-900 truncate">{supportEmail}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${supportPhone}`}
                    className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-2.5 hover:bg-rose-50/60 hover:border-pink-200 transition"
                  >
                    <Phone size={15} className="text-brand shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400">Hotline hỗ trợ</p>
                      <p className="font-semibold text-gray-900 truncate">{supportPhone}</p>
                    </div>
                  </a>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Thời gian hỗ trợ: 8:00 - 22:00</span>
                  </div>
                  {supportFacebook && (
                    <a
                      href={supportFacebook}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-brand hover:underline inline-flex items-center gap-1"
                    >
                      <span>Fanpage hỗ trợ</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
