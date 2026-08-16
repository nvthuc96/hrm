/** Login/refresh response body. The refresh token is NOT here — it lives in an httpOnly cookie. */
export interface AuthResponse {
  token: string;
  username: string;
  roles: string[];
}

/** Non-secret identity kept in localStorage for instant UI (no tokens). */
export interface SessionUser {
  username: string;
  roles: string[];
}

export interface Role {
  id: number;
  name: string;
}

export type NotificationType = 'LEAVE_SUBMITTED' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

/** Current user's own account + linked employee (employee null if unlinked). */
export interface MeProfile {
  username: string;
  roles: string[];
  employeeId: number | null;
  employee: Employee | null;
}

export interface User {
  id: number;
  username: string;
  enabled: boolean;
  employeeId?: number | null;
  employeeName?: string | null;
  roles: string[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  dob?: string;
  gender?: string;
  nationalId?: string;
  email?: string;
  phone?: string;
  address?: string;
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  managerId?: number;
  hireDate?: string;
  status: EmployeeStatus;
}

export interface Department {
  id: number;
  name: string;
  parentId?: number;
  parentName?: string;
  managerId?: number;
}

export interface Position {
  id: number;
  name: string;
  level: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY';

export interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  workDate: string;
  checkIn?: string;
  checkOut?: string;
  workedHours: number;
  otHours: number;
  status: AttendanceStatus;
  source: string;
  note?: string;
}

export interface MonthlyAttendance {
  year: number;
  month: number;
  employeeId: number;
  records: Attendance[];
  summary: {
    presentDays: number;
    absentDays: number;
    leaveDays: number;
    totalWorkedHours: number;
    totalOtHours: number;
  };
}

export interface LeaveType {
  id: number;
  name: string;
  paid: boolean;
  maxDaysPerYear: number;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  approverName?: string;
  decisionNote?: string;
}

export interface LeaveBalance {
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  entitled: number;
  used: number;
  remaining: number;
}

export type ComponentType = 'ALLOWANCE' | 'DEDUCTION';

export interface SalaryComponent {
  id: number;
  name: string;
  type: ComponentType;
  taxable: boolean;
  defaultAmount: number;
}

export type PeriodStatus = 'OPEN' | 'LOCKED';

export interface PayrollPeriod {
  id: number;
  month: number;
  year: number;
  status: PeriodStatus;
}

export interface PayslipDetail {
  name: string;
  type: ComponentType;
  amount: number;
}

export interface Payslip {
  id: number;
  employeeId: number;
  employeeName: string;
  periodId: number;
  month: number;
  year: number;
  workingDays: number;
  baseSalary: number;
  totalAllowance: number;
  totalDeduction: number;
  gross: number;
  insurance: number;
  tax: number;
  netSalary: number;
  details: PayslipDetail[];
}
