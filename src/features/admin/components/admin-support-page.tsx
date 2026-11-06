import { useState, type FormEvent } from 'react'
import { Mail, Phone, Globe, Save } from 'lucide-react'
import { useAdminSupport, useUpdateAdminSupport } from '../queries/admin.queries'
import type { SupportContact } from '../types/admin.model'

export function AdminSupportPage() {
  const support = useAdminSupport()
  const update = useUpdateAdminSupport()
  const [edited, setEdited] = useState<SupportContact | null>(null)
  const draft = edited ?? support.data ?? { email: '', phone: '', facebookUrl: '' }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await update.mutateAsync(draft)
      setEdited(null)
    } catch {}
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Thông tin hỗ trợ nền tảng
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Kênh liên hệ chính thức hiển thị cho chủ salon và đối tác khi cần trợ giúp kỹ thuật hoặc giải quyết khiếu nại
        </p>
      </div>

      {support.isPending ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-gray-400">
          Đang tải thông tin hỗ trợ…
        </div>
      ) : support.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Không tải được thông tin hỗ trợ. Vui lòng thử lại.
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Email hỗ trợ đối tác & người dùng
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={draft.email}
                onChange={(e) => setEdited({ ...draft, email: e.target.value })}
                maxLength={254}
                placeholder="hotro@ellora.vn"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium placeholder-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Số điện thoại hotline hỗ trợ
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                value={draft.phone}
                onChange={(e) => setEdited({ ...draft, phone: e.target.value })}
                maxLength={30}
                placeholder="1900 xxxx hoặc 09xx xxx xxx"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium placeholder-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Đường dẫn Facebook Fanpage hỗ trợ
            </label>
            <div className="relative">
              <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={draft.facebookUrl}
                onChange={(e) => setEdited({ ...draft, facebookUrl: e.target.value })}
                maxLength={500}
                placeholder="https://facebook.com/elloravietnam"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium placeholder-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="submit"
              disabled={update.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-sm shadow-pink-500/20 hover:bg-brand-hover active:scale-95 transition disabled:opacity-50"
            >
              <Save size={15} />
              <span>{update.isPending ? 'Đang lưu…' : 'Cập nhật thông tin hỗ trợ'}</span>
            </button>

            {update.isSuccess && (
              <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
                ✓ Đã cập nhật thành công!
              </span>
            )}
            {update.isError && (
              <span className="text-xs font-bold text-red-600 animate-in fade-in">
                Không thể lưu thay đổi. Vui lòng thử lại.
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
