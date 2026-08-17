import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LeaveService } from '../../core/leave.service';
import { LeaveType } from '../../core/models';
import { LeaveTypeFormComponent } from './leave-type-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-leave-type-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-head">
      <h1 class="page-title">{{ 'ltype.title' | translate }}</h1>
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> {{ 'ltype.add' | translate }}
      </button>
    </div>

    <div class="surface">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll">
        <table mat-table [dataSource]="data()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'ltype.col.name' | translate }}</th>
            <td mat-cell *matCellDef="let t">{{ t.name }}</td>
          </ng-container>
          <ng-container matColumnDef="paid">
            <th mat-header-cell *matHeaderCellDef>{{ 'ltype.col.paid' | translate }}</th>
            <td mat-cell *matCellDef="let t">
              <mat-chip [highlighted]="t.paid">{{
                (t.paid ? 'ltype.paidYes' : 'ltype.paidNo') | translate
              }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="maxDays">
            <th mat-header-cell *matHeaderCellDef>{{ 'ltype.col.max' | translate }}</th>
            <td mat-cell *matCellDef="let t">{{ t.maxDaysPerYear }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'common.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let t" class="text-right">
              <button
                mat-icon-button
                [matTooltip]="'common.edit' | translate"
                (click)="openForm(t)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                [matTooltip]="'common.delete' | translate"
                (click)="confirmDelete(t)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && data().length === 0) {
        <p class="text-center text-[var(--muted)] py-8 m-0">{{ 'ltype.empty' | translate }}</p>
      }
    </div>
  `,
})
export class LeaveTypeListComponent implements OnInit {
  private service = inject(LeaveService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private i18n = inject(I18nService);

  columns = ['name', 'paid', 'maxDays', 'actions'];
  data = signal<LeaveType[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  openForm(type?: LeaveType): void {
    const ref = this.dialog.open(LeaveTypeFormComponent, { width: '440px', data: type ?? null });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open(
          this.i18n.t(type ? 'ltype.updated' : 'ltype.added'),
          this.i18n.t('common.ok'),
          { duration: 2500 },
        );
        this.load();
      }
    });
  }

  confirmDelete(type: LeaveType): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.i18n.t('ltype.deleteTitle'),
        message: this.i18n.t('ltype.deleteMsg', { name: type.name }),
        confirmText: this.i18n.t('common.delete'),
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.service.deleteType(type.id).subscribe({
          next: () => {
            this.snackBar.open(this.i18n.t('ltype.deleted'), this.i18n.t('common.ok'), {
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
    this.loading.set(true);
    this.service.listTypes().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
