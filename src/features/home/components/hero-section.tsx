import { ShieldCheck, Clock, Sparkles } from 'lucide-react'
import { HomeSearchSection } from './home-search-section'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-pink-50/30 to-white -mt-20 pt-28 pb-20 sm:pt-34 sm:pb-28 lg:pt-38 lg:pb-32">
      {/* Decorative Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[700px] w-full max-w-7xl">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-rose-200/35 blur-3xl" />
        <div className="absolute right-1/4 top-16 h-80 w-80 rounded-full bg-pink-300/25 blur-3xl" />
      </div>

      {/* Subtle background ambient mesh */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#fbcfe8_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* UPPER PART: Eyebrow + Title + Subtitle + Trust Badges */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Main Title */}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.15]">
            Ellora Tìm Tiệm Nail Xinh,
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-brand via-rose-500 to-pink-600 bg-clip-text text-transparent">
              Chốt Lịch Trong 30 Giây
            </span>
          </h1>

          {/* Trust Highlights Row */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm font-medium text-gray-600">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-white/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-xs">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>500+ Tiệm nail uy tín</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-white/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-xs">
              <Clock size={16} className="text-brand shrink-0" />
              <span>Giữ chỗ 30s không chờ đợi</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-white/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-xs">
              <Sparkles size={15} className="text-rose-500 shrink-0" />
              <span>Đặt hẹn 100% miễn phí</span>
            </span>
          </div>
        </div>

        {/* SEARCH BAR & QUICK TAGS - Thêm chính xác 5px khoảng cách phía trên và cân bằng với toàn khung Hero */}
        <div className="mt-[53px] sm:mt-[69px] lg:mt-[85px]">
          <HomeSearchSection />
        </div>
      </div>
    </section>
  )
}
