import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Crown,
  Sparkles,
  CreditCard,
  QrCode,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Clock,
  ArrowRight,
  Trash2,
} from 'lucide-react'
import {
  useOwnerSubscription,
  useOwnerSubscriptionRequests,
  usePlans,
  useSubscriptionMutation,
} from '../queries/subscription.queries'
import type { Plan } from '../types/subscription.model'
import { formatPaymentDate } from '../utils/format-payment-date'

export function OwnerSubscriptionPage() {
  const [page, setPage] = useState(0)
  const [selectedPlanForConfirm, setSelectedPlanForConfirm] = useState<Plan | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const current = useOwnerSubscription()
  const plans = usePlans()
  const history = useOwnerSubscriptionRequests(page)
  const mutations = useSubscriptionMutation()

  const pending = current.data?.pendingRequest
  const handledReturn = useRef('')

  // Handle return from PayOS gateway
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orderCode = params.get('orderCode')
    const statusParam = params.get('status')

    if (!orderCode || !pending || pending.payosOrderCode !== orderCode || handledReturn.current === orderCode) {
      return
    }
    handledReturn.current = orderCode

    if (statusParam === 'CANCELLED') {
      setMessage({
        type: 'info',
        text: 'Giao dịch trên cổng PayOS đã bị hủy hoặc chưa hoàn tất.',
      })
      return
    }

    // Attempt to sync payment confirmation
    void mutations.syncOwnerPayment
      .mutateAsync(pending.id)
      .then((result) => {
        if (result.paymentReportedAt) {
          setMessage({
            type: 'success',
            text: 'Thanh toán PayOS thành công! Gói sẽ sớm được kích hoạt.',
          })
        } else {
          setMessage({
            type: 'info',
            text: 'Đang chờ PayOS xác nhận chuyển khoản. Bạn có thể nhấn nút "Kiểm tra thanh toán".',
          })
        }
      })
      .catch(() => {
        setMessage({
          type: 'error',
          text: 'Không thể tự động đồng bộ thanh toán. Vui lòng bấm "Kiểm tra thanh toán" bên dưới.',
        })
      })
  }, [pending, mutations.syncOwnerPayment])

  // Handle creating request & opening PayOS checkout
  const handleConfirmAndPay = async () => {
    if (!selectedPlanForConfirm || selectedPlanForConfirm.monthlyPrice === null) return
    const plan = selectedPlanForConfirm
    const price = plan.monthlyPrice
    if (typeof price !== 'number') return
    try {
      // 1. Create subscription request
      const req = await mutations.request.mutateAsync({
        tier: plan.tier,
        price,
      })
      setSelectedPlanForConfirm(null)

      // 2. Prepare PayOS checkout
      try {
        const payment = await mutations.prepare.mutateAsync(req.id)
        if (payment.payosCheckoutUrl) {
          window.location.assign(payment.payosCheckoutUrl)
        } else {
          setMessage({
            type: 'success',
            text: 'Đã tạo yêu cầu thành công. Bạn có thể thanh toán qua PayOS bên dưới.',
          })
        }
      } catch {
        setMessage({
          type: 'info',
          text: 'Đã tạo yêu cầu đăng ký. Vui lòng nhấn nút "Thanh toán qua PayOS" để tiếp tục.',
        })
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Không thể tạo yêu cầu đăng ký lúc này. Vui lòng kiểm tra lại.',
      })
    }
  }

  // Handle direct payment checkout for existing pending request
  const handleDirectPay = async () => {
    if (!pending) return
    try {
      const payment = await mutations.prepare.mutateAsync(pending.id)
      if (payment.payosCheckoutUrl) {
        window.location.assign(payment.payosCheckoutUrl)
      } else {
        setMessage({
          type: 'error',
          text: 'Không tạo được đường dẫn thanh toán PayOS. Vui lòng thử lại.',
        })
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Không thể kết nối tới PayOS lúc này. Vui lòng thử lại sau giây lát.',
      })
    }
  }

  // Handle syncing payment status
  const handleSyncPayment = async () => {
    if (!pending) return
    try {
      const result = await mutations.syncOwnerPayment.mutateAsync(pending.id)
      if (result.paymentReportedAt) {
        setMessage({
          type: 'success',
          text: 'PayOS đã xác nhận thanh toán! Đang chờ admin duyệt kích hoạt.',
        })
      } else {
        setMessage({
          type: 'info',
          text: 'PayOS chưa ghi nhận thanh toán. Nếu bạn vừa chuyển tiền, vui lòng chờ 1-2 phút rồi kiểm tra lại.',
        })
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Có lỗi khi kiểm tra với cổng PayOS. Vui lòng thử lại.',
      })
    }
  }

  // Handle canceling unpaid pending request
  const handleCancelPending = async () => {
    if (!pending) return
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu đăng ký này để chọn gói khác?')) {
      return
    }
    try {
      await mutations.cancelRequest.mutateAsync(pending.id)
      setMessage({
        type: 'success',
        text: 'Đã hủy yêu cầu thành công. Bây giờ bạn có thể chọn gói mới.',
      })
    } catch {
      setMessage({
        type: 'error',
        text: 'Không thể hủy yêu cầu này. Vui lòng tải lại trang.',
      })
    }
  }

  const effectiveTier = current.data?.effectiveTier
  const isPaid =
    Boolean(pending?.paymentReportedAt) &&
    (pending?.receivedAmount ?? 0) >= (pending?.quotedPrice ?? 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
              Dành cho Salon Đối tác
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Gói dịch vụ & Quyền lợi Salon
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Nâng tầm thương hiệu salon của bạn trên bản đồ và danh sách tìm kiếm, tiếp cận hàng ngàn khách hàng làm đẹp mỗi ngày.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void current.refetch()
            void history.refetch()
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
          Cập nhật trạng thái
        </button>
      </div>

      {/* Global alert */}
      {message && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold transition-all shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : message.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          {message.type === 'success' ? (
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : message.type === 'error' ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
          )}
          <div className="flex-1">
            <p>{message.text}</p>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Active Subscription Banner */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
                effectiveTier === 'VIP'
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-200'
                  : effectiveTier === 'STANDARD'
                  ? 'bg-gradient-to-br from-rose-500 to-brand text-white shadow-rose-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {effectiveTier === 'VIP' ? (
                <Crown className="h-7 w-7" />
              ) : effectiveTier === 'STANDARD' ? (
                <Sparkles className="h-7 w-7" />
              ) : (
                <ShieldCheck className="h-7 w-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900">
                  {effectiveTier
                    ? `Gói hiện tại: ${effectiveTier === 'VIP' ? 'VIP Đối tác cao cấp' : 'Tiêu chuẩn nổi bật'}`
                    : 'Gói hiện tại: Miễn phí (Mặc định)'}
                </h2>
                {effectiveTier && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    Đang kích hoạt
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                {effectiveTier
                  ? 'Salon của bạn đang hưởng các đặc quyền ưu tiên hiển thị và nhận diện thương hiệu độc quyền.'
                  : 'Salon của bạn đang sử dụng tài khoản cơ bản. Nâng cấp ngay để nhận huy hiệu xác thực và đưa tiệm lên đầu trang tìm kiếm.'}
              </p>

              {current.data?.startsAt && current.data?.expiresAt && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <Clock className="h-3.5 w-3.5 text-brand" />
                  <span>
                    Hiệu lực: {formatPaymentDate(current.data.startsAt)} — {formatPaymentDate(current.data.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pending Request Section (HIGH PRIORITY - NO DEAD BUTTONS) */}
      {pending && (
        <section className="relative overflow-hidden rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand px-3 py-0.5 text-xs font-bold text-white">
                  Yêu cầu #{pending.id}
                </span>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isPaid ? 'PayOS đã nhận tiền' : 'Chờ thanh toán PayOS'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                Nâng cấp lên gói <span className="text-brand font-black">{pending.tier}</span>
              </h3>
              <p className="text-sm text-gray-600">
                Số tiền thanh toán:{' '}
                <span className="font-bold text-lg text-gray-900">
                  {pending.quotedPrice.toLocaleString('vi-VN')} ₫
                </span>{' '}
                / tháng
              </p>

              {isPaid ? (
                <p className="text-xs sm:text-sm text-emerald-700 font-medium">
                  ✓ Giao dịch đã được ghi nhận vào {formatPaymentDate(pending.paymentReportedAt!)}. Gói sẽ tự động được ban quản trị kích hoạt sớm nhất!
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  Mã đơn hàng PayOS: <span className="font-mono font-medium text-gray-700">{pending.payosOrderCode || 'Chưa khởi tạo'}</span>
                  {pending.paymentReference && (
                    <> · Mã giao dịch: <span className="font-mono font-medium text-gray-700">{pending.paymentReference}</span></>
                  )}
                </p>
              )}
            </div>

            {/* Actions for Pending Request */}
            <div className="flex flex-wrap items-center gap-3">
              {!isPaid ? (
                <>
                  {pending.payosCheckoutUrl ? (
                    <a
                      href={pending.payosCheckoutUrl}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-dark transition transform active:scale-95"
                    >
                      <CreditCard className="h-4 w-4" />
                      Thanh toán qua PayOS
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleDirectPay()}
                      disabled={mutations.prepare.isPending}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-dark transition disabled:opacity-50"
                    >
                      <CreditCard className="h-4 w-4" />
                      {mutations.prepare.isPending ? 'Đang kết nối PayOS...' : 'Thanh toán ngay qua PayOS'}
                    </button>
                  )}

                  {/* QR view toggle */}
                  {pending.payosQrCode && (
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-slate-50 transition"
                    >
                      <QrCode className="h-4 w-4 text-brand" />
                      Mã VietQR
                    </button>
                  )}

                  {/* Check payment button */}
                  <button
                    type="button"
                    onClick={() => void handleSyncPayment()}
                    disabled={mutations.syncOwnerPayment.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-slate-50 transition disabled:opacity-50"
                    title="Kiểm tra tiền đã vào chưa"
                  >
                    <RefreshCw className={`h-4 w-4 ${mutations.syncOwnerPayment.isPending ? 'animate-spin' : ''}`} />
                    Kiểm tra thanh toán
                  </button>

                  {/* Cancel pending request button - CRITICAL to avoid deadlocks! */}
                  <button
                    type="button"
                    onClick={() => void handleCancelPending()}
                    disabled={mutations.cancelRequest.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-3 text-xs font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                    title="Hủy yêu cầu này để chọn gói khác"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hủy yêu cầu
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                  Đang chờ ban quản trị duyệt kích hoạt
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Cards Section */}
      <section className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Chọn gói dịch vụ phù hợp
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tất cả các gói đều có hiệu lực 30 ngày kể từ thời điểm kích hoạt. Thanh toán an toàn, minh bạch qua PayOS.
          </p>
        </div>

        {plans.isPending ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-gray-500">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gray-400 mb-2" />
            Đang tải thông tin bảng giá và quyền lợi...
          </div>
        ) : plans.isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Không tải được danh sách gói. Vui lòng thử lại.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 items-stretch">
            {plans.data.map((plan) => {
              const isVip = plan.tier === 'VIP'
              const isCurrent = effectiveTier === plan.tier
              const hasPendingThis = pending?.tier === plan.tier
              const cannotChoose = Boolean(pending) || isCurrent || !plan.registrationAvailable || plan.monthlyPrice === null

              return (
                <article
                  key={plan.tier}
                  className={`relative flex flex-col justify-between rounded-3xl border p-8 transition-all ${
                    isVip
                      ? 'border-amber-400/80 bg-gradient-to-b from-amber-50/40 via-white to-white shadow-lg ring-1 ring-amber-400/30'
                      : 'border-slate-200/90 bg-white shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* VIP Ribbon badge */}
                  {isVip && (
                    <div className="absolute -top-3.5 right-8">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1 text-xs font-bold text-white shadow-sm">
                        <Crown className="h-3.5 w-3.5" /> Gói Khuyên Dùng
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                            isVip
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isVip ? <Crown className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{plan.displayName}</h3>
                          <span className="text-xs font-medium text-gray-500">
                            {isVip ? 'Ưu tiên hiển thị cao nhất' : 'Ưu tiên tìm kiếm tiêu chuẩn'}
                          </span>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                          Đang dùng
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-6 border-b border-slate-100 pb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                          {plan.monthlyPrice === null
                            ? 'Liên hệ'
                            : `${plan.monthlyPrice.toLocaleString('vi-VN')} ₫`}
                        </span>
                        {plan.monthlyPrice !== null && (
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            / tháng
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        {plan.description ||
                          (isVip
                            ? 'Dành cho các salon muốn bứt phá doanh thu và tiếp cận tối đa khách hàng mới.'
                            : 'Giải pháp hoàn hảo để tạo uy tín và nổi bật so với các salon miễn phí.')}
                      </p>
                    </div>

                    {/* Features checklist */}
                    <div className="mt-6 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        Quyền lợi bao gồm:
                      </p>
                      <ul className="space-y-2.5">
                        {(plan.features && plan.features.length > 0
                          ? plan.features
                          : isVip
                          ? [
                              'Huy hiệu VIP Shop vàng nổi bật trên bản đồ và trang cá nhân',
                              'Ưu tiên hiển thị Top 1 trong mọi kết quả tìm kiếm gần đây',
                              'Gợi ý nổi bật cho người dùng trong bán kính 30km',
                              'Hỗ trợ kỹ thuật và chăm sóc đối tác 24/7',
                            ]
                          : [
                              'Huy hiệu Shop Uy Tín trên hồ sơ salon',
                              'Hiển thị trước các salon chưa đăng ký gói',
                              'Ghim vị trí rõ ràng trên bản đồ tương tác',
                            ]
                        ).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mt-0.5">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Choose Plan CTA button */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={cannotChoose}
                      onClick={() => setSelectedPlanForConfirm(plan)}
                      className={`w-full rounded-xl py-3 px-4 text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-500 cursor-default'
                          : hasPendingThis
                          ? 'bg-amber-100 text-amber-800 cursor-default'
                          : cannotChoose
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isVip
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-amber-200'
                          : 'bg-brand text-white hover:bg-brand-dark shadow-rose-200'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="h-4 w-4" /> Gói đang sử dụng
                        </>
                      ) : hasPendingThis ? (
                        <>
                          <Clock className="h-4 w-4" /> Đang có yêu cầu chờ xử lý
                        </>
                      ) : pending ? (
                        'Đã có yêu cầu đang xử lý'
                      ) : !plan.registrationAvailable ? (
                        'Tạm dừng đăng ký'
                      ) : (
                        <>
                          Đăng ký gói {plan.displayName}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    {pending && !isCurrent && (
                      <p className="mt-2 text-center text-[11px] text-gray-400">
                        Vui lòng hoàn tất hoặc hủy yêu cầu #{pending.id} trước khi đổi gói.
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      {selectedPlanForConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Xác nhận đăng ký gói
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPlanForConfirm(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-slate-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-rose-50/70 p-4 border border-rose-100">
                <p className="text-xs text-brand font-semibold uppercase">Gói bạn chọn</p>
                <p className="text-xl font-extrabold text-gray-900 mt-1">
                  {selectedPlanForConfirm.displayName}
                </p>
                <p className="text-2xl font-black text-brand mt-1">
                  {selectedPlanForConfirm.monthlyPrice?.toLocaleString('vi-VN')} ₫{' '}
                  <span className="text-xs font-normal text-gray-500">/ 30 ngày</span>
                </p>
              </div>

              <div className="text-xs text-gray-600 space-y-2">
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  Thanh toán qua cổng PayOS (hỗ trợ chuyển khoản mọi ngân hàng qua VietQR).
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  Gói kích hoạt ngay sau khi hệ thống ghi nhận thanh toán.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedPlanForConfirm(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 transition"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmAndPay()}
                disabled={mutations.request.isPending || mutations.prepare.isPending}
                className="rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-dark transition disabled:opacity-50"
              >
                {mutations.request.isPending || mutations.prepare.isPending
                  ? 'Đang khởi tạo...'
                  : 'Xác nhận & Chuyển sang PayOS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VietQR Modal */}
      {showQrModal && pending?.payosQrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-gray-900">
              Quét mã VietQR để thanh toán
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Mở ứng dụng ngân hàng bất kỳ để quét mã và chuyển tiền tự động
            </p>

            <div className="mt-5 flex justify-center">
              <div className="rounded-2xl border-2 border-slate-200 p-2 bg-white shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    pending.payosQrCode
                  )}`}
                  alt="VietQR PayOS"
                  className="h-52 w-52"
                />
              </div>
            </div>

            <p className="mt-3 text-xs font-bold text-gray-900">
              Số tiền: {pending.quotedPrice.toLocaleString('vi-VN')} ₫
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false)
                  void handleSyncPayment()
                }}
                className="w-full rounded-xl bg-brand py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition"
              >
                Tôi đã chuyển khoản xong
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request History Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-gray-900">Lịch sử đăng ký gói</h2>
        <p className="text-xs text-gray-500">
          Danh sách các lần yêu cầu đăng ký và trạng thái xử lý
        </p>

        {history.isPending ? (
          <div className="py-8 text-center text-sm text-gray-400">
            <RefreshCw className="mx-auto h-5 w-5 animate-spin text-gray-300 mb-2" />
            Đang tải lịch sử...
          </div>
        ) : history.isError ? (
          <div className="py-6 text-sm text-red-600">Không tải được lịch sử yêu cầu.</div>
        ) : history.data.content.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            Bạn chưa có yêu cầu đăng ký gói nào trước đây.
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[550px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Mã yêu cầu</th>
                    <th className="py-3 px-4">Gói dịch vụ</th>
                    <th className="py-3 px-4">Số tiền</th>
                    <th className="py-3 px-4">Thanh toán PayOS</th>
                    <th className="py-3 px-4">Trạng thái duyệt</th>
                    <th className="py-3 px-4">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.data.content.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900">#{item.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">{item.tier}</td>
                      <td className="py-3.5 px-4 font-bold text-brand">
                        {item.quotedPrice.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            item.paymentReportedAt
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.paymentReportedAt ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : item.status === 'CANCELLED'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {item.status === 'APPROVED'
                            ? 'Đã duyệt'
                            : item.status === 'REJECTED'
                            ? 'Bị từ chối'
                            : item.status === 'CANCELLED'
                            ? 'Đã hủy'
                            : 'Đang xử lý'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {item.createdAt ? formatPaymentDate(item.createdAt) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
              <span className="text-gray-500">
                Trang <span className="font-semibold text-gray-900">{page + 1}</span> (tổng số {history.data.totalElements} yêu cầu)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Trang trước
                </button>
                <button
                  type="button"
                  disabled={history.data.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Trang sau
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
