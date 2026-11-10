import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Printer,
  CheckCircle2,
  Building2,
  MapPin,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import type { OwnerSalon } from '@/features/owner/types/owner.model'
import type { Profile } from '@/features/auth/types/profile.model'

interface PartnerContractViewProps {
  salon: OwnerSalon
  user: Profile
}

export function PartnerContractView({ salon, user }: PartnerContractViewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const contractCode = `ELR-HD-${new Date().getFullYear()}/SL-${salon.id}`
  const isApproved = salon.status === 'ACTIVE'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner & Quick Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white shadow-xs">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Hợp Đồng Đối Tác Ellora</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <CheckCircle2 size={12} />
                {isApproved ? 'Hợp đồng có hiệu lực' : 'Đang chờ thẩm định'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Mã hồ sơ: <span className="font-semibold text-gray-700">{contractCode}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition"
          >
            <Printer size={14} />
            <span>In / Lưu PDF</span>
          </button>
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition"
          >
            <span>Vào Quản Trị Salon</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Contract Paper Document */}
      <div
        ref={printRef}
        className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 md:p-14 shadow-lg shadow-pink-950/5 text-gray-800 leading-relaxed space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Official Header */}
        <div className="border-b-2 border-gray-900 pb-6 text-center space-y-1">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </p>
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            Độc lập – Tự do – Hạnh phúc
          </p>
          <p className="text-xs text-gray-400">---o0o---</p>
          <div className="pt-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
              HỢP ĐỒNG HỢP TÁC KINH DOANH
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-brand">
              (V/v Cung Cấp Dịch Vụ Nền Tảng Đặt Lịch & Quản Trị Làm Móng Ellora)
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Số hợp đồng: <strong className="text-gray-800">{contractCode}</strong>
            </p>
          </div>
        </div>

        {/* Legal Parties */}
        <div className="space-y-6 text-xs sm:text-sm">
          {/* Party A */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5 space-y-2">
            <h3 className="font-bold uppercase tracking-wide text-gray-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                A
              </span>
              <span>BÊN A: CÔNG TY CỔ PHẦN CÔNG NGHỆ ELLORA VIỆT NAM</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 pt-1">
              <p>
                <strong>Đơn vị vận hành:</strong> Nền tảng Đặt lịch Ellora Booking
              </p>
              <p>
                <strong>Đại diện:</strong> Ban Quản trị Nền tảng Ellora
              </p>
              <p>
                <strong>Hotline đối tác:</strong> 1900 8888
              </p>
              <p>
                <strong>Email hỗ trợ:</strong> partner@ellora.vn
              </p>
              <p className="sm:col-span-2">
                <strong>Địa chỉ:</strong> Tòa nhà Ellora Center, TP. Hồ Chí Minh, Việt Nam
              </p>
            </div>
          </div>

          {/* Party B */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 sm:p-5 space-y-2">
            <h3 className="font-bold uppercase tracking-wide text-gray-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
                B
              </span>
              <span>BÊN B: ĐỐI TÁC CƠ SỞ KINH DOANH (SALON & SPA)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 pt-1">
              <p>
                <strong>Tên tiệm / Salon:</strong> <span className="font-semibold text-gray-900">{salon.name}</span>
              </p>
              <p>
                <strong>Chủ sở hữu / Đại diện:</strong> {user.fullName || 'Chủ cơ sở'}
              </p>
              <p>
                <strong>Điện thoại liên hệ:</strong> {salon.phone || user.phone || 'Chưa cập nhật'}
              </p>
              <p>
                <strong>Email đăng ký:</strong> {salon.email || user.email}
              </p>
              <p className="sm:col-span-2">
                <strong>Địa chỉ cơ sở:</strong> {salon.address}, {salon.district}, {salon.city}
              </p>
              <p className="sm:col-span-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-brand shrink-0" />
                <strong>Vị trí trên bản đồ:</strong>{' '}
                {salon.latitude != null && salon.longitude != null ? (
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ✓ Đã thiết lập vị trí
                  </span>
                ) : (
                  <span className="text-amber-600">
                    Chưa thiết lập vị trí trên bản đồ (vui lòng vào trang Hồ sơ salon để ghim vị trí)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Articles */}
        <div className="space-y-5 text-xs sm:text-sm text-gray-700 border-t border-gray-100 pt-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-1">
              ĐIỀU 1: MỤC ĐÍCH & PHẠM VI HỢP TÁC
            </h4>
            <p className="text-justify text-gray-600 leading-relaxed">
              1.1. Bên A đồng ý cấp quyền cho Bên B kết nối, quảng bá thương hiệu và sử dụng hệ thống
              phần mềm quản trị lịch hẹn, nhân sự, báo cáo doanh thu và định vị salon trên bản đồ của nền tảng Ellora.
              <br />
              1.2. Bên B cam kết tiếp nhận khách hàng đặt lịch trực tuyến qua nền tảng Ellora chu đáo, đúng thời gian
              và chất lượng dịch vụ theo bảng giá đã niêm yết trên hệ thống.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">
              ĐIỀU 2: QUYỀN VÀ TRÁCH NHIỆM CỦA BÊN A (ELLORA)
            </h4>
            <p className="text-justify text-gray-600 leading-relaxed">
              2.1. Đảm bảo nền tảng công nghệ, ứng dụng di động và hệ thống máy chủ hoạt động liên tục, ổn định 24/7.
              <br />
              2.2. Hiển thị thông tin salon, dịch vụ, thợ móng và vị trí ghim bản đồ của Bên B tới khách hàng tiềm năng.
              <br />
              2.3. Cung cấp báo cáo thống kê lượt hẹn, doanh thu và đánh giá của khách hàng minh bạch trên trang quản trị.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">
              ĐIỀU 3: QUYỀN VÀ TRÁCH NHIỆM CỦA BÊN B (SALON)
            </h4>
            <p className="text-justify text-gray-600 leading-relaxed">
              3.1. Cập nhật chính xác, trung thực thông tin cơ sở (tên tiệm, địa chỉ, số hotline, ảnh đại diện, vị trí trên bản đồ).
              <br />
              3.2. Chuẩn bị nhân sự và cơ sở vật chất sẵn sàng phục vụ khi khách hàng đến đúng giờ hẹn đã xác nhận.
              <br />
              3.3. Tuân thủ tiêu chuẩn an toàn vệ sinh làm móng và quy tắc ứng xử văn minh trong cộng đồng làm đẹp Ellora.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-1">
              ĐIỀU 4: PHÂN HẠNG ĐỐI TÁC & HIỆU LỰC
            </h4>
            <p className="text-justify text-gray-600 leading-relaxed">
              4.1. Hợp đồng này được xác lập bằng phương thức điện tử và có giá trị pháp lý đầy đủ giữa hai bên.
              <br />
              4.2. Trạng thái hiện tại: <strong>{isApproved ? 'HỢP ĐỒNG ĐÃ ĐƯỢC DUYỆT & CÓ HIỆU LỰC THI HÀNH' : 'ĐANG CHỜ PHÊ DUYỆT HỒ SƠ'}</strong>.
            </p>
          </div>
        </div>

        {/* Digital Signatures & Seals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t-2 border-dashed border-gray-200 pt-8 text-center text-xs sm:text-sm">
          {/* Party A Signature */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-wide text-gray-900">
              ĐẠI DIỆN BÊN A (ELLORA PLATFORM)
            </p>
            <p className="text-[11px] text-gray-400">(Ký điện tử & Đóng dấu số)</p>
            <div className="py-2">
              <div className="mx-auto flex h-24 w-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/40 p-2 text-brand">
                <ShieldCheck size={28} className="text-brand" />
                <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider">
                  ELLORA VERIFIED SEAL
                </span>
                <span className="text-[9px] text-gray-500 font-mono">ĐÃ XÁC THỰC SỐ</span>
              </div>
            </div>
            <p className="font-bold text-gray-900">Ban Giám Đốc Ellora</p>
          </div>

          {/* Party B Signature */}
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-wide text-gray-900">
              ĐẠI DIỆN BÊN B (ĐỐI TÁC SALON)
            </p>
            <p className="text-[11px] text-gray-400">(Xác nhận qua tài khoản chủ tiệm)</p>
            <div className="py-2">
              <div className="mx-auto flex h-24 w-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-2 text-emerald-700">
                <CheckCircle2 size={28} className="text-emerald-600" />
                <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider">
                  ĐÃ KÝ ĐIỆN TỬ
                </span>
                <span className="text-[9px] text-gray-500 truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
            </div>
            <p className="font-bold text-gray-900">{user.fullName || salon.name}</p>
          </div>
        </div>
      </div>

      {/* Bottom Shortcuts */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <Link
          to="/owner/profile"
          className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
        >
          <MapPin size={13} />
          <span>Cập nhật vị trí tiệm trên bản đồ</span>
        </Link>
        <span>•</span>
        <Link
          to="/owner/dashboard"
          className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
        >
          <Building2 size={13} />
          <span>Bảng điều khiển kinh doanh</span>
        </Link>
      </div>
    </div>
  )
}
