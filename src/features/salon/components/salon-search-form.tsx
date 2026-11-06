import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'

export function SalonSearchForm({
  initialKeyword = '',
  initialLocation = '',
}: {
  initialKeyword?: string
  initialLocation?: string
}) {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState(initialKeyword)
  const [location, setLocation] = useState(initialLocation)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('keyword', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(`/search${params.size ? `?${params}` : ''}`)
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-pink-950/5 transition-all md:flex-row md:items-center md:rounded-full md:p-2.5"
    >
      {/* Keyword Field */}
      <label className="flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5 transition hover:bg-gray-50 focus-within:bg-rose-50/40 md:rounded-full">
        <Search size={18} className="shrink-0 text-brand" />
        <span className="sr-only">Tên dịch vụ hoặc salon</span>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tên salon, dịch vụ (Nail Art, Sơn Gel...)"
          className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </label>

      {/* Divider */}
      <div className="hidden h-7 w-px bg-gray-200 md:block" />

      {/* Location Field */}
      <label className="flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5 transition hover:bg-gray-50 focus-within:bg-rose-50/40 md:rounded-full">
        <MapPin size={18} className="shrink-0 text-brand" />
        <span className="sr-only">Khu vực hoặc thành phố</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Quận, huyện hoặc Tỉnh / TP"
          className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </label>

      {/* Search Button */}
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-brand px-7 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98] md:rounded-full md:py-2.5"
      >
        <Search size={16} />
        <span>Tìm salon</span>
      </button>
    </form>
  )
}
