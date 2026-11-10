import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapPin, Navigation, Info, User } from 'lucide-react'
import type { Salon } from '../types/salon.model'
import { calculateDistanceKm } from '../services/place-search.service'

export interface UserLocation {
  lat: number
  lng: number
  label?: string
}

interface SalonSearchMapProps {
  salons: Salon[]
  userLocation?: UserLocation | null
  className?: string
  heightClassName?: string
  onNearestSalonChange?: (salon: Salon | null, distanceKm: number | null) => void
}

export function SalonSearchMap({
  salons,
  userLocation,
  className = '',
  heightClassName = 'h-[500px]',
  onNearestSalonChange,
}: SalonSearchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [error, setError] = useState(false)

  const points = salons.filter(
    (s) =>
      s.coordinates &&
      Number.isFinite(s.coordinates.lat) &&
      Number.isFinite(s.coordinates.lng) &&
      s.coordinates.lat >= -90 &&
      s.coordinates.lat <= 90 &&
      s.coordinates.lng >= -180 &&
      s.coordinates.lng <= 180,
  )

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return

    if (userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
      if (points.length > 0) {
        let nearest = points[0]
        let minD = calculateDistanceKm(userLocation.lat, userLocation.lng, points[0].coordinates!.lat, points[0].coordinates!.lng)
        for (let i = 1; i < points.length; i++) {
          const d = calculateDistanceKm(userLocation.lat, userLocation.lng, points[i].coordinates!.lat, points[i].coordinates!.lng)
          if (d < minD) {
            minD = d
            nearest = points[i]
          }
        }
        const targetBounds: [number, number][] = [
          [userLocation.lat, userLocation.lng],
          [nearest.coordinates!.lat, nearest.coordinates!.lng],
        ]
        mapInstanceRef.current.fitBounds(L.latLngBounds(targetBounds), { padding: [70, 70], maxZoom: 16 })
      } else {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15)
      }
      return
    }

    if (points.length === 1) {
      mapInstanceRef.current.setView([points[0].coordinates!.lat, points[0].coordinates!.lng], 16)
    } else if (points.length > 1) {
      const bounds = points.map((p) => [p.coordinates!.lat, p.coordinates!.lng] as [number, number])
      mapInstanceRef.current.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 16 })
    } else {
      mapInstanceRef.current.setView([10.776889, 106.700806], 13)
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current) return

    try {
      const defaultCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : points.length > 0
        ? [points[0].coordinates!.lat, points[0].coordinates!.lng]
        : [10.776889, 106.700806] // Trung tâm TP. Hồ Chí Minh

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: userLocation || points.length > 0 ? 15 : 13,
        scrollWheelZoom: true,
        zoomControl: false,
      })
      mapInstanceRef.current = map

      // Zoom control placed at bottom right to avoid overlapping top badges
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      })
      tileLayer.on('tileerror', () => setError(true))
      tileLayer.addTo(map)

      const bounds: [number, number][] = []

      // 1. Render all salons with Pink/Rose Floating Bubble Marker
      points.forEach((salon) => {
        const pt = salon.coordinates!
        bounds.push([pt.lat, pt.lng])

        const safeName = (salon.name || 'Salon').replace(/"/g, '&quot;')
        const subText = salon.rating
          ? `⭐ ${salon.rating.toFixed(1)} • ${salon.district || salon.city || 'Salon'}`
          : '● Vị trí cơ sở'

        const icon = L.divIcon({
          className: 'search-salon-bubble-marker',
          html: `
            <div style="position: relative; transform: translate(-50%, -100%); cursor: pointer; display: flex; flex-direction: column; align-items: center; user-select: none; transition: transform 0.15s ease;">
              <!-- Floating Bubble Card -->
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                background: #ffffff;
                padding: 6px 14px;
                border-radius: 9999px;
                box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.28), 0 8px 10px -6px rgba(0, 0, 0, 0.12);
                border: 1.5px solid #fecdd3;
                white-space: nowrap;
              ">
                <span style="
                  display: flex;
                  height: 24px;
                  width: 24px;
                  align-items: center;
                  justify-content: center;
                  border-radius: 9999px;
                  background: linear-gradient(135deg, #f43f5e, #e11d48);
                  color: #ffffff;
                  font-size: 12px;
                  box-shadow: 0 2px 4px rgba(225, 29, 72, 0.35);
                ">💅</span>
                <div style="display: flex; flex-direction: column; text-align: left;">
                  <span style="font-size: 12px; font-weight: 700; color: #0f172a; max-width: 170px; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">
                    ${safeName}
                  </span>
                  <span style="font-size: 10px; font-weight: 600; color: ${salon.rating ? '#d97706' : '#059669'}; line-height: 1;">
                    ${subText}
                  </span>
                </div>
              </div>
              
              <!-- Speech Bubble Pointer Arrow -->
              <div style="
                width: 10px;
                height: 10px;
                background: #ffffff;
                border-right: 1.5px solid #fecdd3;
                border-bottom: 1.5px solid #fecdd3;
                transform: rotate(45deg);
                margin-top: -5px;
              "></div>

              <!-- Red Pin Base Anchor -->
              <div style="
                margin-top: 3px;
                height: 14px;
                width: 14px;
                border-radius: 9999px;
                background: #e11d48;
                border: 3px solid #ffffff;
                box-shadow: 0 3px 6px rgba(0,0,0,0.35);
              "></div>
              <!-- Soft Shadow -->
              <div style="
                width: 16px;
                height: 4px;
                background: rgba(0,0,0,0.3);
                border-radius: 50%;
                filter: blur(1.5px);
                margin-top: -1px;
              "></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })

        const addressText = [salon.address, salon.district, salon.city].filter(Boolean).join(', ')
        const thumb = salon.images?.[0] || salon.logoUrl || ''

        const popupHtml = `
          <div style="min-width: 220px; max-width: 260px; padding: 2px; font-family: inherit;">
            ${thumb ? `<img src="${thumb}" alt="${safeName}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;" />` : ''}
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 3px; line-height: 1.3;">
              ${safeName}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 5px; line-height: 1.3;">
              📍 ${addressText}
            </div>
            ${salon.distanceKm !== null && salon.distanceKm !== undefined ? `
              <div style="font-size: 11px; color: #e11d48; font-weight: 600; margin-bottom: 5px;">
                🚗 Cách bạn: ~${salon.distanceKm} km
              </div>
            ` : ''}
            ${salon.rating ? `
              <div style="font-size: 11px; color: #f59e0b; font-weight: 700; margin-bottom: 8px;">
                ⭐ ${salon.rating.toFixed(1)} (${salon.reviewCount || 0} đánh giá)
              </div>
            ` : ''}
            <a href="/salon/${encodeURIComponent(salon.id)}" style="
              display: block;
              text-align: center;
              background: #e11d48;
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              padding: 7px 12px;
              border-radius: 9999px;
              text-decoration: none;
              box-shadow: 0 2px 4px rgba(225, 29, 72, 0.3);
            ">Xem chi tiết & Đặt hẹn →</a>
          </div>
        `

        L.marker([pt.lat, pt.lng], {
          icon,
          title: salon.name,
        })
          .bindPopup(popupHtml, {
            maxWidth: 300,
            className: 'salon-popup-card',
          })
          .addTo(map)
      })

      // 2. Render User Location with Blue Floating Bubble Marker
      if (userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
        const safeUserLabel = (userLocation.label || 'Vị trí của bạn').replace(/"/g, '&quot;')
        const userIcon = L.divIcon({
          className: 'user-location-bubble-marker',
          html: `
            <div style="position: relative; transform: translate(-50%, -100%); cursor: pointer; display: flex; flex-direction: column; align-items: center; user-select: none; z-index: 1000;">
              <!-- Floating Blue Bubble Card -->
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                background: #ffffff;
                padding: 6px 14px;
                border-radius: 9999px;
                box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.12);
                border: 2px solid #38bdf8;
                white-space: nowrap;
              ">
                <span style="
                  display: flex;
                  height: 24px;
                  width: 24px;
                  align-items: center;
                  justify-content: center;
                  border-radius: 9999px;
                  background: linear-gradient(135deg, #0284c7, #0369a1);
                  color: #ffffff;
                  font-size: 12px;
                  box-shadow: 0 2px 4px rgba(2, 132, 199, 0.4);
                ">👤</span>
                <div style="display: flex; flex-direction: column; text-align: left;">
                  <span style="font-size: 12px; font-weight: 700; color: #0369a1; max-width: 170px; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">
                    ${safeUserLabel}
                  </span>
                  <span style="font-size: 10px; font-weight: 600; color: #0284c7; line-height: 1;">
                    ● Điểm xuất phát của bạn
                  </span>
                </div>
              </div>
              
              <!-- Speech Bubble Pointer Arrow -->
              <div style="
                width: 10px;
                height: 10px;
                background: #ffffff;
                border-right: 2px solid #38bdf8;
                border-bottom: 2px solid #38bdf8;
                transform: rotate(45deg);
                margin-top: -5px;
              "></div>

              <!-- Blue Pin Base Anchor -->
              <div style="
                margin-top: 3px;
                height: 14px;
                width: 14px;
                border-radius: 9999px;
                background: #0284c7;
                border: 3px solid #ffffff;
                box-shadow: 0 3px 6px rgba(0,0,0,0.35);
              "></div>
              <!-- Soft Shadow -->
              <div style="
                width: 16px;
                height: 4px;
                background: rgba(0,0,0,0.3);
                border-radius: 50%;
                filter: blur(1.5px);
                margin-top: -1px;
              "></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })

        L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          title: 'Vị trí của bạn',
          zIndexOffset: 1000,
        })
          .bindPopup(`
            <div style="padding: 4px; font-family: inherit; font-size: 12px;">
              <div style="font-weight: 800; color: #0369a1; margin-bottom: 2px;">📍 Vị trí của bạn</div>
              <div style="color: #64748b; font-size: 11px;">${safeUserLabel}</div>
            </div>
          `)
          .addTo(map)

        // Auto-Fit Bounds to contain User Location AND at least 1 Nearest Salon!
        if (points.length > 0) {
          let nearest = points[0]
          let minD = calculateDistanceKm(userLocation.lat, userLocation.lng, points[0].coordinates!.lat, points[0].coordinates!.lng)
          for (let i = 1; i < points.length; i++) {
            const d = calculateDistanceKm(userLocation.lat, userLocation.lng, points[i].coordinates!.lat, points[i].coordinates!.lng)
            if (d < minD) {
              minD = d
              nearest = points[i]
            }
          }

          onNearestSalonChange?.(nearest, minD)

          // Draw dashed connector line between user and nearest salon
          L.polyline(
            [
              [userLocation.lat, userLocation.lng],
              [nearest.coordinates!.lat, nearest.coordinates!.lng],
            ],
            {
              color: '#0284c7',
              weight: 2,
              dashArray: '6, 8',
              opacity: 0.8,
            }
          ).addTo(map)

          const targetBounds: [number, number][] = [
            [userLocation.lat, userLocation.lng],
            [nearest.coordinates!.lat, nearest.coordinates!.lng],
          ]
          map.fitBounds(L.latLngBounds(targetBounds), { padding: [70, 70], maxZoom: 16 })
        } else {
          onNearestSalonChange?.(null, null)
          map.setView([userLocation.lat, userLocation.lng], 15)
        }
      } else {
        onNearestSalonChange?.(null, null)
        if (bounds.length === 1) {
          map.setView(bounds[0], 16)
        } else if (bounds.length > 1) {
          map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 16 })
        }
      }

      const timer = setTimeout(() => {
        map.invalidateSize()
      }, 300)

      const onResize = () => map.invalidateSize()
      window.addEventListener('resize', onResize)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', onResize)
        map.remove()
        mapInstanceRef.current = null
      }
    } catch (err) {
      console.error('Failed to init search map:', err)
      setError(true)
    }
  }, [points.length, JSON.stringify(points.map((p) => p.id)), userLocation?.lat, userLocation?.lng, userLocation?.label])

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className={`relative ${heightClassName} w-full overflow-hidden rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20`}>
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Top Overlay Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto max-w-[calc(100%-85px)]">
            {userLocation ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-sky-700 shadow-sm backdrop-blur-xs max-w-full">
                <User size={13} className="text-sky-600 shrink-0" />
                <span className="truncate">Vị trí của bạn: {userLocation.label || 'Đã định vị'}</span>
              </span>
            ) : points.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-brand shadow-sm backdrop-blur-xs">
                <MapPin size={14} className="text-brand shrink-0" />
                <span>{points.length} salon có vị trí trên bản đồ</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/95 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm backdrop-blur-xs">
                <Info size={14} className="text-amber-600 shrink-0" />
                <span className="truncate">Hiển thị khu vực TP.HCM</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="pointer-events-auto flex items-center gap-1 rounded-full border border-gray-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-xs transition hover:bg-gray-100 shrink-0"
            title="Căn chỉnh lại khung nhìn bản đồ"
          >
            <Navigation size={13} className="text-gray-500" />
            <span>Căn giữa</span>
          </button>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 p-4 text-center text-xs text-gray-600">
            Không tải được hình ảnh bản đồ. Danh sách salon vẫn hoạt động bình thường.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>Bấm vào bong bóng tên salon trên bản đồ để xem chi tiết và đặt lịch hẹn.</span>
        <span>
          &copy;{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            OpenStreetMap
          </a>{' '}
          &copy;{' '}
          <a
            href="https://carto.com/attributions"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            CARTO
          </a>
        </span>
      </div>
    </div>
  )
}
