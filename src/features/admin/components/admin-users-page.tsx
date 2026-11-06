import { useState, type FormEvent } from 'react'
import {
  Users,
  Search,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAdminUsers, useLockAdminUser } from '../queries/admin.queries'
import { useConfirm } from '@/hooks/use-confirm'

const roles: Record<string, { label: string; badge: string }> = {
  CUSTOMER: { label: 'Khách hàng', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  SALON_OWNER: { label: 'Chủ salon', badge: 'bg-rose-50 text-brand border-pink-200' },
  ADMIN: { label: 'Quản trị viên', badge: 'bg-gray-900 text-white border-gray-900' },
}

export function AdminUsersPage() {
  const { confirm } = useConfirm()
  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)

  const users = useAdminUsers(keyword, page)
  const lock = useLockAdminUser()

  const search = (event: FormEvent) => {
    event.preventDefault()
    setKeyword(input.trim())
    setPage(0)
  }

  const handleToggleLock = async (id: string, name: string, isLocked: boolean) => {
    const action = isLocked ? 'Mở khóa' : 'Khóa'
    const ok = await confirm({
      title: `${action} tài khoản`,
      description: `Bạn có chắc chắn muốn ${action.toLowerCase()} tài khoản "${name}"?`,
      confirmText: action,
      variant: isLocked ? 'default' : 'destructive',
    })
    if (ok) {
      lock.mutate({ id, locked: !isLocked })
    }
  }

  const userList = users.data?.content ?? []

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Quản lý người dùng
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Tra cứu toàn bộ tài khoản khách hàng, chủ salon và quản trị viên trong hệ thống
        </p>
      </div>

      {/* Main Elevated Card Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
        {/* Search Bar */}
        <form onSubmit={search} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium placeholder-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-pink-500/20 hover:bg-brand-hover active:scale-95 transition"
          >
            Tìm kiếm
          </button>

          {keyword && (
            <button
              type="button"
              onClick={() => {
                setInput('')
                setKeyword('')
                setPage(0)
              }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 active:scale-95 transition"
            >
              Xóa bộ lọc
            </button>
          )}
        </form>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {users.isPending ? (
            <div className="py-16 text-center text-sm text-gray-400">Đang tải danh sách người dùng…</div>
          ) : users.isError ? (
            <div className="py-12 text-center text-sm text-red-600">
              Không tải được danh sách người dùng. Vui lòng kiểm tra quyền truy cập.
            </div>
          ) : userList.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="size-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Không tìm thấy tài khoản phù hợp</p>
              <p className="text-xs text-gray-400 mt-1">Hãy thử tìm với từ khóa khác.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-gray-400 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-3">Người dùng</th>
                  <th className="py-3 px-3">Email & SĐT</th>
                  <th className="py-3 px-3">Vai trò</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3">Ngày tạo</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userList.map((user) => {
                  const roleConfig = roles[user.role] ?? {
                    label: user.role,
                    badge: 'bg-gray-100 text-gray-700 border-gray-200',
                  }
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-gradient-to-tr from-rose-100 to-pink-50 text-brand font-bold flex items-center justify-center text-xs">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{user.fullName || 'Chưa đặt tên'}</p>
                            <p className="font-mono text-[10px] text-gray-400">ID: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-medium text-gray-800">{user.email}</p>
                        <p className="text-[11px] text-gray-400">{user.phone || 'Chưa cập nhật SĐT'}</p>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${roleConfig.badge}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {user.locked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                            <span className="size-1.5 rounded-full bg-red-500" />
                            Đã khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Hoạt động
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-gray-500 font-medium">
                        {user.createdAt ? user.createdAt.slice(0, 10) : '—'}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        {user.role === 'ADMIN' ? (
                          <span className="text-[11px] font-semibold text-gray-400">Bảo vệ</span>
                        ) : (
                          <button
                            type="button"
                            disabled={lock.isPending}
                            onClick={() => handleToggleLock(user.id, user.fullName, user.locked)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition active:scale-95 disabled:opacity-50 ${
                              user.locked
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            {user.locked ? <Unlock size={12} /> : <Lock size={12} />}
                            <span>{user.locked ? 'Mở khóa' : 'Khóa tài khoản'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {users.data && users.data.totalElements > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-gray-500 font-medium">
              Tổng số {users.data.totalElements} tài khoản
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition"
              >
                <ChevronLeft size={14} />
                <span>Trang trước</span>
              </button>

              <span className="text-xs font-semibold text-gray-700 px-2">
                Trang {page + 1}
              </span>

              <button
                type="button"
                disabled={users.data.last}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition"
              >
                <span>Trang sau</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
