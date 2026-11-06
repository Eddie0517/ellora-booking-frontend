# Feature Specification: Toàn bộ Kế hoạch Tái thiết kế Giao diện & Hệ thống Typography (Ellora Booking Platform)

**Mã tính năng**: `specs/001-complete-ui-typography-redesign`  
**Ngày khởi tạo**: 06/11/2026  
**Trạng thái**: Draft / Sẵn sàng phê duyệt  
**Định hướng thiết kế**: Pure White Background (`#FFFFFF`), Primary Pink Accent (`#D84A6B` / `#E85D75`), Modern Minimalist & Editorial Beauty Aesthetic (Anti-slop, WCAG AA Contrast, Crisp Type Scale).

---

## 1. Bối cảnh & Tầm nhìn (Vision & Context)

### 1.1 Vấn đề của giao diện cũ
- **Màu nền và chất liệu cũ**: Nền ngà/vàng kem (`#fdfbf7`, `--color-ivory-50`) kết hợp các mảng màu mờ đục tạo cảm giác cũ kỹ, thiếu sự trong trẻo, sang trọng cần có của một nền tảng làm đẹp hiện đại.
- **Typography thiếu thang bậc (Hierarchy)**: Font serif cổ điển (`Minion Pro`) kết hợp `Inter` không đồng nhất, size chữ ở nhiều nơi bị quá nhỏ hoặc quá lớn, line-height chưa chuẩn khiến mật độ hiển thị thiếu tinh tế.
- **Bố cục rập khuôn (AI / Template Cliché)**: Hero căn giữa kèm đốm gradient mờ ảo, lưới 3 thẻ tính năng nhàm chán, thiếu nhịp điệu (layout rhythm), nút bấm bo tròn không đồng bộ, contrast ở một số nhãn chữ chưa đạt chuẩn WCAG AA.
- **Trải nghiệm đặt lịch chưa tối ưu**: Luồng tìm kiếm salon, xem chi tiết dịch vụ và chọn giờ đặt hẹn còn đơn điệu, chưa toát lên được trải nghiệm cao cấp (editorial / luxury beauty concierge).

### 1.2 Mục tiêu tái thiết kế toàn diện
1. **Giữ vững nhận diện cốt lõi**:
   - **Màu chủ đạo (Primary)**: Màu hồng phấn / hoa hồng thanh lịch (`#D84A6B` - Rose Quartz / Blossom Pink), phối các sắc thái hỗ trợ tinh tế (`#FFF1F3`, `#FFE4E8`, `#FDA4AF`).
   - **Màu nền (Background)**: Màu trắng tinh khôi (`#FFFFFF`), loại bỏ hoàn toàn tone ngà cũ. Các phân vùng phụ sử dụng màu trắng xám siêu nhẹ (`#FAFAFA` hoặc `#F9F9FB`) và viền hairline mảnh (`#F1F1F5`).
2. **Thiết lập hệ thống Typography chuẩn quốc tế**:
   - Thang đo kích thước chữ (Modular Type Scale: 1.25 Major Third).
   - Sử dụng font Sans-serif hiện đại, sắc nét (`Geist` hoặc `Inter Display` kết hợp font chữ hiển thị có cá tính, loại bỏ font serif cổ điển gây nặng nề).
   - Quy định rõ ràng phân cấp: Display, H1 -> H6, Subtitle, Body (Large/Normal/Small), Caption, Micro-label, Button.
3. **Bỏ hoàn toàn thiết kế cũ trên tất cả các trang**:
   - Thiết kế lại trang chủ (`/`), trang tìm kiếm (`/search`), chi tiết salon (`/salon/:id`), luồng đặt lịch (`/booking`), các trang quản trị đối tác (`/owner/*`), trang quản trị hệ thống (`/admin/*`), trang tài khoản khách hàng (`/setting/*`), và các trang xác thực (`/login`, `/register`).
4. **Áp dụng triết lý Anti-Slop (design-taste-frontend)**:
   - Tỷ lệ: `DESIGN_VARIANCE: 7` (layout linh hoạt, phá vỡ sự đối xứng nhàm chán), `MOTION_INTENSITY: 5` (tactile micro-interactions, spring animation mượt mà), `VISUAL_DENSITY: 4` (khoảng thở rộng rãi, tinh tế).
   - Kiểm soát chặt chẽ tỷ lệ tương phản, không có text bị chìm, không dùng thẻ lồng thẻ (no card-in-card hell), không bọc nút dài trên desktop.

