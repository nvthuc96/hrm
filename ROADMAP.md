# HRM — Roadmap phát triển

Tài liệu theo dõi hướng phát triển tiếp theo của hệ thống HRM
(Angular 18 + Material + Tailwind • Spring Boot + PostgreSQL + Flyway + JWT).

Trạng thái: `[ ]` chưa làm · `[~]` đang làm · `[x]` xong.

---

## 1. Tính năng nghiệp vụ (ưu tiên cao)

- [x] **Dashboard tổng quan** — KPI (tổng NV, phòng ban, đang nghỉ, đơn chờ duyệt), biểu đồ
      NV theo phòng ban / chức danh (bar) và theo trạng thái (donut) bằng **Chart.js (ng2-charts)**,
      danh sách mới gia nhập. KPI "Đơn chờ duyệt" deep-link sang `/leaves?status=PENDING`.
      *(Chart.js nạp lazy theo route dashboard, không vào bundle initial.)*
- [x] **Quy trình duyệt nghỉ phép** — luồng `PENDING → APPROVED/REJECTED/CANCELLED` đã có; nút
      Duyệt/Từ chối chỉ hiện với `ADMIN/HR/MANAGER` (khớp `@PreAuthorize`); từ chối kèm **lý do**
      (cột `decision_note`, migration V5) hiển thị qua tooltip; badge trạng thái theo màu.
      **Thông báo** cho người nộp đơn khi duyệt/từ chối (và báo người duyệt khi có đơn mới) — xem mục
      Notifications bên dưới.
- [x] **Quản lý người dùng & phân quyền** — module `/api/users` (chỉ ADMIN): CRUD user, gán nhiều
      role, bật/khóa tài khoản, liên kết nhân viên, đặt lại mật khẩu. Chặn xóa/hạ quyền admin cuối
      cùng và xóa chính mình. FE: màn `/users` (ẩn khỏi sidebar + `adminGuard` với non-admin).
- [x] **Self-service cho nhân viên** — API `/api/me/*` (profile, chấm công theo tháng, đơn nghỉ,
      số dư phép, gửi/hủy đơn nghỉ); employeeId lấy từ JWT nên NV chỉ thao tác trên dữ liệu của mình
      (hủy đơn có kiểm tra chủ sở hữu, tài khoản chưa liên kết NV báo lỗi rõ ràng). FE: nhóm "Cá nhân"
      trên sidebar với 3 màn `/my-profile`, `/my-attendance`, `/my-leaves` + dialog gửi đơn nghỉ.
      *Demo:* user `an / admin123` (ROLE_EMPLOYEE) liên kết NV001.

## 2. UX / Giao diện

- [x] **Dark mode** — theme Material M3 light+dark (`theme.scss`, thay prebuilt), bộ token `.dark`
      trong `styles.scss`, `ThemeService` (toggle + lưu localStorage + theo `prefers-color-scheme`),
      nút bật/tắt ở header, biểu đồ Chart.js đổi màu trục/lưới theo theme. Đã thay toàn bộ
      `text-gray-*` rải rác bằng token (`var(--muted)`/`var(--ink-soft)`) cho tương phản tối ưu.
