# ARCHITECTURE & CODING RULES — Ellora React frontend

> Stack: React 19 + Vite + TypeScript strict + Tailwind CSS v4 + shadcn/ui + React Router + Axios + TanStack Query v5 + Zustand + Mapper Layer. Ngôn ngữ UI mặc định: tiếng Việt.
>
> Mục tiêu: chuyển toàn bộ giao diện và luồng chức năng từ `D:\Project\ellora-booking\ellora\code\frontend` sang React, giữ thiết kế, asset, responsive và API contract hiện có. Angular là nguồn đối chiếu, không chỉnh sửa trong quá trình chuyển đổi.

## 1. Cấu trúc `src/`

```text
src/
├── app/                 # App bootstrap, router, route guards và providers; không gọi API trực tiếp
├── common/
│   ├── constants/endpoints/ # Endpoint được nhiều feature dùng
│   └── enums/            # Enum dùng chung
├── components/
│   ├── ui/               # shadcn/ui do CLI tạo, không sửa logic gốc
│   ├── layout/           # MainLayout, OwnerLayout, AdminLayout, header, footer, sidebar
│   ├── providers/        # QueryProvider, AuthProvider, ThemeController
│   └── shared/           # Component chung ngoài bộ shadcn
├── features/<domain>/    # Mỗi nghiệp vụ một folder độc lập
│   ├── types/*.dto.ts    # Shape thô của backend
│   ├── types/*.model.ts  # Shape sạch cho UI
│   ├── constants/*.endpoints.ts
│   ├── mappers/*.mapper.ts
│   ├── api/*.api.ts
│   ├── queries/*.queries.ts
│   ├── schemas/          # Zod khi có form phức tạp
│   └── components/       # Page và UI riêng của feature
├── hooks/                # Hook dùng chung
├── lib/                  # Axios, auth token, API error, mapper helpers, utils, query client
├── store/                # Zustand cho client state; không lưu danh sách/chi tiết từ API
├── styles/               # Token, global CSS, font, animation
├── types/api.ts          # APIResponse, ErrorResponse, pagination
└── main.tsx              # React root
public/                   # Font, logo và hình ảnh được mang từ Angular sang
```

Alias duy nhất là `@/*` → `./src/*`. Import giữa các feature chỉ đi qua `common/`, `components/`, `lib/`, `store/` hoặc `types/`; không import trực tiếp từ feature khác. `components/ui/` không phụ thuộc feature hay store.

## 2. Routing và layout

- React Router định nghĩa route trong `src/app/router.tsx`; dùng `lazy` và `Suspense` cho page lớn.
- Giữ URL hiện có để không làm đứt luồng: `/`, `/search`, `/salon/:id`, `/booking`, `/setting/*`, `/owner/*`, `/admin/*`, `/login`, `/register`, `/forgot-password`.
- Ba layout public, owner, admin quản lý header, footer, sidebar và outlet riêng. Guard kiểm tra đăng nhập và role trước khi vào trang cần bảo vệ.
- Mọi route phải có ít nhất một đường dẫn vào từ UI; menu mobile cũng phải truy cập được.
- Query parameter đọc qua React Router `useSearchParams`. Link nội bộ dùng `Link`/`NavLink`.

Vite là SPA chạy trên client. Không có Next.js App Router, Server Component, Route Handler, middleware hay `server-fetch`. Các hành vi cần server, như cookie HttpOnly proxy, phải được triển khai ở backend/BFF riêng; không mô phỏng chúng trong Vite. SEO/SSR sẽ cần một bước triển khai riêng nếu sản phẩm yêu cầu.

## 3. Luồng dữ liệu bắt buộc

```text
Component → queries/*.queries.ts → api/*.api.ts → Axios → backend
                                      ↓
                               mapper DTO → Model → UI
```

Mỗi API mới hoặc sửa phải có đủ `DTO interface` + `Model interface` + mapper tương ứng. API function đọc DTO trực tiếp từ backend và trả Model; component và query hook không được nhận DTO. Mapper dùng `pickField` và `safe*` cho từng field, kể cả khi backend được kỳ vọng ổn định. Request tạo/sửa map từ Model hoặc form value sang DTO theo contract thật.

- Không dùng `any`, `as any`, `@ts-ignore` hoặc hard-code URL endpoint trong component.
- Endpoint riêng đặt trong `features/<domain>/constants/`; endpoint nhiều feature dùng đặt trong `common/constants/endpoints/`.
- Generic của Axios phải đúng shape body backend. Backend trả DTO trực tiếp; đối chiếu OpenAPI và controller khi tích hợp.
- Contract chưa rõ thì đối chiếu source Angular, tài liệu API và backend trước khi code.

## 4. State, auth, lỗi

- TanStack Query giữ server state, dùng query key factory cho mỗi domain. Mutation invalidate key liên quan. Component xử lý loading, error, success và empty.
- Zustand chỉ giữ client state như session, theme, sidebar; không cache API response.
- Access token và refresh token do backend phát hành. Access token ở bộ nhớ; refresh token được lưu theo phiên tab và xoay vòng qua endpoint refresh.
- Axios base URL lấy từ `VITE_API_URL`; client tự gắn token khi có phiên. Lỗi API dùng helper chung, tránh hiển thị toast trùng.
- Secret không đặt trong biến `VITE_*` vì được đóng gói vào browser bundle.

## 5. Giao diện và asset

- Giữ bố cục, màu, typography, ảnh, animation và responsive của Angular. Ưu tiên kiểm tra mobile trước.
- Dùng Tailwind v4, token tại `src/styles/globals.css`; font và ảnh tại `public/`.
- shadcn/ui là lựa chọn đầu tiên cho primitive có sẵn. Thêm bằng CLI, giữ logic file gốc; tùy biến bằng `className`, `cn()` hoặc wrapper tại `components/shared/`.
- Component chỉ nhận Model hoặc props UI. Dùng semantic HTML, label, alt, focus và reduced motion phù hợp.
- Bản Angular dùng Leaflet cho bản đồ, Chart.js cho biểu đồ và Amplify cho Cognito; chỉ thêm thư viện tương ứng khi chuyển màn hình cần chúng.

## 6. Cách chuyển từng feature

1. Ghi lại route, state, API, asset và component của màn hình Angular tương ứng.
2. Tạo endpoint constant, DTO, Model, mapper, API, query hook.
3. Chuyển template/style sang JSX và Tailwind/CSS, giữ hành vi responsive.
4. Gắn route và đường dẫn UI; bảo vệ route theo đúng role.
5. Kiểm tra TypeScript và build, so sánh giao diện ở mobile và desktop, thử các trạng thái loading/error/empty.

Các luồng chuyển: public search và salon detail; auth; booking và customer settings; owner dashboard, salon profile, staff, service, bookings, billing; admin dashboard, users, approvals, subscriptions, support và disputes.

## 7. Theo dõi tiến độ

Sau mỗi phần chuyển đổi, cập nhật `docs/PROGRESS.md` và `docs/WORK-LOG.md` với phạm vi, file đã đổi, kết quả kiểm tra và phần còn lại. Không đánh dấu hoàn thành cho màn hình mới chỉ có giao diện mà thiếu hành vi/API cần thiết.
