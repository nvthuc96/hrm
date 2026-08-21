import { Component, inject, signal, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeeService } from '../../core/employee.service';
import { Employee } from '../../core/models';
import { EmployeeFormComponent } from './employee-form.component';
import { UiService } from '../../core/ui.service';
import { saveBlob } from '../../core/download';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ 'emp.title' | translate }}</h1>
        <p class="page-sub">{{ 'emp.sub' | translate }}</p>
      </div>
      <div class="flex gap-2">
        <button mat-stroked-button [disabled]="exporting()" (click)="exportExcel()">
          <mat-icon>download</mat-icon> {{ 'common.exportExcel' | translate }}
        </button>
        <button mat-flat-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> {{ 'emp.add' | translate }}
        </button>
      </div>
    </div>

    <mat-form-field appearance="outline" class="w-full max-w-sm">
      <mat-label>{{ 'emp.searchLabel' | translate }}</mat-label>
      <input matInput [formControl]="searchCtrl" />
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    <div class="surface">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll">
        <table mat-table [dataSource]="data()" class="w-full">
          <ng-container matColumnDef="employeeCode">
            <th mat-header-cell *matHeaderCellDef>{{ 'emp.col.code' | translate }}</th>
            <td mat-cell *matCellDef="let e">{{ e.employeeCode }}</td>
          </ng-container>
          <ng-container matColumnDef="fullName">
            <th mat-header-cell *matHeaderCellDef>{{ 'emp.col.name' | translate }}</th>
            <td mat-cell *matCellDef="let e">{{ e.fullName }}</td>
          </ng-container>
          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>{{ 'emp.col.department' | translate }}</th>
            <td mat-cell *matCellDef="let e">{{ e.departmentName || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="position">
            <th mat-header-cell *matHeaderCellDef>{{ 'emp.col.position' | translate }}</th>
            <td mat-cell *matCellDef="let e">{{ e.positionName || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'emp.col.status' | translate }}</th>
            <td mat-cell *matCellDef="let e">
              <span
                class="badge"
                [class.badge-ok]="e.status === 'ACTIVE'"
                [class.badge-warn]="e.status === 'ON_LEAVE'"
                [class.badge-muted]="e.status === 'TERMINATED'"
              >
                {{ 'status.' + e.status | translate }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'common.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let e" class="text-right">
              <button
                mat-icon-button
                [matTooltip]="'common.edit' | translate"
                (click)="openForm(e)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                [matTooltip]="'common.delete' | translate"
                (click)="confirmDelete(e)"
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
        <p class="text-center text-[var(--muted)] py-8 m-0">{{ 'emp.empty' | translate }}</p>
      }

      <mat-paginator
        [length]="total()"
        [pageSize]="size"
        [pageIndex]="page()"
        [pageSizeOptions]="[10, 20, 50]"
        (page)="onPage($event)"
      ></mat-paginator>
    </div>
  `,
})
export class EmployeeListComponent implements OnInit {
  private service = inject(EmployeeService);
  private dialog = inject(MatDialog);
  private ui = inject(UiService);

  columns = ['employeeCode', 'fullName', 'department', 'position', 'status', 'actions'];
  data = signal<Employee[]>([]);
  total = signal(0);
  page = signal(0);
  size = 20;
  loading = signal(false);
  exporting = signal(false);

  searchCtrl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.page.set(0);
      this.load();
    });
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.size = e.pageSize;
    this.load();
  }

  exportExcel(): void {
    this.exporting.set(true);
    this.service.exportExcel(this.searchCtrl.value).subscribe({
      next: (blob) => {
        saveBlob(blob, 'nhan-vien.xlsx');
        this.exporting.set(false);
      },
      error: (err) => {
        this.ui.error(err, 'common.exportFailed');
        this.exporting.set(false);
      },
    });
  }

  openForm(employee?: Employee): void {
    const ref = this.dialog.open(EmployeeFormComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: employee ?? null,
    });
    this.ui.afterSaved(ref, !employee, 'emp.added', 'emp.updated', () => this.load());
  }

  confirmDelete(employee: Employee): void {
    this.ui.confirmDelete({
      titleKey: 'emp.deleteTitle',
      messageKey: 'emp.deleteMsg',
      messageParams: { name: employee.fullName, code: employee.employeeCode },
      delete$: this.service.delete(employee.id),
      successKey: 'emp.deleted',
      onDone: () => this.load(),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.service.search(this.searchCtrl.value, this.page(), this.size).subscribe({
      next: (res) => {
        this.data.set(res.content);
        this.total.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
