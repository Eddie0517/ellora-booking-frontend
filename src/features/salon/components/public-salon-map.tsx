import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapPin } from 'lucide-react'

interface PublicSalonMapProps {
  coordinates: { lat: number; lng: number } | null | undefined
  salonName?: string
  className?: string
}

export function PublicSalonMap({ coordinates, salonName, className = '' }: PublicSalonMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [error, setError] = useState(false)

  const isValid =
    coordinates &&
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng) &&
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180

  useEffect(() => {
    if (!isValid || !mapContainerRef.current) return

    try {
      const map = L.map(mapContainerRef.current, {
        center: [coordinates.lat, coordinates.lng],
        zoom: 16,
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
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })

      L.marker([coordinates.lat, coordinates.lng], {
        icon,
        title: salonName || 'Vị trí salon',
      }).addTo(map)

      // Fix render size if container initialized before full DOM layout
      const timer = setTimeout(() => {
        map.invalidateSize()
      }, 250)

      return () => {
        clearTimeout(timer)
        map.remove()
        mapInstanceRef.current = null
      }
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err)
      setError(true)
    }
  }, [coordinates?.lat, coordinates?.lng, isValid, salonName])

  if (!isValid) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50/20 p-6 text-center text-gray-500 ${className}`}>
        <MapPin size={26} className="mx-auto mb-1.5 text-brand/50" />
        <p className="text-xs font-semibold text-gray-700">Salon chưa cập nhật ghim vị trí trên bản đồ</p>
        <p className="mt-1 text-[11px] text-gray-400">Bạn có thể xem địa chỉ chi tiết hoặc liên hệ qua hotline tiệm.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative h-60 w-full overflow-hidden rounded-xl border border-rose-100 bg-rose-50/30">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 p-4 text-center text-xs text-gray-500">
            Không tải được bản đồ trực quan. Bạn vẫn có thể sử dụng nút Mở Google Maps bên dưới.
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-400">
        Dữ liệu bản đồ &copy;{' '}
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
