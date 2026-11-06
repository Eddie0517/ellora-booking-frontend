# Backend API: request và response

Nguồn: `ellora-booking-be/contracts/openapi.json`. Schema và mã trạng thái bên dưới phản ánh contract đã xuất; đối chiếu controller khi thay đổi backend. Dữ liệu thành công trả trực tiếp, lỗi dùng Problem Details.

## PUT /api/v1/owner/services/{id}

Update an existing service

- Tham số `id` (path, bắt buộc): integer (int64)
- Request `application/json`: `UpdateServiceRequest`
- Response `200`: */*: ServiceResponse

## GET /api/v1/owner/salon/working-hours

Trả về lịch hoạt động theo tuần của salon thuộc chủ sở hữu đang đăng nhập. JWT bắt buộc.

- Response `200`: array<WorkingHourDto>

## POST /api/v1/owner/bookings/walk-ins

Tạo booking khách vãng lai cho salon thuộc owner trong JWT; không nhận `salonId` từ client. Dịch vụ/nhân viên, giờ hoạt động và tình trạng slot được xác thực như luồng tạo booking công khai.

- JWT bắt buộc.
- Request `application/json`: `CreateWalkInBookingRequest` (`serviceId`, tùy chọn `employeeId`, `scheduledAt`, `customerName`, `customerPhone`, tùy chọn `customerNote`).
- Response `201`: `BookingDetailsResponse` trực tiếp.

## Subscription/billing qua PayOS (ngoài luồng booking)

Owner thanh toán gói salon qua PayOS; đặt lịch của khách không yêu cầu thanh toán. Frontend có trang owner/admin cho gói salon. Trạng thái thanh toán chỉ do webhook PayOS có chữ ký hợp lệ ghi nhận.

- `GET /api/v1/salon-plans` (public): danh sách gói; response trực tiếp là `SubscriptionPlanResponse[]`.
- `GET /api/v1/owner/subscription`: trạng thái gói và yêu cầu đang chờ của salon owner.
- `GET /api/v1/owner/subscription/requests?page=0&size=20`: lịch sử yêu cầu dạng `PagedResult`.
- `POST /api/v1/owner/subscription/requests`: body `{ tier, expectedPrice }`; giá được đối chiếu lại với cấu hình gói hiện hành.
- `POST /api/v1/owner/subscription/requests/{id}/prepare-payment`: tạo hoặc trả lại liên kết PayOS; response có `payosOrderCode`, `payosPaymentLinkId`, `payosCheckoutUrl`, `payosQrCode`.
- `POST /api/v1/owner/subscription/requests/{id}/sync-payment`: owner yêu cầu BE đọc trạng thái trực tiếp từ PayOS để cập nhật thanh toán.
- `POST /api/v1/webhooks/payos`: webhook public của PayOS. BE kiểm tra HMAC-SHA256, mã đơn, payment link và số tiền, ghi nhận thanh toán idempotent.
- `GET /api/v1/admin/subscription-plans`, `PUT /api/v1/admin/subscription-plans/{tier}`: admin xem và cấu hình gói.
- `GET /api/v1/admin/subscription-requests?status=&page=0&size=20`: admin xem hàng đợi đối soát dạng `PagedResult`.
- `POST /api/v1/admin/subscription-requests/{id}/sync-payment`: admin yêu cầu BE đồng bộ trạng thái PayOS trước khi duyệt.
- `PATCH /api/v1/admin/subscription-requests/{id}`: body `{ status, note? }`; duyệt/kích hoạt chỉ khi BE đã nhận webhook PayOS hợp lệ với đủ số tiền.
- Tất cả endpoint admin cần role `ADMIN`; endpoint owner cần JWT. Success response là DTO trực tiếp, lỗi là Problem Details.

## PUT /api/v1/owner/salon/working-hours

Thay thế toàn bộ lịch hoạt động theo tuần của salon thuộc chủ sở hữu. Request phải chứa đủ bảy ngày khác nhau; giờ đóng phải sau giờ mở khi ngày không nghỉ. JWT bắt buộc.

- Request `application/json`: array<WorkingHourDto>
- Response `200`: array<WorkingHourDto>

## GET /api/v1/salons/{id}/working-hours

Trả về lịch hoạt động công khai của salon; ngày chưa được cấu hình được trả về với `closed: true`.

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `200`: array<WorkingHourDto>

## GET /api/v1/salons/{id}/availability

- Public endpoint for available appointment start times.
- Query: `date` (required, `YYYY-MM-DD`), `serviceId` (required), `employeeId` (optional).
- Response: array of local salon times (`HH:mm`); times account for salon hours, closure dates, service duration, active staff, existing pending/confirmed bookings, and a one-hour lead time for same-day bookings.
- Booking creation enforces the same availability rules when the salon has configured working hours.

## GET /api/v1/salons/{id}/closures

Trả về các ngày salon đóng cửa trong khoảng ngày yêu cầu; dùng khi chọn thời gian đặt lịch.

- Tham số `id` (path, bắt buộc): integer (int64)
- Tham số `from` (query, bắt buộc): string (date)
- Tham số `to` (query, bắt buộc): string (date)
- Response `200`: array<string (date)>

## GET /api/v1/owner/salon/closures

Trả về danh sách ngày nghỉ đặc biệt của salon thuộc owner đang đăng nhập. JWT bắt buộc.

- Response `200`: array<SalonClosureDto>

## POST /api/v1/owner/salon/closures

Thêm ngày nghỉ cho salon của owner đang đăng nhập; ngày trùng bị từ chối. JWT bắt buộc.

- Request `application/json`: `CreateSalonClosureRequest`
- Response `201`: SalonClosureDto

## DELETE /api/v1/owner/salon/closures/{id}

Xóa một ngày nghỉ thuộc salon của owner đang đăng nhập. JWT bắt buộc.

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `204`: không có body

## DELETE /api/v1/owner/services/{id}

Deactivate/delete a service

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `204`: không có body

## GET /api/v1/owner/salon

Get owner salon profile

- Response `200`: */*: SalonDetailsResponse

