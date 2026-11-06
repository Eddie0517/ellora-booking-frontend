import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Star, Heart, Clock } from 'lucide-react'
import type { Salon } from '../types/salon.model'

export function SalonCard({ salon }: { salon: Salon }) {
  const [isLiked, setIsLiked] = useState(false)
  const mainImage = salon.images?.[0] || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
  const locationText = [salon.district, salon.city].filter(Boolean).join(', ') || salon.address

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-pink-200 hover:shadow-md">
      {/* Favorite Button */}
      <button
        type="button"
        aria-label={isLiked ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsLiked(!isLiked)
        }}
        className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 backdrop-blur-md shadow-2xs transition hover:scale-110 hover:text-brand"
      >
        <Heart
          size={16}
          className={isLiked ? 'fill-brand text-brand' : 'transition-colors'}
        />
      </button>

      <Link to={`/salon/${salon.id}`} className="flex flex-col flex-1">
        {/* Thumbnail Aspect Ratio 4:3 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={mainImage}
            alt={`Không gian tại ${salon.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Subscription or Status Badge */}
          {salon.subscriptionBadge && (
            <span className="absolute left-3.5 top-3.5 z-10 rounded-full border border-pink-100 bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-brand shadow-2xs backdrop-blur-md">
              {salon.subscriptionBadge}
            </span>
          )}

          {/* Distance Indicator if present */}
          {salon.distanceKm !== null && salon.distanceKm !== undefined && (
            <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              Cách {salon.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div className="space-y-2">
            {/* Header: Name and Rating */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-brand line-clamp-1">
                {salon.name}
              </h3>
              <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>{salon.rating > 0 ? salon.rating.toFixed(1) : '5.0'}</span>
              </div>
            </div>

            {/* Address */}
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={13} className="shrink-0 text-gray-400" />
              <span className="truncate">{locationText}</span>
            </p>
          </div>

          {/* Footer: Review count & Quick Booking CTA */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
            <span className="text-gray-400">
              {salon.reviewCount > 0 ? `${salon.reviewCount} đánh giá` : 'Salon mới'}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              <Clock size={12} />
              <span>Đặt ngay</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
