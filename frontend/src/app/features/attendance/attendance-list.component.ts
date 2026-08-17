import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttendanceService } from '../../core/attendance.service';
import { EmployeeService } from '../../core/employee.service';
import { Attendance, Employee, MonthlyAttendance } from '../../core/models';
import { AttendanceFormComponent } from './attendance-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-head">
      <h1 class="page-title">{{ 'att.title' | translate }}</h1>
      <button mat-flat-button color="primary" [disabled]="!employeeCtrl.value" (click)="openForm()">
        <mat-icon>add</mat-icon> {{ 'att.add' | translate }}
      </button>
    </div>

    <div class="flex flex-wrap gap-4 items-center mb-4">
      <mat-form-field appearance="outline" class="w-64">
        <mat-label>{{ 'att.employee' | translate }}</mat-label>
        <mat-select [formControl]="employeeCtrl">
          @for (e of employees(); track e.id) {
            <mat-option [value]="e.id">{{ e.fullName }} ({{ e.employeeCode }})</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-44">
        <mat-label>{{ 'att.month' | translate }}</mat-label>
        <input matInput type="month" [formControl]="monthCtrl" />
      </mat-form-field>
    </div>

    @if (monthly(); as m) {
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <mat-card class="p-3"
          ><div class="text-xs text-[var(--muted)]">{{ 'att.sum.present' | translate }}</div>
          <div class="text-2xl font-medium">{{ m.summary.presentDays }}</div></mat-card
        >
        <mat-card class="p-3"
          ><div class="text-xs text-[var(--muted)]">{{ 'att.sum.absent' | translate }}</div>
          <div class="text-2xl font-medium">{{ m.summary.absentDays }}</div></mat-card
        >
        <mat-card class="p-3"
          ><div class="text-xs text-[var(--muted)]">{{ 'att.sum.leave' | translate }}</div>
          <div class="text-2xl font-medium">{{ m.summary.leaveDays }}</div></mat-card
        >
        <mat-card class="p-3"
          ><div class="text-xs text-[var(--muted)]">{{ 'att.sum.hours' | translate }}</div>
          <div class="text-2xl font-medium">{{ m.summary.totalWorkedHours }}</div></mat-card
        >
        <mat-card class="p-3"
          ><div class="text-xs text-[var(--muted)]">{{ 'att.sum.ot' | translate }}</div>
          <div class="text-2xl font-medium">{{ m.summary.totalOtHours }}</div></mat-card
        >
      </div>
    }

    <div class="surface">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll">
        <table mat-table [dataSource]="records()" class="w-full">
          <ng-container matColumnDef="workDate">
            <th mat-header-cell *matHeaderCellDef>{{ 'att.col.date' | translate }}</th>
            <td mat-cell *matCellDef="let a">{{ a.workDate }}</td>
          </ng-container>
          <ng-container matColumnDef="checkIn">
            <th mat-header-cell *matHeaderCellDef>{{ 'att.col.in' | translate }}</th>
            <td mat-cell *matCellDef="let a">{{ (a.checkIn || '—').substring(0, 5) }}</td>
          </ng-container>
          <ng-container matColumnDef="checkOut">
            <th mat-header-cell *matHeaderCellDef>{{ 'att.col.out' | translate }}</th>
            <td mat-cell *matCellDef="let a">{{ (a.checkOut || '—').substring(0, 5) }}</td>
          </ng-container>
          <ng-container matColumnDef="workedHours">
            <th mat-header-cell *matHeaderCellDef>{{ 'att.col.worked' | translate }}</th>
            <td mat-cell *matCellDef="let a">{{ a.workedHours }}</td>
          </ng-container>
          <ng-container matColumnDef="otHours">
            <th mat-header-cell *matHeaderCellDef>{{ 'att.col.ot' | translate }}</th>
            <td mat-cell *matCellDef="let a">{{ a.otHours }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'att.col.status' | translate }}</th>
            <td mat-cell *matCellDef="let a">
              <mat-chip [highlighted]="a.status === 'PRESENT'">{{
                'attStatus.' + a.status | translate
              }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'common.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let a" class="text-right">
              <button
                mat-icon-button
                [matTooltip]="'common.edit' | translate"
                (click)="openForm(a)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                [matTooltip]="'common.delete' | translate"
                (click)="confirmDelete(a)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && records().length === 0) {
        <p class="text-center text-[var(--muted)] py-8 m-0">
          {{ (employeeCtrl.value ? 'att.emptyWithEmp' : 'att.emptyNoEmp') | translate }}
        </p>
      }
    </div>
  `,
})
export class AttendanceListComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private i18n = inject(I18nService);

  columns = ['workDate', 'checkIn', 'checkOut', 'workedHours', 'otHours', 'status', 'actions'];
  employees = signal<Employee[]>([]);
  monthly = signal<MonthlyAttendance | null>(null);
  loading = signal(false);
  records = computed(() => this.monthly()?.records ?? []);

  employeeCtrl = new FormControl<number | null>(null);
  monthCtrl = new FormControl<string>(this.currentMonth(), { nonNullable: true });

  ngOnInit(): void {
    this.employeeService.search('', 0, 1000).subscribe((res) => this.employees.set(res.content));
    this.employeeCtrl.valueChanges.subscribe(() => this.load());
    this.monthCtrl.valueChanges.subscribe(() => this.load());
  }

  openForm(attendance?: Attendance): void {
    const employeeId = this.employeeCtrl.value;
    if (!employeeId) return;
    const ref = this.dialog.open(AttendanceFormComponent, {
      width: '480px',
      data: {
        attendance: attendance ?? null,
        employeeId,
        defaultDate: `${this.monthCtrl.value}-01`,
      },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open(
          this.i18n.t(attendance ? 'att.updated' : 'att.added'),
          this.i18n.t('common.ok'),
          { duration: 2500 },
        );
        this.load();
      }
    });
  }

  confirmDelete(a: Attendance): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.i18n.t('att.deleteTitle'),
        message: this.i18n.t('att.deleteMsg', { date: a.workDate }),
        confirmText: this.i18n.t('common.delete'),
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.attendanceService.delete(a.id).subscribe({
          next: () => {
            this.snackBar.open(this.i18n.t('att.deleted'), this.i18n.t('common.ok'), {
              duration: 2500,
            });
            this.load();
          },
          error: (err) =>
            this.snackBar.open(
              err?.error?.message ?? this.i18n.t('common.deleteFailed'),
              this.i18n.t('common.ok'),
              { duration: 3000 },
            ),
        });
      }
    });
  }

  private load(): void {
    const employeeId = this.employeeCtrl.value;
    const month = this.monthCtrl.value;
    if (!employeeId || !month) {
      this.monthly.set(null);
      return;
    }
    const [year, m] = month.split('-').map(Number);
    this.loading.set(true);
    this.attendanceService.monthly(employeeId, year, m).subscribe({
      next: (res) => {
        this.monthly.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private currentMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
