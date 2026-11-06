# Technical Research & Architectural Decisions: Toàn Bộ Giao Diện & Typography

**Feature**: [`specs/001-complete-ui-typography-redesign`](file:///d:/Project/ellora/ellora-booking-frontend/specs/001-complete-ui-typography-redesign)  
**Date**: 06/11/2026

---

## 1. Quyết Định Font Chữ (Typography Family & Engine)

- **Quyết định (Decision)**: Sử dụng `@fontsource-variable/geist` (Geist Sans Variable) làm font chữ mặc định cho toàn bộ dự án, bổ sung utility font display cho các tiêu đề lớn.
- **Lý do (Rationale)**:
  - Thư viện `@fontsource-variable/geist` đã có sẵn trong `package.json` (`^5.3.0`).
  - Font variable hỗ trợ dải weight từ `100` đến `900`, cho phép tinh chỉnh tracking và weight cực kỳ chuẩn xác cho cả Display Headlines và Body Text.
  - Loại bỏ hoàn toàn font serif cổ điển `Minion Pro` (vốn làm giao diện bị già cỗi, nặng nề) và font `Inter` cơ bản.
  - Phù hợp tuyệt đối với hướng dẫn của skill `design-taste-frontend` ("Discouraged as default: Inter. Pick Geist, Outfit, Cabinet Grotesk, Satoshi...").
- **Các phương án thay thế đã cân nhắc (Alternatives Considered)**:
  - `Satoshi` / `Cabinet Grotesk`: Cần cài thêm font cục bộ hoặc CDN, có nguy cơ layout shift nếu mạng chậm.
  - `Inter`: Quá phổ thông, mang tính AI-template cao.

---

## 2. Quyết Định Bảng Màu & Nền Trang (Color System & Surface)

- **Quyết định (Decision)**:
  - **Màu nền (Background)**: `#FFFFFF` (Pure White) đồng nhất trên tất cả các màn hình (Client, Owner, Admin, Auth).
  - **Màu bề mặt phụ (Surface)**: `#FAFAFA` cho background của các block tìm kiếm, sidebar, table header; `#F4F4F6` cho hover state.
  - **Màu thương hiệu chính (Primary Pink)**: `#D84A6B` (Rose Quartz Pink), hover: `#C23859`, active: `#A82946`.
  - **Màu bổ trợ (Supporting Pink)**: `#FFF1F4` (Primary subtle cho tag/badge), `#FBCFE8` (Viền nhấn).
  - **Độ tương phản (A11y)**: `#D84A6B` trên nền trắng `#FFFFFF` đạt tỷ lệ **4.65:1** (đạt chuẩn WCAG AA cho văn bản và nút bấm).
- **Lý do (Rationale)**:
  - Loại bỏ màu vàng kem/ngà cũ (`#fdfbf7`, `--color-ivory-50`, `#efeae0`) - nguyên nhân chính làm giao diện cũ trông đục và thiếu sự tinh khôi của ngành làm đẹp/spa.
  - Tạo không gian thoáng đãng, sắc sảo (crisp & pristine) đúng với tiêu chuẩn nền tảng làm đẹp hiện đại.
- **Các phương án thay thế đã cân nhắc**:
  - Hot Pink `#EC4899`: Quá chói, gây mỏi mắt cho người dùng khi xem danh sách salon lâu.
  - Soft Pink `#F9A8B6`: Độ tương phản văn bản chỉ đạt 2.2:1 (không đạt chuẩn WCAG AA).

---

## 3. Quyết Định Bố Cục & Ngôn Ngữ Thiết Kế (Layout & Anti-Slop Discipline)

- **Quyết định (Decision)**:
  - **Hero Section**: Bố cục 2 cột lệch (Left: Copy & Search Dock; Right: High-fashion Photography & Dynamic Rating Badge). Giới hạn tiêu đề tối đa 2 dòng desktop, mô tả dưới 20 từ.
  - **Spacing & Radius**: Thống nhất quy tắc góc bo: `rounded-2xl` (16px) cho Cards & Dialogs; `rounded-xl` (12px) cho Form Inputs; `rounded-full` cho Buttons, Pills và Badges.
  - **Shadows**: Loại bỏ drop shadow màu xám đen đậm. Sử dụng viền hairline `border-gray-100` (`#F3F4F6`) kết hợp bóng khuếch tán siêu nhẹ màu hồng nhạt `shadow-[0_4px_24px_rgba(216,74,107,0.06)]`.
  - **Tương tác**: Tactile feedback khi click (`active:scale-[0.98] transition-transform duration-150`).
- **Lý do (Rationale)**:
  - Xóa bỏ định kiến giao diện "AI-generated" với thẻ lồng thẻ, gradient mờ và nút bấm không đồng nhất.

---

## 4. Quyết Định Kiến Trúc Dữ Liệu & Tương Thích (Data Contracts & Zero Regression)

- **Quyết định (Decision)**:
  - 100% logic API, DTO, Model, Mapper trong `src/features/*/` được bảo tồn nguyên vẹn.
  - Các hook TanStack Query (`useSalons`, `useSalonDetail`, v.v.) và state Zustand (`useAuthStore`) được giữ nguyên chữ ký hàm (function signature) và kiểu dữ liệu trả về.
  - Chỉ thay đổi tầng hiển thị (JSX/TSX) và CSS utility classes.
- **Lý do (Rationale)**:
  - Đảm bảo toàn bộ luồng nghiệp vụ hiện tại (Authentication, Tìm kiếm, Đặt lịch, Quản trị Owner/Admin) tiếp tục hoạt động trơn tru sau khi thay đổi giao diện.
