import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DepartmentService } from '../../core/department.service';
import { Department } from '../../core/models';
import { DepartmentFormComponent } from './department-form.component';
import { UiService } from '../../core/ui.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-department-list',
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
      <h1 class="page-title">{{ 'dept.title' | translate }}</h1>
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> {{ 'dept.add' | translate }}
      </button>
    </div>

    <div class="surface">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll">
        <table mat-table [dataSource]="data()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'dept.col.name' | translate }}</th>
            <td mat-cell *matCellDef="let d">{{ d.name }}</td>
          </ng-container>
          <ng-container matColumnDef="parent">
            <th mat-header-cell *matHeaderCellDef>{{ 'dept.col.parent' | translate }}</th>
            <td mat-cell *matCellDef="let d">{{ d.parentName || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'common.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let d" class="text-right">
              <button
                mat-icon-button
                [matTooltip]="'common.edit' | translate"
                (click)="openForm(d)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                [matTooltip]="'common.delete' | translate"
                (click)="confirmDelete(d)"
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
        <p class="text-center text-[var(--muted)] py-8 m-0">{{ 'dept.empty' | translate }}</p>
      }
    </div>
  `,
})
export class DepartmentListComponent implements OnInit {
  private service = inject(DepartmentService);
  private dialog = inject(MatDialog);
  private ui = inject(UiService);

  columns = ['name', 'parent', 'actions'];
  data = signal<Department[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  openForm(department?: Department): void {
    const ref = this.dialog.open(DepartmentFormComponent, {
      width: '460px',
      data: { department: department ?? null, all: this.data() },
    });
    this.ui.afterSaved(ref, !department, 'dept.added', 'dept.updated', () => this.load());
  }

  confirmDelete(department: Department): void {
    this.ui.confirmDelete({
      titleKey: 'dept.deleteTitle',
      messageKey: 'dept.deleteMsg',
      messageParams: { name: department.name },
      delete$: this.service.delete(department.id),
      successKey: 'dept.deleted',
      onDone: () => this.load(),
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
