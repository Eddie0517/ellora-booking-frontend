import { Link } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  Check,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useOwnerSalon } from '@/features/owner/queries/owner.queries'
import { PartnerContractView } from './partner-contract-view'

const benefits = [
  {
    icon: CalendarDays,
    title: 'Đặt lịch thông minh 24/7',
    text: 'Tự động hóa hoàn toàn lịch hẹn, phân chia khung giờ và thợ móng hợp lý, giảm đến 80% thời gian trực điện thoại.',
  },
  {
    icon: Users,
    title: 'Quản lý nhân sự & ca làm',
    text: 'Dễ dàng theo dõi lịch làm việc, phân chia doanh thu và đánh giá hiệu suất của từng kỹ thuật viên trong tiệm.',
  },
  {
    icon: BarChart3,
    title: 'Báo cáo doanh thu thời gian thực',
    text: 'Biểu đồ trực quan phân tích tăng trưởng doanh số, tỷ lệ khách quay lại và các dịch vụ sinh lời nhiều nhất.',
  },
]

const reasons = [
  {
    title: 'Tối ưu hóa công suất ghế làm móng',
    text: 'Lấp đầy các khung giờ trống trong tuần, phục vụ được nhiều khách hàng hơn mà không phát sinh thêm chi phí mặt bằng.',
  },
  {
    title: 'Tiếp cận khách hàng mới trong khu vực',
    text: 'Được gợi ý trực tiếp tới hàng ngàn khách hàng đang tìm kiếm tiệm nail gần đó trên ứng dụng Ellora.',
  },
  {
    title: 'Giảm thiểu tối đa tình trạng khách "bỏ hẹn"',
    text: 'Hệ thống gửi tin nhắn nhắc lịch tự động trước 2 giờ giúp khách hàng luôn nhớ lịch hẹn.',
  },
  {
    title: 'Hỗ trợ kỹ thuật & đồng hành 1-1',
    text: 'Đội ngũ chuyên viên Ellora hỗ trợ khởi tạo tài khoản, đào tạo nhân viên và tư vấn chiến lược tăng trưởng.',
  },
]

export function ForBusinessPage() {
  const user = useAuthStore((state) => state.user)
  const isSalonOwner = user?.role === 'SALON_OWNER'
  const salon = useOwnerSalon()

  if (isSalonOwner) {
    if (salon.isPending) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <RefreshCw size={28} className="mx-auto animate-spin text-brand" />
          <p className="mt-4 text-sm font-medium text-gray-500">Đang tải hồ sơ hợp đồng đối tác...</p>
        </div>
      )
    }
    if (salon.data) {
      return <PartnerContractView salon={salon.data} user={user!} />
    }
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <AlertCircle size={32} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900">Chưa tìm thấy thông tin cơ sở salon</h2>
        <p className="mt-2 text-sm text-gray-500">
          Tài khoản của bạn đã có vai trò chủ salon nhưng chưa có cơ sở nào được liên kết hoặc đang chờ duyệt.
        </p>
        <Link
          to="/business-registration"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-dark"
        >
          Đăng ký cơ sở mới
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-rose-50/40 via-white to-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col items-start text-left lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-white px-3.5 py-1 text-xs font-semibold text-brand shadow-2xs">
                <Sparkles size={14} />
                <span>Giải pháp phần mềm cho Salon & Spa</span>
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.1]">
                Nâng Tầm Quản Lý <span className="text-brand">Salon</span> Cùng Nền Tảng Ellora
              </h1>

              <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg leading-relaxed">
                Giải pháp công nghệ toàn diện giúp chủ tiệm quản lý lịch hẹn thông minh, tối ưu ca
                làm việc và đột phá doanh thu mỗi tháng.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/business-registration"
                  className="rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98]"
                >
                  Đăng ký mở tiệm ngay
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
                >
                  Đăng nhập chủ tiệm
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-brand" />
                  <span>Duyệt hồ sơ trong 24 giờ</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span>Tăng 35% lượt đặt hẹn</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-gray-50">
                  <img
                    src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1000&q=80"
                    alt="Không gian làm việc chuyên nghiệp tại salon"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Tính năng nổi bật
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Mọi Công Cụ Bạn Cần Để Vận Hành Tiệm Trơn Tru
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Được thiết kế riêng theo thói quen của các chủ tiệm nail và spa tại Việt Nam.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-2xs transition hover:border-pink-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-brand">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Ellora Section */}
      <section className="border-y border-gray-100 bg-gray-50/40 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80"
                  alt="Dụng cụ làm móng chuyên nghiệp"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Ưu thế vượt trội
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Tại Sao Các Salon Chọn Đồng Hành Cùng Ellora?
              </h2>

              <div className="mt-8 space-y-5">
                {reasons.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-brand">
                      <Check size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Callout */}
      <section className="py-16 md:py-24 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Sẵn Sàng Bứt Phá Doanh Số Cùng Tiệm Của Bạn?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Gửi thông tin đăng ký ngay hôm nay. Đội ngũ Ellora sẽ liên hệ và kích hoạt tài khoản
            đối tác cho bạn trong vòng 24 giờ.
          </p>
          <div className="mt-8">
            <Link
              to="/business-registration"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98]"
            >
              <span>Đăng ký đối tác miễn phí</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
