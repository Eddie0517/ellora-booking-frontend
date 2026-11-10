import { useState, type FormEvent } from 'react'
import { useAdminPlans, useAdminSubscriptionRequests, useSubscriptionMutation } from '../queries/subscription.queries'
import type { Plan, SubscriptionRequest } from '../types/subscription.model'
import { formatPaymentDate } from '../utils/format-payment-date'

function PlanEditor({ plan, save }: { plan: Plan; save: (price: number | null, enabled: boolean) => void }) {
  const [price, setPrice] = useState(plan.monthlyPrice?.toString() ?? '')
  const [enabled, setEnabled] = useState(plan.enabled)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    save(price === '' ? null : Number(price), enabled)
  }
  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
      <h3 className="text-lg font-bold text-gray-900">{plan.displayName}</h3>
      <label className="mt-4 block text-sm font-medium text-gray-700">
        Giá một tháng (₫)
        <input
          type="number"
          min={0}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand focus:outline-none"
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          className="rounded border-slate-300 text-brand focus:ring-brand"
        />
        Mở gói
      </label>
      <button className="mt-5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-dark transition">
        Lưu gói
      </button>
    </form>
  )
}

function Decision({
  item,
  submit,
}: {
  item: SubscriptionRequest
  submit: (status: 'APPROVED' | 'REJECTED', note: string) => void
}) {
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [note, setNote] = useState('')
  const paid = !!item.paymentReportedAt && item.receivedAmount === item.quotedPrice
  const save = (event: FormEvent) => {
    event.preventDefault()
    if (status === 'APPROVED' && !paid) return
    if (status === 'REJECTED' && !note.trim()) return
    submit(status, note)
  }
  return (
    <form onSubmit={save} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
      <h3 className="text-base font-bold text-gray-900">Xét duyệt yêu cầu</h3>
      <label className="block text-sm font-medium text-gray-700">
        Quyết định
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand focus:outline-none"
        >
          <option value="APPROVED">Duyệt và kích hoạt</option>
          <option value="REJECTED">Từ chối yêu cầu</option>
        </select>
      </label>
      {status === 'APPROVED' && (
        <p className="text-sm font-medium text-emerald-600">
          {paid
            ? `PayOS đã xác nhận ${item.receivedAmount?.toLocaleString('vi-VN')} ₫.`
            : 'Đang chờ PayOS xác nhận thanh toán.'}
        </p>
      )}
      <label className="block text-sm font-medium text-gray-700">
        {status === 'REJECTED' ? 'Lý do từ chối' : 'Ghi chú'}
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          required={status === 'REJECTED'}
          maxLength={1000}
          className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand focus:outline-none"
          rows={3}
        />
      </label>
      <button
        disabled={status === 'APPROVED' && !paid}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-dark transition disabled:opacity-40"
      >
        {status === 'APPROVED' ? 'Kích hoạt gói' : 'Xác nhận từ chối'}
      </button>
    </form>
  )
}

