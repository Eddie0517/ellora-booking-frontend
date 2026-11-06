import { useState } from 'react'
import { apiError } from '@/lib/axios'
import { useClosures, useWorkingHours, useWorkingHoursMutations } from '../queries/owner.queries'
import type { WorkingHour } from '../types/owner.model'

const names: Record<string, string> = {
  MONDAY: 'Thứ Hai', TUESDAY: 'Thứ Ba', WEDNESDAY: 'Thứ Tư', THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu', SATURDAY: 'Thứ Bảy', SUNDAY: 'Chủ Nhật',
}

const invalidHour = (hour: WorkingHour) =>
  !hour.closed && (!hour.openTime || !hour.closeTime || hour.openTime >= hour.closeTime)

export function OwnerHoursPage() {
  const hours = useWorkingHours()
  const closures = useClosures()
  const mutation = useWorkingHoursMutations()
  const [edited, setEdited] = useState<WorkingHour[] | null>(null)
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [hoursMessage, setHoursMessage] = useState('')
  const [closureMessage, setClosureMessage] = useState('')
  const draft = edited ?? hours.data ?? []

  const update = (day: string, patch: Partial<WorkingHour>) => {
    setHoursMessage('')
    setEdited(draft.map(hour => hour.dayOfWeek === day ? { ...hour, ...patch } : hour))
  }

  const save = async () => {
    setHoursMessage('')
    const invalid = draft.find(invalidHour)
    if (invalid) {
      setHoursMessage(`${names[invalid.dayOfWeek] ?? invalid.dayOfWeek}: giờ mở phải sớm hơn giờ đóng trong cùng ngày.`)
      return
    }
    try {
      await mutation.save.mutateAsync(draft)
      setEdited(null)
      setHoursMessage('Đã lưu giờ mở cửa.')
    } catch (error) {
      setHoursMessage(apiError(error))
    }
  }

  const addClosure = async () => {
    if (!date) return
    setClosureMessage('')
    try {
      await mutation.close.mutateAsync({ date, reason })
      setDate('')
      setReason('')
      setClosureMessage('Đã thêm ngày nghỉ.')
    } catch (error) {
      setClosureMessage(apiError(error))
    }
  }

  const removeClosure = async (id: string) => {
    setClosureMessage('')
    try {
      await mutation.reopen.mutateAsync(id)
      setClosureMessage('Đã mở lại ngày này.')
    } catch (error) {
      setClosureMessage(apiError(error))
    }
  }

  return <main className="mx-auto max-w-3xl space-y-10 p-8">
    <section>
      <h1 className="text-2xl font-bold text-brand-dark">Giờ mở cửa</h1>
      <p className="mt-2 text-sm text-gray-600">Chọn giờ mở và đóng trong cùng ngày, ví dụ 09:00–18:00.</p>
      {hours.isPending ? <p role="status">Đang tải…</p> : hours.isError ? <p role="alert">{apiError(hours.error)}</p> : <div className="mt-6 space-y-3">
        {draft.map(hour => {
          const invalid = invalidHour(hour)
          return <div key={hour.dayOfWeek} className="rounded-xl bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <strong>{names[hour.dayOfWeek] ?? hour.dayOfWeek}</strong>
              <label><input type="checkbox" checked={hour.closed} onChange={event => update(hour.dayOfWeek, {
                closed: event.target.checked,
                ...(!event.target.checked ? { openTime: hour.openTime ?? '09:00', closeTime: hour.closeTime ?? '18:00' } : {}),
              })} /> Nghỉ hàng tuần</label>
              <label>Mở <input type="time" lang="en-GB" disabled={hour.closed} value={hour.openTime?.slice(0, 5) ?? ''} onChange={event => update(hour.dayOfWeek, { openTime: event.target.value })} /></label>
              <label>Đóng <input type="time" lang="en-GB" disabled={hour.closed} value={hour.closeTime?.slice(0, 5) ?? ''} onChange={event => update(hour.dayOfWeek, { closeTime: event.target.value })} /></label>
            </div>
            {!hour.closed && <p className={`mt-2 text-xs ${invalid ? 'text-red-700' : 'text-gray-500'}`} role={invalid ? 'alert' : undefined}>
              {invalid
                ? `${names[hour.dayOfWeek]}: ${hour.openTime?.slice(0, 5) || 'chưa chọn giờ mở'} → ${hour.closeTime?.slice(0, 5) || 'chưa chọn giờ đóng'}. Giờ mở phải sớm hơn giờ đóng.`
                : `Giờ đã chọn: ${hour.openTime?.slice(0, 5)}–${hour.closeTime?.slice(0, 5)}`}
            </p>}
          </div>
        })}
        <div>
          <button disabled={!edited || mutation.save.isPending} onClick={() => void save()} className="rounded-lg bg-primary-action px-5 py-3 disabled:opacity-50">{mutation.save.isPending ? 'Đang lưu…' : 'Lưu giờ mở cửa'}</button>
          {hoursMessage && <p role="status" className="mt-2 text-sm text-brand-dark">{hoursMessage}</p>}
        </div>
      </div>}
    </section>

    <section className="border-t border-rose-100 pt-8">
      <h2 className="text-xl font-bold text-brand-dark">Ngày nghỉ đặc biệt</h2>
      <p className="mt-2 text-sm text-gray-600">Đánh dấu ngày salon tạm đóng cửa ngoài lịch hàng tuần.</p>
      <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-[1fr_2fr_auto]">
        <label className="text-sm">Ngày nghỉ<input type="date" value={date} onChange={event => setDate(event.target.value)} className="mt-1 block w-full rounded-lg border p-2" /></label>
        <label className="text-sm">Lý do<input maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="Ví dụ: nghỉ lễ" className="mt-1 block w-full rounded-lg border p-2" /></label>
        <button disabled={!date || mutation.close.isPending} onClick={() => void addClosure()} className="self-end rounded-lg bg-primary-action px-4 py-2 disabled:opacity-50">Thêm ngày nghỉ</button>
      </div>
      {closureMessage && <p role="status" className="mt-2 text-sm text-brand-dark">{closureMessage}</p>}
      {closures.isPending ? <p className="mt-4" role="status">Đang tải ngày nghỉ…</p> : closures.isError ? <p className="mt-4" role="alert">{apiError(closures.error)}</p> : <ul className="mt-4 space-y-2">
        {closures.data.map(closure => <li key={closure.id} className="flex items-center justify-between gap-4 rounded-xl bg-white p-4">
          <span><strong>{closure.date}</strong>{closure.reason && <span className="ml-2 text-sm text-gray-600">{closure.reason}</span>}</span>
          <button disabled={mutation.reopen.isPending} onClick={() => void removeClosure(closure.id)} className="text-sm font-semibold text-brand-dark underline">Mở lại</button>
        </li>)}
        {closures.data.length === 0 && <li className="py-3 text-sm text-gray-600">Chưa có ngày nghỉ đặc biệt.</li>}
      </ul>}
    </section>
  </main>
}
