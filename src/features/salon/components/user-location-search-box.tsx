import { useState, useEffect, useRef } from 'react'
import {
  Search,
  MapPin,
  Navigation,
  Sparkles,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { placeSearchService, type PlaceSuggestion } from '../services/place-search.service'
import type { UserLocation } from './salon-search-map'
import type { Salon } from '../types/salon.model'

interface UserLocationSearchBoxProps {
  userLocation: UserLocation | null
  onLocationSelect: (location: UserLocation | null) => void
  nearestSalon: Salon | null
  nearestDistanceKm: number | null
  className?: string
}

export function UserLocationSearchBox({
  userLocation,
  onLocationSelect,
  nearestSalon,
  nearestDistanceKm,
  className = '',
}: UserLocationSearchBoxProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGpsLoading, setIsGpsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search when query changes
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsSearching(true)
    setErrorMsg('')

    const timer = setTimeout(async () => {
      try {
        const results = await placeSearchService.search(query, controller.signal)
        setSuggestions(results)
        setIsOpen(results.length > 0)
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
  }, [query])

  const handleSelectSuggestion = (place: PlaceSuggestion) => {
    onLocationSelect({
      lat: place.lat,
      lng: place.lng,
      label: place.name,
    })
    setQuery(place.name)
    setSuggestions([])
    setIsOpen(false)
    setErrorMsg('')
  }

  const handleManualSubmit = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    setErrorMsg('')

    try {
      const results = await placeSearchService.search(query)
      if (results.length > 0) {
        handleSelectSuggestion(results[0])
      } else {
        setErrorMsg('Không tìm thấy địa điểm hoặc tọa độ phù hợp. Hãy thử tên cụ thể hơn (VD: Trường Đại học FPT, Landmark 81).')
      }
    } catch {
      setErrorMsg('Lỗi tìm kiếm địa điểm. Vui lòng thử lại.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleGetGps = async () => {
    setIsGpsLoading(true)
    setErrorMsg('')

    try {
      const pos = await placeSearchService.getCurrentPosition()
      onLocationSelect({
        lat: pos.lat,
        lng: pos.lng,
        label: 'Vị trí hiện tại của bạn (GPS)',
      })
      setQuery('Vị trí GPS của bạn')
      setIsOpen(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể lấy vị trí GPS.')
    } finally {
      setIsGpsLoading(false)
    }
  }

  const handleClearLocation = () => {
    onLocationSelect(null)
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    setErrorMsg('')
  }

  return (
    <div className={`rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/30 p-4 shadow-xs space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white shadow-xs">
            <Navigation size={13} />
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-gray-900">
            Tìm vị trí của bạn để xem tiệm gần nhất
          </h4>
        </div>

        {userLocation && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="text-[11px] font-semibold text-gray-500 hover:text-rose-600 transition"
          >
            Xóa vị trí
          </button>
        )}
      </div>

      {/* Input & Actions */}
      <div ref={containerRef} className="relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setErrorMsg('')
              }}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpen(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleManualSubmit()
                }
              }}
              placeholder="Nhập tên địa điểm (VD: Đại học FPT), dán link Google Maps hoặc tọa độ..."
              className="w-full rounded-xl border border-sky-200 bg-white pl-9 pr-9 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none shadow-2xs"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setSuggestions([])
                  setIsOpen(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSearching || !query.trim()}
              onClick={handleManualSubmit}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-sky-700 transition disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
            >
              {isSearching ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>Tìm vị trí</span>
            </button>

            <button
              type="button"
              disabled={isGpsLoading}
              onClick={handleGetGps}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-sky-700 shadow-2xs hover:bg-sky-50 transition active:scale-[0.98]"
              title="Định vị bằng GPS của thiết bị"
            >
              {isGpsLoading ? <RefreshCw size={13} className="animate-spin text-sky-600" /> : <Navigation size={13} className="text-sky-600" />}
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
            <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Địa điểm gợi ý
            </div>
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition hover:bg-sky-50/80"
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-sky-600" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-gray-900">{item.name}</p>
                  <p className="truncate text-[11px] text-gray-500">{item.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}

      {/* Active Location Info & Nearest Salon Highlight */}
      {userLocation && (
        <div className="rounded-xl border border-sky-200/80 bg-white p-3 space-y-2 text-xs shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2 text-sky-900 font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <CheckCircle2 size={13} />
            </span>
            <span className="truncate">Vị trí của bạn: <strong className="text-gray-900">{userLocation.label || `${userLocation.lat}, ${userLocation.lng}`}</strong></span>
          </div>

          {nearestSalon && nearestDistanceKm !== null ? (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2">
              <div className="flex items-center gap-1.5 text-gray-700">
                <span className="text-brand font-bold">🚗 Tiệm gần bạn nhất:</span>
                <span className="font-bold text-gray-900">{nearestSalon.name}</span>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-brand">
                  ~{nearestDistanceKm} km
                </span>
              </div>
              <a
                href={`/salon/${encodeURIComponent(nearestSalon.id)}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
              >
                <span>Xem tiệm & Đặt lịch</span>
                <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <p className="border-t border-gray-100 pt-1.5 text-[11px] text-gray-400">
              Đang tính toán salon gần nhất trong khu vực...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
