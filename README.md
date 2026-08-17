# HRM — Hệ thống Quản lý Nhân sự

MVP 4 module: **Nhân viên → Chấm công → Nghỉ phép → Bảng lương**.
Hiện đã hoàn thiện **Pha 0 (Auth/JWT)** + **Pha 1 (Nhân viên & Tổ chức)**.

## Tech stack
| Layer | Công nghệ |
|-------|-----------|
| Backend | Java 17 · Spring Boot 3.3 · Spring Security (JWT) · Data JPA · Flyway |
| DB | PostgreSQL 16 |
| Frontend | Angular 18 · Angular Material · Tailwind CSS |

## Cấu trúc
```
hrm/
├── docker-compose.yml     # PostgreSQL cho dev
├── backend/               # Spring Boot (Maven)
└── frontend/              # Angular + Material + Tailwind
```

## Chạy dự án

### 1. Database
```bash
cd hrm
docker compose up -d          # Postgres tại localhost:5432 (db=hrm, user/pass=postgres)
```

### 2. Backend  (http://localhost:8080)
```bash
cd backend
mvn spring-boot:run
```
- Flyway tự tạo schema (V1) + seed 4 role.
- Tài khoản admin mặc định được tạo lúc khởi động: **admin / admin123**.
- Swagger UI: http://localhost:8080/swagger-ui.html

Biến môi trường ghi đè (tùy chọn): `DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, APP_JWT_SECRET, APP_CORS_ORIGINS`.

### 3. Frontend  (http://localhost:4200)
```bash
cd frontend
npm start
```
Đăng nhập bằng admin / admin123.

## API đã có
| Method | Endpoint | Quyền |
|--------|----------|-------|
| POST | `/api/auth/login` | public |
| GET | `/api/employees?q=&departmentId=&page=&size=` | đã đăng nhập |
| GET/POST/PUT/DELETE | `/api/employees/{id}` | HR/ADMIN (xóa: ADMIN) |
| CRUD | `/api/departments`, `/api/positions` | HR/ADMIN |
| GET | `/api/attendance/monthly?employeeId=&year=&month=` | đã đăng nhập |
| POST/PUT/DELETE | `/api/attendance/{id}` | HR/ADMIN/MANAGER (xóa: HR/ADMIN) |
| GET/POST | `/api/leaves`, `/api/leaves/balances` | đã đăng nhập |
| POST | `/api/leaves/{id}/approve` `/reject` `/cancel` | duyệt: HR/ADMIN/MANAGER |
| CRUD | `/api/leave-types` | HR/ADMIN |
| GET/POST | `/api/payroll/periods` | tạo: HR/ADMIN |
| POST | `/api/payroll/periods/{id}/generate` `/lock` `/unlock` | HR/ADMIN |
| GET | `/api/payroll/payslips?periodId=` | đã đăng nhập |
| CRUD | `/api/salary-components` | HR/ADMIN |

## Lộ trình
- ✅ **Pha 0** — Auth/JWT
- ✅ **Pha 1** — Nhân viên & Tổ chức (Nhân viên, Phòng ban, Chức danh)
- ✅ **Pha 2** — Chấm công (chấm công theo tháng, tự tính giờ công/OT chuẩn 8h)
- ✅ **Pha 3** — Nghỉ phép (đơn nghỉ → duyệt/từ chối/hủy → tự trừ số dư phép)
- ✅ **Pha 4** — Bảng lương (kỳ lương → tính lương từ hợp đồng + công + phụ cấp/khấu trừ → payslip: gross, BHXH 10.5%, thuế TNCN, thực lãnh)

**🎉 MVP 4 module hoàn tất.** Hướng mở rộng: xuất payslip PDF, import chấm công từ Excel/máy chấm công, dashboard tổng quan, phân quyền theo phòng ban, thuế TNCN lũy tiến đầy đủ.

## Ghi chú công thức lương (đơn giản hóa cho MVP)
- Lương cơ bản = lương hợp đồng × (ngày công / 22), tối đa 1 tháng đủ.
- Gross = lương theo công + tổng phụ cấp.
- Bảo hiểm = 10.5% lương theo công (BHXH 8% + BHYT 1.5% + BHTN 1%).
- Thuế TNCN = 10% × (thu nhập chịu thuế − 11 triệu giảm trừ bản thân), làm phẳng (chưa lũy tiến).
- Thực lãnh = Gross − khấu trừ − bảo hiểm − thuế.

Mỗi pha = 1 Flyway migration mới (V2, V3, V4) + 1 package backend + 1 route frontend.

## Lưu ý kỹ thuật
- **Tailwind + Material**: đã tắt `preflight` trong `tailwind.config.js` để Tailwind không phá style Material. Material lo component, Tailwind lo layout/spacing.
- `ddl-auto=validate`: JPA không tự sửa schema — mọi thay đổi bảng đi qua Flyway.
- Đổi `APP_JWT_SECRET` (≥32 ký tự) và mật khẩu admin trước khi lên production.

## Code style & linting

**Frontend** (`frontend/`):

```bash
npm run lint          # ESLint (angular-eslint)
npm run lint:fix      # auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier verify (CI)
```

**Backend** (`backend/`) — Spotless with google-java-format:

```bash
./mvnw spotless:apply   # format all Java
./mvnw spotless:check   # verify (CI)
```

A root `.editorconfig` keeps indentation consistent across editors.
