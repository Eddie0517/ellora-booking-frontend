import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useConfirm } from '@/hooks/use-confirm'
import { apiError } from '@/lib/axios'
import { useOwnerServices, useRemoveOwnerService, useSaveOwnerService, useUploadOwnerImage } from '../queries/owner.queries'
import type { OwnerService, SaveService } from '../types/owner.model'

const empty: SaveService = { name: '', description: '', price: 0, durationMinutes: 30 }

export function OwnerServicesPage() {
  const { confirm } = useConfirm()
  const services = useOwnerServices()
  const save = useSaveOwnerService()
  const remove = useRemoveOwnerService()
  const upload = useUploadOwnerImage()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<SaveService>(empty)
  const [open, setOpen] = useState(false)

  const edit = (service?: OwnerService) => {
    save.reset()
    upload.reset()
    setEditing(service?.id ?? null)
    setDraft(service ? {
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      categoryId: service.categoryId,
      imageUrl: service.imageUrl,
    } : empty)
    setOpen(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await save.mutateAsync({ value: draft, ...(editing ? { id: editing } : {}) })
      setOpen(false)
    } catch { /* The mutation error is shown below the form. */ }
  }

  const handleDelete = async (service: OwnerService) => {
    const ok = await confirm({
      title: 'Xóa dịch vụ',
      description: `Bạn có chắc chắn muốn xóa dịch vụ "${service.name}"?`,
      confirmText: 'Xóa dịch vụ',
      variant: 'destructive',
    })
    if (ok) remove.mutate(service.id)
  }

  return <main className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#8C3A5A]">Quản lý dịch vụ</h1>
        <p className="mt-1 text-sm text-gray-600">Cập nhật các dịch vụ và giá tại salon.</p>
      </div>
      <Button type="button" onClick={() => edit()} className="h-10 bg-primary-action px-5 text-brand-darker hover:bg-primary-action/90">Thêm dịch vụ</Button>
    </div>

    <Dialog open={open} onOpenChange={next => { if (!next && (save.isPending || upload.isPending)) return; setOpen(next) }}>
      <DialogContent>
      <DialogHeader><DialogTitle>{editing ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ'}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Tên dịch vụ<input required value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="text-sm">Giá (₫)<input required min={0} type="number" value={draft.price} onChange={event => setDraft({ ...draft, price: Number(event.target.value) })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="text-sm">Thời lượng (phút)<input required min={5} type="number" value={draft.durationMinutes} onChange={event => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="text-sm">Mô tả<input value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="text-sm sm:col-span-2">Ảnh dịch vụ<input type="file" accept="image/png,image/jpeg" onChange={event => {
        const file = event.target.files?.[0]
        if (file) upload.mutate(file, { onSuccess: url => setDraft(current => ({ ...current, imageUrl: url })) })
      }} className="mt-2 block" />
        {draft.imageUrl && <img src={draft.imageUrl} alt="Ảnh dịch vụ" className="mt-2 h-24 w-24 rounded object-cover" />}
        {upload.isError && <span role="alert">Không tải được ảnh: {apiError(upload.error)}</span>}
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <Button disabled={save.isPending || upload.isPending} className="h-10 bg-primary-action px-5 text-brand-darker hover:bg-primary-action/90">{save.isPending ? 'Đang lưu…' : 'Lưu dịch vụ'}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
      </div>
      {save.isError && <p role="alert" className="text-red-700 sm:col-span-2">{apiError(save.error)}</p>}
      </form>
      </DialogContent>
    </Dialog>

    {services.isPending ? <p role="status">Đang tải dịch vụ…</p> : services.isError ? <p role="alert">{apiError(services.error)}</p> : <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Table className="min-w-[800px]">
        <TableHeader className="bg-rose-50/60">
          <TableRow>
            <TableHead className="w-20">Ảnh</TableHead>
            <TableHead>Dịch vụ</TableHead>
            <TableHead className="w-36">Thời lượng</TableHead>
            <TableHead className="w-36 text-right">Giá</TableHead>
            <TableHead className="w-40 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.data.map(service => <TableRow key={service.id}>
            <TableCell>{service.imageUrl ? <img src={service.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span className="text-gray-400">—</span>}</TableCell>
            <TableCell className="max-w-[420px]"><div className="font-semibold text-gray-900">{service.name}</div><p className="truncate text-xs text-gray-500" title={service.description}>{service.description || 'Chưa có mô tả'}</p></TableCell>
            <TableCell className="whitespace-nowrap text-gray-600">{service.durationMinutes} phút</TableCell>
            <TableCell className="whitespace-nowrap text-right font-semibold text-[#8C3A5A]">{service.price.toLocaleString('vi-VN')} ₫</TableCell>
            <TableCell><div className="flex justify-end gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => edit(service)} className="text-[#8C3A5A]">Sửa</Button>
              <Button type="button" size="sm" variant="destructive" disabled={remove.isPending} onClick={() => void handleDelete(service)}>Xóa</Button>
            </div></TableCell>
          </TableRow>)}
          {services.data.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-500">Salon chưa có dịch vụ.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>}
    {remove.isError && <p role="alert" className="mt-4 text-red-700">{apiError(remove.error)}</p>}
  </main>
}
