import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./features/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'my-profile',
        loadComponent: () =>
          import('./features/self/my-profile.component').then((m) => m.MyProfileComponent),
      },
      {
        path: 'my-attendance',
        loadComponent: () =>
          import('./features/self/my-attendance.component').then((m) => m.MyAttendanceComponent),
      },
      {
        path: 'my-leaves',
        loadComponent: () =>
          import('./features/self/my-leaves.component').then((m) => m.MyLeavesComponent),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employee-list.component').then(
            (m) => m.EmployeeListComponent,
          ),
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./features/departments/department-list.component').then(
            (m) => m.DepartmentListComponent,
          ),
      },
      {
        path: 'positions',
        loadComponent: () =>
          import('./features/positions/position-list.component').then(
            (m) => m.PositionListComponent,
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/attendance/attendance-list.component').then(
            (m) => m.AttendanceListComponent,
          ),
      },
      {
        path: 'leaves',
        loadComponent: () =>
          import('./features/leaves/leave-list.component').then((m) => m.LeaveListComponent),
      },
      {
        path: 'leave-types',
        loadComponent: () =>
          import('./features/leaves/leave-type-list.component').then(
            (m) => m.LeaveTypeListComponent,
          ),
      },
      {
        path: 'payroll',
        loadComponent: () =>
          import('./features/payroll/payroll-list.component').then((m) => m.PayrollListComponent),
      },
      {
        path: 'salary-components',
        loadComponent: () =>
          import('./features/payroll/salary-component-list.component').then(
            (m) => m.SalaryComponentListComponent,
          ),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/users/user-list.component').then((m) => m.UserListComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