---

## 2. Hệ thống Thiết kế Mới (New Design Tokens & Typography Scale)

### 2.1 Bảng màu (Color Palette System)

| Token CSS | Mã Hex / HSL | Ứng dụng | Tiêu chuẩn Contrast (với nền) |
| :--- | :--- | :--- | :--- |
| `--color-background` | `#FFFFFF` | Nền trang toàn bộ hệ thống | N/A |
| `--color-surface` | `#FAFAFA` | Nền khối phụ, card nền phụ, thanh tìm kiếm | 1.05:1 |
| `--color-surface-hover` | `#F4F4F6` | Nền khi hover table row hoặc menu item | 1.15:1 |
| `--color-primary` | `#D84A6B` | Màu hồng chủ đạo: Nút chính, Active Tab, Icon nổi bật | > 4.5:1 (với White) |
| `--color-primary-hover` | `#C23859` | Hover state cho nút bấm chính | > 5.5:1 |
| `--color-primary-subtle` | `#FFF1F4` | Badge, pill nền mỏng, highlight tag | Dùng text primary |
| `--color-primary-border` | `#FBCFE8` | Viền nhấn nhẹ, viền input khi focus | Phụ trợ |
| `--color-text-main` | `#111827` | Chữ chính: Tiêu đề, Body text quan trọng | 16.1:1 (AAA) |
| `--color-text-muted` | `#4B5563` | Chữ phụ: Mô tả ngắn, meta info, timestamp | 7.0:1 (AAA) |
| `--color-text-subtle` | `#6B7280` | Nhãn form, placeholder, breadcrumb | 4.6:1 (AA) |
| `--color-border-subtle` | `#E5E7EB` | Đường kẻ hairline, phân cách các phần | Viền phân định |
| `--color-border-strong` | `#D1D5DB` | Viền input form, viền card nổi bật | Viền phân định |

### 2.2 Thang kích thước chữ (Typography Scale & Hierarchy)

Áp dụng chuẩn tỉ lệ **1.250 (Major Third)** để tạo độ tương phản rõ rệt giữa cấp bậc văn bản:

| Cấp bậc (Level) | Size (Desktop) | Size (Mobile) | Line Height | Tracking / Weight | Ứng dụng cụ thể |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `56px` (`3.5rem`) | `36px` (`2.25rem`) | `1.1` (`leading-tight`) | `-0.03em` / Bold (`700`) | Hero headline trang chủ, trang For Business |
| **Heading 1 (H1)** | `40px` (`2.5rem`) | `28px` (`1.75rem`) | `1.15` | `-0.025em` / SemiBold (`600`) | Tiêu đề chính trang Salon Detail, Dashboard |
| **Heading 2 (H2)** | `30px` (`1.875rem`) | `24px` (`1.5rem`) | `1.2` | `-0.02em` / SemiBold (`600`) | Tiêu đề các phân mục trang chủ, mục dịch vụ |
| **Heading 3 (H3)** | `22px` (`1.375rem`) | `20px` (`1.25rem`) | `1.3` | `-0.015em` / Medium (`500`) | Tên Salon trên thẻ, tiêu đề modal, step |
| **Heading 4 (H4)** | `18px` (`1.125rem`) | `17px` (`1.0625rem`)| `1.4` | `-0.01em` / SemiBold (`600`) | Tên dịch vụ chi tiết, tiêu đề widget |
| **Body Large** | `17px` (`1.0625rem`)| `16px` (`1rem`) | `1.6` | `0` / Regular (`400`) | Đoạn văn giới thiệu ngắn dưới Hero |
| **Body Default** | `15px` (`0.9375rem`)| `15px` (`0.9375rem`)| `1.55` | `0` / Regular (`400`) | Nội dung chi tiết, đánh giá, mô tả dịch vụ |
| **Body Small** | `13.5px` (`0.84rem`)| `13.5px` (`0.84rem`)| `1.45` | `0` / Regular & Medium | Chú thích địa chỉ, thời lượng làm móng, tags |
| **Micro / Eyebrow**| `11px` (`0.6875rem`)| `11px` (`0.6875rem`)| `1.3` | `+0.05em` / Uppercase SemiBold | Category pill, badge trạng thái đơn hẹn |
| **Button / CTA** | `14.5px` (`0.9rem`) | `14.5px` (`0.9rem`) | `1` | `0` / SemiBold (`600`) | Nút "Đặt lịch ngay", "Xác nhận", "Lưu thay đổi" |

