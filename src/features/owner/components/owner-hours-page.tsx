import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { toast } from 'sonner'
import { apiError } from '@/lib/axios'
import { useClosures, useWorkingHours, useWorkingHoursMutations } from '../queries/owner.queries'
import type { WorkingHour } from '../types/owner.model'

// Ánh xạ tên thứ tiếng Việt
const DAY_MAP: Record<number, { key: string; name: string; lower: string }> = {
  1: { key: 'MONDAY', name: 'Thứ hai', lower: 'thứ hai' },
  2: { key: 'TUESDAY', name: 'Thứ ba', lower: 'thứ ba' },
  3: { key: 'WEDNESDAY', name: 'Thứ tư', lower: 'thứ tư' },
  4: { key: 'THURSDAY', name: 'Thứ năm', lower: 'thứ năm' },
  5: { key: 'FRIDAY', name: 'Thứ sáu', lower: 'thứ sáu' },
  6: { key: 'SATURDAY', name: 'Thứ bảy', lower: 'thứ bảy' },
  0: { key: 'SUNDAY', name: 'Chủ nhật', lower: 'chủ nhật' },
}

// Chuyển đổi giờ 24h sang 12h AM/PM
function formatTo12H(time24?: string | null): string {
  if (!time24) return '09:00 AM'
  const [hStr, mStr] = time24.slice(0, 5).split(':')
  let h = parseInt(hStr, 10)
  if (isNaN(h)) return '09:00 AM'
  const m = mStr || '00'
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  const formattedH = h < 10 ? `0${h}` : `${h}`
  return `${formattedH}:${m} ${ampm}`
}

// Danh sách mốc giờ 30 phút từ 06:00 đến 23:30
const TIME_OPTIONS = (() => {
  const options: { value: string; label: string }[] = []
  for (let hour = 6; hour <= 23; hour++) {
    for (const minute of [0, 30]) {
      const hh = hour < 10 ? `0${hour}` : `${hour}`
      const mm = minute === 0 ? '00' : '30'
      const val = `${hh}:${mm}`
      options.push({ value: val, label: formatTo12H(val) })
    }
  }
  return options
})()