## PUT /api/v1/owner/salon

Update owner salon profile

- Request `application/json`: `UpdateOwnerSalonRequest`
- Response `200`: */*: SalonDetailsResponse

## PUT /api/v1/owner/employees/{id}

Update an employee

- Tham số `id` (path, bắt buộc): integer (int64)
- Request `application/json`: `UpdateEmployeeRequest`
- Response `200`: */*: EmployeeResponse

## DELETE /api/v1/owner/employees/{id}

Deactivate/delete an employee

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `204`: không có body

## PUT /api/v1/bookings/{id}/status

Yêu cầu JWT; chỉ khách sở hữu, chủ salon hoặc admin được thao tác theo vai trò.

Update booking status

- Tham số `id` (path, bắt buộc): integer (int64)
- Request `application/json`: `TransitionStatusRequest`
- Response `200`: */*: BookingDetailsResponse

## GET /api/v1/salons

Search and list salons

- Tham số `city` (query, tùy chọn): string
- Tham số `keyword` (query, tùy chọn): string
- Tham số `page` (query, tùy chọn): integer (int32)
- Tham số `pageSize` (query, tùy chọn): integer (int32)
- Response `200`: */*: PagedResultSalonSummaryResponse

## POST /api/v1/salons

Register new salon

- Request `application/json`: `CreateSalonRequest`
- Response `201`: */*: SalonDetailsResponse

## POST /api/v1/reviews

Create review for a completed booking

- Request `application/json`: `CreateReviewRequest`
- Response `201`: */*: ReviewDetailsResponse

## POST /api/v1/reviews/{id}/reply

Salon owner replies to review

- Tham số `id` (path, bắt buộc): integer (int64)
- Request `application/json`: `ReviewReplyRequest`
- Response `200`: */*: ReviewDetailsResponse

## GET /api/v1/owner/services

Get all services in salon

- Response `200`: */*: array<ServiceResponse>

## POST /api/v1/owner/services

Add a new nail service

- Request `application/json`: `CreateServiceRequest`
- Response `201`: */*: ServiceResponse

## GET /api/v1/owner/employees

Get all employees in salon

- Response `200`: */*: array<EmployeeResponse>

## POST /api/v1/owner/employees

Add a new employee

- Request `application/json`: `CreateEmployeeRequest`
- Response `201`: */*: EmployeeResponse

## POST /api/v1/media/upload

Upload image to Cloudinary

- Tham số `folder` (query, tùy chọn): string
- Request `multipart/form-data`: `object`
- Response `201`: */*: UploadImageResponse

## POST /api/v1/bookings

Create an appointment booking

- JWT bắt buộc; chỉ tài khoản `CUSTOMER` được đặt lịch. Nếu chưa đăng nhập, frontend chuyển qua đăng nhập rồi quay lại đúng salon/dịch vụ đang chọn.
- Request `application/json`: `CreateBookingRequest`
- Response `201`: */*: BookingDetailsResponse

## POST /api/v1/auth/verify-email

Verify email with OTP

- Request `application/json`: `VerifyEmailRequest`
- Response `200`: */*: TokenResponse

