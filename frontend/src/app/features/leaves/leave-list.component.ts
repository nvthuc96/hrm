import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { LeaveService } from '../../core/leave.service';
import { EmployeeService } from '../../core/employee.service';
import { AuthService } from '../../core/auth.service';
import { Employee, LeaveBalance, LeaveRequest, LeaveStatus, LeaveType } from '../../core/models';
import { LeaveFormComponent } from './leave-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { UiService } from '../../core/ui.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-head">
      <h1 class="page-title">{{ 'leave.title' | translate }}</h1>
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> {{ 'leave.add' | translate }}
      </button>
    </div>

    <div class="flex flex-wrap gap-4 items-center mb-4">
      <mat-form-field appearance="outline" class="w-64">
        <mat-label>{{ 'leave.employee' | translate }}</mat-label>
        <mat-select [formControl]="employeeCtrl">
          <mat-option [value]="null">{{ 'common.allOption' | translate }}</mat-option>
          @for (e of employees(); track e.id) {
            <mat-option [value]="e.id">{{ e.fullName }} ({{ e.employeeCode }})</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-48">
        <mat-label>{{ 'leave.status' | translate }}</mat-label>
        <mat-select [formControl]="statusCtrl">
          <mat-option [value]="null">{{ 'common.allOption' | translate }}</mat-option>
          <mat-option value="PENDING">{{ 'leaveStatus.PENDING' | translate }}</mat-option>
          <mat-option value="APPROVED">{{ 'leaveStatus.APPROVED' | translate }}</mat-option>
          <mat-option value="REJECTED">{{ 'leaveStatus.REJECTED' | translate }}</mat-option>
          <mat-option value="CANCELLED">{{ 'leaveStatus.CANCELLED' | translate }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    @if (balances().length) {
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        @for (b of balances(); track b.leaveTypeId) {
          <mat-card class="p-3">
            <div class="text-xs text-[var(--muted)]">{{ b.leaveTypeName }}</div>
            <div class="text-2xl font-medium">
              {{ b.remaining }}<span class="text-sm text-[var(--muted)]">/{{ b.entitled }}</span>
            </div>
            <div class="text-xs text-[var(--muted)]">
              {{ 'leave.balUsed' | translate: { n: b.used } }}
            </div>
          </mat-card>
        }
      </div>
    }

    <div class="surface">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll">
        <table mat-table [dataSource]="requests()" class="w-full">
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>{{ 'leave.col.employee' | translate }}</th>
            <td mat-cell *matCellDef="let r">{{ r.employeeName }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>{{ 'leave.col.type' | translate }}</th>
            <td mat-cell *matCellDef="let r">{{ r.leaveTypeName }}</td>
          </ng-container>
          <ng-container matColumnDef="range">
            <th mat-header-cell *matHeaderCellDef>{{ 'leave.col.range' | translate }}</th>
            <td mat-cell *matCellDef="let r">{{ r.startDate }} → {{ r.endDate }}</td>
          </ng-container>
          <ng-container matColumnDef="days">
            <th mat-header-cell *matHeaderCellDef>{{ 'leave.col.days' | translate }}</th>
            <td mat-cell *matCellDef="let r">{{ r.days }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'leave.col.status' | translate }}</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge" [class]="statusBadge(r.status)">{{
                'leaveStatus.' + r.status | translate
              }}</span>
              @if (r.status === 'REJECTED' && r.decisionNote) {
                <mat-icon
                  class="!text-[16px] !w-4 !h-4 align-middle ml-1 text-[var(--muted)] cursor-help"
                  [matTooltip]="('leave.rejectReasonPrefix' | translate) + r.decisionNote"
                  >info</mat-icon
                >
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'common.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let r" class="text-right">
              @if (r.status === 'PENDING') {
                @if (canDecide()) {
                  <button
                    mat-icon-button
                    color="primary"
                    [matTooltip]="'leave.approveTip' | translate"
                    (click)="approve(r)"
                  >
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    [matTooltip]="'leave.rejectTip' | translate"
                    (click)="reject(r)"
                  >
                    <mat-icon>cancel</mat-icon>
                  </button>
                }
                <button
                  mat-icon-button
                  [matTooltip]="'leave.cancelTip' | translate"
                  (click)="cancel(r)"
                >
                  <mat-icon>undo</mat-icon>
                </button>
              } @else {
                <span class="text-[var(--muted)] text-sm pr-2">{{ r.approverName || '—' }}</span>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && requests().length === 0) {
        <p class="text-center text-[var(--muted)] py-8 m-0">{{ 'leave.empty' | translate }}</p>
      }
    </div>
  `,
})
export class LeaveListComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private employeeService = inject(EmployeeService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private ui = inject(UiService);
  private i18n = inject(I18nService);

  private static readonly DECIDER_ROLES = ['ADMIN', 'HR', 'MANAGER'];
  /** Chỉ ADMIN/HR/MANAGER mới thấy nút Duyệt/Từ chối (khớp @PreAuthorize backend).
   *  Roles từ backend có tiền tố ROLE_ (vd ROLE_ADMIN) nên cần bỏ trước khi so. */
  canDecide = computed(() =>
    (this.auth.currentUser()?.roles ?? [])
      .map((r) => r.replace(/^ROLE_/, ''))
      .some((r) => LeaveListComponent.DECIDER_ROLES.includes(r)),
  );

  columns = ['employee', 'type', 'range', 'days', 'status', 'actions'];
  employees = signal<Employee[]>([]);
  leaveTypes = signal<LeaveType[]>([]);
  requests = signal<LeaveRequest[]>([]);
  balances = signal<LeaveBalance[]>([]);
  loading = signal(false);

  employeeCtrl = new FormControl<number | null>(null);
  statusCtrl = new FormControl<LeaveStatus | null>(null);

  ngOnInit(): void {
    // Cho phép mở sẵn bộ lọc trạng thái qua query param (vd dashboard → /leaves?status=PENDING).
    const status = this.route.snapshot.queryParamMap.get('status') as LeaveStatus | null;
    if (status) this.statusCtrl.setValue(status, { emitEvent: false });

    this.employeeService.search('', 0, 1000).subscribe((res) => this.employees.set(res.content));
    this.leaveService.listTypes().subscribe((t) => this.leaveTypes.set(t));
    this.load();
    this.employeeCtrl.valueChanges.subscribe(() => {
      this.loadBalances();
      this.load();
    });
    this.statusCtrl.valueChanges.subscribe(() => this.load());
  }

  statusBadge(s: LeaveStatus): string {
    return {
      PENDING: 'badge-warn',
      APPROVED: 'badge-ok',
      REJECTED: 'badge-danger',
      CANCELLED: 'badge-muted',
    }[s];
  }

  openForm(): void {
    const ref = this.dialog.open(LeaveFormComponent, {
      width: '520px',
      data: {
        employees: this.employees(),
        leaveTypes: this.leaveTypes(),
        defaultEmployeeId: this.employeeCtrl.value,
      },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.ui.toast('leave.submitted');
        this.load();
      }
    });
  }

  approve(r: LeaveRequest): void {
    this.act(this.leaveService.approve(r.id), 'leave.approved');
  }

  reject(r: LeaveRequest): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '460px',
      data: {
        title: this.i18n.t('leave.rejectTitle'),
        message: this.i18n.t('leave.rejectMsg', {
          name: r.employeeName,
          start: r.startDate,
          end: r.endDate,
        }),
        confirmText: this.i18n.t('leave.rejectTip'),
        color: 'warn',
        prompt: {
          label: this.i18n.t('leave.rejectLabel'),
          placeholder: this.i18n.t('leave.rejectPlaceholder'),
        },
      },
    });
    ref.afterClosed().subscribe((note) => {
      // Dialog trả string (kể cả rỗng) khi xác nhận, false khi hủy.
      if (note !== false && note !== undefined) {
        this.act(this.leaveService.reject(r.id, note as string), 'leave.rejected');
      }
    });
  }

  cancel(r: LeaveRequest): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.i18n.t('leave.cancelTitle'),
        message: this.i18n.t('leave.cancelMsg', {
          name: r.employeeName,
          start: r.startDate,
          end: r.endDate,
        }),
        confirmText: this.i18n.t('leave.cancelConfirm'),
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.act(this.leaveService.cancel(r.id), 'leave.cancelled');
    });
  }

  private act(obs: ReturnType<LeaveService['approve']>, successKey: string): void {
    obs.subscribe({
      next: () => {
        this.ui.toast(successKey);
        this.load();
        this.loadBalances();
      },
      error: (err) => this.ui.error(err, 'leave.actionFailed'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.leaveService.search(this.employeeCtrl.value, this.statusCtrl.value).subscribe({
      next: (res) => {
        this.requests.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadBalances(): void {
    const employeeId = this.employeeCtrl.value;
    if (!employeeId) {
      this.balances.set([]);
      return;
    }
    this.leaveService.balances(employeeId).subscribe((b) => this.balances.set(b));
  }
}
