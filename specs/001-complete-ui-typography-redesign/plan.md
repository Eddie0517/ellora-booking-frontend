# Implementation Plan: Toàn Bộ Kế Hoạch Tái Thiết Kế Giao Diện & Typography

**Feature**: [`specs/001-complete-ui-typography-redesign`](file:///d:/Project/ellora/ellora-booking-frontend/specs/001-complete-ui-typography-redesign)  
**Spec Reference**: [`specs/001-complete-ui-typography-redesign/spec.md`](file:///d:/Project/ellora/ellora-booking-frontend/specs/001-complete-ui-typography-redesign/spec.md)  
**Status**: Ready for Tasks & Implementation

---

## 1. Bối Cảnh Kỹ Thuật (Technical Context)

- **Framework & Core**: React 19 + TypeScript strict + Vite.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), token định nghĩa tại `src/styles/globals.css`.
- **Typography Engine**: `@fontsource-variable/geist` (`Geist Variable`).
- **Icons**: `lucide-react` (chuẩn hóa stroke width 1.75px).
- **Component Primitives**: Radix UI primitives (`radix-ui`) / shadcn architecture.
- **State & Server Management**: TanStack Query v5 + Zustand (`useAuthStore`).
- **Routing**: React Router v7 (`react-router-dom`).

---

## 2. Ma Trận Thay Đổi Tệp (File Changes Matrix)

| Tệp / Thành phần | Hành Động | Trách Nhiệm / Thay Đổi Chi Tiết |
| :--- | :---: | :--- |
| `src/styles/globals.css` | **Update** | Nhập font `@fontsource-variable/geist`, xóa bỏ `--color-ivory-*` và font `Minion Pro`, cập nhật bảng màu trắng `#FFFFFF` và hồng `#D84A6B`. |
| `src/components/layout/site-header.tsx` | **Update** | Tái thiết kế toàn diện: Header cố định kính mờ, thanh tìm kiếm dạng pill, logo sắc nét, menu tinh gọn, user avatar popover. |
| `src/components/layout/site-footer.tsx` | **Update** | Tái thiết kế toàn diện: Nền trắng, 4 cột thông tin thông thoáng, liên kết xã hội và bản quyền. |
| `src/features/home/components/home-page.tsx` | **Update** | Tái thiết kế toàn diện: Hero 2 cột bất đối xứng, thanh tìm kiếm đa năng, category rail, thẻ salon đề xuất, quy trình 3 bước tối giản. |
| `src/features/salon/components/salon-card.tsx` | **Update** | Thẻ salon mới: Ảnh tỉ lệ 4:3, huy hiệu rating, nhãn giá, tag địa điểm, 2 slot giờ trống gần nhất, nút tim yêu thích. |
| `src/features/salon/components/salon-search-form.tsx` | **Update** | Form tìm kiếm tích hợp ngay trên Hero hoặc thanh tìm kiếm nhanh. |
| `src/features/salon/components/search-page.tsx` | **Update** | Trang tìm kiếm: Bộ lọc sticky pills thông minh, toggle Grid/List view, sorting bar, empty state chuyên nghiệp. |
| `src/features/salon/components/salon-detail-page.tsx` | **Update** | Trang chi tiết salon: Bento photo grid 5 ảnh, menu dịch vụ dạng tab với giá & thời lượng, sticky booking dock bên phải. |
| `src/features/booking/components/booking-page.tsx` | **Update** | Luồng đặt lịch 4 bước tinh gọn: Chọn dịch vụ/kỹ thuật viên, chọn ngày & giờ, điền thông tin, tóm tắt thanh toán. |
| `src/features/business/components/for-business-page.tsx` | **Update** | Landing page giới thiệu giải pháp cho đối tác salon: Thống kê tăng trưởng, tính năng quản lý, bảng quyền lợi. |
| `src/features/business/components/business-registration-page.tsx` | **Update** | Form đăng ký chủ tiệm đa bước, nhập liệu thông minh, phản hồi lỗi trực quan. |
| `src/features/customer/components/my-bookings-page.tsx` | **Update** | Quản lý lịch hẹn của khách: Tabs Sắp tới/Lịch sử/Đã hủy, hiển thị mã đơn, salon, ngày giờ và nút thao tác nhanh. |
| `src/features/customer/components/profile-page.tsx` | **Update** | Cập nhật giao diện trang hồ sơ khách hàng theo tone trắng - hồng. |
| `src/features/customer/components/security-page.tsx` | **Update** | Cập nhật giao diện trang bảo mật/đổi mật khẩu. |
| `src/features/auth/components/login-page.tsx` | **Update** | Giao diện đăng nhập Split-Screen: Ảnh nghệ thuật bên trái, form đăng nhập nền trắng sắc sảo bên phải. |
| `src/features/auth/components/register-page.tsx` | **Update** | Giao diện đăng ký tài khoản phong cách tương đồng. |
| `src/features/auth/components/forgot-password-page.tsx` | **Update** | Giao diện khôi phục mật khẩu. |
| `src/features/owner/components/owner-layout.tsx` | **Update** | Khung quản trị Chủ Salon: Nền trắng, sidebar thanh thoát, header với thông báo và thông tin salon. |
| `src/features/admin/components/admin-layout.tsx` | **Update** | Khung quản trị Quản Trị Viên: Sidebar hiện đại, typography đồng bộ. |

---

## 3. Các Giai Đoạn Triển Khai (Execution Phases)

### Phase 1: Nền Tảng Design Tokens & Typography (Foundation)
- Cập nhật `src/styles/globals.css`:
  - Import `@fontsource-variable/geist/index.css`.
  - Cấu hình `@theme`: `--font-sans: 'Geist Variable', -apple-system, sans-serif;`.
  - Cấu hình bộ màu: `--color-background: #ffffff;`, `--color-primary: #d84a6b;`, `--color-surface: #fafafa;`.
  - Xóa bỏ toàn bộ class/biến font `Minion Pro` và màu `--color-ivory-*`.
- Kiểm tra tính tương thích Tailwind v4 và build sơ bộ.

### Phase 2: Khung Layout Toàn Cục (Site Shell)
- Cập nhật `SiteHeader`:
  - Thanh header kính mờ `bg-white/95 backdrop-blur-md border-b border-gray-100`.
  - Logo sắc nét, menu trượt, user dropdown gọn gàng.
- Cập nhật `SiteFooter`:
  - Nền trắng tinh khôi, cấu trúc 4 cột thông tin rõ ràng.

### Phase 3: Màn Hình Người Tiêu Dùng Trọng Tâm (Consumer Core)
- Cập nhật `HomePage`: Hero section 2 cột, category slider, featured salon grid, 3-step value prop.
- Cập nhật `SalonCard`: Thẻ hiển thị chuyên nghiệp với giờ trống và ảnh sắc nét.
- Cập nhật `SearchPage`: Bộ lọc linh hoạt, toggle Grid/List, empty state.

### Phase 4: Chi Tiết Salon & Quy Trình Đặt Hẹn (Salon Detail & Booking Flow)
- Cập nhật `SalonDetailPage`: Bento Photo Showcase, Service Catalog theo Tabs, Sticky Booking Dock.
- Cập nhật `BookingPage`: Trình hướng dẫn 4 bước (Dịch vụ -> Thợ -> Ngày/Giờ -> Xác nhận).

### Phase 5: Khu Vực Doanh Nghiệp & Xác Thực (Business & Auth)
- Cập nhật `ForBusinessPage` & `BusinessRegistrationPage`.
- Cập nhật `LoginPage`, `RegisterPage`, `ForgotPasswordPage` (Split-screen high-conversion).

### Phase 6: Khu Vực Khách Hàng, Đối Tác & Quản Trị (Portals)
- Cập nhật `MyBookingsPage`, `ProfilePage`, `SecurityPage`.
- Cập nhật `OwnerLayout` và `AdminLayout`.

### Phase 7: Kiểm Thử Toàn Diện & Tối Ưu (Verification & Polish)
- Kiểm tra toàn bộ Responsive từ `375px` (mobile), `768px` (tablet) đến `1440px` (desktop).
- Chạy `npm run build` và `npm run lint` để đảm bảo 0 lỗi TypeScript và cú pháp.
- Đảm bảo 100% các luồng API và tương tác người dùng hoạt động bình thường.
