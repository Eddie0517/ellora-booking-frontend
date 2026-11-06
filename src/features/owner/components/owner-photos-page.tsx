import { useState } from 'react'
import { useOwnerEmployees, useOwnerPhotoMutations, useOwnerSalon, useOwnerServices } from '../queries/owner.queries'
import { useConfirm } from '@/hooks/use-confirm'

type Kind = 'cover' | 'services' | 'employees'
function PhotoEditor({ kind, id, imageUrl, label }: { kind: Kind; id: string; imageUrl: string | null; label: string }) {
  const { confirm } = useConfirm()
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const mutations = useOwnerPhotoMutations()
  const busy = mutations.upload.isPending || mutations.remove.isPending
  const upload = async () => { if (!file) return; try { await mutations.upload.mutateAsync({ kind, id, file }); setFile(null); setMessage('Đã gửi ảnh. Ảnh sẽ hiển thị sau khi được duyệt nếu tiệm cần xét duyệt.') } catch { setMessage('Không tải được ảnh lên.') } }
  const remove = async () => {
    const ok = await confirm({
      title: 'Xóa ảnh',
      description: 'Bạn có chắc chắn muốn xóa ảnh này?',
      confirmText: 'Xóa ảnh',
      variant: 'destructive',
    })
    if (!ok) return
    try { await mutations.remove.mutateAsync({ kind, id }); setMessage('Đã gửi yêu cầu xóa ảnh.') } catch { setMessage('Không xóa được ảnh.') }
  }
  return <article className="rounded-2xl border border-rose-100 bg-white p-5">{imageUrl ? <img src={imageUrl} alt={label} className={`mb-4 object-cover ${kind === 'employees' ? 'h-28 w-28 rounded-full' : 'aspect-[4/3] w-full rounded-xl'}`} /> : <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-[#FAF7F8] text-sm text-gray-500">Chưa có ảnh</div>}<h3 className="font-semibold">{label}</h3><label className="mt-3 block text-sm">Chọn ảnh JPG/PNG<input type="file" accept="image/jpeg,image/png" disabled={busy} onChange={event => { const chosen = event.target.files?.[0]; setFile(chosen && ['image/jpeg', 'image/png'].includes(chosen.type) && chosen.size <= 5 * 1024 * 1024 ? chosen : null); setMessage(chosen && (chosen.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(chosen.type)) ? 'Chỉ nhận ảnh JPG/PNG tối đa 5 MB.' : ''); event.target.value = '' }} className="mt-2 block max-w-full text-xs" /></label><div className="mt-4 flex flex-wrap gap-2">{file && <button type="button" disabled={busy} onClick={() => void upload()} className="rounded-lg bg-[#8C3A5A] px-4 py-2 text-sm text-white">Lưu ảnh</button>}{imageUrl && <button type="button" disabled={busy} onClick={() => void remove()} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700">Xóa ảnh</button>}</div>{message && <p role="status" className="mt-3 text-sm text-[#8C3A5A]">{message}</p>}</article>
}

function GalleryEditor({ id, urls }: { id: string; urls: string[] }) {
  const { confirm } = useConfirm()
  const [files, setFiles] = useState<File[]>([])
  const [message, setMessage] = useState('')
  const mutations = useOwnerPhotoMutations()
  const busy = mutations.uploadGallery.isPending || mutations.removeGallery.isPending
  const upload = async () => { try { await mutations.uploadGallery.mutateAsync({ id, files }); setFiles([]); setMessage('Đã gửi ảnh thư viện để duyệt.') } catch { setMessage('Không tải được ảnh lên.') } }
  const remove = async (url: string) => {
    const ok = await confirm({
      title: 'Yêu cầu xóa ảnh',
      description: 'Bạn có chắc chắn muốn yêu cầu xóa ảnh này khỏi thư viện?',
      confirmText: 'Xóa ảnh',
      variant: 'destructive',
    })
    if (!ok) return
    try { await mutations.removeGallery.mutateAsync(url); setMessage('Đã gửi yêu cầu xóa ảnh.') } catch { setMessage('Không xóa được ảnh.') }
  }
  return <section className="rounded-2xl border border-rose-100 bg-white p-6"><h2 className="font-serif text-2xl font-semibold">Thư viện salon</h2><p className="mt-2 text-sm text-gray-600">{urls.length} / 10 ảnh. Chọn nhiều ảnh cùng lúc; mỗi ảnh JPG/PNG tối đa 5 MB.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">{urls.map(url => <div key={url} className="rounded-xl border p-3"><img src={url} alt="Ảnh thư viện salon" className="aspect-[4/3] w-full rounded-lg object-cover" /><button type="button" onClick={() => void remove(url)} disabled={busy} className="mt-3 text-sm text-red-700 underline">Yêu cầu xóa ảnh</button></div>)}</div>{urls.length < 10 && <div className="mt-5"><input type="file" accept="image/jpeg,image/png" multiple disabled={busy} onChange={event => { const picked = Array.from(event.target.files ?? []); setFiles(picked.length <= 10 - urls.length && picked.every(file => ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 5 * 1024 * 1024) ? picked : []); setMessage(picked.length > 10 - urls.length || picked.some(file => file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(file.type)) ? 'Vượt quá 10 ảnh hoặc ảnh không đúng định dạng/kích thước.' : ''); event.target.value = '' }} />{files.length > 0 && <button type="button" onClick={() => void upload()} disabled={busy} className="mt-3 block rounded-lg bg-[#8C3A5A] px-4 py-2 text-sm text-white">Gửi {files.length} ảnh</button>}</div>}{message && <p role="status" className="mt-3 text-sm text-[#8C3A5A]">{message}</p>}</section>
}

export function OwnerPhotosPage() {
  const salon = useOwnerSalon()
  const services = useOwnerServices()
  const employees = useOwnerEmployees()
  return <main className="mx-auto max-w-[1100px] space-y-7 px-6 py-10"><header><h1 className="text-2xl font-bold text-[#8C3A5A]">Hình ảnh salon</h1><p className="mt-2 text-sm text-gray-600">Quản lý ảnh đại diện, thư viện, dịch vụ và nhân viên.</p></header>{salon.isPending || services.isPending || employees.isPending ? <p role="status">Đang tải ảnh…</p> : salon.isError || services.isError || employees.isError ? <p role="alert">Không tải được dữ liệu ảnh.</p> : <><div className="grid gap-4 md:grid-cols-3"><PhotoEditor kind="cover" id={salon.data.id} imageUrl={salon.data.logoUrl} label="Ảnh đại diện salon" />{services.data.map(service => <PhotoEditor key={service.id} kind="services" id={service.id} imageUrl={service.imageUrl} label={`Dịch vụ: ${service.name}`} />)}{employees.data.map(employee => <PhotoEditor key={employee.id} kind="employees" id={employee.id} imageUrl={employee.avatarUrl} label={`Nhân viên: ${employee.fullName}`} />)}</div><GalleryEditor id={salon.data.id} urls={salon.data.imageUrls} /></>}</main>
}
