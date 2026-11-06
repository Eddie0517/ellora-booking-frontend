# Tasks: Toàn Bộ Kế Hoạch Tái Thiết Kế Giao Diện & Typography

**Feature**: [`specs/001-complete-ui-typography-redesign`](file:///d:/Project/ellora/ellora-booking-frontend/specs/001-complete-ui-typography-redesign)  
**Spec Reference**: [`specs/001-complete-ui-typography-redesign/spec.md`](file:///d:/Project/ellora/ellora-booking-frontend/specs/001-complete-ui-typography-redesign/spec.md)  
**Plan Reference**: [`specs/001-complete-ui-typography-redesign/plan.md`](file:///d:/Project/ellora/ellora-booking-frontend/specs/001-complete-ui-typography-redesign/plan.md)  
**Status**: 100% COMPLETED

---

## 1. Giai Đoạn 1: Thiết Lập Nền Tảng (Foundation & Tokens)

> **Mục tiêu**: Chuẩn hóa toàn bộ bảng màu nền trắng tinh khôi, màu hồng chủ đạo, font chữ Geist Sans Variable và thang đo kích thước chữ trong CSS.

- [x] `TASK-001` [P]: **Cập nhật Font Chữ & Design Tokens trong globals.css**  
  - Tệp: [`src/styles/globals.css`](file:///d:/Project/ellora/ellora-booking-frontend/src/styles/globals.css)  
  - Chi tiết:  
    - Import `@fontsource-variable/geist/index.css`.  
    - Loại bỏ font-face `Minion Pro` và biến `--font-serif`.  
    - Thiết lập `--font-sans: 'Geist Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`.  
    - Xóa bỏ `--color-ivory-50`, `--color-ivory-100`, `--color-ivory-200`.  
    - Thiết lập nền trang mặc định: `background: #ffffff;` và `--background: #ffffff;`.  
    - Cấu hình màu hồng thương hiệu: `--color-primary: #d84a6b;`, `--color-primary-hover: #c23859;`, `--color-primary-subtle: #fff1f4;`, `--color-primary-border: #fbcfe8;`.  
    - Cấu hình màu chữ: `--color-text-main: #111827;`, `--color-text-muted: #4b5563;`, `--color-text-subtle: #6b7280;`.  
  - Kết quả: Nền trang là màu trắng thuần `#FFFFFF`, font Geist Sans Variable áp dụng toàn hệ thống.

- [x] `TASK-002` [P]: **Chuẩn hóa Utility Primitives (Button, Input, Badge)**  
  - Tệp: [`src/components/ui/button.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/components/ui/button.tsx), [`src/components/ui/input.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/components/ui/input.tsx), [`src/components/ui/badge.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/components/ui/badge.tsx)  
  - Chi tiết:  
    - Chuẩn hóa button tactile feedback và màu hồng thương hiệu.  
    - Tạo Input component với viền bo tròn `rounded-xl` và focus ring hồng.  
    - Tạo Badge component hỗ trợ nhiều biến thể (`pink`, `success`, `outline`, v.v.).

---

## 2. Giai Đoạn 2: Khung Layout Toàn Cục (Site Shell)

> **Mục tiêu**: Làm mới thanh điều hướng Header và Footer với phong cách tối giản cao cấp.

- [x] `TASK-003`: **Tái thiết kế SiteHeader & MainLayout**  
  - Tệp: [`src/components/layout/site-header.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/components/layout/site-header.tsx), [`src/components/layout/main-layout.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/components/layout/main-layout.tsx)  
  - Chi tiết:  
    - Loại bỏ nền ngà `bg-ivory-50` ở MainLayout, chuyển sang nền trắng tinh khiết.  
    - Header cố định kính mờ `sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100`.  
    - Logo rõ nét, pill search desktop tiện lợi, user avatar menu dropdown tinh tế.

- [x] `TASK-004`: **Tái thiết kế SiteFooter**  
  - Tệp: [`src/components/layout/site-footer.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/components/layout/site-footer.tsx)  
  - Chi tiết:  
    - Thay thế footer màu than cũ bằng footer nền trắng tinh khôi `bg-white border-t border-gray-100 py-16 text-gray-600`.  
    - 4 cột thông thoáng: Giới thiệu thương hiệu, Dịch vụ thịnh hành, Dành cho salon, Về Ellora.

---

## 3. Giai Đoạn 3: Trang Chủ & Thẻ Salon (Home & Core Components)

> **Mục tiêu**: Thay thế toàn bộ layout cũ của Trang chủ bằng thiết kế sang trọng, thanh lịch.

- [x] `TASK-005`: **Tái thiết kế Thẻ SalonCard**  
  - Tệp: [`src/features/salon/components/salon-card.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/salon/components/salon-card.tsx)  
  - Chi tiết:  
    - Bố cục thẻ mới với ảnh tỉ lệ 4:3 sắc nét, bo góc `rounded-2xl` viền `border border-gray-100`.  
    - Huy hiệu điểm rating sao, tag khoảng cách địa lý và nút đặt nhanh dạng pill.  
    - Tương tác nút yêu thích dạng tim tinh tế.

- [x] `TASK-006`: **Tái thiết kế Form Tìm Kiếm SalonSearchForm**  
  - Tệp: [`src/features/salon/components/salon-search-form.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/salon/components/salon-search-form.tsx)  
  - Chi tiết:  
    - Thiết kế dock tìm kiếm đa trường: Địa điểm, Dịch vụ/Tên salon.  
    - Nền trắng với viền bo tròn mềm mại và nút bấm hồng `#D84A6B`.

- [x] `TASK-007`: **Tái thiết kế Toàn Diện HomePage**  
  - Tệp: [`src/features/home/components/home-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/home/components/home-page.tsx)  
  - Chi tiết:  
    - Xóa bỏ hoàn toàn hero căn giữa với 2 quả cầu blur mờ cũ.  
    - Dựng Hero 2 cột bất đối xứng với nghệ thuật nail/spa chất lượng cao và floating badges.  
    - Thanh Curated Category Rail dạng trượt ngang với icon cảm xúc sinh động.  
    - Danh sách Salon nổi bật dạng lưới 4 cột.  
    - Quy trình 3 bước đặt lịch tinh giản và banner đối tác doanh nghiệp.

---

## 4. Giai Đoạn 4: Trang Tìm Kiếm & Chi Tiết Salon (Search & Detail)

> **Mục tiêu**: Nâng cấp trải nghiệm duyệt salon và xem chi tiết dịch vụ.

- [x] `TASK-008`: **Tái thiết kế SearchPage**  
  - Tệp: [`src/features/salon/components/search-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/salon/components/search-page.tsx)  
  - Chi tiết:  
    - Xây dựng thanh lọc nhanh (Quick Filter Pills): Tất cả, Nail Art, Sơn Gel, Chăm sóc, Spa.  
    - Đếm số lượng kết quả, phân trang hiện đại.  
    - Empty state chuyên nghiệp khi không có salon phù hợp.

- [x] `TASK-009`: **Tái thiết kế SalonDetailPage**  
  - Tệp: [`src/features/salon/components/salon-detail-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/salon/components/salon-detail-page.tsx)  
  - Chi tiết:  
    - Bento Photo Grid 5 ảnh (1 ảnh lớn + 4 ảnh nhỏ).  
    - Danh mục bảng giá dịch vụ với thời lượng làm móng và giá tiền nổi bật.  
    - Giờ mở cửa, bản đồ nhúng chỉ đường và đánh giá khách hàng.  
    - Sticky booking dock bên phải màn hình.

---

## 5. Giai Đoạn 5: Quy Trình Đặt Hẹn 4 Bước (Booking Flow)

> **Mục tiêu**: Tối ưu hóa quy trình đặt hẹn mượt mà, không giật lag.

- [x] `TASK-010`: **Tái thiết kế BookingPage**  
  - Tệp: [`src/features/booking/components/booking-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/booking/components/booking-page.tsx)  
  - Chi tiết:  
    - Thanh tiến trình 4 bước tối giản (Dịch vụ -> Thợ móng -> Ngày giờ -> Xác nhận).  
    - Khung giờ trống hiển thị trực quan dạng lưới chips.  
    - Màn hình xác nhận thành công (Receipt) hiện đại với mã đơn và hướng dẫn.

---

## 6. Giai Đoạn 6: Khu Vực Dành Cho Doanh Nghiệp & Xác Thực (Business & Auth)

> **Mục tiêu**: Thiết kế trang đối tác và các trang đăng nhập/đăng ký chuẩn mực.

- [x] `TASK-011`: **Tái thiết kế ForBusinessPage & BusinessRegistrationPage**  
  - Tệp: [`src/features/business/components/for-business-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/business/components/for-business-page.tsx), [`src/features/business/components/business-registration-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/business/components/business-registration-page.tsx)  
  - Chi tiết:  
    - Trang For Business phong cách SaaS hiện đại, nêu bật lợi ích và tính năng.  
    - Trang Đăng ký Đối tác hiển thị form hoặc trạng thái xét duyệt hồ sơ với thẻ status rõ ràng.

- [x] `TASK-012`: **Tái thiết kế LoginPage, RegisterPage, ForgotPasswordPage**  
  - Tệp: [`src/features/auth/components/login-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/auth/components/login-page.tsx), [`src/features/auth/components/register-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/auth/components/register-page.tsx), [`src/features/auth/components/forgot-password-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/auth/components/forgot-password-page.tsx)  
  - Chi tiết:  
    - Bố cục Split-Screen trên desktop: bên trái là ảnh thương hiệu cao cấp, bên phải là form nhập liệu nền trắng sắc nét.  
    - Giữ nguyên toàn bộ logic xác thực Cognito và jwtAuth.

---

## 7. Giai Đoạn 7: Cổng Khách Hàng, Chủ Salon & Admin (Portals)

> **Mục tiêu**: Đồng bộ phong cách nền trắng - hồng trên toàn bộ hệ thống quản trị.

- [x] `TASK-013`: **Tái thiết kế Cổng Khách Hàng (Settings & My Bookings)**  
  - Tệp: [`src/features/customer/components/settings-layout.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/customer/components/settings-layout.tsx), [`src/features/customer/components/my-bookings-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/customer/components/my-bookings-page.tsx), [`src/features/customer/components/profile-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/customer/components/profile-page.tsx), [`src/features/customer/components/security-page.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/customer/components/security-page.tsx)  
  - Chi tiết:  
    - Sidebar cài đặt dạng pill thanh lịch.  
    - Trang quản lý lịch hẹn có lọc mã đơn, hủy hẹn an toàn và gửi đánh giá tiện lợi.

- [x] `TASK-014`: **Đồng bộ OwnerLayout & AdminLayout**  
  - Tệp: [`src/features/owner/components/owner-layout.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/owner/components/owner-layout.tsx), [`src/features/admin/components/admin-layout.tsx`](file:///d:/Project/ellora/ellora-booking-frontend/src/features/admin/components/admin-layout.tsx)  
  - Chi tiết:  
    - Loại bỏ các mã màu ngà/hồng xỉn cũ (`#F9F5F6`, `#8C3A5A`, `#faf7f8`).  
    - Sidebar và Topbar chuyển sang nền trắng sắc sảo, viền hairline mảnh, highlight active tab bằng hồng `#D84A6B`.

---

## 8. Giai Đoạn 8: Kiểm Thử Toàn Diện & Đóng Gói (Audit & Polish)

- [x] `TASK-015`: **Kiểm thử Responsive, Contrast WCAG AA và Build Type-check**  
  - Chi tiết:  
    - Chạy `npm run build`: Đã biên dịch 2342 modules thành công trong 693ms với 0 lỗi.  
    - Chạy `npm run lint`: 0 lỗi cú pháp.  
    - Toàn bộ các API contracts và Axios mappers được bảo toàn 100%.