### 2.3 Nguyên tắc Spacing & Hình khối (Radius & Elevation)
- **Corner Radius**:
  - `rounded-2xl` (`16px`): Áp dụng cho các Modal, Salon Card, Khối tìm kiếm chính.
  - `rounded-xl` (`12px`): Áp dụng cho Input fields, dropdown menu, thẻ dịch vụ nhỏ.
  - `rounded-full`: Nút bấm chính (Pill shape), avatar, status badge.
- **Shadow & Elevation**:
  - Loại bỏ hoàn toàn đổ bóng xám đen đậm.
  - Dùng đổ bóng khuếch tán siêu nhẹ: `shadow-[0_4px_20px_rgba(216,74,107,0.06)]` hoặc `shadow-[0_2px_8px_rgba(0,0,0,0.04)]` trên nền trắng tinh khôi.
  - Đường viền: `border border-gray-100` (`#F3F4F6`), tạo độ sắc nét thanh lịch.

---

## 3. Kế hoạch Thiết kế Chi tiết Từng Phân Trang

### 3.1 Layout Khung Chung (Site Header & Site Footer)
- **Site Header**:
  - Bỏ thanh header bo góc lơ lửng với bóng đỏ đậm cũ.
  - Thay bằng Header cố định viền hairline kính mờ (`bg-white/90 backdrop-blur-md border-b border-gray-100`), logo Ellora sắc nét, thanh tìm kiếm thông minh nhanh gọn giữa trang (Desktop), Menu điều hướng tối giản với hiệu ứng hover hồng nhẹ, User Profile dropdown sang trọng.
- **Site Footer**:
  - Nền trắng tinh khôi (`bg-white border-t border-gray-100`), phân chia 4 cột thoáng đãng: Giới thiệu thương hiệu & Tuyên ngôn chất lượng, Danh mục dịch vụ làm đẹp thịnh hành, Dành cho salon đối tác, Thông tin liên hệ & Pháp lý.

### 3.2 Trang Chủ (`/`)
1. **Hero Section**:
   - Bố cục Split-Screen hiện đại hoặc Left-Aligned thoáng đãng:
     - Bên trái: Tiêu đề H1 súc tích, tinh tế ("Vẻ Đẹp Đích Thực, Đặt Lịch Trong Chớp Mắt"), đoạn mô tả chuẩn 20 từ, và Thanh tìm kiếm Salon tích hợp đa tiêu chí (Vị trí, Dịch vụ, Ngày hẹn).
     - Bên phải: Khung ảnh nghệ thuật nail/spa chất lượng cao bo góc mềm mại, hiển thị floating badge điểm rating thực tế và số lượng khách đã phục vụ.
2. **Khám phá Dịch vụ Thịnh hành (Curated Categories)**:
   - Dạng carousel/pill horizontal trượt êm ái: *Nail Art Sang Chảnh*, *Chăm Sóc Móng Chuyên Sâu*, *Sơn Gel Cao Cấp*, *Spa Chân Thư Giãn*, *Nối Mi & Waxing*.
3. **Danh sách Salon Đề Xuất (Featured Salons)**:
   - Thẻ Salon hoàn toàn mới: Ảnh tỷ lệ 4:3 sắc nét, nhãn giá rõ ràng, khoảng cách địa lý, rating sao, nút yêu thích tim tương tác vi mô, hiển thị 2 khung giờ trống gần nhất để khách có thể bấm chọn ngay.
4. **Quy trình Đặt Hẹn 3 Bước Trực Quan**:
   - Bố cục ngang không dùng thẻ lồng thẻ, minh họa đường nét tối giản kèm số thứ tự thanh mảnh `01`, `02`, `03`.
5. **Khu Vực Kêu Gọi Chủ Salon (Partner Callout)**:
   - Nền trắng với khung viền điểm xuyết viền hồng pastel, typography ấn tượng, lời kêu gọi ngắn gọn và nút CTA dẫn tới `/for-business`.

### 3.3 Trang Tìm kiếm & Khám phá (`/search`)
- **Bộ lọc thông minh (Sticky Filter Bar / Drawer)**:
  - Cho phép lọc theo quận/huyện, khoảng giá, đánh giá sao, loại hình dịch vụ, khung giờ có sẵn.
  - Thanh tìm kiếm và sort tức thì (Theo khoảng cách, Đánh giá cao nhất, Giá tốt nhất).
