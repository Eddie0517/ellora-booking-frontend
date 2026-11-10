import { HomeSearchSection } from './home-search-section'
import Lightfall from '@/components/ui/Lightfall'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-pink-50/30 to-white -mt-20 min-h-screen min-h-[100dvh] flex flex-col justify-center pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
      {/* Decorative Background Glows (behind Lightfall) */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[700px] w-full max-w-7xl">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute right-1/4 top-16 h-80 w-80 rounded-full bg-pink-300/20 blur-3xl" />
      </div>

      {/* Subtle background ambient mesh */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#fbcfe8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 -z-10" />

      {/* Lightfall Animated Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Lightfall
          colors={['#eb8fbe', '#ed65ba', '#fda0f9']}
          backgroundColor="#ffffff"
          speed={0.25}
          streakCount={2}
          streakWidth={0.4}
          streakLength={1.1}
          density={0.6}
          twinkle={0.6}
          glow={0.7}
          backgroundGlow={0.16}
          headGlow={0}
          depth={0.5}
          bloom={0}
          zoom={1.3}
          opacity={1}
          fade={0.15}
          mouseInteraction={false}
          mouseStrength={0}
          mouseRadius={0.1}
          lens={0}
          holdToWarp={true}
          intro={true}
          lightMode={true}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
        {/* UPPER PART: Title */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Main Title */}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.15]">
            Ellora Tìm Tiệm Nail Xinh,
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-brand via-rose-500 to-pink-600 bg-clip-text text-transparent">
              Chốt Lịch Trong 30 Giây
            </span>
          </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="mt-8 sm:mt-12 lg:mt-14">
          <HomeSearchSection />
        </div>
      </div>
    </section>
  )
}
