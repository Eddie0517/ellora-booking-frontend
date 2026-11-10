import { HeroSection } from './hero-section'
import { HomeRecommendations } from './home-recommendations'
import { HomeProcess } from './home-process'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

export function HomePage() {
  return (
    <div className="bg-white">
      {/* 1. Hero Section: Headline, Trust Highlights & Search */}
      <HeroSection />

      {/* 2. Recommended for you: Curated salon selections */}
      <HomeRecommendations />

      {/* 3. Simple Process: 3-step booking flow */}
      <HomeProcess />

      {/* 4. Pre-Footer Partner Callout (Prominent, High-Contrast Luxury Card) */}
      <section className="relative overflow-hidden border-t border-gray-100 bg-gradient-to-b from-white via-rose-50/20 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-rose-500/30 bg-gradient-to-br from-gray-950 via-[#1d0b19] to-[#2d0e23] p-8 sm:p-12 lg:p-14 shadow-2xl shadow-rose-950/25 ring-1 ring-white/10">
            {/* Ambient Lighting Orbs */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-rose-500/25 blur-3xl" />
            <div className="pointer-events-none absolute right-1/3 -bottom-24 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
            <div className="pointer-events-none absolute left-0 top-0 h-48 w-48 rounded-full bg-rose-700/15 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/15 px-3.5 py-1 text-xs font-semibold text-rose-200 backdrop-blur-md">
                  <Sparkles size={14} className="text-rose-400 animate-pulse" />
                  <span>Dành riêng cho chủ tiệm nail</span>
                </div>

                {/* Heading */}
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight">
                  Bạn Là Chủ Salon Nail?{' '}
                  <span className="block mt-1 sm:inline sm:mt-0 bg-gradient-to-r from-rose-200 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                    Đồng Hành Cùng Ellora
                  </span>
                </h2>

                {/* Subtitle */}
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-rose-100/80">
                  Tiếp cận hàng nghìn khách hàng tiềm năng mỗi tháng, tự động hóa quản lý lịch hẹn
                  và giảm tối đa tỉ lệ khách hủy hẹn.
                </p>

                {/* Benefit Highlights */}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-medium text-rose-100/90">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    Miễn phí khởi tạo
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    Đặt hẹn tự động 24/7
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    Tăng trưởng doanh thu
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 lg:shrink-0">
                <Link
                  to="/business-registration"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand via-rose-500 to-pink-500 px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-rose-500/30 transition hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Đăng ký đối tác ngay</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/for-business"
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 sm:px-7 sm:py-4 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/30 active:scale-[0.98]"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is rendered directly below via MainLayout SiteFooter */}
    </div>
  )
}
