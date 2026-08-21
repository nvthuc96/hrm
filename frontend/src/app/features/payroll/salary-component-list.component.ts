import { Component, inject, signal, OnInit } from '@angular/core';
import { LocaleNumberPipe } from '../../core/i18n/locale-number.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { PayrollService } from '../../core/payroll.service';
import { SalaryComponent } from '../../core/models';
import { SalaryComponentFormComponent } from './salary-component-form.component';
import { UiService } from '../../core/ui.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-salary-component-list',
  standalone: true,
  imports: [
    LocaleNumberPipe,
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
      <h1 class="page-title">{{ 'sc.title' | translate }}</h1>
      <button mat-flat-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> {{ 'sc.add' | translate }}
      </button>
    </div>

    <div class="surface">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll">
        <table mat-table [dataSource]="data()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'sc.col.name' | translate }}</th>
            <td mat-cell *matCellDef="let c">{{ c.name }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>{{ 'sc.col.type' | translate }}</th>
            <td mat-cell *matCellDef="let c">
              <mat-chip [highlighted]="c.type === 'ALLOWANCE'">
                {{ (c.type === 'ALLOWANCE' ? 'sc.typeAllowance' : 'sc.typeDeduction') | translate }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'sc.col.default' | translate }}
            </th>
            <td mat-cell *matCellDef="let c" class="text-right">
              {{ c.defaultAmount | localeNumber }} ₫
            </td>
          </ng-container>
          <ng-container matColumnDef="taxable">
            <th mat-header-cell *matHeaderCellDef>{{ 'sc.col.taxable' | translate }}</th>
            <td mat-cell *matCellDef="let c">
              {{ (c.taxable ? 'common.yes' : 'common.no') | translate }}
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'common.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let c" class="text-right">
              <button
                mat-icon-button
                [matTooltip]="'common.edit' | translate"
                (click)="openForm(c)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                [matTooltip]="'common.delete' | translate"
                (click)="confirmDelete(c)"
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
        <p class="text-center text-[var(--muted)] py-8 m-0">{{ 'sc.empty' | translate }}</p>
      }
    </div>
  `,
})
export class SalaryComponentListComponent implements OnInit {
  private service = inject(PayrollService);
  private dialog = inject(MatDialog);
  private ui = inject(UiService);

  columns = ['name', 'type', 'amount', 'taxable', 'actions'];
  data = signal<SalaryComponent[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  openForm(component?: SalaryComponent): void {
    const ref = this.dialog.open(SalaryComponentFormComponent, {
      width: '440px',
      data: component ?? null,
    });
    this.ui.afterSaved(ref, !component, 'sc.added', 'sc.updated', () => this.load());
  }

  confirmDelete(component: SalaryComponent): void {
    this.ui.confirmDelete({
      titleKey: 'sc.deleteTitle',
      messageKey: 'sc.deleteMsg',
      messageParams: { name: component.name },
      delete$: this.service.deleteComponent(component.id),
      successKey: 'sc.deleted',
      onDone: () => this.load(),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.service.listComponents().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
