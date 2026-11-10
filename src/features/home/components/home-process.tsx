import { Sparkles, CalendarDays, CheckCircle2, ShieldCheck } from 'lucide-react'

const processSteps = [
  {
    step: '01',
    icon: Sparkles,
    title: 'Khám Phá & Chọn Tiệm Xinh',
    description:
      'Tìm tiệm nail phong cách gần bạn, xem hình ảnh thực tế, bảng giá niêm yết và đánh giá chân thực từ khách hàng.',
    highlight: '500+ Salon tuyển chọn',
  },
  {
    step: '02',
    icon: CalendarDays,
    title: 'Chọn Dịch Vụ & Khung Giờ',
    description:
      'Tự do lựa chọn mẫu nail ưng ý, kỹ thuật viên tay nghề khéo léo và khung giờ còn trống phù hợp với thời gian biểu của bạn.',
    highlight: 'Linh hoạt & tiện lợi',
  },
  {
    step: '03',
    icon: CheckCircle2,
    title: 'Chốt Lịch Trong 30 Giây',
    description:
      'Xác nhận lịch hẹn tự động tức thì. Bạn chỉ cần ghé tiệm đúng giờ và tận hưởng dịch vụ làm đẹp không phải chờ đợi.',
    highlight: 'Xác nhận tức thì',
  },
]

export function HomeProcess() {
  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-rose-50/70 px-3.5 py-1 text-xs font-semibold text-brand">
            <ShieldCheck size={14} />
            <span>Quy trình đơn giản</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Làm Móng Đẹp Chỉ Với 3 Bước
          </h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Ellora giúp bạn loại bỏ hoàn toàn việc chờ đợi và thủ tục đặt hẹn rườm rà.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {processSteps.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between rounded-3xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-900/5"
              >
                <div>
                  {/* Step badge & icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black tracking-tighter text-pink-200 group-hover:text-brand/40 transition-colors">
                      {item.step}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-brand transition-transform group-hover:scale-110">
                      <Icon size={22} className="text-brand" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-gray-900 group-hover:text-brand transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Highlight */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  <span>{item.highlight}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
