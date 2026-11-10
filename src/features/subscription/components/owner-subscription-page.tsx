import { useEffect, useRef, useState } from 'react'
import { useOwnerSubscription, useOwnerSubscriptionRequests, usePlans, useSubscriptionMutation } from '../queries/subscription.queries'
import type { Plan } from '../types/subscription.model'
import { formatPaymentDate } from '../utils/format-payment-date'

export function OwnerSubscriptionPage() {
  const [page, setPage] = useState(0)
  const [quote, setQuote] = useState<Plan | null>(null)
  const [message, setMessage] = useState('')
  const current = useOwnerSubscription()
  const plans = usePlans()
  const history = useOwnerSubscriptionRequests(page)
  const mutations = useSubscriptionMutation()
  const pending = current.data?.pendingRequest
  const handledReturn = useRef('')
  useEffect(() => {
    const orderCode = new URLSearchParams(window.location.search).get('orderCode')
    if (!orderCode || !pending || pending.payosOrderCode !== orderCode || handledReturn.current === orderCode) return
    handledReturn.current = orderCode
    void mutations.syncOwnerPayment.mutateAsync(pending.id)
      .then(result => setMessage(result.paymentReportedAt ? 'PayOS đã xác nhận thanh toán.' : 'Đang chờ PayOS ghi nhận thanh toán.'))
      .catch(() => setMessage('Không kiểm tra được thanh toán. Hãy dùng nút kiểm tra bên dưới.'))
  }, [pending, mutations.syncOwnerPayment])
  const submit = async () => {
    if (!quote || quote.monthlyPrice === null) return
    try {
      await mutations.request.mutateAsync({ tier: quote.tier, price: quote.monthlyPrice })
      setQuote(null)
      setMessage('Đã tạo yêu cầu. Bạn có thể thanh toán qua PayOS.')
    } catch { setMessage('Không tạo được yêu cầu. Vui lòng tải lại giá.') }
  }
  const pay = async () => {
    if (!pending) return
    try {
      const payment = await mutations.prepare.mutateAsync(pending.id)
      window.location.assign(payment.payosCheckoutUrl)
    } catch { setMessage('Không tạo được liên kết PayOS. Vui lòng thử lại.') }
  }
  const sync = async () => {
    if (!pending) return
    try {
      const result = await mutations.syncOwnerPayment.mutateAsync(pending.id)
      setMessage(result.paymentReportedAt ? 'PayOS đã xác nhận thanh toán.' : 'PayOS chưa ghi nhận thanh toán. Vui lòng thử lại sau.')
    } catch { setMessage('Không kiểm tra được thanh toán. Vui lòng thử lại.') }
  }
  return <main className="mx-auto max-w-[1100px] px-6 py-10">
    <header className="mb-8 flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl font-bold text-[#8C3A5A]">Gói đăng ký</h1><p className="mt-2 text-sm text-gray-600">Thanh toán gói salon qua PayOS. Trạng thái được cập nhật tự động.</p></div><button onClick={() => { current.refetch(); history.refetch() }} className="rounded-lg border bg-white px-4 py-2 text-sm">Tải lại</button></header>
    {message && <p role="status" className="mb-4 text-sm text-brand-dark">{message}</p>}
    {pending?.payosCheckoutUrl && !pending.paymentReportedAt && <button onClick={() => void sync()} disabled={mutations.syncOwnerPayment.isPending} className="mb-4 rounded-lg border border-[#8C3A5A] px-4 py-2 text-sm text-[#8C3A5A]">Kiểm tra thanh toán PayOS</button>}
    {current.isPending ? <p role="status">Đang tải gói…</p> : current.isError ? <p role="alert">Không tải được gói hiện tại.</p> : <section className="mb-8 rounded-2xl border bg-white p-6"><h2 className="font-serif text-2xl font-semibold">Gói hiện tại</h2><p className="mt-3">{current.data.effectiveTier ? `Gói ${current.data.effectiveTier}` : 'Chưa có gói đang hiệu lực.'}</p>{current.data.startsAt && <p className="mt-2 text-sm text-gray-500">{formatPaymentDate(current.data.startsAt)} – {formatPaymentDate(current.data.expiresAt)}</p>}{pending && <div className="mt-6 rounded-xl bg-[#fff5f8] p-5"><h3 className="font-semibold">Yêu cầu #{pending.id} · {pending.tier}</h3><p className="mt-2 text-sm">Số tiền: <strong>{pending.quotedPrice.toLocaleString('vi-VN')} ₫</strong></p>{pending.paymentReportedAt ? <p className="mt-3 text-sm">PayOS đã xác nhận thanh toán. Đang chờ admin duyệt gói.</p> : pending.payosCheckoutUrl ? <a href={pending.payosCheckoutUrl} className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 font-semibold text-white shadow-xs hover:bg-brand-dark transition">Đến trang thanh toán PayOS</a> : <button onClick={() => void pay()} disabled={mutations.prepare.isPending} className="mt-4 rounded-lg bg-brand px-4 py-2 font-semibold text-white shadow-xs hover:bg-brand-dark transition">Thanh toán qua PayOS</button>}</div>}</section>}
    <section><h2 className="mb-5 font-serif text-2xl font-semibold">Chọn gói cho tiệm</h2>{plans.isPending ? <p role="status">Đang tải gói…</p> : plans.isError ? <p role="alert">Không tải được giá gói.</p> : <div className="grid gap-5 md:grid-cols-2">{plans.data.map(plan => <article key={plan.tier} className="rounded-2xl border bg-white p-6"><h3 className="font-serif text-2xl font-semibold">{plan.displayName}</h3><p className="mt-5 text-2xl font-bold text-[#8C3A5A]">{plan.monthlyPrice === null ? 'Chưa công bố giá' : `${plan.monthlyPrice.toLocaleString('vi-VN')} ₫ / tháng`}</p><button disabled={!!pending || !plan.registrationAvailable || plan.monthlyPrice === null} onClick={() => setQuote(plan)} className="mt-5 rounded-lg bg-brand px-5 py-2.5 font-semibold text-white shadow-xs hover:bg-brand-dark transition disabled:opacity-50">Chọn gói</button></article>)}</div>}{quote && <div className="mt-6 rounded-2xl border bg-white p-6"><h3 className="font-serif text-xl font-semibold">Xác nhận gói {quote.displayName}</h3><p className="mt-3">Giá: {quote.monthlyPrice?.toLocaleString('vi-VN')} ₫ / tháng.</p><div className="mt-4 flex gap-3"><button onClick={() => void submit()} disabled={mutations.request.isPending} className="rounded-lg bg-brand px-4 py-2 font-semibold text-white shadow-xs hover:bg-brand-dark transition">Tạo yêu cầu</button><button onClick={() => setQuote(null)}>Quay lại</button></div></div>}</section>
    <section className="mt-8 rounded-2xl border bg-white p-6"><h2 className="font-serif text-xl font-semibold">Lịch sử yêu cầu</h2>{history.isPending ? <p role="status">Đang tải…</p> : history.isError ? <p role="alert">Không tải được lịch sử.</p> : <><div className="mt-4 space-y-3">{history.data.content.map(item => <div key={item.id} className="rounded-xl border p-4 text-sm">#{item.id} · {item.tier} · {item.quotedPrice.toLocaleString('vi-VN')} ₫ · {item.status} · {item.paymentReportedAt ? 'PayOS đã xác nhận' : 'Chưa thanh toán'}</div>)}</div><div className="mt-5 flex justify-center gap-5 text-sm"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Trang trước</button><span>Trang {page + 1}</span><button disabled={history.data.last} onClick={() => setPage(page + 1)}>Trang sau</button></div></>}</section>
  </main>
}
