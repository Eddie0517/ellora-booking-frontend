import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useConfirm } from '@/hooks/use-confirm'
import { apiError } from '@/lib/axios'
import { useOwnerEmployees, useRemoveOwnerEmployee, useSaveOwnerEmployee } from '../queries/owner.queries'
import type { OwnerEmployee, SaveEmployee } from '../types/owner.model'

const empty: SaveEmployee = { fullName: '', phone: '', bio: '' }

export function OwnerStaffPage() {
  const { confirm } = useConfirm()
  const staff = useOwnerEmployees()
  const save = useSaveOwnerEmployee()
  const remove = useRemoveOwnerEmployee()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<SaveEmployee>(empty)
  const [open, setOpen] = useState(false)

  const edit = (employee?: OwnerEmployee) => {
    save.reset()
    setEditing(employee?.id ?? null)
    setDraft(employee ? { fullName: employee.fullName, phone: employee.phone, bio: employee.bio } : empty)
    setOpen(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await save.mutateAsync({ value: draft, ...(editing ? { id: editing } : {}) })
      setOpen(false)
    } catch { /* The mutation error is shown below the form. */ }
  }

  const handleDelete = async (employee: OwnerEmployee) => {
    const ok = await confirm({
      title: 'Xóa nhân viên',
      description: `Bạn có chắc chắn muốn xóa nhân viên "${employee.fullName}"?`,
      confirmText: 'Xóa nhân viên',
      variant: 'destructive',
    })
    if (ok) remove.mutate(employee.id)
  }

  return <main className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#8C3A5A]">Quản lý nhân viên</h1>
        <p className="mt-1 text-sm text-gray-600">Thông tin đội ngũ salon.</p>
      </div>
      <Button type="button" onClick={() => edit()} className="h-10 bg-primary-action px-5 text-brand-darker hover:bg-primary-action/90">Thêm nhân viên</Button>
    </div>

    <Dialog open={open} onOpenChange={next => { if (!next && save.isPending) return; setOpen(next) }}>
      <DialogContent>
      <DialogHeader><DialogTitle>{editing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Họ và tên<input required value={draft.fullName} onChange={event => setDraft({ ...draft, fullName: event.target.value })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="text-sm">Số điện thoại<input required type="tel" maxLength={20} value={draft.phone} onChange={event => setDraft({ ...draft, phone: event.target.value })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="text-sm sm:col-span-2">Giới thiệu<textarea maxLength={1000} value={draft.bio} onChange={event => setDraft({ ...draft, bio: event.target.value })} className="mt-2 w-full rounded-lg border p-3" /></label>
      <div className="flex gap-3 sm:col-span-2">
        <Button disabled={save.isPending} className="h-10 bg-primary-action px-5 text-brand-darker hover:bg-primary-action/90">{save.isPending ? 'Đang lưu…' : 'Lưu nhân viên'}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
      </div>
      {save.isError && <p role="alert" className="text-red-700 sm:col-span-2">{apiError(save.error)}</p>}
      </form>
      </DialogContent>
    </Dialog>

    {staff.isPending ? <p role="status">Đang tải nhân viên…</p> : staff.isError ? <p role="alert">{apiError(staff.error)}</p> : <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <Table className="min-w-[760px]">
        <TableHeader className="bg-rose-50/60">
          <TableRow>
            <TableHead className="w-16">Ảnh</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Giới thiệu</TableHead>
            <TableHead className="w-40 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.data.map(employee => <TableRow key={employee.id}>
            <TableCell><img src={employee.avatarUrl || '/salon-placeholder.svg'} alt="" className="h-11 w-11 rounded-full object-cover" /></TableCell>
            <TableCell className="font-semibold text-gray-900">{employee.fullName}</TableCell>
            <TableCell className="whitespace-nowrap text-gray-600">{employee.phone || '—'}</TableCell>
            <TableCell className="max-w-[360px] truncate text-gray-600" title={employee.bio}>{employee.bio || '—'}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => edit(employee)} className="text-[#8C3A5A]">Sửa</Button>
                <Button type="button" size="sm" variant="destructive" disabled={remove.isPending} onClick={() => void handleDelete(employee)}>Xóa</Button>
              </div>
            </TableCell>
          </TableRow>)}
          {staff.data.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-500">Salon chưa có nhân viên.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>}
    {remove.isError && <p role="alert" className="mt-4 text-red-700">{apiError(remove.error)}</p>}
  </main>
}
