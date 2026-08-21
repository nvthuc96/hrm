import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { LeaveService } from '../../core/leave.service';
import { LeaveType } from '../../core/models';
import { LeaveTypeFormComponent } from './leave-type-form.component';
import { UiService } from '../../core/ui.service';
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
  private ui = inject(UiService);

  columns = ['name', 'paid', 'maxDays', 'actions'];
  data = signal<LeaveType[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  openForm(type?: LeaveType): void {
    const ref = this.dialog.open(LeaveTypeFormComponent, { width: '440px', data: type ?? null });
    this.ui.afterSaved(ref, !type, 'ltype.added', 'ltype.updated', () => this.load());
  }

  confirmDelete(type: LeaveType): void {
    this.ui.confirmDelete({
      titleKey: 'ltype.deleteTitle',
      messageKey: 'ltype.deleteMsg',
      messageParams: { name: type.name },
      delete$: this.service.deleteType(type.id),
      successKey: 'ltype.deleted',
      onDone: () => this.load(),
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
