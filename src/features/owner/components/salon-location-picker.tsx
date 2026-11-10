import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapPin, Navigation, Check } from 'lucide-react'

interface SalonCoordinates {
  lat: number
  lng: number
}

interface SalonLocationPickerProps {
  value: SalonCoordinates | null | undefined
  onChange: (coords: SalonCoordinates) => void
  disabled?: boolean
  disabledReason?: string
}

function isValidCoords(coords: SalonCoordinates | null | undefined): coords is SalonCoordinates {
  return (
    !!coords &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180
  )
}

export function SalonLocationPicker({
  value,
  onChange,
  disabled = false,
  disabledReason,
}: SalonLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  const [latInput, setLatInput] = useState(value ? String(value.lat) : '')
  const [lngInput, setLngInput] = useState(value ? String(value.lng) : '')
  const [inputError, setInputError] = useState('')

  // Sync inputs when external value changes
  useEffect(() => {
    if (value && isValidCoords(value)) {
      setLatInput(String(value.lat))
      setLngInput(String(value.lng))
    }
  }, [value?.lat, value?.lng])

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initialCenter: [number, number] =
      value && isValidCoords(value) ? [value.lat, value.lng] : [10.776889, 106.700806] // Default Ho Chi Minh City

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: value && isValidCoords(value) ? 16 : 13,
      scrollWheelZoom: false,
    })
    mapInstanceRef.current = map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(map)

    const icon = L.divIcon({
      className: 'salon-location-pin',
      html: '<span aria-hidden="true">●</span>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    })

    // If initial coords exist, place marker
    if (value && isValidCoords(value)) {
      const marker = L.marker([value.lat, value.lng], {
        icon,
        draggable: !disabled,
        title: 'Vị trí salon',
      }).addTo(map)
      markerRef.current = marker

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        const selected = {
          lat: Number(pos.lat.toFixed(6)),
          lng: Number(pos.lng.toFixed(6)),
        }
        setLatInput(String(selected.lat))
        setLngInput(String(selected.lng))
        setInputError('')
        onChange(selected)
      })
    }

    // Map click handler to set marker
    if (!disabled) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const selected = {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6)),
        }

        if (markerRef.current) {
          markerRef.current.setLatLng([selected.lat, selected.lng])
        } else {
          const marker = L.marker([selected.lat, selected.lng], {
            icon,
            draggable: true,
            title: 'Vị trí salon',
          }).addTo(map)
          markerRef.current = marker

          marker.on('dragend', () => {
            const pos = marker.getLatLng()
            const dragged = {
              lat: Number(pos.lat.toFixed(6)),
              lng: Number(pos.lng.toFixed(6)),
            }
            setLatInput(String(dragged.lat))
            setLngInput(String(dragged.lng))
            setInputError('')
            onChange(dragged)
          })
        }

        setLatInput(String(selected.lat))
        setLngInput(String(selected.lng))
        setInputError('')
        onChange(selected)
      })
    }

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [disabled])

  // Move marker when valid coordinates change programmatically
  useEffect(() => {
    if (!mapInstanceRef.current || !value || !isValidCoords(value)) return
    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng])
    }
  }, [value?.lat, value?.lng])

  const handleApplyManualCoords = () => {
    if (disabled) return
    const lat = Number(latInput.trim())
    const lng = Number(lngInput.trim())
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setInputError('Tọa độ không hợp lệ. Vĩ độ từ -90 đến 90, Kinh độ từ -180 đến 180.')
      return
    }
    setInputError('')
    const selected = {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([selected.lat, selected.lng], 16)
      if (markerRef.current) {
        markerRef.current.setLatLng([selected.lat, selected.lng])
      } else {
        const icon = L.divIcon({
          className: 'salon-location-pin',
          html: '<span aria-hidden="true">●</span>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        })
        const marker = L.marker([selected.lat, selected.lng], {
          icon,
          draggable: !disabled,
        }).addTo(mapInstanceRef.current)
        markerRef.current = marker
      }
    }
    onChange(selected)
  }

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-brand" />
          <h3 className="text-sm font-bold text-gray-900">Vị trí tiệm trên bản đồ</h3>
        </div>
        {value && isValidCoords(value) ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <Check size={13} />
            Đã chọn: {value.lat}, {value.lng}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Chưa chọn vị trí</span>
        )}
      </div>

      {disabled && disabledReason ? (
        <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          {disabledReason}
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Chạm vào bản đồ hoặc kéo ghim đến đúng vị trí tiệm của bạn. Khách hàng sẽ tìm thấy tiệm khi tìm kiếm gần đây.
        </p>
      )}

      {/* Map Container */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl border border-gray-200 shadow-2xs bg-rose-50/20">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>

      <p className="text-[11px] text-gray-400">
        Bản đồ OpenStreetMap &copy;{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          OpenStreetMap contributors
        </a>
      </p>

      {/* Manual Input Fallback */}
      {!disabled && (
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 sm:p-4 space-y-2.5">
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Navigation size={13} className="text-gray-400" />
            Hoặc nhập tọa độ chính xác:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="salon-lat" className="block text-[11px] font-medium text-gray-500 mb-1">
                Vĩ độ (Latitude)
              </label>
              <input
                id="salon-lat"
                type="text"
                inputMode="decimal"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="Ví dụ: 10.776889"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="salon-lng" className="block text-[11px] font-medium text-gray-500 mb-1">
                Kinh độ (Longitude)
              </label>
              <input
                id="salon-lng"
                type="text"
                inputMode="decimal"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                placeholder="Ví dụ: 106.700806"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-brand focus:outline-none"
              />
            </div>
          </div>
          {inputError && <p className="text-xs text-red-600">{inputError}</p>}
          <button
            type="button"
            onClick={handleApplyManualCoords}
            className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Áp dụng tọa độ
          </button>
        </div>
      )}
    </div>
  )
}
