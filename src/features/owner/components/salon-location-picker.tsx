import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import {
  MapPin,
  Navigation,
  Check,
  Link2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import { ownerApi } from '../api/owner.api'

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

function extractCoordinatesLocally(input: string): SalonCoordinates | null {
  if (!input || typeof input !== 'string') return null
  const str = input.trim()

  // 1. !3d<lat>!4d<lng> (Google Maps place exact pin)
  const placeMatch = str.match(/!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/)
  if (placeMatch) {
    const lat = Number(Number(placeMatch[1]).toFixed(6))
    const lng = Number(Number(placeMatch[2]).toFixed(6))
    if (isValidCoords({ lat, lng })) return { lat, lng }
  }

  // 2. @<lat>,<lng> (Camera center view coordinates)
  const atMatch = str.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const lat = Number(Number(atMatch[1]).toFixed(6))
    const lng = Number(Number(atMatch[2]).toFixed(6))
    if (isValidCoords({ lat, lng })) return { lat, lng }
  }

  // 3. query/destination/ll/q parameter
  const queryMatch = str.match(/[?&](?:q|query|ll|destination|center)=(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/i)
  if (queryMatch) {
    const lat = Number(Number(queryMatch[1]).toFixed(6))
    const lng = Number(Number(queryMatch[2]).toFixed(6))
    if (isValidCoords({ lat, lng })) return { lat, lng }
  }

  // 4. Raw coordinates pasted e.g. "10.776042, 106.698747" or "10.776042 106.698747"
  const rawMatch = str.match(/^\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)\s*$/)
  if (rawMatch) {
    const lat = Number(Number(rawMatch[1]).toFixed(6))
    const lng = Number(Number(rawMatch[2]).toFixed(6))
    if (isValidCoords({ lat, lng })) return { lat, lng }
  }

  return null
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

  // Google Maps URL Auto Extract states
  const [mapsUrlInput, setMapsUrlInput] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [extractSuccess, setExtractSuccess] = useState('')

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

    const icon = createGooglePinIcon()

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
        const icon = createGooglePinIcon()
        const marker = L.marker([selected.lat, selected.lng], {
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
          setLatInput(String(dragged.lat))
          setLngInput(String(dragged.lng))
          setInputError('')
          onChange(dragged)
        })
      }
    }
    onChange(selected)
  }

  const handleExtractFromUrl = async () => {
    if (disabled) return
    const raw = mapsUrlInput.trim()
    if (!raw) return

    setExtractError('')
    setExtractSuccess('')
    setIsExtracting(true)

    try {
      // Step 1: Client-side regex (instant 0ms)
      let coords = extractCoordinatesLocally(raw)

      // Step 2: If client-side couldn't parse (e.g. short link maps.app.goo.gl or goo.gl/maps)
      if (!coords && (raw.startsWith('http://') || raw.startsWith('https://'))) {
        const res = await ownerApi.resolveMapsUrl(raw)
        if (res && Number.isFinite(res.latitude) && Number.isFinite(res.longitude)) {
          coords = {
            lat: Number(res.latitude.toFixed(6)),
            lng: Number(res.longitude.toFixed(6)),
          }
        }
      }

      if (coords && isValidCoords(coords)) {
        setLatInput(String(coords.lat))
        setLngInput(String(coords.lng))
        setInputError('')
        onChange(coords)
        setExtractSuccess(`✓ Đã định vị thành công: ${coords.lat}, ${coords.lng}`)

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
              setLatInput(String(dragged.lat))
              setLngInput(String(dragged.lng))
              setInputError('')
              onChange(dragged)
            })
          }
        }
      } else {
        setExtractError('Không tìm thấy tọa độ từ liên kết hoặc văn bản đã dán. Vui lòng kiểm tra lại link Google Maps.')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Không thể phân tích liên kết Google Maps'
      setExtractError(msg)
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="space-y-3.5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-brand" />
          <h3 className="text-sm font-bold text-gray-900">Vị trí tiệm trên bản đồ</h3>
        </div>
        {value && isValidCoords(value) ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
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
          Chạm vào bản đồ, kéo ghim hoặc dán liên kết Google Maps của tiệm để hệ thống tự động đánh dấu vị trí.
        </p>
      )}

      {/* Auto Extract from Google Maps URL or Coordinates */}
      {!disabled && (
        <div className="rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/50 via-white to-pink-50/30 p-3 sm:p-4 space-y-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Link2 size={14} className="text-brand" />
              <span>Tự động định vị từ link Google Maps</span>
            </span>
            <span className="text-[11px] text-gray-400">
              Hỗ trợ link đầy đủ, link rút gọn (maps.app.goo.gl) hoặc tọa độ
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={mapsUrlInput}
                onChange={(e) => {
                  setMapsUrlInput(e.target.value)
                  setExtractError('')
                  setExtractSuccess('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleExtractFromUrl()
                  }
                }}
                placeholder="Dán link Google Maps (VD: https://maps.app.goo.gl/... hoặc https://www.google.com/maps/place/...)"
                className="w-full rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none shadow-2xs"
              />
              {mapsUrlInput && (
                <button
                  type="button"
                  onClick={() => {
                    setMapsUrlInput('')
                    setExtractError('')
                    setExtractSuccess('')
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Xóa đường dẫn"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={!mapsUrlInput.trim() || isExtracting}
              onClick={handleExtractFromUrl}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-brand-dark transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            >
              {isExtracting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Đang trích xuất...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Trích xuất & Đánh dấu</span>
                </>
              )}
            </button>
          </div>

          {extractSuccess && (
            <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{extractSuccess}</span>
            </p>
          )}
          {extractError && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5 animate-in fade-in duration-200">
              <AlertCircle size={14} className="shrink-0" />
              <span>{extractError}</span>
            </p>
          )}
        </div>
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
            <span>Hoặc nhập tọa độ thủ công:</span>
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
            Áp dụng tọa độ thủ công
          </button>
        </div>
      )}
    </div>
  )
}