export function OwnerHoursPage() {
  const hours = useWorkingHours()
  const closures = useClosures()
  const mutation = useWorkingHoursMutations()

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [viewDate, setViewDate] = useState<Date>(() => new Date())

  // Bản nháp chỉnh sửa giờ mở cửa hàng tuần
  const [draftHours, setDraftHours] = useState<WorkingHour[] | null>(null)
  const currentHours = draftHours ?? hours.data ?? []

  // Thông tin ngày đang chọn
  const selectedYear = selectedDate.getFullYear()
  const selectedMonth = selectedDate.getMonth() + 1
  const selectedDay = selectedDate.getDate()
  const selectedDayOfWeek = selectedDate.getDay()
  const dayInfo = DAY_MAP[selectedDayOfWeek]

  // Chuỗi định dạng YYYY-MM-DD của ngày đang chọn
  const selectedDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
  const selectedDateDisplay = `${String(selectedDay).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${selectedYear}`

  // Cấu hình giờ cho thứ tương ứng
  const currentDayWorkingHour = useMemo(() => {
    return (
      currentHours.find((h) => h.dayOfWeek === dayInfo.key) ?? {
        dayOfWeek: dayInfo.key,
        openTime: '09:00',
        closeTime: '18:00',
        closed: false,
      }
    )
  }, [currentHours, dayInfo.key])

  // Kiểm tra ngày này có phải ngày nghỉ đột xuất không
  const activeClosure = useMemo(() => {
    if (!closures.data) return null
    return closures.data.find((c) => c.date === selectedDateStr) ?? null
  }, [closures.data, selectedDateStr])

  // Cập nhật giờ trong bản nháp
  const handleUpdateCurrentDayHour = (patch: Partial<WorkingHour>) => {
    const next = currentHours.map((h) => {
      if (h.dayOfWeek === dayInfo.key) {
        return { ...h, ...patch }
      }
      return h
    })
    setDraftHours(next)
  }

  // Lưu giờ làm việc theo thứ
  const handleSaveWeeklyHours = async () => {
    if (
      !currentDayWorkingHour.closed &&
      currentDayWorkingHour.openTime &&
      currentDayWorkingHour.closeTime &&
      currentDayWorkingHour.openTime >= currentDayWorkingHour.closeTime
    ) {
      toast.error('Giờ mở cửa phải sớm hơn giờ đóng cửa trong cùng ngày.')
      return
    }

    try {
      await mutation.save.mutateAsync(currentHours)
      setDraftHours(null)
      toast.success(`Đã lưu giờ mở cửa cho ${dayInfo.lower} thành công.`)
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  // Bật/tắt ngày nghỉ riêng cho ngày đang chọn
  const handleToggleSpecialClosure = async () => {
    try {
      if (activeClosure) {
        // Đang là ngày nghỉ riêng -> Bỏ ngày nghỉ riêng
        await mutation.reopen.mutateAsync(activeClosure.id)
        toast.success(`Đã bỏ ngày nghỉ riêng cho ngày ${selectedDateDisplay}.`)
      } else {
        // Đặt ngày nghỉ riêng
        await mutation.close.mutateAsync({
          date: selectedDateStr,
          reason: 'Nghỉ đột xuất',
        })
        toast.success(`Đã đặt ngày nghỉ riêng cho ngày ${selectedDateDisplay}.`)
      }
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  // Logic tạo lịch tháng
  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth() // 0 - 11

  const calendarDays = useMemo(() => {
    // Ngày đầu tiên của tháng
    const firstDay = new Date(viewYear, viewMonth, 1)
    // Ngày trong tuần của ngày 1 (T2 = 0, T3 = 1, ..., CN = 6)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7
    // Tổng số ngày trong tháng
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    // Tổng số ngày trong tháng trước
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const days: {
      date: Date
      dateStr: string
      dayNum: number
      isCurrentMonth: boolean
      isSunday: boolean
    }[] = []

    // Các ngày thuộc tháng trước tràn qua
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i)
      const y = prevDate.getFullYear()
      const m = String(prevDate.getMonth() + 1).padStart(2, '0')
      const d = String(prevDate.getDate()).padStart(2, '0')
      days.push({
        date: prevDate,
        dateStr: `${y}-${m}-${d}`,
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
        isSunday: prevDate.getDay() === 0,
      })
    }

    // Các ngày trong tháng hiện tại
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(viewYear, viewMonth, d)
      const y = thisDate.getFullYear()
      const m = String(thisDate.getMonth() + 1).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      days.push({
        date: thisDate,
        dateStr: `${y}-${m}-${dayStr}`,
        dayNum: d,
        isCurrentMonth: true,
        isSunday: thisDate.getDay() === 0,
      })
    }

    // Các ngày thuộc tháng tiếp theo tràn vào cho đủ hàng (bội số 7)
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d)
      const y = nextDate.getFullYear()
      const m = String(nextDate.getMonth() + 1).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      days.push({
        date: nextDate,
        dateStr: `${y}-${m}-${dayStr}`,
        dayNum: d,
        isCurrentMonth: false,
        isSunday: nextDate.getDay() === 0,
      })
    }

    return days
  }, [viewYear, viewMonth])

  // Điều hướng tháng trước / sau
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1))
  }
  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1))
  }

  // Tra cứu trạng thái nghỉ hằng tuần của một ngày
  const isWeeklyDayOff = (d: Date) => {
    const dow = d.getDay()
    const info = DAY_MAP[dow]
    const cfg = currentHours.find((h) => h.dayOfWeek === info?.key)
    return Boolean(cfg?.closed)
  }

  // Tra cứu ngày nghỉ đột xuất
  const closureDateSet = useMemo(() => {
    if (!closures.data) return new Set<string>()
    return new Set(closures.data.map((c) => c.date))
  }, [closures.data])

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 font-serif">
          Giờ mở cửa &amp; ngày nghỉ
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
          Chọn ngày trên lịch để chỉnh giờ theo thứ hoặc đặt ngày nghỉ riêng. Giờ Việt Nam · mốc 30 phút.
        </p>
      </div>

      {/* Khung nội dung chính */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] xl:grid-cols-[360px_1fr] gap-8 xl:gap-12 items-start">
          {/* Cột trái: Bộ chọn lịch tương tác */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200/80 p-4 sm:p-5 bg-white shadow-2xs">
              {/* Header tháng và nút điều hướng */}
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-bold text-gray-900">
                  Tháng {viewMonth + 1} Năm {viewYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition"
                    aria-label="Tháng trước"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition"
                    aria-label="Tháng sau"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Hàng tên các thứ trong tuần (T2 -> CN) */}
              <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-semibold text-gray-400">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>

              {/* Lưới các ngày trong tháng */}
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center items-center justify-items-center pt-1">
                {calendarDays.map((item) => {
                  const isSelected = item.dateStr === selectedDateStr
                  const weeklyOff = isWeeklyDayOff(item.date)
                  const specialOff = closureDateSet.has(item.dateStr)

                  return (
                    <div key={item.dateStr} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(item.date)}
                        className={`size-8 sm:size-9 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#8C3A5A] text-white font-bold shadow-xs scale-105'
                            : !item.isCurrentMonth
                            ? 'text-gray-300 hover:bg-gray-50'
                            : item.isSunday
                            ? 'bg-gray-100/90 text-gray-700 hover:bg-gray-200/70'
                            : 'text-gray-800 hover:bg-rose-50/60'
                        }`}
                      >
                        {item.dayNum}
                      </button>

                      {/* Dấu chấm trạng thái ngày nghỉ bên dưới */}
                      <div className="h-1.5 flex items-center justify-center gap-0.5 mt-0.5">
                        {specialOff ? (
                          <span
                            className="size-1.5 rounded-full bg-[#E11D48]"
                            title="Nghỉ đột xuất"
                          />
                        ) : weeklyOff ? (
                          <span
                            className="size-1.5 rounded-full bg-gray-400"
                            title="Nghỉ hằng tuần"
                          />
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Chú thích các chấm trạng thái */}
              <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center gap-4 text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-gray-400" />
                  <span>Nghỉ hằng tuần</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#E11D48]" />
                  <span>Nghỉ đột xuất</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed pl-1">
              Ngày nghỉ mới cần được chọn trước ít nhất một ngày.
            </p>
          </div>

          {/* Cột phải: Cấu hình chi tiết cho ngày đang chọn */}
          <div className="space-y-6 lg:pl-2">
            {/* Tiêu đề ngày đang chọn (Thứ tư · 11/11/2026) */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#8C3A5A]">
                {dayInfo.name} · {selectedDateDisplay}
              </h2>
            </div>

            {/* Mục 1: Giờ mở cửa theo thứ */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Giờ mở cửa {dayInfo.lower}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Áp dụng cho mọi {dayInfo.lower} hằng tuần.
                </p>
              </div>

              {/* Checkbox nghỉ vào thứ này hằng tuần */}
              <label className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(currentDayWorkingHour.closed)}
                  onChange={(e) =>
                    handleUpdateCurrentDayHour({
                      closed: e.target.checked,
                      ...(!e.target.checked
                        ? {
                            openTime: currentDayWorkingHour.openTime ?? '09:00',
                            closeTime: currentDayWorkingHour.closeTime ?? '18:00',
                          }
                        : {}),
                    })
                  }
                  className="size-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                />
                <span>Nghỉ vào thứ này hằng tuần</span>
              </label>

              {/* Khung chọn Giờ mở & Giờ đóng mốc 30 phút */}
              <div className="flex items-center gap-3 max-w-md pt-1">
                {/* Giờ mở */}
                <div className="flex-1 space-y-1.5">
                  <span className="block text-xs font-semibold text-gray-700">Giờ mở</span>
                  <div className="relative">
                    <select
                      disabled={Boolean(currentDayWorkingHour.closed)}
                      value={currentDayWorkingHour.openTime?.slice(0, 5) ?? '09:00'}
                      onChange={(e) => handleUpdateCurrentDayHour({ openTime: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs sm:text-sm text-gray-900 shadow-2xs outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <Clock3
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                  </div>
                </div>

                {/* Dấu gạch ngang phân cách */}
                <div className="pt-6 text-gray-400 font-bold">—</div>

                {/* Giờ đóng */}
                <div className="flex-1 space-y-1.5">
                  <span className="block text-xs font-semibold text-gray-700">Giờ đóng</span>
                  <div className="relative">
                    <select
                      disabled={Boolean(currentDayWorkingHour.closed)}
                      value={currentDayWorkingHour.closeTime?.slice(0, 5) ?? '18:00'}
                      onChange={(e) => handleUpdateCurrentDayHour({ closeTime: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs sm:text-sm text-gray-900 shadow-2xs outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <Clock3
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Nút Lưu giờ theo thứ */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={mutation.save.isPending}
                  onClick={() => void handleSaveWeeklyHours()}
                  className="rounded-xl bg-[#F8A5B6] hover:bg-[#f692a5] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition active:scale-95 disabled:opacity-50"
                >
                  {mutation.save.isPending ? 'Đang lưu…' : 'Lưu giờ theo thứ'}
                </button>
              </div>
            </div>

            {/* Đường kẻ ngang phân cách */}
            <div className="border-t border-gray-100 my-6" />

            {/* Mục 2: Ngày nghỉ riêng biệt cho ngày đang chọn */}
            <div className="space-y-3.5">
              <label className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(activeClosure)}
                  onChange={() => void handleToggleSpecialClosure()}
                  disabled={mutation.close.isPending || mutation.reopen.isPending}
                  className="size-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                />
                <span className="font-medium">Nghỉ riêng ngày {selectedDateDisplay}</span>
              </label>

              <p className="text-xs text-gray-500 leading-relaxed">
                {activeClosure
                  ? `Đang đặt nghỉ riêng vào ngày ${selectedDateDisplay}. Bỏ ngày nghỉ không tự khôi phục các lịch đã hủy.`
                  : 'Ngày này dùng giờ hằng tuần. Bỏ ngày nghỉ không tự khôi phục các lịch đã hủy.'}
              </p>

              {/* Nút hành động cho ngày nghỉ riêng */}
              <div className="pt-1">
                {activeClosure ? (
                  <button
                    type="button"
                    disabled={mutation.reopen.isPending}
                    onClick={() => void handleToggleSpecialClosure()}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition active:scale-95 disabled:opacity-50"
                  >
                    {mutation.reopen.isPending ? 'Đang bỏ…' : 'Bỏ ngày nghỉ riêng'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={mutation.close.isPending}
                    onClick={() => void handleToggleSpecialClosure()}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition active:scale-95 disabled:opacity-50"
                  >
                    {mutation.close.isPending ? 'Đang đặt…' : 'Đặt ngày nghỉ riêng'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