- **Danh sách kết quả hiển thị dạng Hybrid**:
  - Chuyển đổi linh hoạt giữa Grid View (Thẻ lớn trực quan) và List View (Dễ so sánh giá và giờ trống).
  - Trạng thái Empty State được chăm chút tinh tế khi không tìm thấy kết quả kèm gợi ý salon lân cận.

### 3.4 Trang Chi tiết Salon (`/salon/:id`)
- **Hero Showcase Gallery**:
  - Bento Grid 5 ảnh (1 ảnh lớn bên trái, 4 ảnh nhỏ bên phải) hoặc Slider toàn cảnh với nút "Xem tất cả hình ảnh".
- **Thông tin & Đánh giá**:
  - Tên Salon, địa chỉ đầy đủ, giờ mở cửa hôm nay (kèm trạng thái mở/đóng cửa màu xanh mint / hồng), tổng lượt đánh giá.
- **Thực đơn Dịch vụ (Service Menu)**:
  - Phân nhóm theo tabs (ví dụ: *Nail Art, Chăm sóc móng, Sơn Gel, Combo ưu đãi*).
  - Mỗi dịch vụ hiển thị rõ thời lượng (phút), giá tiền niêm yết, mô tả chi tiết và nút "Thêm vào lịch hẹn".
- **Sticky Booking Summary Dock (Desktop & Mobile)**:
  - Desktop: Khung tóm tắt lịch hẹn dính cố định góc phải, hiển thị tổng tiền và nút tiếp tục.
  - Mobile: Bottom bar cố định hiển thị số dịch vụ đã chọn và tổng tiền với nút "Đặt lịch ngay".

### 3.5 Luồng Đặt lịch (`/booking`)
- **Tiến trình 4 bước (Step Indicator)** thanh thoát:
  1. *Dịch vụ*: Kiểm tra lại các dịch vụ đã chọn, tùy chọn nhân viên phục vụ mong muốn.
  2. *Thời gian*: Chọn ngày qua Mini Calendar hiện đại và chọn Khung giờ (Time Slot Grid) trực quan, có đánh dấu slot phổ biến.
  3. *Thông tin*: Điền họ tên, số điện thoại, ghi chú đặc biệt cho salon.
  4. *Xác nhận*: Tóm tắt chi tiết lịch hẹn, chính sách hủy lịch và nút "Xác nhận đặt hẹn".

### 3.6 Trang Doanh Nghiệp & Đăng ký Đối Tác (`/for-business`, `/business-registration`)
- Giao diện Landing chuyển đổi cao, nêu bật các tính năng: Tăng trưởng doanh thu, Tự động hóa lịch hẹn, Quản lý nhân viên, Báo cáo tài chính.
- Form đăng ký salon trực quan theo từng bước, xác thực dữ liệu tức thì, không bị quá tải thông tin.

### 3.7 Cổng Khách hàng (`/setting/*`)
- Giao diện quản lý thông tin tài khoản, mật khẩu, và đặc biệt là trang **Lịch hẹn của tôi (`/setting/my-bookings`)**:
  - Phân loại rõ: *Sắp tới (Upcoming)*, *Đã hoàn thành (Completed)*, *Đã hủy (Cancelled)*.
  - Thẻ lịch hẹn với đầy đủ thông tin: Mã đặt chỗ, tên salon, địa chỉ, số tiền, nút chỉ đường và nút "Hủy / Đổi lịch".

### 3.8 Bảng điều khiển Chủ Salon & Admin (`/owner/*`, `/admin/*`)
- Loại bỏ giao diện thô ráp cũ. Thay bằng Admin/Owner Portal phong cách hiện đại:
  - Nền trắng tinh khôi, sidebar thu gọn thông minh, các thẻ KPI hiển thị tăng trưởng rõ ràng.
  - Bảng lịch hẹn (Calendar Timeline) kéo thả tiện lợi, danh sách quản lý nhân viên và dịch vụ trực quan.

---

## 4. Kịch bản Người dùng & Kiểm thử (User Scenarios & Testing)

