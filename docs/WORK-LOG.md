# Work log

## 2026-11-06 — Khởi tạo React/Vite

- Mục tiêu: tạo project mới theo kiến trúc React/Vite thay cho bản Next.js trong tài liệu ban đầu.
- Đã làm: cập nhật `ARCHITECTURE.md`; tạo Vite React TypeScript; thêm React Router, TanStack Query, Zustand, Axios, Tailwind v4 và shadcn/ui; cấu hình alias `@/*`; chép font và asset Ellora; tạo hero cơ bản.
- Kiểm tra: `npm run build` thành công; `npm run lint` thành công (cảnh báo từ file do shadcn sinh ra).
- Tiến độ: nền tảng 0% → 90%; public 0% → 5%.
- Còn lại: auth provider, toàn bộ route và feature/API; so sánh giao diện trên mobile và desktop.

## 2026-11-06 — Chuyển các luồng chính

- Mục tiêu: bắt đầu clone frontend Angular theo kiến trúc React/Vite và API DTO → Mapper → Model → Query.
- Đã làm: public home/search/salon detail/for-business; auth Cognito login/register/reset; booking khách; customer profile/security/history; owner layout/dashboard/services/staff/bookings; admin layout/dashboard/users/approvals/support. Các route lớn tải lazy.
- API được đối chiếu từ các Angular service tương ứng. Những trang chưa chuyển chưa có link điều hướng trong layout mới.
- Kiểm tra: `npm run build` thành công; `npm run lint` thành công với cảnh báo ở file shadcn và một số phần React cần dọn tiếp. Chưa kiểm tra bằng tài khoản thật hoặc so sánh screenshot mobile/desktop.
- Tiến độ: xem `docs/PROGRESS.md`. Chưa đạt mục tiêu clone toàn bộ.
- Còn lại: owner profile/reviews/analytics/subscription/billing; admin salon changes/content/billing/subscriptions/disputes; bản đồ, đánh giá, ảnh, báo cáo, các trạng thái booking, kiểm tra thiết kế và luồng API thực tế.

## 2026-11-06 — Mở rộng owner, admin và public

- Mục tiêu: tiếp tục chuyển các màn hình và luồng API còn thiếu, theo DTO → Mapper → Model → API → Query.
- Đã làm: gói đăng ký owner/admin và bảng giá công khai; admin quản lý nội dung salon, ảnh, đánh giá/phản hồi; admin cấu hình phí, QR và đối soát công nợ; owner giờ mở cửa/ngày nghỉ, khách vãng lai và quản lý ảnh; public tìm salon gần vị trí, đánh giá, giờ hoạt động, chỉ đường và salon lân cận.
- Route mới: `/owner/hours`, `/owner/walk-in`, `/owner/photos`, `/admin/content`, `/admin/billing`. Đã gắn đường dẫn vào menu owner/admin.
- Kiểm tra: `npm run build` thành công; `npm run lint` thành công với 1 cảnh báo trong file button do shadcn sinh ra. Chưa kiểm tra trực quan mobile/desktop hoặc thử API bằng tài khoản thật. Bundle chính còn cảnh báo dung lượng trên 500 kB.
- Tiến độ: xem `docs/PROGRESS.md`. Chưa đạt mục tiêu clone toàn bộ.
- Còn lại: đối chiếu screenshot và chỉnh chính xác các trang; bản đồ tìm kiếm và bộ chọn vị trí owner; thông báo; biểu đồ; booking/customer các trạng thái nâng cao; kiểm thử end-to-end auth và API.

## 2026-11-06 — Đăng ký và phiên JWT

- Ghi lại endpoint và schema backend trong `BACKEND-ENDPOINTS.md`; đối chiếu mã trạng thái với controller.
- Chuyển đăng ký, xác thực OTP, đăng nhập, khôi phục mật khẩu và đăng xuất sang JWT backend; Axios tự đính kèm token và làm mới phiên.
- `npm run build` thành công. Chưa kiểm thử luồng email thực tế. Các feature ngoài xác thực vẫn cần đối chiếu API backend.

## 2026-11-06 — Kết nối API backend

- Đồng bộ phân trang, endpoint và DTO trực tiếp cho salon, dịch vụ, nhân viên, booking, đánh giá, owner và admin.
- Thêm tra cứu lịch theo mã, đánh giá và hủy lịch; kết nối upload ảnh dịch vụ. Các route chưa có backend báo chưa khả dụng.
- Frontend build và lint thành công; còn cảnh báo Fast Refresh trong `components/ui/button.tsx`. Chưa xác minh E2E với dữ liệu thật và Cloudinary.

## 2026-11-06 — Giao diện đặt lại mật khẩu

- Tách nhập email, mã OTP và mật khẩu mới; bổ sung xác nhận mật khẩu và gửi lại mã.
- BE hiện kiểm tra OTP cùng lúc đổi mật khẩu; giao diện ghi rõ thời điểm kiểm tra. Chưa có API xác thực OTP riêng.
- `npm run build` thành công; chưa kiểm tra email OTP thực tế.

## 2026-11-06 — Lịch hẹn của khách hàng

- Kết nối danh sách lịch phân trang qua `GET /api/v1/bookings/my`; BE giới hạn theo tài khoản xác thực.
- Kiểm thử use case và HTTP/JWT với PostgreSQL thật thành công; frontend build và lint thành công (còn cảnh báo Fast Refresh có sẵn).
- Chưa hoàn tất phân quyền cho API chi tiết và đổi trạng thái lịch hẹn.

## 2026-11-06 — Phân quyền lịch hẹn

