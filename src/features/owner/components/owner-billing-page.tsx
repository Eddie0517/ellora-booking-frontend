import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  QrCode,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useOwnerBill,
  usePreparePayment,
  useSyncPayment,
} from '@/features/billing/queries/billing.queries'
import { billStatusMap, vnMonth } from '@/features/billing/types/billing.model'

export function OwnerBillingPage() {
  const currentVnMonth = vnMonth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedMonth, setSelectedMonth] = useState(currentVnMonth)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const billQuery = useOwnerBill(selectedMonth)
  const preparePayment = usePreparePayment()
  const syncPayment = useSyncPayment()

  // Xử lý tự động kiểm tra khi PayOS redirect về sau khi thanh toán
  useEffect(() => {
    const orderCode = searchParams.get('orderCode')
    const status = searchParams.get('status')
    if (orderCode || status === 'PAID') {
      toast.info('Đang đồng bộ trạng thái thanh toán từ PayOS...')
      syncPayment.mutate(selectedMonth, {
        onSuccess: (data) => {
          if (data.status === 'PAID' || data.due === 0) {
            toast.success('Thanh toán thành công! Cơ sở đã được mở lại dịch vụ bình thường.')
          } else {
            toast.info('Hệ thống đã cập nhật đối soát phí sàn.')
          }
          // Xóa param query để tránh trigger lại
          setSearchParams({}, { replace: true })
        },
        onError: () => {
          toast.error('Không thể tự động đồng bộ kết quả thanh toán. Vui lòng nhấn "Kiểm tra thanh toán".')
        },
      })
    }
  }, [searchParams, selectedMonth, setSearchParams, syncPayment])

  const copyTransferContent = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép nội dung chuyển khoản')
  }

  const handlePayViaPayOs = async () => {
    try {
      const res = await preparePayment.mutateAsync(selectedMonth)
      setQrModalOpen(true)
      if (res.payosCheckoutUrl) {
        // Mở popup hoặc redirect sang trang PayOS
        window.open(res.payosCheckoutUrl, '_blank')
      }
    } catch {
      toast.error('Không thể tạo liên kết thanh toán PayOS. Vui lòng thử lại sau.')
    }
  }

  const handleSyncPayment = async () => {
    try {
      const res = await syncPayment.mutateAsync(selectedMonth)
      if (res.status === 'PAID' || res.due === 0) {
        toast.success('Xác nhận đã thanh toán thành công! Trạng thái quá hạn (nếu có) đã được gỡ bỏ.')
        setQrModalOpen(false)
      } else {
        toast.info(`Hệ thống chưa ghi nhận thanh toán đủ cho tháng ${selectedMonth}. Số tiền còn lại: ${res.due.toLocaleString('vi-VN')} ₫`)
      }
    } catch {
      toast.error('Không thể đồng bộ giao dịch với PayOS. Vui lòng kiểm tra lại sau ít phút.')
    }
  }

  const isOverdue = billQuery.data?.status === 'OVERDUE'
  const isPaid = billQuery.data?.status === 'PAID' || (billQuery.data && billQuery.data.due <= 0)

  return (
    <div className="space-y-7">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Thanh toán phí dịch vụ nền tảng
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Hóa đơn phí hoa hồng đơn hàng hoàn thành & thanh toán tự động qua PayOS (VietQR)
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

      {/* Overdue Alert Banner */}
      {isOverdue && (
        <div className="flex items-start gap-3.5 rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-red-900 shadow-xs animate-in fade-in">
          <AlertTriangle className="size-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-red-800">
              Phí dịch vụ tháng {selectedMonth} đã quá hạn thanh toán!
            </h3>
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              Theo quy định hợp đồng, salon của bạn hiện bị tạm ẩn khỏi trang tìm kiếm và khách hàng không thể đặt lịch mới.
              Vui lòng bấm <strong>"Thanh toán ngay qua PayOS"</strong> bên dưới để hoàn tất phí sàn và tự động mở lại dịch vụ ngay lập tức.
            </p>
          </div>
        </div>
      )}

      {billQuery.isPending ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-gray-400">
          Đang tính toán đối soát phí tháng {selectedMonth}...
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
                    Báo cáo hoa hồng tháng {billQuery.data.month}
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
                  <span className="text-xs text-gray-500">Doanh thu đơn hoàn thành</span>
                  <div className="mt-1 text-xl font-bold text-gray-900">
                    {billQuery.data.gross.toLocaleString('vi-VN')} ₫
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">Chỉ tính đơn có trạng thái COMPLETED</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-gray-500">Tỷ lệ phí sàn ({billQuery.data.percent}%)</span>
                  <div className="mt-1 text-xl font-bold text-[#8C3A5A]">
                    {billQuery.data.fee.toLocaleString('vi-VN')} ₫
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">Áp dụng theo chính sách nền tảng</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-gray-500">Đã thanh toán ghi nhận</span>
                  <div className="mt-1 text-lg font-semibold text-emerald-600">
                    {billQuery.data.paid.toLocaleString('vi-VN')} ₫
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">Ghi nhận tức thì qua PayOS</p>
                </div>

                <div className="rounded-xl bg-rose-50/50 p-4 border border-rose-100">
                  <span className="text-xs font-semibold text-rose-700">Số tiền cần thanh toán</span>
                  <div className="mt-1 text-2xl font-black text-[#8C3A5A]">
                    {billQuery.data.due.toLocaleString('vi-VN')} ₫
                  </div>
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">Hạn thanh toán: Ngày {billQuery.data.dueDate}</p>
                </div>
              </div>

              {/* Deadline & Meta */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs text-gray-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    Hạn chót thanh toán kỳ này:
                  </span>
                  <span className="font-semibold text-gray-900">{billQuery.data.dueDate}</span>
                </div>
                {billQuery.data.paidAt && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      Thời điểm thanh toán gần nhất:
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {new Date(billQuery.data.paidAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Section (PayOS VietQR) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <CreditCard size={18} className="text-[#8C3A5A]" />
                Thanh toán phí sàn tự động
              </h3>

              {!isPaid && billQuery.data.due > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-4 text-xs text-gray-700 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-[#8C3A5A]">
                      <Sparkles size={16} />
                      <span>Thanh toán tức thì qua PayOS (VietQR)</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Quét mã QR bằng ứng dụng ngân hàng bất kỳ để đối soát và tự động mở khóa salon ngay sau khi thanh toán.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={preparePayment.isPending}
                    onClick={() => void handlePayViaPayOs()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8C3A5A] to-rose-600 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-95 transition disabled:opacity-50"
                  >
                    {preparePayment.isPending ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <QrCode size={16} />
                    )}
                    <span>{preparePayment.isPending ? 'Đang tạo giao dịch...' : 'Thanh toán ngay qua PayOS'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={syncPayment.isPending}
                    onClick={() => void handleSyncPayment()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={syncPayment.isPending ? 'animate-spin' : ''} />
                    <span>{syncPayment.isPending ? 'Đang kiểm tra...' : 'Kiểm tra kết quả thanh toán'}</span>
                  </button>

                  {/* Manual fallback transfer content */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="text-[11px] font-semibold text-gray-500">Mã giao dịch / Nội dung đối soát:</label>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
                      <code className="text-xs font-bold text-gray-900">{billQuery.data.transferContent}</code>
                      <button
                        type="button"
                        onClick={() => copyTransferContent(billQuery.data.transferContent)}
                        className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                        title="Sao chép nội dung"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-xs text-emerald-800 space-y-2.5">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                  <p className="font-bold text-sm">Đã hoàn tất thanh toán phí sàn</p>
                  <p className="text-emerald-700 text-xs">
                    Cơ sở không còn nợ phí sàn cho tháng {selectedMonth}. Salon đang hoạt động bình thường trên hệ thống.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PayOS VietQR Modal */}
      {qrModalOpen && billQuery.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <h3 className="text-base font-bold text-gray-900">Quét mã VietQR để thanh toán</h3>
            <p className="text-xs text-gray-500">
              Số tiền: <strong className="text-rose-600 font-bold">{billQuery.data.due.toLocaleString('vi-VN')} ₫</strong>
            </p>

            {billQuery.data.payosQrCode ? (
              <div className="flex justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                    billQuery.data.payosQrCode
                  )}&size=240x240`}
                  alt="VietQR PayOS"
                  className="size-56 rounded-xl object-contain shadow-xs"
                />
              </div>
            ) : (
              <div className="py-8 text-xs text-gray-400">Đang tạo mã QR PayOS...</div>
            )}

            {billQuery.data.payosCheckoutUrl && (
              <a
                href={billQuery.data.payosCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C3A5A] hover:underline"
              >
                <span>Mở trang thanh toán PayOS trực tiếp</span>
                <ExternalLink size={13} />
              </a>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={syncPayment.isPending}
                onClick={() => void handleSyncPayment()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition"
              >
                <CheckCircle2 size={16} />
                <span>Tôi đã chuyển khoản - Xác nhận ngay</span>
              </button>

              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-gray-600 hover:bg-slate-50 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
