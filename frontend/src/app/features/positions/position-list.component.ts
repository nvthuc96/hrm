import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PositionService } from '../../core/position.service';
import { Position } from '../../core/models';
import { PositionFormComponent } from './position-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-position-list',
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
      <h1 class="page-title">{{ 'pos.title' | translate }}</h1>
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> {{ 'pos.add' | translate }}
      </button>
    </div>

    <div class="surface">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll">
        <table mat-table [dataSource]="data()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'pos.col.name' | translate }}</th>
            <td mat-cell *matCellDef="let p">{{ p.name }}</td>
          </ng-container>
          <ng-container matColumnDef="level">
            <th mat-header-cell *matHeaderCellDef>{{ 'pos.col.level' | translate }}</th>
            <td mat-cell *matCellDef="let p">{{ p.level }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'common.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let p" class="text-right">
              <button
                mat-icon-button
                [matTooltip]="'common.edit' | translate"
                (click)="openForm(p)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                [matTooltip]="'common.delete' | translate"
                (click)="confirmDelete(p)"
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
        <p class="text-center text-[var(--muted)] py-8 m-0">{{ 'pos.empty' | translate }}</p>
      }
    </div>
  `,
})
export class PositionListComponent implements OnInit {
  private service = inject(PositionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private i18n = inject(I18nService);

  columns = ['name', 'level', 'actions'];
  data = signal<Position[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  openForm(position?: Position): void {
    const ref = this.dialog.open(PositionFormComponent, {
      width: '460px',
      data: position ?? null,
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.snackBar.open(
          this.i18n.t(position ? 'pos.updated' : 'pos.added'),
          this.i18n.t('common.ok'),
          {
            duration: 2500,
          },
        );
        this.load();
      }
    });
  }

  confirmDelete(position: Position): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.i18n.t('pos.deleteTitle'),
        message: this.i18n.t('pos.deleteMsg', { name: position.name }),
        confirmText: this.i18n.t('common.delete'),
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.service.delete(position.id).subscribe({
          next: () => {
            this.snackBar.open(this.i18n.t('pos.deleted'), this.i18n.t('common.ok'), {
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
    this.service.list().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
