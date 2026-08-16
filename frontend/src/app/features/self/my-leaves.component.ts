import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeService } from '../../core/me.service';
import { LeaveService } from '../../core/leave.service';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../core/models';
import { MyLeaveFormComponent } from './my-leave-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ 'me.leaves.title' | translate }}</h1>
        <p class="page-sub">{{ 'me.leaves.sub' | translate }}</p>
      </div>
      <button mat-flat-button color="primary" [disabled]="loadingTypes()" (click)="openForm()">
        <mat-icon>add</mat-icon> {{ 'me.leaves.submit' | translate }}
      </button>
    </div>

    @if (error(); as e) {
      <div class="surface p-6 text-center text-[var(--muted)]">
        <mat-icon class="!w-10 !h-10 !text-[40px] text-[var(--muted)] mb-2">event_available</mat-icon>
        <p class="m-0">{{ e }}</p>
      </div>
    } @else {
      <div class="surface">
        @if (loading()) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }
        <div class="tbl-scroll"><table mat-table [dataSource]="requests()" class="w-full">
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
          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef>{{ 'me.leaves.reasonCol' | translate }}</th>
            <td mat-cell *matCellDef="let r">{{ r.reason || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'leave.col.status' | translate }}</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge" [class]="statusBadge(r.status)">{{ 'leaveStatus.' + r.status | translate }}</span>
              @if (r.status === 'REJECTED' && r.decisionNote) {
                <mat-icon class="!text-[16px] !w-4 !h-4 align-middle ml-1 text-[var(--muted)] cursor-help"
                  [matTooltip]="(('leave.rejectReasonPrefix' | translate)) + r.decisionNote">info</mat-icon>
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'common.actions' | translate }}</th>
            <td mat-cell *matCellDef="let r" class="text-right">
              @if (r.status === 'PENDING') {
                <button mat-icon-button [matTooltip]="'leave.cancelTip' | translate" (click)="cancel(r)">
                  <mat-icon>undo</mat-icon>
                </button>
              } @else {
                <span class="text-[var(--muted)] text-sm pr-2">{{ r.approverName || '—' }}</span>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table></div>

        @if (!loading() && requests().length === 0) {
          <p class="text-center text-[var(--muted)] py-8 m-0">{{ 'me.leaves.empty' | translate }}</p>
        }
      </div>
    }
  `,
})
export class MyLeavesComponent implements OnInit {
  private me = inject(MeService);
  private leaveService = inject(LeaveService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private i18n = inject(I18nService);

  columns = ['type', 'range', 'days', 'reason', 'status', 'actions'];
  requests = signal<LeaveRequest[]>([]);
  leaveTypes = signal<LeaveType[]>([]);
  loading = signal(true);
  loadingTypes = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
    this.leaveService.listTypes().subscribe({
      next: (t) => {
        this.leaveTypes.set(t);
        this.loadingTypes.set(false);
      },
      error: () => this.loadingTypes.set(false),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.me.leaves().subscribe({
      next: (r) => {
        this.requests.set(r);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? this.i18n.t('me.leaves.loadError'));
      },
    });
  }

  openForm(): void {
    const ref = this.dialog.open(MyLeaveFormComponent, {
      data: { leaveTypes: this.leaveTypes() },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.snackBar.open(this.i18n.t('leave.submitted'), this.i18n.t('common.close'), { duration: 2500 });
        this.load();
      }
    });
  }

  cancel(r: LeaveRequest): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.i18n.t('me.leaves.cancelTitle'),
        message: this.i18n.t('me.leaves.cancelMsg', { start: r.startDate, end: r.endDate }),
        confirmText: this.i18n.t('leave.cancelConfirm'),
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.me.cancelLeave(r.id).subscribe({
          next: () => {
            this.snackBar.open(this.i18n.t('leave.cancelled'), this.i18n.t('common.close'), { duration: 2500 });
            this.load();
          },
          error: (err) =>
            this.snackBar.open(err?.error?.message ?? this.i18n.t('me.leaves.cancelFailed'), this.i18n.t('common.close'), { duration: 3000 }),
        });
      }
    });
  }

  statusBadge(s: LeaveStatus): string {
    return {
      PENDING: 'badge-warn',
      APPROVED: 'badge-ok',
      REJECTED: 'badge-danger',
      CANCELLED: 'badge-muted',
    }[s];
  }
}
