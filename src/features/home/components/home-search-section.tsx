import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Sparkles, Navigation, Calendar, Clock } from 'lucide-react'

const searchTags = [
  { label: '✨ Nail Art Thiết Kế', keyword: 'nail art' },
  { label: '💅 Sơn Gel Hàn Quốc', keyword: 'sơn gel' },
  { label: '🫧 Spa Chân & Chăm Sóc', keyword: 'chăm sóc' },
  { label: '💎 Móng Úp & Đắp Bột', keyword: 'đắp móng' },
  // { label: '👁️ Nối Mi Tự Nhiên', keyword: 'mi' },
  { label: '🔥 Ưu Đãi Hôm Nay', keyword: 'combo' },
]

function getTodayStr() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function HomeSearchSection() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [todayStr] = useState(getTodayStr)

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('keyword', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    if (date.trim()) params.set('date', date.trim())
    if (time.trim()) params.set('time', time.trim())
    navigate(`/search${params.size ? `?${params.toString()}` : ''}`)
  }

  const handleTagClick = (tagKeyword: string) => {
    navigate(`/search?keyword=${encodeURIComponent(tagKeyword)}`)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const params = new URLSearchParams()
        if (keyword.trim()) params.set('keyword', keyword.trim())
        if (date.trim()) params.set('date', date.trim())
        if (time.trim()) params.set('time', time.trim())
        params.set('latitude', String(pos.coords.latitude))
        params.set('longitude', String(pos.coords.longitude))
        params.set('sort', 'distance')
        navigate(`/search?${params.toString()}`)
      },
      () => {
        setIsLocating(false)
        // Fallback default
        setLocation('Hồ Chí Minh')
      },
      { timeout: 8000 }
    )
  }

  const handleSetToday = () => {
    setDate(todayStr)
  }

  return (
    <div id="search-section" className="relative z-20 mx-auto max-w-6xl">
      {/* Floating Multi-field Search Bar Card */}
      <div className="rounded-3xl border border-rose-100/90 bg-white/95 p-3.5 shadow-xl shadow-pink-950/8 backdrop-blur-xl ring-1 ring-black/5 sm:p-5">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-center"
          >
            {/* Field 1: Service / Salon Keyword (API: keyword) */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50/90 px-4 py-3 transition hover:bg-gray-100/80 focus-within:bg-rose-50/40 focus-within:ring-2 focus-within:ring-brand/20 sm:col-span-2 lg:col-span-4">
              <Sparkles size={18} className="shrink-0 text-brand" />
              <div className="flex-1 min-w-0">
                <label htmlFor="home-search-keyword" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Dịch vụ & Tiệm nail
                </label>
                <input
                  id="home-search-keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nail Art, Sơn Gel, Đắp móng..."
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Field 2: Location (API: city / location) */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50/90 px-4 py-3 transition hover:bg-gray-100/80 focus-within:bg-rose-50/40 focus-within:ring-2 focus-within:ring-brand/20 sm:col-span-2 lg:col-span-3">
              <MapPin size={18} className="shrink-0 text-brand" />
              <div className="flex-1 min-w-0">
                <label htmlFor="home-search-location" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Khu vực / Tỉnh, TP
                </label>
                <input
                  id="home-search-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Quận 1, Bình Thạnh, Cầu Giấy..."
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                title="Định vị tiệm gần bạn nhất"
                disabled={isLocating}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-2xs transition hover:border-pink-200 hover:text-brand"
              >
                <Navigation size={12} className={isLocating ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Gần tôi</span>
              </button>
            </div>

            {/* Field 3: Date (API: date) */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50/90 px-4 py-3 transition hover:bg-gray-100/80 focus-within:bg-rose-50/40 focus-within:ring-2 focus-within:ring-brand/20 sm:col-span-1 lg:col-span-2">
              <Calendar size={18} className="shrink-0 text-brand" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <label htmlFor="home-search-date" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Ngày hẹn
                  </label>
                  {!date && (
                    <button
                      type="button"
                      onClick={handleSetToday}
                      className="text-[10px] font-semibold text-brand hover:underline"
                    >
                      Hôm nay
                    </button>
                  )}
                </div>
                <input
                  id="home-search-date"
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Field 4: Time Slot (API: time) */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50/90 px-4 py-3 transition hover:bg-gray-100/80 focus-within:bg-rose-50/40 focus-within:ring-2 focus-within:ring-brand/20 sm:col-span-1 lg:col-span-2">
              <Clock size={18} className="shrink-0 text-brand" />
              <div className="flex-1 min-w-0">
                <label htmlFor="home-search-time" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Khung giờ
                </label>
                <select
                  id="home-search-time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none cursor-pointer"
                >
                  <option value="">Bất kỳ lúc nào</option>
                  <option value="morning">Sáng (08:00 - 12:00)</option>
                  <option value="afternoon">Chiều (12:00 - 17:00)</option>
                  <option value="evening">Tối (17:00 - 21:00)</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                </select>
              </div>
            </div>

            {/* Field 5: Search Submit Button */}
            <div className="sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand via-rose-500 to-pink-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-pink-900/15 transition hover:brightness-105 hover:shadow-lg hover:shadow-pink-900/20 active:scale-[0.98] lg:h-[46px] lg:px-4"
                title="Tìm kiếm tiệm nail"
              >
                <Search size={18} />
                <span className="lg:hidden">Tìm Salon</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tag Pills - Centered (+5px breathing room) */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-gray-500">Tìm kiếm phổ biến:</span>
          {searchTags.map((tag) => (
            <button
              key={tag.keyword}
              type="button"
              onClick={() => handleTagClick(tag.keyword)}
              className="rounded-full border border-gray-200/90 bg-white/80 px-3.5 py-1.5 font-medium text-gray-700 shadow-2xs backdrop-blur-xs transition hover:border-pink-200 hover:bg-rose-50 hover:text-brand active:scale-95"
            >
              {tag.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleGetLocation}
            className="flex items-center gap-1 rounded-full border border-pink-200 bg-rose-50/80 px-3.5 py-1.5 font-medium text-brand shadow-2xs transition hover:bg-rose-100/80 active:scale-95 cursor-pointer"
          >
            <Navigation size={11} />
            <span>Salon gần tôi nhất</span>
          </button>
        </div>
    </div>
  )
}
