import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Sparkles, Navigation, Calendar, Clock } from 'lucide-react'

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
    <div id="search-section" className="relative z-20 mx-auto w-full max-w-[1320px]">
      {/* Floating Multi-field Search Bar Card - Extra Wide & Fully Spacious */}
      <div className="rounded-3xl sm:rounded-[36px] border border-rose-100/90 bg-white/95 p-3.5 sm:p-4.5 lg:p-4 shadow-2xl shadow-pink-950/10 backdrop-blur-xl ring-1 ring-black/5">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:items-center lg:gap-3"
        >
          {/* Field 1: Service / Salon Keyword (API: keyword) */}
          <div className="flex items-center gap-3.5 rounded-2xl bg-gray-50/90 px-4 py-3.5 sm:py-4 transition hover:bg-gray-100/80 focus-within:bg-rose-50/40 focus-within:ring-2 focus-within:ring-brand/20 sm:col-span-2 lg:flex-[1.3] lg:min-w-0">
            <Sparkles size={20} className="shrink-0 text-brand" />
            <div className="flex-1 min-w-0">
              <label htmlFor="home-search-keyword" className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                Dịch vụ & Tiệm nail
              </label>
              <input
                id="home-search-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nail Art, Sơn Gel, Đắp móng..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Field 2: Location (API: city / location) */}
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50/90 px-4 py-3.5 sm:py-4 transition hover:bg-gray-100/80 focus-within:bg-rose-50/40 focus-within:ring-2 focus-within:ring-brand/20 sm:col-span-2 lg:flex-[1.3] lg:min-w-0">
            <MapPin size={20} className="shrink-0 text-brand" />
            <div className="flex-1 min-w-0">
              <label htmlFor="home-search-location" className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                Khu vực / Tỉnh, TP
              </label>
              <input
                id="home-search-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Quận 1, Bình Thạnh, Cầu Giấy..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              title="Định vị tiệm gần bạn nhất"
              disabled={isLocating}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 shadow-2xs transition hover:border-pink-200 hover:text-brand"
            >
              <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
              <span className="hidden xl:inline">Gần tôi</span>
            </button>
          </div>

          {/* Field 3: Date (API: date) */}
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50/90 px-4 py-3.5 sm:py-4 transition hover:bg-gray-100/80 focus-within:bg-rose-50/40 focus-within:ring-2 focus-within:ring-brand/20 sm:col-span-1 lg:flex-[1.1] lg:min-w-[215px]">
            <Calendar size={20} className="shrink-0 text-brand" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <label htmlFor="home-search-date" className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Ngày hẹn
                </label>
                {!date && (
                  <button
                    type="button"
                    onClick={handleSetToday}
                    className="text-[11px] font-semibold text-brand hover:underline shrink-0"
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
                className="w-full bg-transparent text-sm sm:text-base font-medium text-gray-900 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
              />
            </div>
          </div>

          {/* Field 4: Time Slot (API: time) */}
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50/90 px-4 py-3.5 sm:py-4 transition hover:bg-gray-100/80 focus-within:bg-rose-50/40 focus-within:ring-2 focus-within:ring-brand/20 sm:col-span-1 lg:flex-[1.1] lg:min-w-[200px]">
            <Clock size={20} className="shrink-0 text-brand" />
            <div className="flex-1 min-w-0">
              <label htmlFor="home-search-time" className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                Khung giờ
              </label>
              <select
                id="home-search-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-medium text-gray-900 outline-none cursor-pointer"
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
          <div className="sm:col-span-2 lg:shrink-0">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand via-rose-500 to-pink-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-pink-900/20 transition hover:brightness-105 hover:shadow-xl hover:shadow-pink-900/25 active:scale-[0.98] lg:h-[58px] lg:w-[60px] lg:px-0"
              title="Tìm kiếm tiệm nail"
            >
              <Search size={22} />
              <span className="lg:hidden">Tìm Salon</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
