import { useMemo, useState, type FormEvent } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  Scissors,
  User,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { apiError } from '@/lib/axios'
import { useConfirm } from '@/hooks/use-confirm'
import {
  useCreateWalkIn,
  useOwnerBookings,
  useOwnerEmployees,
  useOwnerSalon,
  useOwnerServices,
  useUpdateOwnerBooking,
} from '../queries/owner.queries'
import type { OwnerBooking } from '../types/owner.model'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Tên thứ tiếng Việt chuẩn
const VI_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

// Các khung giờ từ 8 SÁNG đến 9 TỐI
const TIME_SLOTS = [
  { hour: 8, label: '8 SÁNG' },
  { hour: 9, label: '9 SÁNG' },
  { hour: 10, label: '10 SÁNG' },
  { hour: 11, label: '11 SÁNG' },
  { hour: 12, label: '12 TRƯA' },
  { hour: 13, label: '1 CHIỀU' },
  { hour: 14, label: '2 CHIỀU' },
  { hour: 15, label: '3 CHIỀU' },
  { hour: 16, label: '4 CHIỀU' },
  { hour: 17, label: '5 CHIỀU' },
  { hour: 18, label: '6 CHIỀU' },
  { hour: 19, label: '7 TỐI' },
  { hour: 20, label: '8 TỐI' },
  { hour: 21, label: '9 TỐI' },
]

// Chiều cao một ô giờ (px)
const SLOT_HEIGHT = 88

function formatHeaderDate(d: Date): string {
  const dayName = VI_DAYS[d.getDay()]
  const day = d.getDate()
  const month = d.getMonth() + 1
  const year = d.getFullYear()
  return `${dayName}, ${day} tháng ${month}, ${year}`
}

function formatDateToYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseBookingDateTime(isoStr: string) {
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) {
    const [dPart, tPart] = isoStr.split('T')
    const [y, m, day] = (dPart || '').split('-').map(Number)
    const [h, min] = (tPart || '00:00').split(':').map(Number)
    return {
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      hour: h || 0,
      minute: min || 0,
    }
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return {
    dateStr: `${y}-${m}-${day}`,
    hour: d.getHours(),
    minute: d.getMinutes(),
  }
}

