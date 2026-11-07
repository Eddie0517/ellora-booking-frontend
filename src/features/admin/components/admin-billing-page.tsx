import { useState, type FormEvent } from 'react'
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Bell,
  Percent,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import {
  useBillingConfig,
  useBillingStatements,
  useConfirmPayment,
  useRemindPayment,
  useUpdateBillingRate,
  useUploadBillingQr,
} from '@/features/billing/queries/billing.queries'
import { billStatusMap, vnMonth } from '@/features/billing/types/billing.model'
import type { PlatformBill } from '@/features/billing/types/billing.model'

export function AdminBillingPage() {
  const { confirm } = useConfirm()
  const currentVnMonth = vnMonth()
  const [selectedMonth, setSelectedMonth] = useState(currentVnMonth)
  const [page, setPage] = useState(0)

  const configQuery = useBillingConfig()
  const statementsQuery = useBillingStatements(selectedMonth, page)
  const updateRate = useUpdateBillingRate()
  const uploadQr = useUploadBillingQr()
  const confirmPayment = useConfirmPayment()
  const remindPayment = useRemindPayment()

  const [rateInput, setRateInput] = useState<string>('')
  const [qrFile, setQrFile] = useState<File | null>(null)

  const handleSaveRate = async (e: FormEvent) => {
    e.preventDefault()
    const num = parseFloat(rateInput)
    if (isNaN(num) || num < 0 || num > 100) {
      toast.error('Vui lòng nhập tỷ lệ phí hợp lệ từ 0% đến 100%')
      return
    }
    try {
      await updateRate.mutateAsync(num)
      toast.success('Đã cập nhật tỷ lệ phí cho tháng tiếp theo')
      setRateInput('')
    } catch {
      toast.error('Không thể cập nhật tỷ lệ phí')
    }
  }

  const handleUploadQr = async () => {
    if (!qrFile) return
    try {
      await uploadQr.mutateAsync(qrFile)
      toast.success('Đã tải lên mã QR nhận tiền mới')
      setQrFile(null)
    } catch {
      toast.error('Không thể tải lên mã QR')
    }
  }

  const handleConfirm = async (bill: PlatformBill) => {
    const ok = await confirm({
      title: 'Xác nhận nhận tiền',
      description: `Xác nhận đã nhận ${bill.due.toLocaleString('vi-VN')} ₫ từ ${bill.salonName} cho tháng ${bill.month}?`,
      confirmText: 'Xác nhận',
    })
    if (!ok) return

    try {
      await confirmPayment.mutateAsync({
        salonId: bill.salonId,
        month: bill.month,
        expectedDue: bill.due,
      })
      toast.success(`Đã xác nhận thanh toán cho salon ${bill.salonName}`)
    } catch {
      toast.error('Không thể xác nhận thanh toán')
    }
  }

  const handleRemind = async (bill: PlatformBill) => {
    const ok = await confirm({
      title: 'Gửi nhắc nhở thanh toán',
      description: `Gửi email nhắc nhở thanh toán phí sàn tháng ${bill.month} đến salon ${bill.salonName}?`,
      confirmText: 'Gửi nhắc nhở',
    })
    if (!ok) return

    try {
      await remindPayment.mutateAsync({
        salonId: bill.salonId,
        month: bill.month,
      })
      toast.success(`Đã gửi email nhắc nhở thanh toán đến ${bill.salonName}`)
    } catch {
      toast.error('Không thể gửi email nhắc nhở')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Phí nền tảng & Đối soát thanh toán
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý tỷ lệ hoa hồng nền tảng, mã QR nhận thanh toán và đối soát công nợ hàng tháng của các salon.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#8C3A5A]">
            <Percent size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cấu hình phí hoa hồng sàn</h2>
            <p className="text-xs text-gray-500">Áp dụng chung cho tất cả giao dịch hoàn thành của salon đối tác</p>
          </div>
        </div>

        {configQuery.isPending ? (
          <p className="text-sm text-gray-400">Đang tải cấu hình...</p>
        ) : configQuery.isError ? (
          <p className="text-sm text-red-600">Không tải được cấu hình phí.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Đang áp dụng:</span>
                  <span className="text-xl font-bold text-[#8C3A5A]">{configQuery.data.currentPercent}%</span>
                </div>
                <div className="mt-2 flex justify-between items-center text-sm border-t border-slate-200/60 pt-2">
                  <span className="text-gray-500">Áp dụng từ tháng {configQuery.data.effectiveMonth}:</span>
                  <span className="font-semibold text-gray-900">{configQuery.data.nextPercent}%</span>
                </div>
              </div>

              <form onSubmit={handleSaveRate} className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Cài đặt tỷ lệ phí cho tháng tiếp theo (%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder={`Ví dụ: ${configQuery.data.nextPercent}`}
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#8C3A5A] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={updateRate.isPending}
                    className="rounded-xl bg-[#8C3A5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#722e48] transition-colors disabled:opacity-50"
                  >
                    Lưu tỷ lệ
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  * Tỷ lệ mới sẽ tự động có hiệu lực từ ngày đầu tiên của tháng tiếp theo. Không áp dụng hồi tố tháng trước.
                </p>
              </form>
            </div>

            {/* QR Code Section */}
            <div className="space-y-4 md:border-l md:border-slate-100 md:pl-6">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <QrCode size={16} className="text-[#8C3A5A]" />
                Mã QR tài khoản nhận thanh toán của Admin
              </h3>
              <div className="flex items-start gap-4">
                {configQuery.data.qrUrl ? (
                  <img
                    src={configQuery.data.qrUrl}
                    alt="QR thanh toán"
                    className="h-32 w-32 rounded-xl border border-slate-200 object-contain p-1 shadow-xs"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-gray-400 text-center p-2">
                    Chưa cập nhật QR
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => setQrFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-slate-200"
                  />
                  {qrFile && (
                    <button
                      type="button"
                      onClick={handleUploadQr}
                      disabled={uploadQr.isPending}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {uploadQr.isPending ? 'Đang tải lên...' : 'Lưu ảnh QR'}
                    </button>
                  )}
                  <p className="text-[11px] text-gray-400">Định dạng JPG/PNG, tối đa 5 MB.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statements Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bảng đối soát công nợ salon</h2>
              <p className="text-xs text-gray-500">Xem và xác nhận thanh toán phí sàn từ các tiệm</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">Tháng:</label>
            <input
              type="month"
              max={currentVnMonth}
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setPage(0)
              }}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold focus:border-[#8C3A5A] focus:outline-none"
            />
          </div>
        </div>

        {statementsQuery.isPending ? (
          <div className="py-12 text-center text-sm text-gray-400">Đang tải danh sách công nợ...</div>
        ) : statementsQuery.isError ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">Không thể tải dữ liệu công nợ.</div>
        ) : statementsQuery.data.content.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Không có dữ liệu salon cho tháng {selectedMonth}.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Salon / Mã CK</th>
                  <th className="py-3 px-3">Doanh thu gộp</th>
                  <th className="py-3 px-3">Phí sàn</th>
                  <th className="py-3 px-3">Đã trả / Còn nợ</th>
                  <th className="py-3 px-3">Trạng thái / Hạn</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statementsQuery.data.content.map((bill) => {
                  const statusInfo = billStatusMap[bill.status] ?? { label: bill.status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={bill.salonId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">{bill.salonName}</div>
                        <code className="text-[11px] text-gray-500">{bill.transferContent}</code>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        {bill.gross.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#8C3A5A]">{bill.fee.toLocaleString('vi-VN')} ₫</span>
                        <span className="text-[11px] text-gray-400 block">({bill.percent}%)</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-gray-500">{bill.paid.toLocaleString('vi-VN')} ₫</span> /{' '}
                        <strong className="text-gray-900 font-bold">{bill.due.toLocaleString('vi-VN')} ₫</strong>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <div className="text-[11px] text-gray-400 mt-0.5">Hạn: {bill.dueDate}</div>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleConfirm(bill)}
                          disabled={confirmPayment.isPending || bill.due <= 0}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                        >
                          <CheckCircle2 size={13} />
                          Đã nhận
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemind(bill)}
                          disabled={remindPayment.isPending || bill.due <= 0}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                        >
                          <Bell size={13} />
                          Nhắc nợ
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {statementsQuery.data && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-gray-500">
              Trang {page + 1} / Tổng {statementsQuery.data.totalElements} tiệm
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                type="button"
                disabled={statementsQuery.data.last}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
