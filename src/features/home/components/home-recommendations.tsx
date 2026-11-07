import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, Sparkles, ArrowRight } from 'lucide-react'
import { SalonCard } from '@/features/salon/components/salon-card'
import { useSalons } from '@/features/salon/queries/salon.queries'
import type { Salon } from '@/features/salon/types/salon.model'

// Curated Fallback Salons if backend has 0 results or offline during dev
const curatedSalons: Salon[] = [
  {
    id: 'salon-1',
    name: 'Ellora Luxe Nail Boutique',
    description: 'Không gian làm móng chuẩn phong cách Hàn Quốc với các mẫu Nail Art thiết kế độc bản.',
    address: '148 Pasteur, Bến Nghé',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    images: [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.95,
    reviewCount: 320,
    coordinates: { lat: 10.7769, lng: 106.7009 },
    distanceKm: 0.8,
    logoUrl: null, showcaseImages: [], subscriptionTier: 'VIP',
    subscriptionBadge: '✦ Salon VIP',
  },
  {
    id: 'salon-2',
    name: 'The Muse Nail & Spa Studio',
    description: 'Chuyên sơn gel organic nhập khẩu, chăm sóc móng chuyên sâu và dịch vụ spa chân thảo mộc.',
    address: '86 Nguyễn Thị Minh Khai',
    district: 'Quận 3',
    city: 'Hồ Chí Minh',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 184,
    coordinates: { lat: 10.7788, lng: 106.6912 },
    distanceKm: 1.4,
    logoUrl: null, showcaseImages: [], subscriptionTier: 'VIP',
    subscriptionBadge: '✦ Đối tác hàng đầu',
  },
  {
    id: 'salon-3',
    name: 'Aura Bloom Beauty & Nails',
    description: 'Đắp móng úp cao cấp, ombre thạch sang chảnh và kỹ thuật viên tay nghề 5 năm kinh nghiệm.',
    address: '24 Trần Não, An Phú',
    district: 'Thành phố Thủ Đức',
    city: 'Hồ Chí Minh',
    images: [
      'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.88,
    reviewCount: 215,
    coordinates: { lat: 10.7932, lng: 106.7321 },
    distanceKm: 3.2,
    logoUrl: null, showcaseImages: [], subscriptionTier: 'STANDARD',
    subscriptionBadge: 'Yêu thích nhất',
  },
  {
    id: 'salon-4',
    name: 'Glow Chic Nail Bar & Care',
    description: 'Dịch vụ nhanh gọn trong 45 phút, đầy đủ các mẫu đính đá, vẽ họa tiết thời thượng.',
    address: '312 Hai Bà Trưng, Tân Định',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.85,
    reviewCount: 142,
    coordinates: { lat: 10.7891, lng: 106.6924 },
    distanceKm: 2.1,
    logoUrl: null, showcaseImages: [], subscriptionTier: 'STANDARD',
    subscriptionBadge: 'Đặt nhiều',
  },
]

const filterTabs = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'nail-art', label: '✨ Nail Art Sang Chảnh' },
  { id: 'gel', label: '💅 Sơn Gel Hàn Quốc' },
  { id: 'spa', label: '🫧 Spa & Chăm Sóc' },
  { id: 'vip', label: '👑 Salon VIP Tuyển Chọn' },
]

export function HomeRecommendations() {
  const [activeTab, setActiveTab] = useState('all')
  const salonsQuery = useSalons({ page: 0, size: 8 })

  // Use API salons if available, otherwise use curated fallback list
  const displaySalons =
    salonsQuery.data?.content && salonsQuery.data.content.length > 0
      ? salonsQuery.data.content
      : curatedSalons

  return (
    <section className="bg-gray-50/50 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200/60 bg-white px-3.5 py-1 text-xs font-semibold text-brand shadow-2xs">
              <Sparkles size={13} />
              <span>Gợi ý dành cho bạn</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Salon Được Yêu Thích & Đánh Giá Cao
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Tuyển chọn các tiệm nail không gian đẹp, thợ tay nghề giỏi và phục vụ tận tâm.
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:border-pink-200 hover:bg-rose-50 hover:text-brand"
          >
            <Compass size={15} />
            <span>Xem tất cả tiệm nail</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-xs'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:text-brand'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Salons Grid */}
        <div className="mt-8">
          {salonsQuery.isPending && !salonsQuery.data ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {displaySalons.slice(0, 8).map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