export function AdminSubscriptionsPage() {
  const [filter, setFilter] = useState('PENDING')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')
  const plans = useAdminPlans()
  const requests = useAdminSubscriptionRequests(filter, page)
  const mutations = useSubscriptionMutation()
  const selected = requests.data?.content.find((item) => item.id === selectedId)

  const savePlan = async (tier: Plan['tier'], price: number | null, enabled: boolean) => {
    try {
      await mutations.savePlan.mutateAsync({ tier, price, enabled })
      setMessage('Đã lưu gói.')
    } catch {
      setMessage('Không lưu được gói.')
    }
  }

  const decide = async (status: 'APPROVED' | 'REJECTED', note: string) => {
    if (!selected) return
    try {
      await mutations.decide.mutateAsync({ id: selected.id, status, note })
      setSelectedId('')
      setMessage('Đã xử lý yêu cầu.')
    } catch {
      setMessage('Không xử lý được yêu cầu.')
    }
  }

  const sync = async () => {
    if (!selected) return
    try {
      const result = await mutations.syncAdminPayment.mutateAsync(selected.id)
      setMessage(
        result.paymentReportedAt
          ? 'PayOS đã xác nhận thanh toán.'
          : 'PayOS chưa ghi nhận thanh toán.'
      )
    } catch {
      setMessage('Không kiểm tra được PayOS.')
    }
  }

  return (
    <section className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Gói đăng ký salon</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cấu hình gói và duyệt thanh toán đã được PayOS xác nhận.
        </p>
      </header>

      {message && (
        <p role="status" className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm font-semibold text-brand">
          {message}
        </p>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Giá gói</h2>
        {plans.isPending ? (
          <p role="status" className="text-sm text-gray-500">Đang tải gói…</p>
        ) : plans.isError ? (
          <p role="alert" className="text-sm text-red-600">Không tải được gói.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.data.map((plan) => (
              <PlanEditor
                key={`${plan.tier}-${plan.monthlyPrice}-${plan.enabled}`}
                plan={plan}
                save={(price, enabled) => void savePlan(plan.tier, price, enabled)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-9 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <h2 className="text-xl font-bold text-gray-900">Yêu cầu đăng ký</h2>
        <label className="mt-4 block text-sm font-medium text-gray-700">
          Trạng thái
          <select
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value)
              setPage(0)
              setSelectedId('')
            }}
            className="mt-2 block w-full sm:w-64 rounded-lg border border-slate-200 p-2.5 text-sm focus:border-brand focus:outline-none"
          >
            <option value="PENDING">Chờ duyệt</option>
            <option value="">Tất cả</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>
        </label>

        {requests.isPending ? (
          <p className="mt-5 text-sm text-gray-500" role="status">Đang tải yêu cầu…</p>
        ) : requests.isError ? (
          <p className="mt-5 text-sm text-red-600" role="alert">Không tải được yêu cầu.</p>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-3.5">Salon</th>
                    <th className="p-3.5">Gói</th>
                    <th className="p-3.5">Thanh toán</th>
                    <th className="p-3.5">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.data.content.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-medium text-gray-900">#{item.id} · {item.salonName}</td>
                      <td className="p-3.5 text-gray-700">{item.tier} · {item.quotedPrice.toLocaleString('vi-VN')} ₫</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                            item.paymentReportedAt
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.paymentReportedAt ? 'PayOS đã xác nhận' : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedId(item.id)}
                          className="font-semibold text-brand hover:text-brand-dark hover:underline"
                        >
                          Xem yêu cầu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav className="mt-5 flex items-center justify-center gap-4 text-sm font-medium">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-gray-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Trang trước
              </button>
              <span className="text-gray-500">Trang {page + 1}</span>
              <button
                disabled={requests.data.last}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-gray-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Trang sau
              </button>
            </nav>
          </>
        )}
      </section>

      {selected && (
        <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h2 className="text-xl font-bold text-gray-900">
            Yêu cầu #{selected.id} · {selected.salonName}
          </h2>
          <p className="mt-3 text-sm text-gray-700">
            Gói <span className="font-semibold">{selected.tier}</span> ·{' '}
            <span className="font-semibold text-brand">
              {selected.quotedPrice.toLocaleString('vi-VN')} ₫ / tháng
            </span>{' '}
            · Trạng thái: <span className="font-medium">{selected.status}</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            PayOS order: {selected.payosOrderCode || 'Chưa tạo'} · Mã giao dịch:{' '}
            {selected.paymentReference || 'Chưa có'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Thanh toán:{' '}
            {selected.paymentReportedAt
              ? `${selected.receivedAmount?.toLocaleString('vi-VN')} ₫ · ${formatPaymentDate(
                  selected.paymentReportedAt
                )}`
              : 'Chưa được PayOS xác nhận'}
          </p>
          {selected.payosCheckoutUrl && !selected.paymentReportedAt && (
            <button
              onClick={() => void sync()}
              disabled={mutations.syncAdminPayment.isPending}
              className="mt-4 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-rose-50 transition"
            >
              Kiểm tra thanh toán PayOS
            </button>
          )}
          {selected.status === 'PENDING' ? (
            <Decision key={selected.id} item={selected} submit={(status, note) => void decide(status, note)} />
          ) : (
            <p className="mt-5 text-sm text-gray-500 italic">
              {selected.reviewNote || 'Không có ghi chú.'}
            </p>
          )}
        </section>
      )}
    </section>
  )
}
