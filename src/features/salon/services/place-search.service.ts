import { ownerApi } from '@/features/owner/api/owner.api'

export interface PlaceSuggestion {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  source: 'nominatim' | 'url' | 'coords'
}

function isValidCoords(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function extractCoordinatesLocally(input: string): { lat: number; lng: number } | null {
  if (!input || typeof input !== 'string') return null
  const str = input.trim()

  // 1. !3d<lat>!4d<lng>
  const placeMatch = str.match(/!3d(-?\d+(?:\.\d+)?)[^!]*!4d(-?\d+(?:\.\d+)?)/)
  if (placeMatch) {
    const lat = Number(Number(placeMatch[1]).toFixed(6))
    const lng = Number(Number(placeMatch[2]).toFixed(6))
    if (isValidCoords(lat, lng)) return { lat, lng }
  }

  // 2. @<lat>,<lng>
  const atMatch = str.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const lat = Number(Number(atMatch[1]).toFixed(6))
    const lng = Number(Number(atMatch[2]).toFixed(6))
    if (isValidCoords(lat, lng)) return { lat, lng }
  }

  // 3. query/destination/ll/q parameter
  const queryMatch = str.match(/[?&](?:q|query|ll|destination|center)=(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/i)
  if (queryMatch) {
    const lat = Number(Number(queryMatch[1]).toFixed(6))
    const lng = Number(Number(queryMatch[2]).toFixed(6))
    if (isValidCoords(lat, lng)) return { lat, lng }
  }

  // 4. Raw coordinates
  const rawMatch = str.match(/^\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)\s*$/)
  if (rawMatch) {
    const lat = Number(Number(rawMatch[1]).toFixed(6))
    const lng = Number(Number(rawMatch[2]).toFixed(6))
    if (isValidCoords(lat, lng)) return { lat, lng }
  }

  return null
}

export const placeSearchService = {
  /**
   * Search places by query string (name, address, Google Maps link, or coordinates)
   */
  async search(query: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) return []

    // Check if input is a direct coordinate or Google Maps link
    const localCoords = extractCoordinatesLocally(trimmed)
    if (localCoords) {
      return [
        {
          id: `coord-${localCoords.lat}-${localCoords.lng}`,
          name: `${localCoords.lat}, ${localCoords.lng}`,
          address: 'Tọa độ trích xuất trực tiếp',
          lat: localCoords.lat,
          lng: localCoords.lng,
          source: 'coords',
        },
      ]
    }

    // Check if input is a web URL (such as shortened maps.app.goo.gl)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const resolved = await ownerApi.resolveMapsUrl(trimmed)
        if (resolved && isValidCoords(resolved.latitude, resolved.longitude)) {
          return [
            {
              id: `resolved-${resolved.latitude}-${resolved.longitude}`,
              name: 'Vị trí từ link Google Maps',
              address: `${resolved.latitude}, ${resolved.longitude}`,
              lat: Number(resolved.latitude.toFixed(6)),
              lng: Number(resolved.longitude.toFixed(6)),
              source: 'url',
            },
          ]
        }
      } catch {
        // Fall through to geocoding if resolve fails
      }
    }

    // Search via OpenStreetMap Nominatim Geocoding API
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.set('q', trimmed)
      url.searchParams.set('format', 'json')
      url.searchParams.set('addressdetails', '1')
      url.searchParams.set('limit', '5')
      url.searchParams.set('countrycodes', 'vn') // Prioritize Vietnam places

      const response = await fetch(url.toString(), {
        headers: {
          'Accept-Language': 'vi,en;q=0.9',
        },
        signal,
      })

      if (!response.ok) return []

      const items = await response.json()
      if (!Array.isArray(items)) return []

      return items.map((item: any, idx: number) => {
        const lat = parseFloat(item.lat)
        const lng = parseFloat(item.lon)
        const displayName = item.display_name || ''
        const parts = displayName.split(', ')
        const title = parts[0] || displayName
        const subtitle = parts.slice(1).join(', ')

        return {
          id: item.place_id ? String(item.place_id) : `nom-${idx}`,
          name: title,
          address: subtitle || displayName,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          source: 'nominatim',
        }
      })
    } catch (err: any) {
      if (err?.name === 'AbortError') return []
      console.warn('Geocoding search failed:', err)
      return []
    }
  },

  /**
   * Request device current GPS coordinates via HTML5 Geolocation API
   */
  async getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt của bạn không hỗ trợ định vị GPS.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          })
        },
        (err) => {
          let msg = 'Không thể lấy vị trí hiện tại.'
          if (err.code === err.PERMISSION_DENIED) {
            msg = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật vị trí trong cài đặt trình duyệt.'
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'Tín hiệu GPS không khả dụng.'
          } else if (err.code === err.TIMEOUT) {
            msg = 'Quá thời gian yêu cầu vị trí.'
          }
          reject(new Error(msg))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      )
    })
  },
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(1))
}
