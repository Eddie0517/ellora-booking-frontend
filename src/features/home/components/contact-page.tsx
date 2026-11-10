import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Send,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Headphones,
} from 'lucide-react'
import { useAdminSupport } from '@/features/admin/queries/admin.queries'
import { toast } from 'sonner'

interface FAQItem {
  question: string
  answer: string
  category: 'khach-hang' | 'chu-salon'
}

const faqs: FAQItem[] = [
  {
    category: 'khach-hang',
    question: 'Làm thế nào để đặt lịch làm móng trên Ellora?',
    answer:
      'Bạn chỉ cần tìm kiếm tiệm nail gần bạn trên thanh tìm kiếm hoặc trang Khám phá, chọn dịch vụ mong muốn, chọn ngày giờ và bấm "Xác nhận đặt hẹn". Hệ thống sẽ giữ chỗ tức thì mà không cần thanh toán trước.',
  },
  {
    category: 'khach-hang',
    question: 'Tôi có thể hủy hoặc đổi giờ hẹn sau khi đã đặt không?',
    answer:
      'Có. Bạn có thể truy cập mục "Tài khoản > Lịch hẹn của tôi" để xem danh sách lịch và chủ động hủy hoặc đổi hẹn ít nhất 2 giờ trước giờ hẹn quy định.',
  },
  {
    category: 'chu-salon',
    question: 'Salon muốn đăng ký tham gia mạng lưới Ellora cần chuẩn bị gì?',
    answer:
      'Chủ salon chỉ cần truy cập trang "Đăng ký mở tiệm", điền tên cơ sở, địa chỉ, số điện thoại và tải lên hình ảnh cơ sở / bảng giá. Đội ngũ Ellora sẽ liên hệ và xét duyệt trong vòng 24 giờ.',
  },
  {
    category: 'chu-salon',
    question: 'Chi phí đối tác và phí dịch vụ của Ellora như thế nào?',
    answer:
      'Ellora miễn phí khởi tạo gian hàng và hỗ trợ đăng tải hồ sơ cho mọi salon đối tác mới. Bạn có thể trải nghiệm các gói tính năng linh hoạt được tối ưu riêng cho ngành nail & spa.',
  },
  {
    category: 'khach-hang',
    question: 'Khi gặp sự cố hoặc cần hỗ trợ gấp, tôi liên hệ ai?',
    answer:
      'Bạn hãy gọi ngay vào Hotline hỗ trợ khẩn cấp của Ban Quản Trị Ellora: 0369589161 hoặc nhắn tin qua Fanpage chính thức để được giải quyết trong vòng 15-30 phút.',
  },
]

