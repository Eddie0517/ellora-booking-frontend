import { useState, useRef } from 'react'
import {
    Trash2,
  Sparkles,
  RefreshCw,
  Camera,
  Layers,
    CheckCircle,
} from 'lucide-react'
import {
  useOwnerEmployees,
  useOwnerPhotoMutations,
  useOwnerSalon,
  useOwnerServices,
} from '../queries/owner.queries'
import { useConfirm } from '@/hooks/use-confirm'

const SHOWCASE_SLOTS = [
  {
    index: 0,
    title: 'Ảnh chính tiệm (Hero lớn)',
    subtitle: 'Mặt tiền hoặc không gian tổng quan chính',
    defaultPlaceholder:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
  },
  {
    index: 1,
    title: 'Vị trí 2: Góc làm móng',
    subtitle: 'Bàn nail nghệ thuật & mẫu móng',
    defaultPlaceholder:
      'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
  },
  {
    index: 2,
    title: 'Vị trí 3: Chăm sóc tóc & Spa',
    subtitle: 'Ghế tạo kiểu / Khu gội đầu',
    defaultPlaceholder:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  },
  {
    index: 3,
    title: 'Vị trí 4: Giường dưỡng sinh',
    subtitle: 'Không gian thư giãn trị liệu',
    defaultPlaceholder:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  },
  {
    index: 4,
    title: 'Vị trí 5: Góc đón tiếp & Mỹ phẩm',
    subtitle: 'Quầy lễ tân / Sản phẩm chăm sóc',
    defaultPlaceholder:
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
  },
]

