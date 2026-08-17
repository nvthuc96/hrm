import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MeService } from '../../core/me.service';
import { Attendance, MonthlyAttendance } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const BADGE: Record<string, string> = {
  PRESENT: 'badge-ok',
  ABSENT: 'badge-danger',
  LEAVE: 'badge-warn',
  HOLIDAY: 'badge-brand',
};

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ 'me.att.title' | translate }}</h1>
        <p class="page-sub">{{ 'me.att.sub' | translate }}</p>
      </div>
      <mat-form-field appearance="outline" class="w-44">
        <mat-label>{{ 'att.month' | translate }}</mat-label>
        <input matInput type="month" [formControl]="monthCtrl" />
      </mat-form-field>
    </div>

    @if (error(); as e) {
      <div class="surface p-6 text-center text-[var(--muted)]">
        <mat-icon class="!w-10 !h-10 !text-[40px] text-[var(--muted)] mb-2">schedule</mat-icon>
        <p class="m-0">{{ e }}</p>
      </div>
    } @else {
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
                <span class="badge" [class]="badge(a.status)">{{
                  'attStatus.' + a.status | translate
                }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="note">
              <th mat-header-cell *matHeaderCellDef>{{ 'me.att.noteCol' | translate }}</th>
              <td mat-cell *matCellDef="let a">{{ a.note || '—' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>

        @if (!loading() && records().length === 0) {
          <p class="text-center text-[var(--muted)] py-8 m-0">
            {{ 'att.emptyWithEmp' | translate }}
          </p>
        }
      </div>
    }
  `,
})
export class MyAttendanceComponent implements OnInit {
  private me = inject(MeService);
  private i18n = inject(I18nService);

  columns = ['workDate', 'checkIn', 'checkOut', 'workedHours', 'otHours', 'status', 'note'];

  monthCtrl = new FormControl(this.currentMonth(), { nonNullable: true });
  monthly = signal<MonthlyAttendance | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  records = computed<Attendance[]>(() => this.monthly()?.records ?? []);

  badge(status: string): string {
    return BADGE[status] ?? 'badge-muted';
  }

  ngOnInit(): void {
    this.load();
    this.monthCtrl.valueChanges.subscribe(() => this.load());
  }

  private load(): void {
    const [y, m] = this.monthCtrl.value.split('-').map(Number);
    if (!y || !m) return;
    this.loading.set(true);
    this.error.set(null);
    this.me.attendance(y, m).subscribe({
      next: (data) => {
        this.monthly.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.monthly.set(null);
        this.error.set(err?.error?.message ?? this.i18n.t('me.att.loadError'));
      },
    });
  }

  private currentMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`;
  }
}
