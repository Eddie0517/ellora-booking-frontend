import { Link } from 'react-router-dom'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Download,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react'
import type { OwnerSalon } from '@/features/owner/types/owner.model'
import type { Profile } from '@/features/auth/types/profile.model'

interface PartnerContractViewProps {
  salon: OwnerSalon
  user: Profile
}

export function PartnerContractView({ salon, user }: PartnerContractViewProps) {
  const isApproved = salon.status === 'ACTIVE'
  const isPending = salon.status === 'PENDING_APPROVAL' || !salon.status

  const isPdf = Boolean(
    salon.contractFileType === 'application/pdf' ||
      salon.contractFileName?.toLowerCase().endsWith('.pdf') ||
      salon.contractUrl?.toLowerCase().includes('.pdf')
  )

  const isImage = Boolean(
    salon.contractFileType?.startsWith('image/') ||
      salon.contractFileName?.match(/\.(png|jpe?g|webp)$/i) ||
      salon.contractUrl?.match(/\.(png|jpe?g|webp)/i)
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in">
      {/* Top Banner & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-rose-100 bg-gradient-to-r from-rose-50/70 via-pink-50/40 to-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-pink-900/15">
            <Building2 size={28} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Đơn Đăng Ký & Hồ Sơ Đối Tác
              </h1>
              {isApproved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <ShieldCheck size={14} />
                  <span>Đã duyệt & Đang hoạt động</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                  <Clock size={14} />
                  <span>Đang chờ thẩm định</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 border border-rose-200">
                  <AlertCircle size={14} />
                  <span>{salon.status}</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Cơ sở: <strong className="text-gray-900 font-bold">{salon.name}</strong> • Mã hồ sơ: <span className="font-mono font-semibold text-gray-700">SL-{salon.id}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/owner/profile"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition"
          >
            <span>Chỉnh sửa hồ sơ</span>
          </Link>
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-dark active:scale-95 transition"
          >
            <span>Vào Quản Trị Salon</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Status Notice Banner */}
      {isPending && (
        <div className="flex items-start gap-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 text-amber-900 shadow-xs">
          <Clock className="size-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
            <h3 className="font-bold text-amber-950 text-sm sm:text-base">
              Hồ sơ đăng ký đang chờ ban quản trị thẩm định & làm hợp đồng trực tiếp
            </h3>
            <p className="text-amber-800">
              Đơn đăng ký của bạn đã được ghi nhận trên hệ thống Ellora. Đội ngũ phát triển đối tác sẽ trực tiếp liên hệ với chủ tiệm qua số điện thoại <strong>{salon.phone || user.phone}</strong> hoặc email <strong>{salon.email || user.email}</strong> để thẩm định cơ sở vật chất và ký kết hợp đồng hợp tác trực tiếp.
            </p>
            <p className="text-amber-700 text-xs font-medium">
              * Sau khi hai bên ký kết hợp đồng, ban quản trị sẽ tải bản hợp đồng số hóa (file PDF hoặc ảnh) lên hệ thống để chính thức kích hoạt cơ sở hoạt động.
            </p>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="flex items-start gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-emerald-900 shadow-xs">
          <ShieldCheck className="size-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed flex-1">
            <h3 className="font-bold text-emerald-950 text-sm sm:text-base">
              Cơ sở đã được duyệt chính thức và đang hoạt động trên hệ thống
            </h3>
            <p className="text-emerald-800">
              Salon <strong>{salon.name}</strong> đã hoàn tất ký kết hợp đồng và sẵn sàng đón tiếp khách hàng. Tiệm của bạn đã xuất hiện trên bản đồ tìm kiếm và mở tính năng đặt lịch trực tuyến 24/7.
            </p>
            <div className="pt-2">
              <Link
                to={`/salons/${salon.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
              >
                <span>Xem trang công khai của Salon trên ứng dụng khách hàng</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Real Contract Document Card (Uploaded by Admin) */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm space-y-6 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
              <Sparkles size={14} />
              <span>Hồ sơ pháp lý</span>
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
              File Hợp Đồng Hợp Tác Chính Thức
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tài liệu hợp đồng do Admin thẩm định và tải lên sau khi ký kết trực tiếp với cơ sở
            </p>
          </div>

          {salon.contractUrl ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={14} />
              <span>Đã có file hợp đồng</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
              <Clock size={14} />
              <span>Chưa có file hợp đồng số hóa</span>
            </span>
          )}
        </div>

        {salon.contractUrl ? (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                  isPdf ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  {isPdf ? <FileText size={24} /> : <ImageIcon size={24} />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {salon.contractFileName || 'Hop-dong-doi-tac-ellora.pdf'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {salon.contractUploadedAt ? (
                      <>
                        Thời gian tải lên:{' '}
                        <strong className="text-gray-700 font-semibold">
                          {new Date(salon.contractUploadedAt).toLocaleDateString('vi-VN')} lúc{' '}
                          {new Date(salon.contractUploadedAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </>
                    ) : (
                      'Tài liệu hợp đồng số hóa đã xác thực'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={salon.contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition shadow-xs"
                >
                  <ExternalLink size={14} />
                  <span>Mở xem tài liệu gốc</span>
                </a>
                <a
                  href={salon.contractUrl}
                  download={salon.contractFileName || 'Hop-dong-doi-tac.pdf'}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 active:scale-95 transition shadow-2xs"
                  title="Tải về máy"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Tải về</span>
                </a>
              </div>
            </div>

            {/* Document Preview Display */}
            {isImage ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-semibold text-gray-500 mb-3">Xem trước ảnh hợp đồng đã ký:</p>
                <div className="max-h-[600px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs inline-block">
                  <img
                    src={salon.contractUrl}
                    alt="Hợp đồng đối tác"
                    className="max-h-[580px] w-auto object-contain mx-auto"
                  />
                </div>
              </div>
            ) : isPdf ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-xs">
                  <FileText size={32} />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  Tài liệu Hợp đồng định dạng PDF
                </h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Tài liệu đã được ký kết và số hóa an toàn trên hệ thống lưu trữ Cloudinary. Nhấn nút bên dưới để mở đọc toàn văn file PDF trong tab mới.
                </p>
                <div className="pt-2">
                  <a
                    href={salon.contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700 active:scale-95 transition"
                  >
                    <ExternalLink size={15} />
                    <span>Xem toàn văn file PDF</span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-gray-400 shadow-2xs">
              <FileText size={28} />
            </div>
            <h4 className="text-sm font-bold text-gray-800">
              Chưa có file hợp đồng số hóa đính kèm
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Quy trình ký hợp đồng được thực hiện trực tiếp giữa đại diện Ellora và chủ cơ sở. Sau khi ký, ban quản trị sẽ tải bản scan hợp đồng (PDF hoặc ảnh) lên mục này để lưu trữ pháp lý lâu dài.
            </p>
          </div>
        )}
      </div>

      {/* Salon Registration Details Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Thông tin chi tiết
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
            Đơn Đăng Ký Cơ Sở Salon
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Dữ liệu tiệm móng đã khai báo khi gửi đơn đăng ký gia nhập nền tảng
          </p>
        </div>

        {/* Salon Overview Block */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl bg-slate-50/70 border border-slate-100 p-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {salon.logoUrl ? (
              <img src={salon.logoUrl} alt={salon.name} className="h-full w-full object-cover" />
            ) : (
              <Building2 size={32} className="text-gray-300" />
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{salon.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
              <MapPin size={13} className="text-gray-400 shrink-0" />
              <span>{salon.address}, {salon.district ? `${salon.district}, ` : ''}{salon.city}</span>
            </p>
            <p className="text-xs text-gray-600 line-clamp-2 pt-1">
              {salon.description || 'Chưa có mô tả chi tiết cơ sở.'}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-2">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-brand">
              Thông tin liên hệ cơ sở
            </h4>
            <div className="space-y-2 text-gray-600 pt-1">
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <span>Hotline salon: <strong className="text-gray-900">{salon.phone || 'Chưa cập nhật'}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <span>Email tiệm: <strong className="text-gray-900">{salon.email || 'Chưa cập nhật'}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <span>Địa chỉ: <strong className="text-gray-900">{salon.address}, {salon.district ? `${salon.district}, ` : ''}{salon.city}</strong></span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-2">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-brand">
              Đại diện chủ sở hữu
            </h4>
            <div className="space-y-2 text-gray-600 pt-1">
              <p>
                Họ và tên: <strong className="text-gray-900">{user.fullName || 'Chủ cơ sở'}</strong>
              </p>
              <p>
                Email tài khoản: <strong className="text-gray-900">{user.email}</strong>
              </p>
              <p>
                Số điện thoại: <strong className="text-gray-900">{user.phone || salon.phone || 'Chưa cập nhật'}</strong>
              </p>
              <p>
                Tọa độ bản đồ:{' '}
                {salon.latitude != null && salon.longitude != null ? (
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                    ✓ Đã định vị ({salon.latitude.toFixed(4)}, {salon.longitude.toFixed(4)})
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">Chưa ghim vị trí bản đồ</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Showcase Images (if any) */}
        {salon.imageUrls && salon.imageUrls.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-900">Hình ảnh không gian cơ sở:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {salon.imageUrls.map((url, i) => (
                <div key={i} className="aspect-4/3 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                  <img src={url} alt={`Ảnh salon ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Helper Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 pt-4">
        <Link
          to="/owner/profile"
          className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
        >
          <Building2 size={13} />
          <span>Chỉnh sửa thông tin hồ sơ salon</span>
        </Link>
        <span>•</span>
        <Link
          to="/owner/billing"
          className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
        >
          <FileText size={13} />
          <span>Theo dõi phí sàn & thanh toán</span>
        </Link>
        <span>•</span>
        <Link
          to="/owner/dashboard"
          className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
        >
          <span>Vào bảng điều khiển quản trị &rarr;</span>
        </Link>
      </div>
    </div>
  )
}
