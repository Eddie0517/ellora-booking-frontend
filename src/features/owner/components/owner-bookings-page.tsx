import { useState } from 'react'
import { useOwnerBookings, useOwnerSalon, useUpdateOwnerBooking } from '../queries/owner.queries'
import { useConfirm } from '@/hooks/use-confirm'
import { apiError } from '@/lib/axios'
import { toast } from 'sonner'

const tabs = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
]

const nextStatuses: Record<string, { value: string; label: string }[]> = {
  PENDING: [
    { value: 'CONFIRMED', label: 'Xác nhận' },
    { value: 'CANCELLED', label: 'Hủy lịch' },
  ],
  CONFIRMED: [
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Hủy lịch' },
  ],
}

export function OwnerBookingsPage() {
  const { confirm } = useConfirm()
  const salon = useOwnerSalon()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const bookings = useOwnerBookings(salon.data?.id ?? '', page, status || undefined)
  const update = useUpdateOwnerBooking()

  const act = async (id: string, value: string) => {
    if (value === 'CANCELLED' || value === 'REJECTED') {
      const ok = await confirm({
        title: 'Thay đổi trạng thái lịch hẹn',
        description: 'Bạn có chắc chắn muốn thay đổi trạng thái lịch hẹn này?',
        confirmText: 'Xác nhận',
        variant: 'destructive',
      })
      if (!ok) return
    }
    try {
      await update.mutateAsync({ id, status: value })
      toast.success(value === 'CANCELLED' ? 'Đã hủy lịch hẹn.' : 'Đã cập nhật lịch hẹn.')
    } catch (error) {
      toast.error(apiError(error))
    }
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lịch hẹn</h1>
        <p className="mt-1 text-sm text-gray-600">Theo dõi và xử lý lịch hẹn của salon.</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Lọc trạng thái lịch hẹn">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value)
              setPage(0)
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              status === tab.value
                ? 'bg-brand text-white shadow-xs'
                : 'bg-white text-gray-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {salon.isPending || bookings.isPending ? (
        <p role="status" className="text-sm text-gray-500">Đang tải lịch hẹn…</p>
      ) : salon.isError || bookings.isError ? (
        <p role="alert" className="text-sm text-red-600">Không tải được lịch hẹn.</p>
      ) : bookings.data.content.length ? (
        <div className="space-y-4">
          {bookings.data.content.map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {booking.customerName || 'Khách hàng'}{' '}
                    <span className="ml-2 text-xs font-normal text-gray-500">#{booking.id}</span>
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {booking.serviceName} • {booking.servicePrice.toLocaleString('vi-VN')} ₫
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {booking.scheduledAt.replace('T', ' ').slice(0, 16)} • {booking.durationMinutes} phút
                  </p>
                  {booking.customerPhone && (
                    <p className="mt-1 text-sm text-gray-600">{booking.customerPhone}</p>
                  )}
                  {booking.customerNote && (
                    <p className="mt-2 text-sm text-gray-500">Ghi chú: {booking.customerNote}</p>
                  )}
                </div>
                <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-brand">
                  {booking.status}
                </span>
              </div>

              {nextStatuses[booking.status] && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  {nextStatuses[booking.status].map((action) => (
                    <button
                      key={action.value}
                      onClick={() => act(booking.id, action.value)}
                      disabled={update.isPending}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:brightness-105 active:scale-95 disabled:opacity-50 ${
                        action.value === 'CANCELLED'
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : 'bg-brand hover:bg-brand-dark'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-8 text-center text-gray-600">Chưa có lịch hẹn trong mục này.</p>
      )}

      {update.isError && (
        <p role="alert" className="mt-4 text-red-700">Không cập nhật được lịch hẹn.</p>
      )}

      {bookings.isSuccess && bookings.data.totalElements > 50 && (
        <nav className="mt-8 flex justify-center gap-5 text-sm font-medium" aria-label="Phân trang lịch hẹn">
          <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-gray-600 hover:bg-slate-50 disabled:opacity-40">
            Trang trước
          </button>
          <span className="text-gray-500">Trang {page + 1}</span>
          <button disabled={bookings.data.last} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-gray-600 hover:bg-slate-50 disabled:opacity-40">
            Trang sau
          </button>
        </nav>
      )}
    </main>
  )
}
