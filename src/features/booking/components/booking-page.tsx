import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  User,
  Calendar,
  Sparkles,
  Phone,
  FileText,
  AlertCircle,
} from 'lucide-react'
import {
  useSalon,
  useSalonAvailability,
  useSalonClosures,
  useSalonEmployees,
  useSalonServices,
} from '@/features/salon/queries/salon.queries'
import { useAuthStore } from '@/store/auth.store'
import { useCreateBooking } from '../queries/booking.queries'
import type { BookingDraft } from '../types/booking.model'

const stepLabels = ['Chọn dịch vụ', 'Chuyên viên', 'Ngày & Giờ', 'Xác nhận']

const vietnamTime = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    time: `${value('hour')}:${value('minute')}`,
  }
}

export function BookingPage() {
  const [params] = useSearchParams()
  const salonId = params.get('salonId') ?? ''
  const preselected = params.get('serviceId') ?? ''
  const user = useAuthStore((state) => state.user)

  const salon = useSalon(salonId)
  const services = useSalonServices(salonId)
  const employees = useSalonEmployees(salonId)

  const [step, setStep] = useState(1)
  const [serviceId, setServiceId] = useState(preselected)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [customerNote, setCustomerNote] = useState('')
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<string | null>(null)

  const createBooking = useCreateBooking()
  const [earliest] = useState(() => vietnamTime(new Date(Date.now() + 60 * 60 * 1000)))

  const availability = useSalonAvailability(salonId, date, serviceId, employeeId)
  const closures = useSalonClosures(salonId, date, date)
  const chosen = services.data?.find((service) => service.id === serviceId)
  const chosenEmployee = employees.data?.find((emp) => emp.id === employeeId)
  const salonClosed = closures.data?.includes(date) ?? false

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!salonId || !serviceId || !date || !time || !phone.trim()) {
      setError('Vui lòng điền đầy đủ thông tin đặt lịch.')
      return
    }
    if (date < earliest.date || (date === earliest.date && time < earliest.time)) {
      setError('Vui lòng chọn thời gian hẹn sau thời điểm hiện tại ít nhất 1 giờ.')
      return
    }
    if (salonClosed || !availability.data?.some((slot) => slot.slice(0, 5) === time)) {
      setError('Khung giờ này hiện không còn trống. Vui lòng chọn khung giờ khác.')
      return
    }
    if (!user) {
      setError('Vui lòng đăng nhập để hoàn tất đặt lịch.')
      return
    }

    const draft: BookingDraft = {
      salonId,
      serviceId,
      employeeId,
      date,
      time,
      customerNote,
      customerPhone: phone,
    }

    try {
      const result = await createBooking.mutateAsync(draft)
      setReceipt(result.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo lịch hẹn. Vui lòng thử lại.')
    }
  }

  if (!salonId) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <AlertCircle size={36} className="mx-auto text-amber-500" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Chưa chọn salon</h1>
          <p className="mt-2 text-sm text-gray-500">
            Vui lòng chọn một salon trước khi bắt đầu tiến trình đặt hẹn.
          </p>
          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-xs"
          >
            <span>Khám phá salon</span>
          </Link>
        </div>
      </main>
    )
  }

  if (receipt) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 shadow-lg shadow-pink-950/5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check size={32} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">Đặt Lịch Thành Công!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Mã lịch hẹn: <span className="font-mono font-bold text-gray-900">#{receipt}</span>
          </p>

          <div className="my-6 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Salon:</span>
              <span className="font-semibold text-gray-900">{salon.data?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dịch vụ:</span>
              <span className="font-semibold text-gray-900">{chosen?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Thời gian:</span>
              <span className="font-semibold text-brand">
                {time} - {date}
              </span>
            </div>
            {chosenEmployee && (
              <div className="flex justify-between">
                <span className="text-gray-500">Chuyên viên:</span>
                <span className="font-semibold text-gray-900">{chosenEmployee.name}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Salon sẽ gửi thông báo xác nhận và chuẩn bị đón tiếp bạn chu đáo.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/setting/my-bookings"
              className="w-full sm:w-auto rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-dark"
            >
              Xem lịch hẹn của tôi
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto rounded-full border border-gray-200 px-6 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-28 pt-8 sm:px-6">
      {/* Top Bar with Navigation */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <Link
          to={`/salon/${salonId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Quay lại trang salon</span>
        </Link>
        <span className="text-xs font-semibold text-gray-900 truncate max-w-xs">
          {salon.data?.name ?? 'Đang tải thông tin salon...'}
        </span>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="my-8 flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const currentStepNumber = index + 1
          const isDone = step > currentStepNumber
          const isActive = step === currentStepNumber

          return (
            <div key={label} className="flex flex-1 flex-col items-center text-center">
              <div className="flex items-center w-full">
                {/* Connecting Line Left */}
                <div
                  className={`h-0.5 flex-1 ${
                    index === 0
                      ? 'invisible'
                      : isDone || isActive
                      ? 'bg-brand'
                      : 'bg-gray-200'
                  }`}
                />

                {/* Step Circle */}
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-brand text-white shadow-xs'
                      : isActive
                      ? 'border-2 border-brand bg-white text-brand ring-4 ring-rose-50'
                      : 'border border-gray-200 bg-white text-gray-400'
                  }`}
                >
                  {isDone ? <Check size={14} /> : currentStepNumber}
                </span>

                {/* Connecting Line Right */}
                <div
                  className={`h-0.5 flex-1 ${
                    index === stepLabels.length - 1
                      ? 'invisible'
                      : isDone
                      ? 'bg-brand'
                      : 'bg-gray-200'
                  }`}
                />
              </div>

              <span
                className={`mt-2 text-xs font-medium ${
                  isActive ? 'font-bold text-brand' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Main Step Container */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm shadow-pink-950/5">
        {/* Step 1: Chọn dịch vụ */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Bước 1 / 4
              </span>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                Chọn Dịch Vụ Làm Đẹp
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Lựa chọn dịch vụ bạn mong muốn trải nghiệm tại {salon.data?.name}.
              </p>
            </div>

            {services.isPending ? (
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-28 animate-pulse rounded-2xl bg-gray-50" />
                ))}
              </div>
            ) : services.isError ? (
              <p className="text-sm text-red-500">Không tải được dịch vụ.</p>
            ) : services.data.length > 0 ? (
              <div className="grid gap-3.5 sm:grid-cols-2 pt-2">
                {services.data.map((service) => {
                  const isSelected = serviceId === service.id
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setServiceId(service.id)}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all ${
                        isSelected
                          ? 'border-brand bg-rose-50/40 ring-1 ring-brand shadow-2xs'
                          : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{service.name}</h3>
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              isSelected
                                ? 'border-brand bg-brand text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>

                        {service.description && (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100/80 pt-3">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock3 size={12} />
                          <span>{service.durationMinutes} phút</span>
                        </span>
                        <span className="text-sm font-bold text-brand">
                          {service.price.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Salon hiện chưa có dịch vụ nào.</p>
            )}
          </div>
        )}

        {/* Step 2: Chọn Chuyên viên */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Bước 2 / 4
              </span>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                Chọn Kỹ Thuật Viên
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Bạn có thể chọn chuyên viên quen thuộc hoặc để salon tự động sắp xếp.
              </p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 pt-2">
              {/* Option: Any Employee */}
              <button
                type="button"
                onClick={() => setEmployeeId(null)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                  employeeId === null
                    ? 'border-brand bg-rose-50/40 ring-1 ring-brand shadow-2xs'
                    : 'border-gray-200 bg-white hover:border-pink-200'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Bất kỳ thợ nào</h3>
                  <p className="text-xs text-gray-500">Salon sắp xếp người có khung giờ phù hợp</p>
                </div>
              </button>

              {/* Employee List */}
              {employees.data?.map((emp) => {
                const isSelected = employeeId === emp.id
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => setEmployeeId(emp.id)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-brand bg-rose-50/40 ring-1 ring-brand shadow-2xs'
                        : 'border-gray-200 bg-white hover:border-pink-200'
                    }`}
                  >
                    <img
                      src={emp.avatarUrl ?? '/salon-placeholder.svg'}
                      alt={emp.name}
                      className="h-12 w-12 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{emp.name}</h3>
                      <p className="text-xs text-gray-500">Chuyên viên làm móng</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Chọn Ngày & Giờ */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Bước 3 / 4
              </span>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                Chọn Ngày & Giờ Hẹn
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Chọn ngày và khung giờ bạn muốn được phục vụ.
              </p>
            </div>

            {/* Date Selection */}
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Chọn ngày hẹn:
              </label>
              <div className="relative mt-2">
                <input
                  type="date"
                  value={date}
                  min={earliest.date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setTime('')
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs"
                />
              </div>
            </div>

            {/* Available Time Slots */}
            {date && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-brand" />
                  <h3 className="text-sm font-bold text-gray-900">Khung giờ còn trống:</h3>
                </div>

                {closures.isPending || availability.isPending ? (
                  <p className="py-4 text-xs text-gray-400">Đang kiểm tra khung giờ khả dụng...</p>
                ) : closures.isError || availability.isError ? (
                  <p className="py-4 text-xs text-red-500">Không tải được khung giờ.</p>
                ) : salonClosed ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                    Salon đóng cửa vào ngày này. Vui lòng chọn một ngày khác.
                  </div>
                ) : availability.data && availability.data.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                    {availability.data.map((slot) => {
                      const val = slot.slice(0, 5)
                      const isSelected = time === val
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTime(val)}
                          className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-brand bg-brand text-white shadow-xs'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-pink-200 hover:bg-rose-50/50 hover:text-brand'
                          }`}
                        >
                          {val}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="py-4 text-xs text-gray-500">
                    Không còn khung giờ trống trong ngày này. Vui lòng chọn ngày khác.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Xác nhận & Điền thông tin */}
        {step === 4 && (
          <form id="booking-confirm-form" onSubmit={submit}>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Bước 4 / 4
              </span>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                Kiểm Tra & Xác Nhận
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Vui lòng xác nhận lại thông tin trước khi hoàn tất đặt hẹn.
              </p>
            </div>

            {/* Summary Ticket */}
            <div className="rounded-2xl border border-pink-100 bg-rose-50/40 p-5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-pink-100">
                <span className="font-semibold text-gray-600">Salon:</span>
                <span className="font-bold text-gray-900 text-sm">{salon.data?.name}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Dịch vụ:</span>
                <span className="font-semibold text-gray-900">{chosen?.name}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Thời gian làm:</span>
                <span className="font-semibold text-gray-900">{chosen?.durationMinutes} phút</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Thời gian hẹn:</span>
                <span className="font-bold text-brand text-sm">
                  {time} — {date}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Chuyên viên:</span>
                <span className="font-semibold text-gray-900">
                  {chosenEmployee?.name ?? 'Bất kỳ chuyên viên nào'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-pink-100 text-sm">
                <span className="font-bold text-gray-900">Tổng thanh toán tại tiệm:</span>
                <span className="font-bold text-brand text-base">
                  {chosen?.price.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            {/* User Input Fields */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Phone size={13} className="text-brand" />
                  <span>Số điện thoại nhận tin nhắn xác nhận:</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <FileText size={13} className="text-brand" />
                  <span>Ghi chú cho salon (tùy chọn):</span>
                </label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Yêu cầu riêng về mẫu móng, đính đá, tháo móng cũ..."
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        )}

        {/* Step Navigation Controls */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft size={14} />
            <span>Quay lại</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              disabled={
                step === 1
                  ? !serviceId
                  : step === 3
                  ? !date ||
                    !time ||
                    closures.isPending ||
                    closures.isError ||
                    availability.isPending ||
                    availability.isError ||
                    salonClosed
                  : false
              }
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Tiếp tục</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              form="booking-confirm-form"
              type="submit"
              disabled={createBooking.isPending}
              className="flex items-center gap-1.5 rounded-full bg-brand px-7 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-40"
            >
              <Sparkles size={14} />
              <span>{createBooking.isPending ? 'Đang xác nhận...' : 'Xác nhận đặt lịch'}</span>
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
