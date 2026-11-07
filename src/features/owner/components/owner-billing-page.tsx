import { useState } from 'react'
import {
  QrCode,
  CheckCircle2,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import { useOwnerBill } from '@/features/billing/queries/billing.queries'
import { billStatusMap, vnMonth } from '@/features/billing/types/billing.model'

export function OwnerBillingPage() {
  const currentVnMonth = vnMonth()
  const [selectedMonth, setSelectedMonth] = useState(currentVnMonth)
  const billQuery = useOwnerBill(selectedMonth)

  const copyTransferContent = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép nội dung chuyển khoản')
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Thanh toán phí nền tảng
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi doanh thu, tỷ lệ hoa hồng và công nợ phí sàn theo từng tháng đối soát
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">Tháng đối soát:</label>
          <input
            type="month"
            max={currentVnMonth}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold shadow-xs focus:border-[#8C3A5A] focus:outline-none"
          />
        </div>
      </header>

      {billQuery.isPending ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-gray-400">
          Đang tính toán công nợ tháng {selectedMonth}...
        </div>
      ) : billQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Không thể tải dữ liệu công nợ. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Statement Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Báo cáo tháng {billQuery.data.month}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-0.5">{billQuery.data.salonName}</h2>
                </div>
                {(() => {
                  const statusInfo = billStatusMap[billQuery.data.status] ?? {
                    label: billQuery.data.status,
                    color: 'bg-gray-100 text-gray-600',
                  }
                  return (
                    <span className={`rounded-full px-3 py-1 text-xs font-bold border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  )
                })()}
              </div>

              {/* Numbers Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-gray-500">Doanh thu hoàn thành</span>
                  <div className="mt-1 text-xl font-bold text-gray-900">
                    {billQuery.data.gross.toLocaleString('vi-VN')} ₫
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-gray-500">Tỷ lệ phí nền tảng ({billQuery.data.percent}%)</span>
                  <div className="mt-1 text-xl font-bold text-[#8C3A5A]">
                    {billQuery.data.fee.toLocaleString('vi-VN')} ₫
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-gray-500">Admin đã xác nhận nhận</span>
                  <div className="mt-1 text-lg font-semibold text-emerald-600">
                    {billQuery.data.paid.toLocaleString('vi-VN')} ₫
                  </div>
                </div>

                <div className="rounded-xl bg-rose-50/50 p-4 border border-rose-100">
                  <span className="text-xs font-semibold text-rose-700">Còn phải thanh toán</span>
                  <div className="mt-1 text-2xl font-black text-[#8C3A5A]">
                    {billQuery.data.due.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>

              {/* Deadline & Meta */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs text-gray-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Hạn chót thanh toán:</span>
                  <span className="font-semibold text-gray-900">{billQuery.data.dueDate}</span>
                </div>
                {billQuery.data.paidAt && (
                  <div className="flex justify-between">
                    <span>Xác nhận gần nhất:</span>
                    <span className="font-semibold text-emerald-600">
                      {new Date(billQuery.data.paidAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
                {billQuery.data.remindedAt && (
                  <div className="flex justify-between">
                    <span>Nhắc nhở gần nhất:</span>
                    <span className="font-semibold text-gray-500">
                      {new Date(billQuery.data.remindedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment QR & Transfer Guide */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <QrCode size={18} className="text-[#8C3A5A]" />
                Thông tin chuyển khoản
              </h3>

              {billQuery.data.due > 0 ? (
                <>
                  {billQuery.data.qrUrl ? (
                    <div className="flex justify-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <img
                        src={billQuery.data.qrUrl}
                        alt="QR thanh toán phí sàn"
                        className="h-48 w-48 object-contain rounded-lg shadow-2xs"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
                      Quản trị viên chưa cập nhật ảnh mã QR thanh toán. Vui lòng liên hệ hỗ trợ nền tảng.
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">Nội dung chuyển khoản chuẩn:</label>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                      <code className="text-xs font-bold text-gray-900">{billQuery.data.transferContent}</code>
                      <button
                        type="button"
                        onClick={() => copyTransferContent(billQuery.data.transferContent)}
                        className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                        title="Sao chép nội dung"
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    * Vui lòng chuyển khoản đúng số tiền <strong>{billQuery.data.due.toLocaleString('vi-VN')} ₫</strong> và ghi chính xác nội dung chuyển khoản ở trên để Admin đối soát và phê duyệt tự động.
                  </p>
                </>
              ) : (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-xs text-emerald-800 space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                  <p className="font-bold text-sm">Bạn đã hoàn tất phí sàn tháng này</p>
                  <p className="text-emerald-700">Không còn khoản công nợ nào chưa thanh toán.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