function BentoSlotCard({
  slot,
  customUrl,
  isHero,
}: {
  slot: (typeof SHOWCASE_SLOTS)[0]
  customUrl: string | null | undefined
  isHero?: boolean
}) {
  const { confirm } = useConfirm()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mutations = useOwnerPhotoMutations()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const activeImage = customUrl || slot.defaultPlaceholder
  const isCustom = Boolean(customUrl)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setMessage('Vui lòng chọn định dạng JPG hoặc PNG.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Dung lượng ảnh tối đa 5 MB.')
      return
    }

    try {
      setUploading(true)
      setMessage('')
      await mutations.uploadShowcaseSlot.mutateAsync({ slotIndex: slot.index, file })
      setMessage('Đã cập nhật ảnh vị trí này thành công!')
    } catch {
      setMessage('Không thể tải ảnh lên. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    const ok = await confirm({
      title: 'Xóa ảnh vị trí này',
      description: `Khôi phục vị trí "${slot.title}" về ảnh mẫu mặc định chất lượng cao?`,
      confirmText: 'Xóa ảnh',
      variant: 'destructive',
    })
    if (!ok) return

    try {
      setUploading(true)
      await mutations.removeShowcaseSlot.mutateAsync(slot.index)
      setMessage('Đã xóa ảnh tùy chỉnh.')
    } catch {
      setMessage('Không thể xóa ảnh.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md ${
        isHero ? 'md:col-span-2 md:row-span-2 min-h-[300px]' : 'min-h-[170px]'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        disabled={uploading}
        onChange={handleFileChange}
        className="hidden"
      />

      <img
        src={activeImage}
        alt={slot.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity" />

      {/* Badges & Meta */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md ${
            isCustom
              ? 'bg-emerald-500/90 text-white'
              : 'bg-black/50 text-white/90 border border-white/20'
          }`}
        >
          {isCustom ? <CheckCircle size={12} /> : <Sparkles size={12} />}
          {isCustom ? 'Ảnh tiệm đã tải' : 'Ảnh mẫu gợi ý'}
        </span>

        {uploading && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/90 px-2 py-0.5 text-[11px] font-bold text-white animate-pulse">
            <RefreshCw size={12} className="animate-spin" /> Đang tải…
          </span>
        )}
      </div>

      {/* Bottom Content & Actions */}
      <div className="absolute bottom-3 left-3 right-3 space-y-1.5 text-white">
        <h3 className="font-bold text-xs sm:text-sm drop-shadow-sm">{slot.title}</h3>
        <p className="text-[11px] text-white/80 line-clamp-1">{slot.subtitle}</p>

        {message && (
          <p className="text-[10px] font-semibold text-amber-200 bg-black/60 rounded px-1.5 py-0.5">
            {message}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-gray-900 shadow-xs hover:bg-white active:scale-95 transition"
          >
            <Camera size={13} className="text-brand" />
            <span>{isCustom ? 'Đổi ảnh' : 'Tải ảnh lên'}</span>
          </button>

          {isCustom && (
            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="inline-flex items-center gap-1 rounded-lg bg-red-600/90 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 active:scale-95 transition"
              title="Xóa và khôi phục ảnh mặc định"
            >
              <Trash2 size={13} />
              <span>Xóa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function BentoShowcaseStudio({ imageUrls }: { imageUrls: string[] }) {
  return (
    <section className="rounded-3xl border border-pink-100 bg-gradient-to-br from-rose-50/40 via-white to-pink-50/20 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-3 py-1 text-xs font-bold text-brand mb-2">
            <Layers size={13} />
            <span>Studio thiết kế khung Bento Showcase</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Khung ảnh 5 vị trí trên trang chi tiết Salon
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Tùy biến từng ô ảnh để hiển thị không gian, dịch vụ nổi bật của salon đến khách hàng.
            Mỗi vị trí có thể tải ảnh riêng biệt thay vì lặp lại ảnh đại diện.
          </p>
        </div>
      </div>

      {/* Exact Bento 5-slot grid representation */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-auto md:h-[480px]">
        {/* Slot 0: Hero (2 cols, 2 rows) */}
        <BentoSlotCard
          slot={SHOWCASE_SLOTS[0]}
          customUrl={imageUrls[0]}
          isHero
        />

        {/* Slots 1, 2, 3, 4 */}
        {[1, 2, 3, 4].map((idx) => (
          <BentoSlotCard
            key={idx}
            slot={SHOWCASE_SLOTS[idx]}
            customUrl={imageUrls[idx]}
          />
        ))}
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-gray-600 flex items-start gap-2.5">
        <Sparkles size={16} className="text-brand shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900 font-semibold">Mẹo trình bày:</strong> Chọn ảnh ngang có ánh sáng tự nhiên và độ sắc nét cao. Ảnh tải lên sẽ được hiển thị ngay lập tức trên trang công khai của tiệm bạn.
        </div>
      </div>
    </section>
  )
}

type Kind = 'cover' | 'services' | 'employees'
function PhotoEditor({
  kind,
  id,
  imageUrl,
  label,
}: {
  kind: Kind
  id: string
  imageUrl: string | null
  label: string
}) {
  const { confirm } = useConfirm()
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const mutations = useOwnerPhotoMutations()
  const busy = mutations.upload.isPending || mutations.remove.isPending

  const upload = async () => {
    if (!file) return
    try {
      await mutations.upload.mutateAsync({ kind, id, file })
      setFile(null)
      setMessage('Đã lưu ảnh đại diện thành công.')
    } catch {
      setMessage('Không tải được ảnh lên.')
    }
  }

  const remove = async () => {
    const ok = await confirm({
      title: 'Xóa ảnh',
      description: 'Bạn có chắc chắn muốn xóa ảnh này?',
      confirmText: 'Xóa ảnh',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      await mutations.remove.mutateAsync({ kind, id })
      setMessage('Đã xóa ảnh.')
    } catch {
      setMessage('Không xóa được ảnh.')
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className={`mb-4 object-cover ${
            kind === 'employees' ? 'h-28 w-28 rounded-full mx-auto' : 'aspect-[4/3] w-full rounded-xl'
          }`}
        />
      ) : (
        <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-50 text-xs text-gray-400">
          Chưa có ảnh
        </div>
      )}
      <h3 className="font-bold text-sm text-gray-900">{label}</h3>
      <label className="mt-3 block text-xs text-gray-500">
        Chọn ảnh JPG/PNG (tối đa 5 MB)
        <input
          type="file"
          accept="image/jpeg,image/png"
          disabled={busy}
          onChange={(event) => {
            const chosen = event.target.files?.[0]
            setFile(
              chosen &&
                ['image/jpeg', 'image/png'].includes(chosen.type) &&
                chosen.size <= 5 * 1024 * 1024
                ? chosen
                : null
            )
            setMessage(
              chosen &&
                (chosen.size > 5 * 1024 * 1024 ||
                  !['image/jpeg', 'image/png'].includes(chosen.type))
                ? 'Chỉ nhận ảnh JPG/PNG tối đa 5 MB.'
                : ''
            )
            event.target.value = ''
          }}
          className="mt-2 block max-w-full text-xs"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        {file && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void upload()}
            className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-hover transition"
          >
            Lưu ảnh
          </button>
        )}
        {imageUrl && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void remove()}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            Xóa ảnh
          </button>
        )}
      </div>
      {message && <p role="status" className="mt-2.5 text-xs font-medium text-brand">{message}</p>}
    </article>
  )
}

function GalleryEditor({ id, urls }: { id: string; urls: string[] }) {
  const { confirm } = useConfirm()
  const [files, setFiles] = useState<File[]>([])
  const [message, setMessage] = useState('')
  const mutations = useOwnerPhotoMutations()
  const busy = mutations.uploadGallery.isPending || mutations.removeGallery.isPending

  const upload = async () => {
    try {
      await mutations.uploadGallery.mutateAsync({ id, files })
      setFiles([])
      setMessage('Đã thêm ảnh vào thư viện.')
    } catch {
      setMessage('Không tải được ảnh lên.')
    }
  }

  const remove = async (url: string) => {
    const ok = await confirm({
      title: 'Xóa ảnh thư viện',
      description: 'Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện tiệm?',
      confirmText: 'Xóa ảnh',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      await mutations.removeGallery.mutateAsync(url)
      setMessage('Đã xóa ảnh thư viện.')
    } catch {
      setMessage('Không xóa được ảnh.')
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Thư viện ảnh tiệm (Gallery)</h2>
        <p className="mt-1 text-xs text-gray-500">
          {urls.length} / 10 ảnh. Chọn nhiều ảnh cùng lúc; mỗi ảnh JPG/PNG tối đa 5 MB.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {urls.map((url) => (
          <div key={url} className="group relative overflow-hidden rounded-xl border border-slate-200 p-2">
            <img
              src={url}
              alt="Ảnh thư viện salon"
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => void remove(url)}
              disabled={busy}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition"
            >
              <Trash2 size={13} />
              <span>Xóa ảnh</span>
            </button>
          </div>
        ))}
      </div>

      {urls.length < 10 && (
        <div className="pt-2">
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            disabled={busy}
            onChange={(event) => {
              const picked = Array.from(event.target.files ?? [])
              setFiles(
                picked.length <= 10 - urls.length &&
                  picked.every(
                    (file) =>
                      ['image/jpeg', 'image/png'].includes(file.type) &&
                      file.size <= 5 * 1024 * 1024
                  )
                  ? picked
                  : []
              )
              setMessage(
                picked.length > 10 - urls.length ||
                  picked.some(
                    (file) =>
                      file.size > 5 * 1024 * 1024 ||
                      !['image/jpeg', 'image/png'].includes(file.type)
                  )
                  ? 'Vượt quá 10 ảnh hoặc ảnh không đúng định dạng/kích thước.'
                  : ''
              )
              event.target.value = ''
            }}
            className="text-xs"
          />
          {files.length > 0 && (
            <button
              type="button"
              onClick={() => void upload()}
              disabled={busy}
              className="mt-3 block rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-hover transition"
            >
              Tải lên {files.length} ảnh
            </button>
          )}
        </div>
      )}
      {message && <p role="status" className="text-xs font-semibold text-brand">{message}</p>}
    </section>
  )
}

export function OwnerPhotosPage() {
  const salon = useOwnerSalon()
  const services = useOwnerServices()
  const employees = useOwnerEmployees()

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 py-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Quản lý hình ảnh salon
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Thiết kế khung ảnh Bento 5 vị trí, ảnh đại diện thương hiệu, thư viện và ảnh dịch vụ/nhân viên.
        </p>
      </header>

      {salon.isPending || services.isPending || employees.isPending ? (
        <div className="py-12 text-center text-sm text-gray-400">Đang tải dữ liệu hình ảnh…</div>
      ) : salon.isError || services.isError || employees.isError ? (
        <div className="py-12 text-center text-sm text-rose-600">Không tải được dữ liệu ảnh.</div>
      ) : (
        <>
          {/* 1. Bento Showcase Studio (5 Slots) */}
          <BentoShowcaseStudio imageUrls={salon.data.imageUrls || []} />

          {/* 2. Brand Avatar / Logo */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Ảnh đại diện & Logo thương hiệu</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <PhotoEditor
                kind="cover"
                id={salon.data.id}
                imageUrl={salon.data.logoUrl}
                label="Logo / Avatar đại diện salon"
              />
            </div>
          </section>

          {/* 3. General Gallery */}
          <GalleryEditor id={salon.data.id} urls={salon.data.imageUrls || []} />

          {/* 4. Services & Employees Photos */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Ảnh dịch vụ & Đội ngũ thợ</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.data.map((service) => (
                <PhotoEditor
                  key={service.id}
                  kind="services"
                  id={service.id}
                  imageUrl={service.imageUrl}
                  label={`Dịch vụ: ${service.name}`}
                />
              ))}
              {employees.data.map((employee) => (
                <PhotoEditor
                  key={employee.id}
                  kind="employees"
                  id={employee.id}
                  imageUrl={employee.avatarUrl}
                  label={`Thợ: ${employee.fullName}`}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}
