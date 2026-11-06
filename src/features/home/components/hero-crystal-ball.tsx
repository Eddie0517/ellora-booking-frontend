import { useState } from 'react'
import { Sparkles, Star, Zap, Heart, MousePointerClick } from 'lucide-react'
import CrystalizedBall from '@/components/ui/CrystalizedBall'

export function HeroCrystalBall() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    setMousePos({ x, y })
  }

  const handlePointerLeave = () => {
    setMousePos({ x: 0, y: 0 })
  }

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto h-[460px] w-full max-w-[620px] sm:h-[540px] md:h-[580px] flex items-center justify-center select-none"
    >
      {/* Background Radial Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-pink-300/35 via-rose-400/20 to-pink-100/10 blur-3xl sm:h-[400px] sm:w-[400px]" />
        <div className="absolute h-[240px] w-[240px] rounded-full bg-rose-500/15 blur-2xl animate-pulse" />
      </div>

      {/* React Bits <CrystalizedBall /> Component */}
      <div className="absolute inset-0 h-full w-full">
        <CrystalizedBall
          preset="plasma"
          color="#f25bd0"
          motion="rise"
          particleShape="square"
          size={0.75}
          strands={6}
          crackle={0.2}
          flares={0.6}
          glow={0.85}
          sparks={0.45}
          particleCount={12500}
          fill={0.2}
          depth={0.55}
          sway={0.7}
          twinkle={0.45}
          haze={1.5}
          speed={1.75}
          dustSpeed={1.25}
          interactive={true}
          hoverStrength={0.6}
          intro={true}
          paused={false}
        />
      </div>

      {/* CORE ELLORA LOGO INSIDE / OVER THE CRYSTALIZED BALL - DEAD CENTERED & ZOOMED IN */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div
          className="flex flex-col items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `perspective(800px) rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 10}deg)`,
          }}
        >
          {/* Soft Frosted Glass Halo - Enlarged */}
          <div className="relative flex h-36 w-36 sm:h-44 sm:w-44 md:h-48 md:w-48 items-center justify-center rounded-full bg-white/70 p-3 shadow-[0_0_40px_rgba(242,91,208,0.45)] backdrop-blur-md border border-white/90">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/90 via-pink-50/60 to-rose-100/35" />

            {/* Ellora Icon - Zoomed in */}
            <img
              src="/ellora-icon.png"
              alt="Ellora Icon"
              className="relative z-10 h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 object-contain scale-125 drop-shadow-[0_4px_16px_rgba(216,74,107,0.4)] transition-transform duration-500 hover:scale-130"
            />

            {/* Shimmer sweep */}
            <div className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-60 blur-xs" />
          </div>

          {/* Brand Tagline Beneath Logo */}
          <span className="mt-3 rounded-full border border-pink-200/90 bg-white/90 px-3.5 py-1 text-[11px] font-bold tracking-widest text-brand uppercase shadow-xs backdrop-blur-md">
            BEAUTY & NAIL
          </span>
        </div>
      </div>

      {/* 3D FLOATING GLASSMORPHISM HIGHLIGHT PILLS */}
      {/* Pill 1: Top Left */}
      <div
        className="pointer-events-none absolute left-2 top-4 hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-lg shadow-pink-900/5 backdrop-blur-md transition-transform duration-300 sm:flex sm:items-center sm:gap-2.5 sm:left-4 sm:top-8"
        style={{
          transform: `translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-brand">
          <Sparkles size={16} className="text-brand" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-900">500+ Salon Tuyển Chọn</p>
          <p className="text-[10px] text-gray-500">Chuẩn chất lượng 5★</p>
        </div>
      </div>

      {/* Pill 2: Top Right */}
      <div
        className="pointer-events-none absolute right-2 top-6 hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-lg shadow-pink-900/5 backdrop-blur-md transition-transform duration-300 sm:flex sm:items-center sm:gap-2.5 sm:right-4 sm:top-10"
        style={{
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * -10}px, 0)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100/70 text-brand">
          <Zap size={16} className="text-brand fill-brand/30" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-900">Chốt Lịch Trong 30s</p>
          <p className="text-[10px] text-gray-500">Xác nhận tức thì</p>
        </div>
      </div>

      {/* Pill 3: Bottom Left */}
      <div
        className="pointer-events-none absolute bottom-6 left-2 hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-lg shadow-pink-900/5 backdrop-blur-md transition-transform duration-300 sm:flex sm:items-center sm:gap-2.5 sm:bottom-10 sm:left-6"
        style={{
          transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * 12}px, 0)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Star size={16} className="fill-amber-400 text-amber-400" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-900">4.9 / 5.0 Đánh Giá</p>
          <p className="text-[10px] text-gray-500">Từ 12.000+ khách hàng</p>
        </div>
      </div>

      {/* Pill 4: Bottom Right */}
      <div
        className="pointer-events-none absolute bottom-4 right-2 hidden rounded-2xl border border-white/80 bg-white/80 p-2.5 shadow-lg shadow-pink-900/5 backdrop-blur-md transition-transform duration-300 sm:flex sm:items-center sm:gap-2.5 sm:bottom-8 sm:right-6"
        style={{
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-brand">
          <Heart size={16} className="fill-brand text-brand" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-900">Nail Art & Sơn Gel</p>
          <p className="text-[10px] text-gray-500">Cập nhật trend mới nhất</p>
        </div>
      </div>

      {/* Interactive Micro Hint */}
      <div className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gray-200/60 bg-white/70 px-3 py-1 text-[11px] font-medium text-gray-500 backdrop-blur-xs transition hover:bg-white sm:bottom-2">
        <MousePointerClick size={12} className="text-brand animate-bounce" />
        <span>Di chuột hoặc chạm để tương tác tia plasma</span>
      </div>
    </div>
  )
}
