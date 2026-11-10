import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Salon } from '../types/salon.model'

interface SalonSearchMapProps {
  salons: Salon[]
  className?: string
}

export function SalonSearchMap({ salons, className = '' }: SalonSearchMapProps) {
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

  useEffect(() => {
    if (!mapContainerRef.current) return
    if (!points.length) return

    try {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
      })
      mapInstanceRef.current = map

      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      })
      tileLayer.on('tileerror', () => setError(true))
      tileLayer.addTo(map)

      const icon = L.divIcon({
        className: 'salon-location-pin',
        html: '<span aria-hidden="true">●</span>',
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      })

      const bounds: [number, number][] = []

      points.forEach((salon) => {
        const pt = salon.coordinates!
        bounds.push([pt.lat, pt.lng])

        const popupEl = document.createElement('div')
        popupEl.className = 'p-1 text-xs space-y-1'

        const title = document.createElement('div')
        title.className = 'font-bold text-gray-900 text-sm'
        title.textContent = salon.name
        popupEl.appendChild(title)

        const addr = document.createElement('div')
        addr.className = 'text-gray-600'
        addr.textContent = [salon.address, salon.district, salon.city].filter(Boolean).join(', ')
        popupEl.appendChild(addr)

        if (salon.distanceKm !== null && salon.distanceKm !== undefined) {
          const dist = document.createElement('div')
          dist.className = 'text-brand font-medium'
          dist.textContent = `Cách bạn: ~${salon.distanceKm} km`
          popupEl.appendChild(dist)
        }

        const link = document.createElement('a')
        link.href = `/salon/${encodeURIComponent(salon.id)}`
        link.className = 'inline-block mt-1 font-semibold text-brand hover:underline'
        link.textContent = 'Xem chi tiết tiệm →'
        popupEl.appendChild(link)

        L.marker([pt.lat, pt.lng], {
          icon,
          title: salon.name,
        })
          .bindPopup(popupEl)
          .addTo(map)
      })

      if (bounds.length === 1) {
        map.setView(bounds[0], 15)
      } else if (bounds.length > 1) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 15 })
      }

      const timer = setTimeout(() => {
        map.invalidateSize()
      }, 300)

      return () => {
        clearTimeout(timer)
        map.remove()
        mapInstanceRef.current = null
      }
    } catch (err) {
      console.error('Failed to init search map:', err)
      setError(true)
    }
  }, [points.length, JSON.stringify(points.map((p) => p.id))])

  if (!points.length) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/50 p-8 text-center text-gray-500 ${className}`}>
        <p className="text-sm font-medium text-gray-700">Chưa có salon nào có tọa độ bản đồ trong trang kết quả này.</p>
        <p className="mt-1 text-xs text-gray-500">Bạn vẫn có thể xem danh sách địa chỉ và đặt lịch hẹn ở bên cạnh.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 p-4 text-center text-xs text-gray-600">
            Không tải được hình ảnh bản đồ. Danh sách salon vẫn hoạt động bình thường.
          </div>
        )}
      </div>
      <p className="text-right text-[11px] text-gray-400">
        Hiển thị {points.length} salon có vị trí. &copy;{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          OpenStreetMap contributors
        </a>
      </p>
    </div>
  )
}
