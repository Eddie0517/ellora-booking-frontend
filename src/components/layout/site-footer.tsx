import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function SiteFooter() {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-gray-100 bg-white text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="flex flex-col gap-3.5">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90" aria-label="Trang chủ Ellora">
              <img
                src="/ellora-logoHeader.png"
                alt="Ellora"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              Nền tảng làm đẹp & đặt lịch salon, kết nối khách hàng và các nghệ nhân làm móng uy tín.
            </p>
          </div>

          {/* Dịch vụ & Khám phá */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Khám phá
            </h4>
            <ul className="mt-3.5 space-y-2.5 text-sm">
              <li>
                <Link to="/search" className="transition hover:text-brand">
                  Tìm kiếm salon
                </Link>
              </li>
              <li>
                <Link to="/search" className="transition hover:text-brand">
                  Nail Art nghệ thuật
                </Link>
              </li>
              <li>
                <Link to="/search" className="transition hover:text-brand">
                  Sơn Gel & Chăm sóc móng
                </Link>
              </li>
            </ul>
          </div>

          {/* Dành cho Salon */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Dành cho salon
            </h4>
            <ul className="mt-3.5 space-y-2.5 text-sm">
              <li>
                <Link to="/for-business" className="transition hover:text-brand">
                  Trở thành đối tác
                </Link>
              </li>
              <li>
                <Link to="/business-registration" className="transition hover:text-brand">
                  Đăng ký mở tiệm
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ & Chính sách */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Hỗ trợ & Pháp lý
            </h4>
            <ul className="mt-3.5 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="cursor-pointer transition hover:text-brand"
                >
                  Điều khoản dịch vụ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="cursor-pointer transition hover:text-brand"
                >
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-brand">
                  Giải đáp thắc mắc & Liên hệ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 text-xs text-gray-400 sm:flex-row">
          <p>© 2026 Ellora Booking Platform. Mọi quyền được bảo lưu.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex cursor-pointer items-center gap-1.5 transition hover:text-brand"
            aria-label="Cuộn lên đầu trang"
          >
            <span>Lên đầu trang</span>
            <ArrowUp className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Modal: Terms of Service */}
      <Dialog open={activeModal === 'terms'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Điều Khoản Dịch Vụ</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2 text-sm leading-relaxed text-gray-600">
            <h5 className="font-semibold text-gray-900">1. Đặt lịch & Giữ chỗ</h5>
            <p>
              Ellora là nền tảng kết nối trực tuyến giữa khách hàng và các salon đối tác. Quý khách có thể lựa chọn dịch vụ, nghệ nhân và khung giờ phù hợp.
            </p>
            <h5 className="font-semibold text-gray-900">2. Thay đổi & Hủy lịch</h5>
            <p>
              Quý khách có thể thay đổi hoặc hủy lịch hẹn hoàn toàn miễn phí trước giờ hẹn ít nhất 02 tiếng thông qua trang Quản lý lịch hẹn.
            </p>
            <h5 className="font-semibold text-gray-900">3. Trách nhiệm dịch vụ</h5>
            <p>
              Các tiệm nail cam kết cung cấp đúng chất lượng và bảng giá niêm yết. Đội ngũ Ellora luôn sẵn sàng tiếp nhận phản hồi để bảo đảm quyền lợi đôi bên.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Privacy Policy */}
      <Dialog open={activeModal === 'privacy'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Chính Sách Bảo Mật</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2 text-sm leading-relaxed text-gray-600">
            <h5 className="font-semibold text-gray-900">1. Thu thập dữ liệu</h5>
            <p>
              Chúng tôi chỉ thu thập thông tin cần thiết (tên, số điện thoại, email) nhằm phục vụ việc xác nhận và gửi thông báo nhắc lịch hẹn.
            </p>
            <h5 className="font-semibold text-gray-900">2. Bảo vệ thông tin</h5>
            <p>
              Ellora cam kết không cung cấp hay chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị trái phép.
            </p>
            <h5 className="font-semibold text-gray-900">3. Quyền của người dùng</h5>
            <p>
              Bạn có thể xem lại, cập nhật hoặc yêu cầu xóa dữ liệu tài khoản bất kỳ lúc nào trong phần Cài đặt tài khoản.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  )
}
