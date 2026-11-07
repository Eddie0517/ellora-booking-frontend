import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  AlertCircle,
  Building2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { apiError, refreshSession } from '@/lib/axios'
import {
  useCreateRegistration,
  useRegistration,
} from '../queries/registration.queries'
import type { RegistrationDraft } from '../types/registration.model'

const formFields: Array<{
  key: keyof RegistrationDraft
  label: string
  type: string
  placeholder: string
  required: boolean
}> = [
  { key: 'name', label: 'Tên Salon / Tiệm làm móng', type: 'text', placeholder: 'Ví dụ: Ellora Beauty & Nails', required: true },
  { key: 'phone', label: 'Số điện thoại liên hệ', type: 'tel', placeholder: '0912 345 678', required: true },
  { key: 'email', label: 'Email liên hệ', type: 'email', placeholder: 'salon@example.com', required: true },
  { key: 'address', label: 'Địa chỉ cụ thể', type: 'text', placeholder: 'Số nhà, tên đường, phường...', required: true },
  { key: 'district', label: 'Quận / Huyện', type: 'text', placeholder: 'Quận 1', required: true },
  { key: 'city', label: 'Tỉnh / Thành phố', type: 'text', placeholder: 'TP. Hồ Chí Minh', required: true },
  { key: 'description', label: 'Giới thiệu về salon', type: 'text', placeholder: 'Chuyên về nail art Hàn Quốc, chăm sóc móng organic...', required: false },
]

const statusDescriptions: Record<string, { label: string; color: string; desc: string }> = {
  PENDING_APPROVAL: {
    label: 'Đang chờ xét duyệt',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: 'Hồ sơ đã được gửi thành công. Quản trị viên Ellora đang thẩm định và sẽ kích hoạt trong 24h.',
  },
  ACTIVE: {
    label: 'Đã phê duyệt thành công',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Chúc mừng bạn! Salon của bạn đã được kích hoạt trên hệ thống Ellora.',
  },
  REJECTED: {
    label: 'Hồ sơ bị từ chối',
    color: 'bg-red-50 text-red-700 border-red-200',
    desc: 'Thông tin đăng ký chưa đạt yêu cầu. Vui lòng liên hệ bộ phận hỗ trợ đối tác.',
  },
  SUSPENDED: {
    label: 'Tạm khóa',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    desc: 'Salon đang tạm ngưng hoạt động trên hệ thống.',
  },
}

export function BusinessRegistrationPage() {
  const user = useAuthStore((state) => state.user)
  const registration = useRegistration()
  const create = useCreateRegistration()

  const [draft, setDraft] = useState<RegistrationDraft>({
    name: '',
    address: '',
    city: '',
    district: '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    description: '',
  })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const roleRefreshAttempted = useRef(false)

  // Prefill phone and email if user profile is loaded or updated
  useEffect(() => {
    if (user) {
      setDraft((prev) => ({
        ...prev,
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

  useEffect(() => {
    if (
      registration.data?.status !== 'ACTIVE' ||
      user?.role === 'SALON_OWNER' ||
      roleRefreshAttempted.current
    )
      return
    roleRefreshAttempted.current = true
    void refreshSession().catch(() =>
      setError('Không thể cập nhật quyền chủ salon. Vui lòng đăng xuất và đăng nhập lại.')
    )
  }, [registration.data?.status, user?.role])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccessMsg('')
    try {
      await create.mutateAsync(draft)
      setSuccessMsg('Gửi hồ sơ đăng ký thành công! Đội ngũ quản trị viên Ellora đang xem xét hồ sơ của bạn.')
    } catch (err: unknown) {
      setError(apiError(err) || 'Không gửi được đăng ký. Vui lòng kiểm tra lại thông tin và thử lại.')
    }
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <Building2 size={36} className="mx-auto text-brand" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Đăng Ký Đối Tác Salon</h1>
          <p className="mt-2 text-sm text-gray-500">
            Bạn cần đăng nhập tài khoản trước khi gửi thông tin salon để được xét duyệt quyền chủ tiệm.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-dark"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
          <Sparkles size={14} />
          <span>Dành cho chủ salon</span>
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Đăng Ký Mở Salon Trên Ellora
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Điền thông tin cơ sở kinh doanh của bạn để đội ngũ xét duyệt và cấp quyền quản trị.
        </p>
      </div>

      {registration.isPending ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center">
          <RefreshCw size={24} className="mx-auto animate-spin text-brand" />
          <p className="mt-3 text-xs text-gray-500">Đang kiểm tra hồ sơ đăng ký của bạn...</p>
        </div>
      ) : registration.isSuccess && registration.data ? (
        /* Status Card */
        <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm shadow-pink-950/5">
          {successMsg && (
            <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-medium text-gray-400">Tên cơ sở</span>
              <h2 className="text-xl font-bold text-gray-900">{registration.data.name}</h2>
            </div>
            {statusDescriptions[registration.data.status] && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  statusDescriptions[registration.data.status].color
                }`}
              >
                {statusDescriptions[registration.data.status].label}
              </span>
            )}
          </div>

          <div className="mt-4 space-y-2 text-xs text-gray-600">
            <p>
              <strong className="text-gray-800">Địa chỉ:</strong> {registration.data.address},{' '}
              {registration.data.district}, {registration.data.city}
            </p>
            {registration.data.phone && (
              <p>
                <strong className="text-gray-800">Số điện thoại liên hệ:</strong> {registration.data.phone}
              </p>
            )}
          </div>

          {statusDescriptions[registration.data.status] && (
            <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
              {statusDescriptions[registration.data.status].desc}
            </p>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {registration.data.status === 'ACTIVE' && user.role === 'SALON_OWNER' && (
              <Link
                to="/owner/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-dark"
              >
                <span>Vào trang quản trị salon</span>
                <ArrowRight size={14} />
              </Link>
            )}

            <button
              type="button"
              onClick={() => registration.refetch()}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={13} />
              <span>Cập nhật trạng thái</span>
            </button>
          </div>
        </section>
      ) : (
        /* Registration Form */
        <form
          onSubmit={submit}
          className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm shadow-pink-950/5 space-y-5"
        >
          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {formFields.map((field) => (
              <div
                key={field.key}
                className={field.key === 'name' || field.key === 'description' || field.key === 'address' ? 'sm:col-span-2' : ''}
              >
                <label className="block text-xs font-semibold text-gray-700">
                  {field.label}
                  {field.required && <span className="text-brand ml-0.5">*</span>}
                </label>
                <input
                  type={field.type}
                  value={draft[field.key]}
                  placeholder={field.placeholder}
                  required={field.required}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-2xs placeholder:text-gray-400"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={create.isPending}
              className="flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              <span>{create.isPending ? 'Đang gửi hồ sơ...' : 'Gửi đăng ký xét duyệt'}</span>
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
