# Tiến độ chuyển Angular → React

| Phần việc | Tiến độ | Trạng thái |
| --- | ---: | --- |
| Nền tảng React/Vite, TypeScript, router, Tailwind, asset | 90% | Có auth provider, role guard và lazy routes; còn hoàn thiện shared utilities |
| Public: home, search, salon detail, for business | 65% | Có tìm salon gần vị trí, bản đồ chi tiết, đánh giá, giờ hoạt động, ngày đóng cửa và khung giờ trống từ backend, gói công khai; còn nhiều chi tiết thiết kế và tương tác nâng cao |
| Auth: login, register, forgot password | 65% | Có Cognito email, Google callback, profile sync; cần kiểm tra phiên thực tế và UI |
| Booking và customer settings | 50% | Có booking cơ bản, truy vấn khung giờ còn trống, hồ sơ, bảo mật, lịch sử; thiếu nhiều trạng thái chi tiết |
| Owner | 64% | Có dashboard, hồ sơ, dịch vụ, nhân viên, lịch hẹn, khách vãng lai, giờ hoạt động và ngày nghỉ đã kết nối backend; còn ảnh, analytics, bản đồ, thông báo và biểu đồ |
| Admin | 65% | Có dashboard, quản lý users và duyệt salon; còn support, duyệt thay đổi, disputes, content, biểu đồ và kiểm tra luồng thực tế |

## Lịch sử cập nhật

| Ngày | Thay đổi | Lý do |
| --- | --- | --- |
| 2026-11-06 | 0% → 90% nền tảng | Tạo project, chuyển kiến trúc sang Vite, cấu hình shadcn |
| 2026-11-06 | Public 5% → 45%, auth 0% → 65%, booking/customer 0% → 45%, owner 0% → 30%, admin 0% → 25% | Chuyển các route, giao diện và API chính từ Angular; chưa đối chiếu trực quan đầy đủ |
| 2026-11-06 | Public 45% → 63%, owner 30% → 63%, admin 25% → 65% | Kết nối giờ hoạt động và ngày nghỉ; các API owner/admin và giao diện nâng cao vẫn đang được rà soát |
| 2026-11-06 | Public 63% → 65%, booking 45% → 50% | Thêm API khung giờ khả dụng theo ngày/dịch vụ/nhân viên; tạo booking xác nhận slot theo cùng quy tắc |
| 2026-11-06 | Owner 63% → 64% | Tạo booking khách vãng lai bằng JWT owner và salon lấy từ session; trang owner không gửi salonId |

## Tích hợp backend hiện tại — 2026-11-06

Đã nối các API cho salon, đặt lịch, tra cứu lịch theo mã, đánh giá, hồ sơ, danh sách lịch của khách, cập nhật hồ sơ, giờ hoạt động, ngày nghỉ salon, khung giờ khả dụng và walk-in. Thanh toán không thuộc luồng nghiệp vụ booking hiện tại; các trang billing/subscription đang là route placeholder và không nằm trong backlog tích hợp cốt lõi. Support, ảnh gallery, analytics và một số luồng quản trị còn cần đối chiếu/hoàn thiện phía backend. Chưa kiểm thử đầu cuối với tài khoản thật và dịch vụ email/media ngoài.
