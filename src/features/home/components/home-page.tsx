import { HeroSection } from './hero-section'
import { HomeRecommendations } from './home-recommendations'
import { HomeProcess } from './home-process'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

export function HomePage() {
  return (
    <div className="bg-white">
      {/* 1. Hero Section: Headline, Trust Highlights & Search */}
      <HeroSection />

      {/* 2. Recommended for you: Curated salon selections */}
      <HomeRecommendations />

      {/* 4. Simple Process: 3-step booking flow & statistics */}
      <HomeProcess />

      {/* 5. Pre-Footer Partner Callout (Elegant & subtle) */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-white to-rose-50/30 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-pink-100 bg-white p-8 shadow-xs sm:p-12 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-brand">
                <Sparkles size={13} />
                <span>Dành cho chủ tiệm nail</span>
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Bạn Là Chủ Salon Nail? Đồng Hành Cùng Ellora
              </h2>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Tiếp cận hàng nghìn khách hàng tiềm năng mỗi tháng, tự động hóa quản lý lịch hẹn
                và giảm tối đa tỉ lệ khách hủy hẹn.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-0 lg:shrink-0">
              <Link
                to="/business-registration"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98]"
              >
                <span>Đăng ký đối tác ngay</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/for-business"
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is rendered directly below via MainLayout SiteFooter */}
    </div>
  )
}
