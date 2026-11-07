import { useRef, useState, type FormEvent } from 'react'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Save,
  RotateCcw,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useOwnerSalon, useSaveOwnerSalon, useUploadOwnerImage } from '../queries/owner.queries'
import { apiError } from '@/lib/axios'
import { toast } from 'sonner'
import type { SaveSalon } from '../types/owner.model'

export function OwnerProfilePage() {
  const salon = useOwnerSalon()
  const save = useSaveOwnerSalon()
  const upload = useUploadOwnerImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [edited, setEdited] = useState<SaveSalon | null>(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  if (salon.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-pulse p-6">
        <div className="h-32 rounded-3xl bg-gray-100" />
        <div className="h-96 rounded-3xl bg-gray-100" />
      </div>
    )
  }

  if (salon.isError || !salon.data) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <h3 className="mt-3 text-sm font-bold text-red-900">Không tải được thông tin salon</h3>
          <p className="mt-1 text-xs text-red-600">Vui lòng kiểm tra lại quyền truy cập hoặc đăng nhập lại.</p>
        </div>
      </main>
    )
  }

  const d: SaveSalon = edited ?? {
    name: salon.data.name,
    description: salon.data.description,
    address: salon.data.address,
    city: salon.data.city,
    district: salon.data.district,
    phone: salon.data.phone,
    email: salon.data.email,
    logoUrl: salon.data.logoUrl,
  }

  const isDirty = edited !== null

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await upload.mutateAsync(file)
      setEdited({
        ...d,
        logoUrl: url,
      })
      toast.success('Đã tải ảnh đại diện salon lên! Hãy nhấn "Lưu thay đổi" để áp dụng.')
    } catch (err: unknown) {
      toast.error(apiError(err) || 'Không thể tải ảnh salon lên.')
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsError(false)
    try {
      await save.mutateAsync(d)
      setEdited(null)
      const successText = 'Đã cập nhật thông tin salon thành công.'
      setMessage(successText)
      toast.success(successText)
    } catch (err: unknown) {
      setIsError(true)
      const errorText = apiError(err)
      setMessage(errorText)
      toast.error(errorText)
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
          <Sparkles size={14} />
          <span>Quản lý cơ sở</span>
        </span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Hồ Sơ Salon
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Cập nhật thông tin nhận diện thương hiệu, địa chỉ và số điện thoại liên hệ để khách hàng tìm kiếm dễ dàng.
        </p>
      </div>

      {/* Overview Card with Photo Upload */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-xs shadow-pink-950/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Logo / Avatar with Upload button */}
          <div className="relative group shrink-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-gray-100 bg-slate-50 overflow-hidden shadow-xs">
              {d.logoUrl ? (
                <img
                  src={d.logoUrl}
                  alt={d.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 size={36} className="text-gray-300" />
              )}
            </div>
            <button
              type="button"
              disabled={upload.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-md hover:bg-brand-dark transition disabled:opacity-50"
              title="Tải ảnh đại diện salon"
            >
              {upload.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 truncate">{salon.data.name}</h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                {salon.data.status || 'ACTIVE'}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={13} className="shrink-0 text-gray-400" />
              <span className="truncate">{salon.data.address}, {salon.data.district}, {salon.data.city}</span>
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Bấm vào biểu tượng máy ảnh trên hình để chọn và tải lên ảnh đại diện / logo mới của salon.
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form
        onSubmit={submit}
        className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs shadow-pink-950/5 space-y-6"
      >
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-sm font-bold text-gray-900">Chi tiết thông tin salon</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Thông tin này sẽ được hiển thị công khai trên trang chi tiết salon dành cho khách hàng.
          </p>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-medium border ${
              isError
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {isError ? (
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            )}
            <div className="flex-1">{message}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Building2 size={14} className="text-gray-400" />
              <span>Tên Salon</span>
              <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              required
              value={d.name}
              onChange={(e) => setEdited({ ...d, name: e.target.value })}
              placeholder="Tên tiệm làm móng của bạn"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <FileText size={14} className="text-gray-400" />
              <span>Giới thiệu salon</span>
            </label>
            <textarea
              rows={3}
              value={d.description}
              onChange={(e) => setEdited({ ...d, description: e.target.value })}
              placeholder="Mô tả phong cách, không gian tiệm, dịch vụ nổi bật..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Phone size={14} className="text-gray-400" />
              <span>Số điện thoại hotline</span>
              <span className="text-brand">*</span>
            </label>
            <input
              type="tel"
              required
              value={d.phone}
              onChange={(e) => setEdited({ ...d, phone: e.target.value })}
              placeholder="0912 345 678"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Mail size={14} className="text-gray-400" />
              <span>Email liên hệ</span>
              <span className="text-brand">*</span>
            </label>
            <input
              type="email"
              required
              value={d.email}
              onChange={(e) => setEdited({ ...d, email: e.target.value })}
              placeholder="salon@example.com"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <MapPin size={14} className="text-gray-400" />
              <span>Địa chỉ cụ thể</span>
              <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              required
              value={d.address}
              onChange={(e) => setEdited({ ...d, address: e.target.value })}
              placeholder="Số nhà, tên đường, phường..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* District */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Quận / Huyện <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              required
              value={d.district}
              onChange={(e) => setEdited({ ...d, district: e.target.value })}
              placeholder="Quận 1, Hoàn Kiếm..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Tỉnh / Thành phố <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              required
              value={d.city}
              onChange={(e) => setEdited({ ...d, city: e.target.value })}
              placeholder="TP. Hồ Chí Minh, Hà Nội..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            disabled={!isDirty || save.isPending}
            onClick={() => setEdited(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <RotateCcw size={14} />
            <span>Khôi phục</span>
          </button>

          <button
            type="submit"
            disabled={!isDirty || save.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            <span>{save.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </form>
    </main>
  )
}