## POST /api/v1/auth/resend-verification

Resend email verification OTP

- Request `application/json`: `ResendVerificationRequest`
- Response `200`: */*: object

## POST /api/v1/auth/register

Customer registration

- Request `application/json`: `RegisterRequest`
- Response `201`: */*: RegisterResponse

## POST /api/v1/auth/refresh

Refresh token rotation

- Request `application/json`: `RefreshTokenRequest`
- Response `200`: */*: TokenResponse

## POST /api/v1/auth/logout

User logout

- Tham số `Authorization` (header, tùy chọn): string
- Request `application/json`: `RefreshTokenRequest`
- Response `204`: không có body

## POST /api/v1/auth/login

User login

- Request `application/json`: `LoginRequest`
- Response `200`: */*: TokenResponse

## POST /api/v1/auth/forgot-password

Forgot password request

- Request `application/json`: `ForgotPasswordRequest`
- Response `200`: */*: object

## POST /api/v1/auth/confirm-forgot-password

Confirm forgot password

- Request `application/json`: `ConfirmForgotPasswordRequest`
- Response `200`: */*: object

## POST /api/v1/auth/change-password

Change password

- Request `application/json`: `ChangePasswordRequest`
- Response `204`: không có body

## POST /api/v1/admin/salons/{id}/reject

Reject/suspend salon

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `200`: */*: object

## POST /api/v1/admin/salons/{id}/approve

Approve salon

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `200`: */*: object

## PATCH /api/v1/admin/users/{id}/lock

Lock/unlock user account

- Tham số `id` (path, bắt buộc): string (uuid)
- Request `application/json`: `LockUserRequest`
- Response `200`: */*: AdminUserResponse

## GET /healthz

Liveness check

- Response `200`: application/json: HealthStatus

## GET /api/v1/salons/{salonId}/reviews

Get reviews for a salon

- Tham số `salonId` (path, bắt buộc): integer (int64)
- Tham số `page` (query, tùy chọn): integer (int32)
- Tham số `pageSize` (query, tùy chọn): integer (int32)
- Response `200`: */*: PagedResultReviewDetailsResponse

## GET /api/v1/salons/{id}

Get salon details

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `200`: */*: SalonDetailsResponse

## GET /api/v1/salons/{id}/staff

Get salon staff

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `200`: */*: array<EmployeeResponse>

## GET /api/v1/salons/{id}/services

Get salon services

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `200`: */*: array<NailServiceResponse>

## GET /api/v1/owner/dashboard

Get owner dashboard analytics

- Response `200`: */*: OwnerDashboardSummaryResponse

## GET /api/v1/owner/bookings

Get salon appointments

- Tham số `status` (query, tùy chọn): string
- Response `200`: */*: array<BookingDetailsResponse>

## GET /api/v1/bookings/{id}

Yêu cầu JWT; chỉ khách sở hữu, chủ salon hoặc admin được xem.

Get booking details by ID

- Tham số `id` (path, bắt buộc): integer (int64)
- Response `200`: */*: BookingDetailsResponse

## GET /api/v1/auth/me

Get current user profile

- Response `200`: */*: UserProfileResponse

## GET /api/v1/admin/users

List all users

- Tham số `page` (query, tùy chọn): integer (int32)
- Tham số `pageSize` (query, tùy chọn): integer (int32)
- Response `200`: */*: PagedResultAdminUserResponse

## GET /api/v1/admin/salons/pending

List pending salons

- Tham số `page` (query, tùy chọn): integer (int32)
- Tham số `pageSize` (query, tùy chọn): integer (int32)
- Response `200`: */*: PagedResultSalonDetailsResponse

## GET /api/v1/admin/dashboard

Get platform metrics

- Response `200`: */*: AdminDashboardResponse

## GET /api/profiles/me

Get current user profile (legacy compatibility)