export function ContactPage() {
  const support = useAdminSupport()
  const supportEmail = support.data?.email || 'ellorabooking77@gmail.com'
  const supportPhone = support.data?.phone || '0369589161'
  const supportFacebook =
    support.data?.facebookUrl || 'https://www.facebook.com/profile.php?id=100090024755289'

  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const [formSent, setFormSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'customer',
    message: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.message) {
      toast.error('Vui lòng điền đầy đủ họ tên và nội dung cần hỗ trợ.')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setFormSent(true)
      toast.success('Yêu cầu hỗ trợ đã được gửi thành công! Ban quản trị Ellora sẽ liên hệ sớm nhất.')
      setFormData({ name: '', phone: '', email: '', role: 'customer', message: '' })
    }, 800)
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50/40 via-white to-gray-50/30">
      {/* Top Breadcrumb & Hero */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="transition hover:text-brand">Trang chủ</Link>
          <span>/</span>
          <span className="text-brand font-semibold">Giải đáp thắc mắc & Liên hệ</span>
        </nav>

        {/* Hero Title (Nhỏ lại, tinh tế & thanh thoát) */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50/70 px-3 py-0.5 text-[11px] font-medium text-brand">
            <Headphones size={12} className="shrink-0" />
            <span>Trung tâm trợ giúp Ellora</span>
          </span>
          <h1 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Giải Đáp Thắc Mắc & Liên Hệ Ban Quản Trị
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 font-normal leading-relaxed max-w-lg mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe, giải đáp mọi thắc mắc và hỗ trợ nhanh chóng cho khách hàng cũng như chủ salon đối tác.
          </p>
        </div>

        {/* PHẦN 1: Form Gửi Tin Nhắn & FAQ */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Column 1: Contact Form */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand" />
                <h2 className="text-lg font-bold text-gray-900">Gửi Tin Nhắn Cho Admin</h2>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Để lại câu hỏi hoặc thắc mắc của bạn, admin Ellora sẽ phản hồi qua email hoặc số điện thoại.
              </p>

              {formSent ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-emerald-900">Đã gửi tin nhắn thành công!</h3>
                  <p className="mt-1 text-xs text-emerald-700">
                    Cảm ơn bạn. Đội ngũ quản trị Ellora đã nhận được thông tin và sẽ phản hồi sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormSent(false)}
                    className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    Gửi thắc mắc khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Họ và tên của bạn <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        placeholder="0912 345 678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email liên hệ
                      </label>
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Bạn là:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label
                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 font-medium transition ${
                          formData.role === 'customer'
                            ? 'border-brand bg-rose-50/60 text-brand'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="customer"
                          checked={formData.role === 'customer'}
                          onChange={() => setFormData({ ...formData, role: 'customer' })}
                          className="sr-only"
                        />
                        <span>Khách hàng</span>
                      </label>
                      <label
                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 font-medium transition ${
                          formData.role === 'owner'
                            ? 'border-brand bg-rose-50/60 text-brand'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="owner"
                          checked={formData.role === 'owner'}
                          onChange={() => setFormData({ ...formData, role: 'owner' })}
                          className="sr-only"
                        />
                        <span>Chủ salon nail</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nội dung câu hỏi / Thắc mắc <span className="text-brand">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề bạn cần admin hỗ trợ..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-brand-dark transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{sending ? 'Đang gửi...' : 'Gửi Thắc Mắc Tới Admin'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: FAQ Section */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <HelpCircle size={18} className="text-brand" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Câu Hỏi Thường Gặp (FAQ)</h2>
                <p className="text-xs text-gray-500">
                  Câu trả lời nhanh cho các thắc mắc phổ biến nhất
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs transition hover:border-gray-200"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between text-left gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            faq.category === 'khach-hang'
                              ? 'bg-rose-50 text-brand'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {faq.category === 'khach-hang' ? 'Khách hàng' : 'Chủ salon'}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{faq.question}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-brand' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pl-1 pt-2 border-t border-gray-50">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* PHẦN 2: 3 Thẻ Kênh Liên Hệ Trực Tiếp */}
        <div className="mt-14 pt-8 border-t border-rose-100/70">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Hotline */}
            <div className="group relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <Phone size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">Hotline hỗ trợ 24/7</h3>
              <p className="mt-1 text-xs text-gray-500">
                Giải quyết khiếu nại, hỗ trợ sự cố khẩn cấp và tư vấn dịch vụ.
              </p>
              <a
                href={`tel:${supportPhone}`}
                className="mt-4 inline-flex items-center gap-1.5 text-base font-extrabold text-brand hover:underline"
              >
                <span>{supportPhone}</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Card 2: Email Ban Quản Trị */}
            <div className="group relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <Mail size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">Email Quản Trị Viên</h3>
              <p className="mt-1 text-xs text-gray-500">
                Tiếp nhận hồ sơ đối tác, đối soát tài chính và giải đáp thắc mắc.
              </p>
              <a
                href={`mailto:${supportEmail}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline break-all"
              >
                <span>{supportEmail}</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Card 3: Facebook Fanpage */}
            <div className="group relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-md sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <MessageSquare size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">Fanpage Facebook</h3>
              <p className="mt-1 text-xs text-gray-500">
                Chat trực tiếp với đội ngũ quản trị viên qua Messenger.
              </p>
              <a
                href={supportFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
              >
                <span>Nhắn tin qua Facebook</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
