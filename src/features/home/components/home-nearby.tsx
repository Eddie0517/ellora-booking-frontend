import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSalons } from '@/features/salon/queries/salon.queries'
import { SalonCard } from '@/features/salon/components/salon-card'

function NearbyResults({ lat, lng, refresh }: { lat: number; lng: number; refresh: () => void }) {
  const salons = useSalons({ latitude: lat, longitude: lng, radiusKm: 5, sort: 'distance', page: 0, size: 8 })
  return <section className="mx-auto max-w-7xl px-4 py-8 md:px-6" aria-label="Salon gần bạn"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-3xl font-bold text-brand-darker md:text-4xl">Salon gần bạn</h2><p className="mt-2 text-sm text-gray-600">Trong bán kính 5 km quanh vị trí của bạn. Khoảng cách theo đường thẳng.</p></div><button type="button" onClick={refresh} className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-brand-dark">Cập nhật vị trí</button></div>{salons.isPending ? <p role="status">Đang tìm salon gần bạn…</p> : salons.isError ? <div><p role="alert" className="text-red-700">Không tải được salon gần bạn.</p><button onClick={() => salons.refetch()} className="mt-3 text-brand-dark underline">Tải lại</button></div> : salons.data.content.length ? <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{salons.data.content.slice(0, 4).map(item => <SalonCard key={item.id} salon={item} />)}</div><Link to={`/search?latitude=${lat}&longitude=${lng}&radiusKm=5&sort=distance`} className="mt-5 inline-block text-sm font-semibold text-brand-dark underline">Xem tất cả salon gần bạn</Link></> : <p role="status" className="text-sm text-gray-600">Chưa có salon phù hợp trong bán kính 5 km. Hãy tìm theo khu vực ở trang tìm kiếm.</p>}</section>
}

export function HomeNearby() {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const locate = () => {
    if (!navigator.geolocation) { setError('Trình duyệt không hỗ trợ xác định vị trí.'); return }
    setLocating(true); setError('')
    navigator.geolocation.getCurrentPosition(position => { setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude }); setLocating(false) }, () => { setError('Không lấy được vị trí. Hãy cấp quyền vị trí hoặc nhập khu vực trong ô tìm kiếm.'); setLocating(false) }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })
  }
  return coordinates ? <NearbyResults lat={coordinates.lat} lng={coordinates.lng} refresh={locate} /> : <section className="mx-auto max-w-7xl px-4 py-8 md:px-6" aria-label="Salon gần bạn"><div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-rose-100 bg-white p-6"><div className="max-w-xl"><h2 className="font-serif text-3xl font-semibold text-brand-darker">Salon gần bạn</h2><p className="mt-2 text-sm leading-6 text-gray-600">Dùng vị trí của bạn để tìm tiệm trong bán kính 5 km. Bạn cũng có thể nhập khu vực trong ô tìm kiếm phía trên.</p></div><button type="button" onClick={locate} disabled={locating} className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-brand-dark disabled:opacity-50">{locating ? 'Đang lấy vị trí…' : 'Dùng vị trí của tôi'}</button>{error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}</div></section>
}