- Response `200`: */*: UserProfileResponse

## GET /api/v1/bookings/my

Danh sách lịch của tài khoản đã đăng nhập; `page` mặc định 0, `pageSize` mặc định 10, tối đa 100. Response 200: `PagedResultBookingDetailsResponse`.

## PUT /api/v1/auth/me

Yêu cầu JWT; request `{ fullName, phone }`; response 200 `UserProfileResponse`.

# Schema

## UpdateServiceRequest

- `categoryId`: integer (int64)
- `name`: string (bắt buộc)
- `description`: string
- `price`: number (bắt buộc)
- `durationMinutes`: integer (int32) (bắt buộc)
- `imageUrl`: string
- `active`: boolean

## ServiceResponse

- `id`: integer (int64)
- `salonId`: integer (int64)
- `categoryId`: integer (int64)
- `name`: string
- `description`: string
- `price`: number
- `durationMinutes`: integer (int32)
- `imageUrl`: string
- `active`: boolean
- `createdAt`: string (date-time)
- `updatedAt`: string (date-time)

## UpdateOwnerSalonRequest

- `name`: string (bắt buộc)
- `description`: string
- `address`: string (bắt buộc)
- `city`: string (bắt buộc)
- `district`: string (bắt buộc)
- `phone`: string (bắt buộc)
- `email`: string (bắt buộc)
- `logoUrl`: string

## SalonDetailsResponse

- `id`: integer (int64)
- `ownerId`: string (uuid)
- `name`: string
- `description`: string
- `address`: string
- `city`: string
- `district`: string
- `phone`: string
- `email`: string
- `logoUrl`: string
- `status`: string
- `latitude`: number (double)
- `longitude`: number (double)
- `averageRating`: number
- `totalReviews`: integer (int32)
- `subscriptionTier`: string

## UpdateEmployeeRequest

- `fullName`: string (bắt buộc)
- `phone`: string
- `avatarUrl`: string
- `bio`: string
- `active`: boolean

## EmployeeResponse

- `id`: integer (int64)
- `salonId`: integer (int64)
- `fullName`: string
- `phone`: string
- `avatarUrl`: string
- `bio`: string
- `active`: boolean
- `createdAt`: string (date-time)
- `updatedAt`: string (date-time)

## TransitionStatusRequest

- `status`: string (bắt buộc)
- `cancellationReason`: string
- `note`: string

## BookingDetailsResponse

- `id`: integer (int64)
- `customerId`: string (uuid)
- `walkInName`: string
- `guestEmail`: string
- `walkInPhone`: string
- `salonId`: integer (int64)
- `serviceId`: integer (int64)
- `employeeId`: integer (int64)
- `scheduledAt`: string (date-time)
- `durationMinutes`: integer (int32)
- `servicePriceSnapshot`: number
- `status`: string
- `customerNote`: string
- `salonNote`: string
- `cancellationReason`: string
- `completedAt`: string (date-time)
- `createdAt`: string (date-time)
- `updatedAt`: string (date-time)
- `customerName`: string
- `customerPhone`: string
- `salonName`: string
- `serviceName`: string

## CreateSalonRequest

- `name`: string (bắt buộc)
- `address`: string (bắt buộc)
- `city`: string
- `district`: string
- `phone`: string
- `email`: string
- `description`: string

## CreateReviewRequest

- `bookingId`: integer (int64) (bắt buộc)
- `rating`: integer (int32) (bắt buộc)
- `comment`: string

## ReviewDetailsResponse

- `id`: integer (int64)
- `customerId`: string (uuid)
- `customerName`: string
- `customerAvatarUrl`: string
- `salonId`: integer (int64)
- `bookingId`: integer (int64)
- `serviceName`: string
- `employeeName`: string
- `rating`: integer (int32)
- `comment`: string
- `salonReply`: string
- `salonRepliedAt`: string (date-time)
- `createdAt`: string (date-time)

## ReviewReplyRequest

- `reply`: string (bắt buộc)

## CreateServiceRequest

- `categoryId`: integer (int64)
- `name`: string (bắt buộc)
- `description`: string
- `price`: number (bắt buộc)
- `durationMinutes`: integer (int32) (bắt buộc)
- `imageUrl`: string

## CreateEmployeeRequest

- `fullName`: string (bắt buộc)
- `phone`: string
- `avatarUrl`: string
- `bio`: string

## UploadImageResponse

- `url`: string

## CreateBookingRequest

- `salonId`: integer (int64) (bắt buộc)
- `serviceId`: integer (int64) (bắt buộc)
- `employeeId`: integer (int64)
- `scheduledAt`: string (date-time) (bắt buộc)
- `durationMinutes`: integer (int32)
- `customerNote`: string
- `walkInName`: string
- `guestEmail`: string
- `walkInPhone`: string
- `customerPhone`: string (số liên hệ của lịch hẹn khách đăng nhập)

## VerifyEmailRequest

- `email`: string (bắt buộc)
- `code`: string (bắt buộc)

## TokenResponse

- `accessToken`: string
- `refreshToken`: string
- `tokenType`: string
- `expiresIn`: integer (int64)
- `user`: UserProfileResponse

## UserProfileResponse

- `id`: string (uuid)
- `email`: string
- `fullName`: string
- `phone`: string
- `avatarUrl`: string
- `role`: string
- `emailVerified`: boolean

## ResendVerificationRequest

- `email`: string (bắt buộc)

## RegisterRequest

- `email`: string (bắt buộc)
- `password`: string (bắt buộc)
- `fullName`: string (bắt buộc)
- `phone`: string

## RegisterResponse

- `userId`: string (uuid)
- `email`: string
- `message`: string

## RefreshTokenRequest

- `refreshToken`: string (bắt buộc)

## LoginRequest

- `email`: string (bắt buộc)
- `password`: string (bắt buộc)

## ForgotPasswordRequest

- `email`: string (bắt buộc)

## ConfirmForgotPasswordRequest

- `email`: string (bắt buộc)
- `confirmationCode`: string (bắt buộc)
- `newPassword`: string (bắt buộc)

## ChangePasswordRequest

- `currentPassword`: string (bắt buộc)
- `newPassword`: string (bắt buộc)

## LockUserRequest

- `locked`: boolean (bắt buộc)

## AdminUserResponse

- `id`: string (uuid)
- `email`: string
- `fullName`: string
- `phone`: string
- `role`: string
- `enabled`: boolean
- `locked`: boolean
- `emailVerifiedAt`: string (date-time)
- `createdAt`: string (date-time)

## HealthStatus

- `status`: string (bắt buộc)
- `timestamp`: string (date-time) (bắt buộc)

## PagedResultSalonSummaryResponse

- `items`: array<SalonSummaryResponse>
- `page`: integer (int32)
- `pageSize`: integer (int32)
- `totalItems`: integer (int64)
- `totalPages`: integer (int32)

## SalonSummaryResponse

- `id`: integer (int64)
- `name`: string
- `address`: string
- `city`: string
- `district`: string
- `phone`: string
- `logoUrl`: string
- `averageRating`: number
- `totalReviews`: integer (int32)
- `subscriptionTier`: string

## PagedResultReviewDetailsResponse

- `items`: array<ReviewDetailsResponse>
- `page`: integer (int32)
- `pageSize`: integer (int32)
- `totalItems`: integer (int64)
- `totalPages`: integer (int32)

## NailServiceResponse

- `id`: integer (int64)
- `salonId`: integer (int64)
- `categoryId`: integer (int64)
- `name`: string
- `description`: string
- `price`: number
- `durationMinutes`: integer (int32)
- `imageUrl`: string
- `active`: boolean

## OwnerDashboardSummaryResponse

- `totalBookings`: integer (int64)
- `pendingBookings`: integer (int64)
- `confirmedBookings`: integer (int64)
- `completedBookings`: integer (int64)
- `monthlyRevenue`: number
- `monthlyCustomers`: integer (int64)
- `averageRating`: number (double)

## PagedResultAdminUserResponse

- `items`: array<AdminUserResponse>
- `page`: integer (int32)
- `pageSize`: integer (int32)
- `totalItems`: integer (int64)
- `totalPages`: integer (int32)

## PagedResultSalonDetailsResponse

- `items`: array<SalonDetailsResponse>
- `page`: integer (int32)
- `pageSize`: integer (int32)
- `totalItems`: integer (int64)
- `totalPages`: integer (int32)

## AdminDashboardResponse

- `totalSalons`: integer (int64)
- `pendingSalons`: integer (int64)
- `activeSalons`: integer (int64)
- `totalUsers`: integer (int64)
- `totalBookings`: integer (int64)
- `totalRevenue`: number

## InvalidParam

- `name`: string (bắt buộc)
- `reason`: string (bắt buộc)

## ProblemDetail

- `type`: string (uri) (bắt buộc)
- `title`: string (bắt buộc)
- `status`: integer (int32) (bắt buộc)
- `detail`: string
- `instance`: string
- `traceId`: string
- `invalidParams`: array<InvalidParam>

## PagedResult

- `items`: array<object> (bắt buộc)
- `page`: integer (int32) (bắt buộc)
- `pageSize`: integer (int32) (bắt buộc)
- `totalItems`: integer (int64) (bắt buộc)
- `totalPages`: integer (int32) (bắt buộc)
