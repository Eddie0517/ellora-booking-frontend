# Quickstart Validation Guide: UI & Typography Redesign

**Feature**: [`specs/001-complete-ui-typography-redesign`](file:///d:/Project/ellora/ellora-booking-frontend/specs/001-complete-ui-typography-redesign)  
**Spec Reference**: [`specs/001-complete-ui-typography-redesign/spec.md`](file:///d:/Project/ellora/ellora-booking-frontend/specs/001-complete-ui-typography-redesign/spec.md)

---

## 1. Môi Trường & Lệnh Chạy Kiểm Thử (Environment & Commands)

```bash
# 1. Khởi chạy dev server
npm run dev

# 2. Kiểm tra type và build
npm run build

# 3. Kiểm tra lint
npm run lint
```

---

## 2. Kịch Bản Kiểm Thử Xác Thực Giao Diện (Visual & Flow Verification Scenarios)

### Kịch bản 1: Kiểm tra Nền Trắng & Typography Đồng Bộ
1. Truy cập trang chủ `http://localhost:5173/`.
2. Kiểm tra màu nền trang: Phải là màu trắng thuần `#FFFFFF`, không có sắc vàng kem ngà (`#fdfbf7`).
3. Kiểm tra font chữ: Tất cả tiêu đề và văn bản sử dụng font Sans-serif sắc nét (Geist Variable), không có font serif `Minion Pro`.
4. Kiểm tra Header: Cố định ở đầu trang với hiệu ứng kính mờ và viền xám siêu nhẹ `border-b border-gray-100`.

### Kịch bản 2: Tìm Kiếm & Lọc Salon
1. Trên trang chủ, bấm vào danh mục "Nail Art" hoặc gõ từ khóa tìm kiếm.
2. Được điều hướng tới `/search`.
3. Kiểm tra hiển thị thẻ `SalonCard`: Ảnh salon sắc nét, nhãn giá rõ ràng, rating hiển thị chuẩn xác, có hiển thị các khung giờ trống gần nhất.
4. Thử chuyển đổi giữa Grid View và List View.

### Kịch bản 3: Chi Tiết Salon & Chọn Dịch Vụ
1. Bấm vào một Salon bất kỳ (ví dụ `/salon/1`).
2. Kiểm tra bộ sưu tập ảnh (Bento Gallery) hiển thị mượt mà.
3. Chuyển qua lại giữa các tab dịch vụ (Nail Art, Chăm sóc móng, Sơn gel).
4. Bấm "Thêm vào lịch hẹn" một dịch vụ: Sticky Booking Dock ở bên phải (hoặc bottom bar trên mobile) cập nhật số lượng và tổng tiền ngay lập tức.
5. Bấm "Đặt lịch ngay" để sang trang `/booking`.

### Kịch bản 4: Luồng Đặt Hẹn 4 Bước
1. Trên trang `/booking`, kiểm tra tiến trình 4 bước hiển thị thanh thoát.
2. Bước 1: Dịch vụ đã chọn.
3. Bước 2: Chọn thợ/chuyên viên móng.
4. Bước 3: Chọn ngày trên mini calendar và chọn khung giờ trống.
5. Bước 4: Tóm tắt thông tin và xác nhận.

### Kịch bản 5: Kiểm Tra Responsive Mobile
1. Bật DevTools, chọn thiết bị iPhone 14 / 15 Pro (`393px`).
2. Kiểm tra:
   - Header thu gọn thành menu hamburger mượt mà.
   - Text tiêu đề hero không bị tràn hoặc gãy chữ vô lý.
   - Các nút bấm CTA có chiều cao tối thiểu 44px, dễ dàng bấm bằng ngón tay cái.
   - Khoảng cách padding 2 bên màn hình đạt chuẩn 16px.