export function OwnerBookingsPage() {
  const { confirm } = useConfirm()
  const salon = useOwnerSalon()
  const employees = useOwnerEmployees()
  const services = useOwnerServices()
  const updateMutation = useUpdateOwnerBooking()
  const createWalkInMutation = useCreateWalkIn()

  // Chế độ xem: Ngày hoặc Tuần
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  // Ngày đang chọn
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  // Thu gọn / mở rộng mục lịch cần xử lý trong ngày
  const [showPendingAccordion, setShowPendingAccordion] = useState(true)

  // Modal chi tiết lịch hẹn
  const [selectedBooking, setSelectedBooking] = useState<OwnerBooking | null>(null)

  // Modal thêm khách vãng lai
  const [walkInOpen, setWalkInOpen] = useState(false)
  const [walkInName, setWalkInName] = useState('')
  const [walkInPhone, setWalkInPhone] = useState('')
  const [walkInServiceId, setWalkInServiceId] = useState('')
  const [walkInEmployeeId, setWalkInEmployeeId] = useState('')
  const [walkInTime, setWalkInTime] = useState('09:00')
  const [walkInNote, setWalkInNote] = useState('')

  // Lấy dữ liệu lịch hẹn
  const salonId = salon.data?.id ?? ''
  const bookingsQuery = useOwnerBookings(salonId, 0, undefined, {
    refetchInterval: 8000,
    enabled: !!salonId,
  })

  const allBookings = bookingsQuery.data?.content ?? []

  // Chuỗi YYYY-MM-DD của ngày đang chọn
  const selectedDateStr = formatDateToYMD(currentDate)

  // Điều hướng ngày: trước / sau / hôm nay
  const handlePrev = () => {
    const next = new Date(currentDate)
    if (viewMode === 'day') {
      next.setDate(next.getDate() - 1)
    } else {
      next.setDate(next.getDate() - 7)
    }
    setCurrentDate(next)
  }

  const handleNext = () => {
    const next = new Date(currentDate)
    if (viewMode === 'day') {
      next.setDate(next.getDate() + 1)
    } else {
      next.setDate(next.getDate() + 7)
    }
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Danh sách nhân viên hoạt động
  const activeEmployees = useMemo(() => {
    return employees.data?.filter((e) => e.active) ?? []
  }, [employees.data])

  // Cột nhân viên (ngày)
  const staffColumns = useMemo(() => {
    return [
      { id: 'unassigned', name: 'Chưa phân công', bio: '', avatarUrl: null as string | null },
      ...activeEmployees.map((e) => ({
        id: e.id,
        name: e.fullName,
        bio: e.bio || '',
        avatarUrl: e.avatarUrl,
      })),
    ]
  }, [activeEmployees])

  // Tính các ngày trong tuần (chế độ tuần)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate)
    const dayOfWeek = (curr.getDay() + 6) % 7 // T2 = 0, CN = 6
    const monday = new Date(curr)
    monday.setDate(curr.getDate() - dayOfWeek)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return {
        date: d,
        dateStr: formatDateToYMD(d),
        label: `${VI_DAYS[d.getDay()]}`,
        subLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        isToday: formatDateToYMD(d) === formatDateToYMD(new Date()),
      }
    })
  }, [currentDate])

  // Lọc lịch hẹn cần xử lý trong ngày (PENDING)
  const pendingBookingsInDay = useMemo(() => {
    return allBookings.filter((b) => {
      const { dateStr } = parseBookingDateTime(b.scheduledAt)
      if (viewMode === 'day') {
        return dateStr === selectedDateStr && b.status === 'PENDING'
      } else {
        const weekDateStrs = weekDays.map((w) => w.dateStr)
        return weekDateStrs.includes(dateStr) && b.status === 'PENDING'
      }
    })
  }, [allBookings, selectedDateStr, viewMode, weekDays])

  // Lọc tất cả lịch hẹn hiển thị trong ngày/tuần
  const displayedBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const { dateStr } = parseBookingDateTime(b.scheduledAt)
      if (viewMode === 'day') {
        return dateStr === selectedDateStr
      } else {
        const weekDateStrs = weekDays.map((w) => w.dateStr)
        return weekDateStrs.includes(dateStr)
      }
    })
  }, [allBookings, selectedDateStr, viewMode, weekDays])

  // Cập nhật trạng thái lịch hẹn
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      const ok = await confirm({
        title: 'Hủy lịch hẹn',
        description: 'Bạn có chắc chắn muốn hủy lịch hẹn này?',
        confirmText: 'Xác nhận hủy',
        variant: 'destructive',
      })
      if (!ok) return
    }

    try {
      await updateMutation.mutateAsync({ id, status: newStatus })
      toast.success(
        newStatus === 'CONFIRMED'
          ? 'Đã xác nhận lịch hẹn.'
          : newStatus === 'COMPLETED'
          ? 'Đã hoàn thành dịch vụ.'
          : newStatus === 'CANCELLED'
          ? 'Đã hủy lịch hẹn.'
          : 'Đã cập nhật trạng thái.'
      )
      setSelectedBooking(null)
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  // Thêm khách vãng lai
  const handleCreateWalkIn = async (e: FormEvent) => {
    e.preventDefault()
    if (!walkInServiceId) {
      toast.error('Vui lòng chọn dịch vụ.')
      return
    }
    if (!walkInName.trim() || !walkInPhone.trim()) {
      toast.error('Vui lòng nhập tên và số điện thoại khách hàng.')
      return
    }

    try {
      const scheduledAt = new Date(`${selectedDateStr}T${walkInTime}:00+07:00`).toISOString()
      await createWalkInMutation.mutateAsync({
        serviceId: walkInServiceId,
        ...(walkInEmployeeId ? { employeeId: walkInEmployeeId } : {}),
        scheduledAt,
        customerName: walkInName.trim(),
        customerPhone: walkInPhone.trim(),
        customerNote: walkInNote.trim(),
      })
      toast.success('Đã thêm khách vãng lai vào lịch hẹn.')
      setWalkInOpen(false)
      setWalkInName('')
      setWalkInPhone('')
      setWalkInNote('')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  return (
    <div className="space-y-5">
      {/* 1. Top Bar / Thanh công cụ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Nút chuyển đổi Ngày / Tuần */}
        <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-2xs self-start">
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`rounded-lg px-4 py-1.5 text-xs sm:text-sm font-bold transition-all ${
              viewMode === 'day'
                ? 'bg-rose-50/70 text-[#8C3A5A] shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Ngày
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`rounded-lg px-4 py-1.5 text-xs sm:text-sm font-bold transition-all ${
              viewMode === 'week'
                ? 'bg-rose-50/70 text-[#8C3A5A] shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Tuần
          </button>
        </div>

        {/* Cụm điều hướng ngày tháng */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 active:scale-95 transition"
            aria-label="Thời gian trước"
          >
            <ChevronLeft size={19} />
          </button>

          <span className="text-sm sm:text-base font-bold text-gray-900">
            {viewMode === 'day'
              ? formatHeaderDate(currentDate)
              : `${weekDays[0].subLabel} - ${weekDays[6].subLabel} / ${currentDate.getFullYear()}`}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 active:scale-95 transition"
            aria-label="Thời gian sau"
          >
            <ChevronRight size={19} />
          </button>

          {/* Hộp chọn ngày dạng MM/DD/YYYY kèm icon lịch */}
          <div className="relative">
            <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentDate(new Date(`${e.target.value}T00:00:00`))
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-gray-700 shadow-2xs hover:bg-gray-50">
              <span>
                {String(currentDate.getMonth() + 1).padStart(2, '0')}/
                {String(currentDate.getDate()).padStart(2, '0')}/{currentDate.getFullYear()}
              </span>
              <CalendarIcon size={14} className="text-gray-400" />
            </div>
          </div>

          {/* Nút Hôm nay */}
          <button
            type="button"
            onClick={handleToday}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition"
          >
            Hôm nay
          </button>
        </div>

        {/* Nút + Khách vãng lai */}
        <button
          type="button"
          onClick={() => setWalkInOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-[#8C3A5A] bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#8C3A5A] hover:bg-rose-50 shadow-2xs active:scale-95 transition self-start md:self-auto"
        >
          <UserPlus size={16} />
          <span>Khách vãng lai</span>
        </button>
      </div>

      {/* 2. Mục Lịch cần xử lý trong ngày (Accordion) */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
        <button
          type="button"
          onClick={() => setShowPendingAccordion((prev) => !prev)}
          className="flex items-center justify-between w-full text-left font-bold text-sm text-[#8C3A5A]"
        >
          <div className="flex items-center gap-2">
            {showPendingAccordion ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
            <span>
              Lịch cần xử lý trong {viewMode === 'day' ? 'ngày' : 'tuần'} (
              {pendingBookingsInDay.length})
            </span>
          </div>
          {pendingBookingsInDay.length > 0 && (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs text-brand font-semibold">
              Cần duyệt
            </span>
          )}
        </button>

        {showPendingAccordion && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {pendingBookingsInDay.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500">
                Không có lịch cần xử lý trong {viewMode === 'day' ? 'ngày này' : 'tuần này'}.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {pendingBookingsInDay.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-2xs hover:shadow-xs transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-gray-900 truncate">
                          {b.customerName || 'Khách đặt lịch'}
                        </span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                          Chờ duyệt
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600 font-medium truncate">
                        {b.serviceName}
                      </p>
                      <p className="text-[11px] text-brand font-semibold mt-0.5">
                        {b.scheduledAt.replace('T', ' ').slice(0, 16)} • {b.durationMinutes} phút
                      </p>
                      {b.customerPhone && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{b.customerPhone}</p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-amber-200/60 pt-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                        disabled={updateMutation.isPending}
                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                        disabled={updateMutation.isPending}
                        className="rounded-lg bg-brand px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-brand-dark"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Lưới Lịch Hẹn (Timetable Scheduler Grid) */}
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Header các cột (Nhân viên ở chế độ Ngày, hoặc Các thứ ở chế độ Tuần) */}
            <div className="grid border-b border-gray-200 bg-slate-50/50 sticky top-0 z-20"
              style={{
                gridTemplateColumns:
                  viewMode === 'day'
                    ? `80px repeat(${staffColumns.length}, minmax(180px, 1fr))`
                    : `80px repeat(7, minmax(140px, 1fr))`,
              }}
            >
              {/* Ô góc trên cùng bên trái */}
              <div className="border-r border-gray-100 p-3" />

              {viewMode === 'day'
                ? staffColumns.map((col) => (
                    <div
                      key={col.id}
                      className="border-r border-gray-100 p-3 text-center flex flex-col items-center justify-center"
                    >
                      {/* Avatar hình tròn */}
                      <div className="size-9 rounded-full bg-rose-100/70 border border-pink-200/60 flex items-center justify-center text-xs font-bold text-[#8C3A5A] mb-1.5 shadow-2xs">
                        {col.avatarUrl ? (
                          <img
                            src={col.avatarUrl}
                            alt={col.name}
                            className="size-full rounded-full object-cover"
                          />
                        ) : col.id === 'unassigned' ? (
                          <User size={16} className="text-[#8C3A5A]" />
                        ) : (
                          col.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                        {col.name}
                      </span>
                      {col.bio && (
                        <span className="text-[11px] text-gray-400 font-medium mt-0.5 line-clamp-1">
                          {col.bio}
                        </span>
                      )}
                    </div>
                  ))
                : weekDays.map((col) => (
                    <div
                      key={col.dateStr}
                      className={`border-r border-gray-100 p-3 text-center flex flex-col items-center justify-center ${
                        col.isToday ? 'bg-rose-50/50' : ''
                      }`}
                    >
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          col.isToday ? 'text-brand' : 'text-gray-900'
                        }`}
                      >
                        {col.label}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {col.subLabel}
                      </span>
                    </div>
                  ))}
            </div>

            {/* Thân bảng lịch theo các khung giờ */}
            <div className="relative" style={{ height: `${TIME_SLOTS.length * SLOT_HEIGHT}px` }}>
              {/* Lưới các đường kẻ ngang và nhãn giờ bên trái */}
              {TIME_SLOTS.map((slot, index) => (
                <div
                  key={slot.hour}
                  className="absolute inset-x-0 border-t border-gray-100 flex"
                  style={{ top: `${index * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}
                >
                  <div className="w-[80px] shrink-0 border-r border-gray-100 pr-3 pt-2 text-right text-[11px] font-semibold text-gray-400 select-none">
                    {slot.label}
                  </div>
                  {/* Các ô trống nền */}
                  <div
                    className="flex-1 grid"
                    style={{
                      gridTemplateColumns:
                        viewMode === 'day'
                          ? `repeat(${staffColumns.length}, minmax(180px, 1fr))`
                          : `repeat(7, minmax(140px, 1fr))`,
                    }}
                  >
                    {Array.from({
                      length: viewMode === 'day' ? staffColumns.length : 7,
                    }).map((_, i) => (
                      <div key={i} className="border-r border-gray-100/70 h-full" />
                    ))}
                  </div>
                </div>
              ))}

              {/* Các thẻ Lịch hẹn được định vị tuyệt đối theo khung giờ và cột */}
              <div
                className="absolute inset-y-0 left-[80px] right-0 grid pointer-events-none"
                style={{
                  gridTemplateColumns:
                    viewMode === 'day'
                      ? `repeat(${staffColumns.length}, minmax(180px, 1fr))`
                      : `repeat(7, minmax(140px, 1fr))`,
                }}
              >
                {viewMode === 'day'
                  ? staffColumns.map((col) => {
                      // Lọc các lịch hẹn thuộc cột này
                      const colBookings = displayedBookings.filter((b) => {
                        if (col.id === 'unassigned') {
                          return (
                            !b.employeeName ||
                            !activeEmployees.some(
                              (e) => e.fullName.toLowerCase() === b.employeeName.toLowerCase()
                            )
                          )
                        } else {
                          return (
                            b.employeeName &&
                            b.employeeName.toLowerCase() === col.name.toLowerCase()
                          )
                        }
                      })

                      return (
                        <div key={col.id} className="relative h-full pointer-events-auto">
                          {colBookings.map((b) => {
                            const { hour, minute } = parseBookingDateTime(b.scheduledAt)
                            const minutesFrom8 = (hour - 8) * 60 + minute
                            const top = Math.max(0, (minutesFrom8 / 60) * SLOT_HEIGHT)
                            const duration = b.durationMinutes || 45
                            const height = Math.max(42, (duration / 60) * SLOT_HEIGHT - 4)

                            const isPending = b.status === 'PENDING'
                            const isConfirmed = b.status === 'CONFIRMED'
                            const isCompleted = b.status === 'COMPLETED'

                            return (
                              <div
                                key={b.id}
                                onClick={() => setSelectedBooking(b)}
                                style={{ top: `${top}px`, height: `${height}px` }}
                                className={`absolute left-1.5 right-1.5 rounded-xl border p-2 text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md z-10 overflow-hidden flex flex-col justify-between ${
                                  isPending
                                    ? 'border-amber-300 bg-amber-50/95 text-amber-950 shadow-xs'
                                    : isConfirmed
                                    ? 'border-emerald-300 bg-emerald-50/95 text-emerald-950 shadow-xs'
                                    : isCompleted
                                    ? 'border-rose-200 bg-rose-50/95 text-rose-950 shadow-xs'
                                    : 'border-gray-200 bg-gray-100/90 text-gray-500 opacity-60'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-xs truncate">
                                      {b.customerName || 'Khách đặt'}
                                    </span>
                                    <span
                                      className={`text-[9px] font-extrabold uppercase px-1 rounded ${
                                        isPending
                                          ? 'bg-amber-200 text-amber-900'
                                          : isConfirmed
                                          ? 'bg-emerald-200 text-emerald-900'
                                          : isCompleted
                                          ? 'bg-rose-200 text-rose-900'
                                          : 'bg-gray-200 text-gray-700'
                                      }`}
                                    >
                                      {isPending
                                        ? 'Chờ duyệt'
                                        : isConfirmed
                                        ? 'Đã duyệt'
                                        : isCompleted
                                        ? 'Hoàn tất'
                                        : 'Đã hủy'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-medium text-gray-600 truncate mt-0.5">
                                    {b.serviceName}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 pt-0.5">
                                  <span>
                                    {String(hour).padStart(2, '0')}:
                                    {String(minute).padStart(2, '0')}
                                  </span>
                                  <span>
                                    {b.servicePrice
                                      ? `${Number(b.servicePrice).toLocaleString('vi-VN')} đ`
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })
                  : weekDays.map((w) => {
                      const dayBookings = displayedBookings.filter((b) => {
                        const { dateStr } = parseBookingDateTime(b.scheduledAt)
                        return dateStr === w.dateStr
                      })

                      return (
                        <div key={w.dateStr} className="relative h-full pointer-events-auto">
                          {dayBookings.map((b) => {
                            const { hour, minute } = parseBookingDateTime(b.scheduledAt)
                            const minutesFrom8 = (hour - 8) * 60 + minute
                            const top = Math.max(0, (minutesFrom8 / 60) * SLOT_HEIGHT)
                            const duration = b.durationMinutes || 45
                            const height = Math.max(42, (duration / 60) * SLOT_HEIGHT - 4)

                            const isPending = b.status === 'PENDING'
                            const isConfirmed = b.status === 'CONFIRMED'
                            const isCompleted = b.status === 'COMPLETED'

                            return (
                              <div
                                key={b.id}
                                onClick={() => setSelectedBooking(b)}
                                style={{ top: `${top}px`, height: `${height}px` }}
                                className={`absolute left-1.5 right-1.5 rounded-xl border p-2 text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md z-10 overflow-hidden flex flex-col justify-between ${
                                  isPending
                                    ? 'border-amber-300 bg-amber-50/95 text-amber-950 shadow-xs'
                                    : isConfirmed
                                    ? 'border-emerald-300 bg-emerald-50/95 text-emerald-950 shadow-xs'
                                    : isCompleted
                                    ? 'border-rose-200 bg-rose-50/95 text-rose-950 shadow-xs'
                                    : 'border-gray-200 bg-gray-100/90 text-gray-500 opacity-60'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-xs truncate">
                                      {b.customerName || 'Khách đặt'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-600 truncate mt-0.5">
                                    {b.serviceName}
                                  </p>
                                </div>
                                <div className="text-[10px] font-semibold text-gray-500">
                                  {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Modal Chi Tiết Lịch Hẹn */}
      <Dialog
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      >
        <DialogContent className="max-w-md">
          {selectedBooking && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg">Lịch hẹn #{selectedBooking.id}</DialogTitle>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      selectedBooking.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedBooking.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedBooking.status === 'COMPLETED'
                        ? 'bg-rose-100 text-brand'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedBooking.status === 'PENDING'
                      ? 'Chờ xác nhận'
                      : selectedBooking.status === 'CONFIRMED'
                      ? 'Đã xác nhận'
                      : selectedBooking.status === 'COMPLETED'
                      ? 'Đã hoàn thành'
                      : 'Đã hủy'}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-3 rounded-2xl bg-gray-50/70 p-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <User size={16} className="text-brand shrink-0" />
                  <span className="font-bold text-gray-900">{selectedBooking.customerName}</span>
                </div>

                {selectedBooking.customerPhone && (
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center gap-2.5">
                      <Phone size={16} className="text-gray-400 shrink-0" />
                      <span>{selectedBooking.customerPhone}</span>
                    </div>
                    <a
                      href={`tel:${selectedBooking.customerPhone}`}
                      className="text-xs font-semibold text-brand underline"
                    >
                      Gọi điện
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-gray-700">
                  <Scissors size={16} className="text-gray-400 shrink-0" />
                  <span>
                    {selectedBooking.serviceName} •{' '}
                    <strong className="text-gray-900">
                      {selectedBooking.servicePrice.toLocaleString('vi-VN')} ₫
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-gray-700">
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <span>
                    {selectedBooking.scheduledAt.replace('T', ' ').slice(0, 16)} (
                    {selectedBooking.durationMinutes} phút)
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-gray-700">
                  <User size={16} className="text-gray-400 shrink-0" />
                  <span>
                    Kỹ thuật viên:{' '}
                    <strong className="text-gray-900">
                      {selectedBooking.employeeName || 'Chưa phân công'}
                    </strong>
                  </span>
                </div>

                {selectedBooking.customerNote && (
                  <div className="border-t border-gray-200/60 pt-2 text-gray-600">
                    <span className="font-medium text-gray-500">Ghi chú của khách: </span>
                    {selectedBooking.customerNote}
                  </div>
                )}
              </div>

              {/* Nút hành động */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'CANCELLED')}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                      Hủy lịch
                    </button>
                    <button
                      type="button"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'CONFIRMED')}
                      className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-dark"
                    >
                      Xác nhận lịch hẹn
                    </button>
                  </>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <>
                    <button
                      type="button"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'CANCELLED')}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Hủy lịch
                    </button>
                    <button
                      type="button"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED')}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      Đánh dấu hoàn thành
                    </button>
                  </>
                )}

                {['COMPLETED', 'CANCELLED'].includes(selectedBooking.status) && (
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. Modal Thêm Khách Vãng Lai (+ Khách vãng lai) */}
      <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm lịch hẹn khách vãng lai</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateWalkIn} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Khách vãng lai"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm outline-none focus:border-brand shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0912345678"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm outline-none focus:border-brand shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dịch vụ trải nghiệm *
              </label>
              <select
                required
                value={walkInServiceId}
                onChange={(e) => setWalkInServiceId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm outline-none focus:border-brand shadow-2xs bg-white"
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.data
                  ?.filter((s) => s.active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} • {s.durationMinutes} phút •{' '}
                      {Number(s.price).toLocaleString('vi-VN')} ₫
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kỹ thuật viên
                </label>
                <select
                  value={walkInEmployeeId}
                  onChange={(e) => setWalkInEmployeeId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm outline-none focus:border-brand shadow-2xs bg-white"
                >
                  <option value="">Tự phân công nhân viên trống</option>
                  {activeEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Giờ hẹn ({selectedDateStr})
                </label>
                <select
                  value={walkInTime}
                  onChange={(e) => setWalkInTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm outline-none focus:border-brand shadow-2xs bg-white"
                >
                  {TIME_SLOTS.flatMap((s) => [
                    `${String(s.hour).padStart(2, '0')}:00`,
                    `${String(s.hour).padStart(2, '0')}:30`,
                  ]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ghi chú thêm
              </label>
              <textarea
                rows={2}
                value={walkInNote}
                onChange={(e) => setWalkInNote(e.target.value)}
                placeholder="Yêu cầu riêng của khách hàng..."
                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm outline-none focus:border-brand shadow-2xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setWalkInOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={createWalkInMutation.isPending}
                className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-dark disabled:opacity-50"
              >
                {createWalkInMutation.isPending ? 'Đang thêm…' : 'Thêm vào lịch hẹn'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
