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
        scrollWheelZoom: true,
        zoomControl: false,
      })
      mapInstanceRef.current = map

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'clean-light-tiles',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      })
      tileLayer.on('tileerror', () => setError(true))
      tileLayer.addTo(map)

      const safeName = (salonName || 'Salon').replace(/"/g, '&quot;')
      const icon = L.divIcon({
        className: 'public-salon-bubble-marker',
        html: `
          <div style="position: relative; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: auto; user-select: none;">
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
                <span style="font-size: 10px; font-weight: 600; color: #059669; line-height: 1;">
                  ● Vị trí cơ sở
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
      <div className="relative h-60 w-full overflow-hidden rounded-xl border border-rose-100 bg-rose-50/30 clean-light-map">
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