- [x] **Thông báo trong app (notifications)** — bảng `notification` (V6) + `NotificationService`;
      tạo thông báo khi đơn nghỉ được **gửi** (báo ADMIN/HR/MANAGER), **duyệt**/**từ chối** (báo NV nộp đơn,
      kèm lý do). API `/api/me/notifications` (list, unread-count, mark read, read-all) — recipient là
      *tài khoản* nên HR không gắn NV vẫn có hộp thư; đọc/đánh dấu có kiểm tra chủ sở hữu. FE: **chuông +
      badge** trên header, menu danh sách + "đánh dấu đã đọc", click điều hướng theo link, poll 45s.
- [ ] **Đa ngôn ngữ (i18n)** — chuỗi đang hardcode tiếng Việt; tách bằng `@angular/localize`
      hoặc `ngx-translate` nếu cần thêm EN.
- [ ] **Skeleton loading + empty state** trau chuốt hơn.
- [x] **Export Excel / PDF** cho danh sách NV và bảng lương — **Excel (.xlsx)** qua Apache POI:
      `GET /api/employees/export?q=&departmentId=` và `GET /api/payroll/payslips/export?periodId=`;
      helper `ExcelExporter`/`ExportResponse` dùng lại được; nút "Xuất Excel" ở màn Nhân viên & Bảng lương.
      **In phiếu lương (PDF):** nút "In phiếu / Lưu PDF" trong dialog phiếu lương mở bản in A4 (in-đậm,
      chữ ký) rồi `window.print()` — người dùng in hoặc "Lưu PDF". Chọn cách in trình duyệt để tiếng Việt
      hiển thị chuẩn, không phải nhúng font. *(Nếu cần PDF sinh phía server để gửi email tự động thì làm sau.)*
- [x] **Responsive mobile** — sidebar → drawer, bảng cuộn ngang, header co giãn.
- [x] **Trang 404** — route wildcard hiển thị trang Not Found (thay vì redirect âm thầm).

## 3. Chất lượng kỹ thuật

- [ ] **Rà soát bug `lower(bytea)`** — kiểm tra các repository search khác
      (leave/attendance/payroll) có cùng pattern `:param IS NULL OR ...` gây lỗi khi param null.
      *(Đã sửa ở EmployeeRepository bằng `CAST(:q AS string)`.)*
- [ ] **Rà soát pattern `if (q)` bỏ query param** ở các service FE khác (gây lệch FE/BE).
- [ ] **Kiểm thử** — thêm test controller/service (backend) và test luồng auth + search (frontend).
- [x] **spring-boot-devtools** — đã thêm (scope `runtime`, optional); backend tự restart khi class
      đổi, hết cảnh chạy bản stale. *Lưu ý:* cần khởi động lại backend **một lần** để nạp devtools.
- [x] **Employee search null-safe** — FE luôn gửi `q`, BE cast kiểu tường minh.

## 4. Bảo mật (làm sớm nếu chạy thật)

- [x] **Refresh token + thu hồi token / logout phía server** — access token rút còn **1h**, thêm
      **refresh token** 7 ngày (bảng `refresh_token` V7, chỉ lưu **SHA-256 hash**). `POST /api/auth/refresh`
      (xoay vòng: thu hồi token cũ, cấp token mới) và `POST /api/auth/logout` (thu hồi phía server). FE:
      `AuthService` lưu/refresh token, **interceptor tự refresh khi gặp 401** rồi replay request (single-flight,
      chống lặp), logout gọi API thu hồi. Đã test: xoay vòng ✓, dùng lại token cũ bị chặn ✓, logout thu hồi ✓.
- [x] **Chuyển token khỏi `localStorage`** → httpOnly cookie (giảm rủi ro XSS). **Refresh token** giờ nằm
      trong cookie **HttpOnly + SameSite=Strict** (Path=`/api/auth`, `secure` bật ở prod), JS không đọc được;
      **access token chỉ ở memory** (không còn trong localStorage), gửi qua header Bearer nên endpoint dữ liệu
      không phát sinh CSRF. localStorage chỉ giữ `{username, roles}` (không bí mật) để UI hiện ngay.
      `/auth/refresh` & `/auth/logout` đọc token từ cookie; **silent refresh khi tải trang** (APP_INITIALIZER)
      + interceptor tự refresh khi 401. Đã test cookie set/rotate/clear + thu hồi qua curl.
- [ ] **Đổi mật khẩu admin mặc định** `admin/admin123` + chính sách mật khẩu.
- [ ] **Rate limit** cho `/api/auth/login`.

## 5. Vận hành / DevOps

- [ ] **CI (GitHub Actions)** — build + test FE/BE, chạy Flyway migration.
- [ ] **Docker hoá** backend + frontend (mở rộng `docker-compose` hiện có cho Postgres).
- [ ] **Audit log** (ai sửa/xoá gì) + **soft delete** thay cho xoá cứng.

---

## Đề xuất thứ tự bắt đầu

1. **Dashboard tổng quan** — giá trị thấy ngay, tận dụng data đã có, ít đụng bảo mật.
2. **Luồng duyệt nghỉ phép** — giá trị nghiệp vụ cao nhất.
3. **Quản lý người dùng & phân quyền** — nền tảng cho self-service và bảo mật.