- BE yêu cầu JWT và kiểm tra chủ lịch, chủ salon hoặc admin khi xem hoặc chuyển trạng thái; CUSTOMER chỉ hủy hoặc phản ánh lịch của mình.
- Kiểm thử unit, controller và tích hợp JWT/PostgreSQL thành công.
- Các chức năng API khác trong kế hoạch vẫn chưa hoàn thành.

## 2026-11-06 — Chỉnh sửa hồ sơ khách hàng

- Thêm API PUT /api/v1/auth/me và giao diện chỉnh sửa họ tên, số điện thoại theo JWT.
- Unit test và kiểm thử HTTP/JWT với PostgreSQL thật thành công; frontend build thành công.

## 2026-11-06 — Giờ hoạt động salon

- Bổ sung API GET/PUT giờ hoạt động cho salon của owner và API GET công khai theo salon ID; dữ liệu lưu trong bảng `salon_working_hours` có sẵn.
- Kiểm tra quyền owner bằng JWT, validate đủ bảy ngày và khoảng giờ; ngày chưa cấu hình mặc định đóng cửa.
- Kết nối lịch giờ hoạt động trong trang owner và trang chi tiết salon; cập nhật OpenAPI và `BACKEND-ENDPOINTS.md`.
- Frontend build và lint thành công. Toàn bộ 103 test BE (unit, controller, tích hợp PostgreSQL/JWT) pass trong Docker.

## 2026-11-06 — Ngày nghỉ salon

- Thêm API owner xem/thêm/xóa ngày nghỉ và API công khai lấy các ngày đóng cửa theo khoảng ngày.
- Kết nối trang owner để quản lý ngày nghỉ; booking kiểm tra ngày đóng cửa trước khi cho khách tiếp tục.
- Frontend build/lint thành công. Chạy 103 test BE trong Docker: 103 pass, 0 lỗi.
- Đang xuất lại OpenAPI chính thức từ backend để đồng bộ contract.

## 2026-11-06 — Khung giờ đặt lịch khả dụng

- Bổ sung `GET /api/v1/salons/{id}/availability` theo ngày, dịch vụ và tùy chọn nhân viên; kết quả loại khung ngoài giờ hoạt động, ngày nghỉ, giờ đã có lịch PENDING/CONFIRMED và giờ không đủ lead time trong ngày.
- Luồng tạo booking kiểm tra lại slot bằng cùng quy tắc, tránh gửi slot cũ hoặc giờ không hợp lệ.
- Frontend lấy giờ trống từ backend để render lựa chọn giờ và kiểm tra lại trước khi gửi booking; tài liệu endpoint được cập nhật.
- 6 test BE mục tiêu pass trong Docker; OpenAPI được xuất lại; backend được build/restart, `/healthz` trả 200 và runtime contract có đủ 3 nhóm giờ hoạt động/ngày nghỉ/availability.
- Frontend build/lint đã pass sau thay đổi UI ở nhóm này; lint còn một cảnh báo Fast Refresh có sẵn trong `components/ui/button.tsx`.

## 2026-11-06 — Booking khách vãng lai cho owner

- Thêm `POST /api/v1/owner/bookings/walk-ins`; server xác định salon theo owner JWT, nhận dịch vụ/nhân viên/giờ hẹn và thông tin liên hệ khách, sau đó dùng chung quy tắc tạo booking và xác thực slot.
- Kết nối trang owner với response DTO trực tiếp theo chuẩn backend (không bọc `APIResponse`).
- Test tích hợp PostgreSQL xác nhận anonymous bị từ chối và owner tạo được booking cho salon của mình: 1 test pass.
- Frontend build/lint pass; backend đã xuất lại OpenAPI, rebuild/restart thành công, `/healthz` trả 200 và endpoint walk-in có trong contract runtime.

## 2026-11-06 — Gói đăng ký salon và đối soát

- Bổ sung API public xem gói; owner xem gói hiện tại/lịch sử, tạo yêu cầu, lấy QR và báo đã chuyển khoản; admin cấu hình giá, lọc yêu cầu và duyệt/từ chối.
- Dùng bảng subscription đã có; chỉ kích hoạt sau khi xác nhận đã báo chuyển khoản và số tiền nhận đúng giá gói. Giá quote lấy từ cấu hình backend và phát hiện khi client gửi giá cũ.
- Chuyển frontend subscription sang response DTO trực tiếp và `PagedResult` đúng chuẩn BE.
- Test tích hợp PostgreSQL chạy trọn chu trình từ tạo gói, owner đăng ký/báo tiền, admin đối soát đến cập nhật tier: 1 test pass. Frontend build/lint pass (cảnh báo Fast Refresh có sẵn trong `components/ui/button.tsx`).
- OpenAPI export pass; backend được rebuild/restart, `/healthz` trả 200 và runtime OpenAPI có đủ routes subscription, walk-in và availability.

### 2026-11-06 — Điều chỉnh phạm vi booking
- Xác nhận nghiệp vụ hiện tại không thu tiền trong lúc user đặt lịch; booking chỉ tạo và được owner quản lý trạng thái.
- Gỡ endpoint upload QR vừa thêm vì nó chỉ phục vụ thanh toán; giữ nguyên schema có sẵn để không làm thay đổi dữ liệu nền.
- Billing/subscription không được tính là API thiếu của luồng cốt lõi; ưu tiên tiếp theo là quản lý booking, salon, nhân viên/dịch vụ và các công cụ admin.
- Đặt lịch công khai trước đây cho phép guest; đã đổi thành JWT `CUSTOMER` bắt buộc, khóa route FE và giữ query salon/dịch vụ khi login quay lại.