### 4.1 Kịch bản Khách hàng Đặt hẹn (Customer Booking Journey)
- **Tình huống**: Khách hàng mở trang chủ trên điện thoại di động hoặc máy tính, muốn tìm tiệm nail gần nhất tại TP.HCM có dịch vụ "Sơn Gel Thạch".
- **Hành động**:
  1. Nhập từ khóa hoặc bấm vào danh mục "Sơn Gel" trên trang chủ.
  2. Trang tìm kiếm lọc nhanh các salon phù hợp, kết quả hiển thị rõ giá dịch vụ từ thấp tới cao và khoảng cách.
  3. Khách bấm vào salon, xem ảnh không gian và chọn dịch vụ.
  4. Khung giờ trống được hiển thị rõ ràng, không bị nhảy layout.
  5. Đặt lịch thành công và nhận mã xác nhận ngay trên màn hình.

### 4.2 Kịch bản Trải nghiệm Thị giác & Tính Dễ Tiếp Cận (Accessibility & Contrast)
- Toàn bộ nút bấm primary màu hồng `#D84A6B` khi đặt trên nền trắng đều đạt tỷ lệ tương phản tối thiểu **4.6:1** (vượt chuẩn WCAG AA).
- Text màu phụ không bao giờ sử dụng màu xám quá nhạt (tối thiểu `#4B5563` hoặc `#6B7280`).
- Font size nhỏ nhất trong hệ thống (ngoại trừ micro-eyebrow) là **13px**, đảm bảo người dùng mọi lứa tuổi đều đọc dễ dàng trên màn hình smartphone 375px.

---

## 5. Yêu cầu Chức năng & Kỹ thuật (Functional & Design Requirements)

1. **FR-01**: Cập nhật file `globals.css` và hệ thống Design Tokens:
   - Loại bỏ các biến màu ngà cũ (`--color-ivory-50`, v.v.).
   - Định nghĩa bộ màu chuẩn: Primary Pink `#D84A6B`, Surface `#FAFAFA`, Text Primary `#111827`, Text Muted `#4B5563`, Border `#E5E7EB`.
   - Cấu hình font chữ Sans-serif hiện đại sắc nét thông qua `@fontsource-variable/geist` hoặc hệ thống Geist/Inter có sẵn.
2. **FR-02**: Tái thiết kế toàn diện các Component Layout chung (`SiteHeader`, `SiteFooter`, `MainLayout`).
3. **FR-03**: Tái cấu trúc và thiết kế lại `HomePage` với layout mới, typography chuẩn và các section hấp dẫn.
4. **FR-04**: Tái thiết kế trang Tìm kiếm `SearchPage` và thẻ `SalonCard`.
5. **FR-05**: Tái thiết kế trang Chi tiết Salon `SalonDetailPage` với bộ sưu tập ảnh và menu dịch vụ mới.
6. **FR-06**: Tái thiết kế trang `BookingPage` tối ưu hóa quy trình 4 bước.
7. **FR-07**: Tái thiết kế trang `ForBusinessPage` và `BusinessRegistrationPage`.
8. **FR-08**: Tái thiết kế Portal Khách hàng (`/setting/*`) và hệ thống các trang Auth (`/login`, `/register`, `/forgot-password`).
9. **FR-09**: Đồng bộ hóa layout Owner (`/owner/*`) và Admin (`/admin/*`) theo phong cách nền trắng sạch sẽ, typography mới.
10. **FR-10**: Đảm bảo 100% build sạch không có lỗi TypeScript, không phá vỡ logic API hoặc Mapper hiện tại.

---

## 6. Tiêu chí Thành công (Success Criteria)

- **Độ hoàn thiện thẩm mỹ (Visual Polish)**: 100% các màn hình chính sở hữu diện mạo mới: Nền trắng tinh khôi, điểm nhấn hồng thanh lịch, loại bỏ toàn bộ dấu vết thiết kế cũ.
- **Tính nhất quán của Typography**: 100% các thành phần tuân thủ đúng thang bậc chữ quy định, không xuất hiện font serif cũ lộn xộn.
- **Tiêu chuẩn Trải nghiệm & Tiếp cận**: Mọi nút bấm và trường nhập liệu đều đạt chuẩn tương phản WCAG AA, không bị tràn viền (overflow) trên mọi kích thước màn hình từ `375px` đến `1920px`.
- **Tính toàn vẹn của Hệ thống (Zero Regression)**: Không làm hỏng hoặc gián đoạn bất kỳ endpoint API, Axios mapper, router path hoặc logic auth/booking nào đã được xây dựng.
