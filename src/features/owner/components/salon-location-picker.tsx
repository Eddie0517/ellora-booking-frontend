import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import {
  MapPin,
  Check,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import { placeSearchService, type PlaceSuggestion } from '@/features/salon/services/place-search.service'

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

function createGooglePinIcon() {
  return L.divIcon({
    className: 'custom-google-picker-pin',
    html: `
      <div style="position: relative; transform: translate(-50%, -100%); cursor: grab; display: flex; flex-direction: column; align-items: center; user-select: none;">
        <div style="background: #111827; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 9999px; white-space: nowrap; box-shadow: 0 4px 8px rgba(0,0,0,0.25); margin-bottom: 4px; border: 1.5px solid rgba(255,255,255,0.9); display: flex; align-items: center; gap: 4px;">
          <span>📍 Vị trí salon</span>
        </div>
        <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 10px rgba(0,0,0,0.35));">
          <path d="M18 0C8.05888 0 0 8.05888 0 18C0 27.8 13.5 42.5 17.1 47.1C17.5 47.7 18.5 47.7 18.9 47.1C22.5 42.5 36 27.8 36 18C36 8.05888 27.9411 0 18 0Z" fill="#EA4335"/>
          <circle cx="18" cy="18" r="7" fill="#FFFFFF"/>
          <circle cx="18" cy="18" r="4" fill="#B3261E"/>
        </svg>
        <div style="width: 14px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%; filter: blur(1.5px); margin-top: -3px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
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
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Search & Google Maps auto-locate states
  const [searchInput, setSearchInput] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [statusSuccess, setStatusSuccess] = useState('')

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search for suggestions when user types in search input
  useEffect(() => {
    if (!searchInput.trim() || searchInput.trim().length < 2) {
      setSuggestions([])
      setIsDropdownOpen(false)
      return
    }

    // If it's a URL or coordinate format, don't spam geocoding API on every letter
    const isUrlOrCoord =
      searchInput.includes('http') ||
      searchInput.includes('maps') ||
      /^\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*/.test(searchInput)

    if (isUrlOrCoord) {
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsSearching(true)
    setStatusError('')

    const timer = setTimeout(async () => {
      try {
        const results = await placeSearchService.search(searchInput, controller.signal)
        setSuggestions(results)
        setIsDropdownOpen(results.length > 0)
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error(err)
        }
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchInput])

  // Helper to place marker & fly map to coordinates
  const applyCoordinates = (coords: SalonCoordinates, successMessage?: string) => {
    onChange(coords)
    if (successMessage) {
      setStatusSuccess(successMessage)
      setStatusError('')
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 17, { duration: 1.2 })

      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng])
      } else {
        const icon = createGooglePinIcon()
        const marker = L.marker([coords.lat, coords.lng], {
          icon,
          draggable: !disabled,
          title: 'Vị trí salon',
        }).addTo(mapInstanceRef.current)
        markerRef.current = marker

        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          const dragged = {
            lat: Number(pos.lat.toFixed(6)),
            lng: Number(pos.lng.toFixed(6)),
          }
          setStatusSuccess('✓ Đã kéo ghim tới vị trí mới')
          onChange(dragged)
        })
      }
    }
  }

  // Handle selecting a place from dropdown
  const handleSelectPlace = (place: PlaceSuggestion) => {
    applyCoordinates(
      { lat: place.lat, lng: place.lng },
      `✓ Đã định vị thành công: ${place.name}`
    )
    setSearchInput(place.name)
    setSuggestions([])
    setIsDropdownOpen(false)
  }

  // Handle manual Enter / click "Tìm & Đánh dấu" button (handles place names or Google Maps URLs)
  const handleSearchOrExtract = async () => {
    if (disabled) return
    const raw = searchInput.trim()
    if (!raw) return

    setIsSearching(true)
    setStatusError('')
    setStatusSuccess('')

    try {
      const results = await placeSearchService.search(raw)
      if (results.length > 0) {
        handleSelectPlace(results[0])
      } else {
        setStatusError('Không tìm thấy địa điểm phù hợp. Hãy thử tên cụ thể hơn hoặc dán link Google Maps chi tiết.')
      }
    } catch (err: any) {
      setStatusError(err?.message || 'Lỗi tìm kiếm vị trí. Vui lòng thử lại.')
    } finally {
      setIsSearching(false)
    }
  }

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initialCenter: [number, number] =
      value && isValidCoords(value) ? [value.lat, value.lng] : [10.776889, 106.700806] // TP. Hồ Chí Minh

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: value && isValidCoords(value) ? 16 : 13,
      scrollWheelZoom: true,
      zoomControl: false,
    })
    mapInstanceRef.current = map

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
    }).addTo(map)

    const icon = createGooglePinIcon()

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
        setStatusSuccess('✓ Đã kéo ghim tới vị trí mới')
        onChange(selected)
      })
    }

    if (!disabled) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const selected = {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6)),
        }
        setStatusSuccess('✓ Đã chọn vị trí trên bản đồ')
        onChange(selected)

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
            setStatusSuccess('✓ Đã kéo ghim tới vị trí mới')
            onChange(dragged)
          })
        }
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

  // Sync external changes
  useEffect(() => {
    if (!mapInstanceRef.current || !value || !isValidCoords(value)) return
    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng])
    }
  }, [value?.lat, value?.lng])

  return (
    <div className="space-y-3.5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-brand" />
          <h3 className="text-sm font-bold text-gray-900">Vị trí tiệm trên bản đồ</h3>
        </div>
        {value && isValidCoords(value) ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Check size={13} />
            Đã ghim vị trí tiệm
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
          Bạn có thể tìm kiếm tên địa điểm giống Google Maps, dán link Google Maps của tiệm hoặc kéo ghim trực tiếp trên bản đồ.
        </p>
      )}

      {/* Place Search & Google Maps Link Autocomplete Box */}
      {!disabled && (
        <div className="rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/50 via-white to-pink-50/30 p-3 sm:p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Search size={14} className="text-brand" />
            <span className="text-xs font-bold text-gray-900">Tìm địa điểm hoặc dán link Google Maps</span>
          </div>

          <div ref={searchContainerRef} className="relative">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setStatusError('')
                    setStatusSuccess('')
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setIsDropdownOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearchOrExtract()
                    }
                  }}
                  placeholder="Nhập tên địa điểm (VD: Trường Đại học FPT) hoặc dán link Google Maps..."
                  className="w-full rounded-xl border border-rose-200 bg-white pl-9 pr-9 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none shadow-2xs"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      setSuggestions([])
                      setIsDropdownOpen(false)
                      setStatusError('')
                      setStatusSuccess('')
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Xóa nội dung"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={!searchInput.trim() || isSearching}
                onClick={handleSearchOrExtract}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-brand-dark transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
              >
                {isSearching ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Đang tìm...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Tìm & Đánh dấu</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Địa điểm gợi ý
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPlace(item)}
                    className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition hover:bg-rose-50/80"
                  >
                    <MapPin size={15} className="mt-0.5 shrink-0 text-brand" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-bold text-gray-900">{item.name}</p>
                      <p className="truncate text-[11px] text-gray-500">{item.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {statusSuccess && (
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{statusSuccess}</span>
            </p>
          )}
          {statusError && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-200">
              <AlertCircle size={14} className="shrink-0" />
              <span>{statusError}</span>
            </p>
          )}
        </div>
      )}

      {/* Map Container with Google Maps Red Pin */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl border border-gray-200 shadow-2xs bg-rose-50/20">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>Kéo ghim hoặc chạm vào bản đồ để tinh chỉnh vị trí chính xác.</span>
        <span>
          Bản đồ &copy;{' '}
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
