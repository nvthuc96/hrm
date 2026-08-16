import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { LocaleNumberPipe } from '../../core/i18n/locale-number.pipe';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PayrollService } from '../../core/payroll.service';
import { PayrollPeriod, Payslip } from '../../core/models';
import { PayslipDetailComponent } from './payslip-detail.component';
import { saveBlob } from '../../core/download';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [
    LocaleNumberPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-head">
      <h1 class="page-title">{{ 'pay.title' | translate }}</h1>
    </div>

    <div class="flex flex-wrap gap-4 items-center mb-4">
      <mat-form-field appearance="outline" class="w-56">
        <mat-label>{{ 'pay.period' | translate }}</mat-label>
        <mat-select [formControl]="periodCtrl">
          @for (p of periods(); track p.id) {
            <mat-option [value]="p.id">{{ p.month }}/{{ p.year }} ({{ 'periodStatus.' + p.status | translate }})</mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (currentPeriod(); as p) {
        <button mat-flat-button color="primary" [disabled]="p.status === 'LOCKED' || loading()"
                (click)="generate()">
          <mat-icon>calculate</mat-icon> {{ 'pay.generate' | translate }}
        </button>
        @if (p.status === 'OPEN') {
          <button mat-stroked-button (click)="lock(p)"><mat-icon>lock</mat-icon> {{ 'pay.lock' | translate }}</button>
        } @else {
          <button mat-stroked-button (click)="unlock(p)"><mat-icon>lock_open</mat-icon> {{ 'pay.unlock' | translate }}</button>
        }
        <button mat-stroked-button [disabled]="!payslips().length || exporting()" (click)="exportExcel()">
          <mat-icon>download</mat-icon> {{ 'common.exportExcel' | translate }}
        </button>
      }

      <span class="flex-1"></span>

      <mat-form-field appearance="outline" class="w-40">
        <mat-label>{{ 'pay.newPeriod' | translate }}</mat-label>
        <input matInput type="month" [formControl]="newPeriodCtrl" />
      </mat-form-field>
      <button mat-stroked-button color="primary" (click)="createPeriod()">
        <mat-icon>add</mat-icon> {{ 'pay.createPeriod' | translate }}
      </button>
    </div>

    @if (payslips().length) {
      <div class="mb-3 text-sm text-[var(--ink-soft)]">
        {{ 'pay.totalNet' | translate }} <span class="font-semibold">{{ totalNet() | localeNumber }} ₫</span>
        · {{ 'pay.employeesSuffix' | translate:{ n: payslips().length } }}
      </div>
    }

    <div class="surface overflow-auto">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll"><table mat-table [dataSource]="payslips()" class="w-full">
        <ng-container matColumnDef="employee">
          <th mat-header-cell *matHeaderCellDef>{{ 'pay.col.employee' | translate }}</th>
          <td mat-cell *matCellDef="let s">{{ s.employeeName }}</td>
        </ng-container>
        <ng-container matColumnDef="workingDays">
          <th mat-header-cell *matHeaderCellDef>{{ 'pay.col.workingDays' | translate }}</th>
          <td mat-cell *matCellDef="let s">{{ s.workingDays }}</td>
        </ng-container>
        <ng-container matColumnDef="baseSalary">
          <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'pay.col.base' | translate }}</th>
          <td mat-cell *matCellDef="let s" class="text-right">{{ s.baseSalary | localeNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="gross">
          <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'pay.col.gross' | translate }}</th>
          <td mat-cell *matCellDef="let s" class="text-right">{{ s.gross | localeNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="insurance">
          <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'pay.col.insurance' | translate }}</th>
          <td mat-cell *matCellDef="let s" class="text-right">{{ s.insurance | localeNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="tax">
          <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'pay.col.tax' | translate }}</th>
          <td mat-cell *matCellDef="let s" class="text-right">{{ s.tax | localeNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="netSalary">
          <th mat-header-cell *matHeaderCellDef class="text-right">{{ 'pay.col.net' | translate }}</th>
          <td mat-cell *matCellDef="let s" class="text-right font-medium text-blue-700">
            {{ s.netSalary | localeNumber }}
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="text-right"></th>
          <td mat-cell *matCellDef="let s" class="text-right">
            <button mat-icon-button [matTooltip]="'pay.viewSlip' | translate" (click)="viewDetail(s)">
              <mat-icon>receipt_long</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table></div>

      @if (!loading() && payslips().length === 0) {
        <p class="text-center text-[var(--muted)] py-8 m-0">
          {{ (periodCtrl.value ? 'pay.emptyWithPeriod' : 'pay.emptyNoPeriod') | translate }}
        </p>
      }
    </div>
  `,
})
export class PayrollListComponent implements OnInit {
  private service = inject(PayrollService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private i18n = inject(I18nService);

  columns = ['employee', 'workingDays', 'baseSalary', 'gross', 'insurance', 'tax', 'netSalary', 'actions'];
  periods = signal<PayrollPeriod[]>([]);
  payslips = signal<Payslip[]>([]);
  loading = signal(false);
  exporting = signal(false);

  periodCtrl = new FormControl<number | null>(null);
  newPeriodCtrl = new FormControl<string>(this.currentMonth(), { nonNullable: true });

  currentPeriod = computed(() => this.periods().find((p) => p.id === this.periodCtrl.value) ?? null);
  totalNet = computed(() => this.payslips().reduce((sum, s) => sum + s.netSalary, 0));

  ngOnInit(): void {
    this.loadPeriods();
    this.periodCtrl.valueChanges.subscribe(() => this.loadPayslips());
  }

  exportExcel(): void {
    const periodId = this.periodCtrl.value;
    if (!periodId) return;
    this.exporting.set(true);
    this.service.exportPayslips(periodId).subscribe({
      next: (blob) => {
        const p = this.currentPeriod();
        saveBlob(blob, p ? `bang-luong-${p.month}-${p.year}.xlsx` : 'bang-luong.xlsx');
        this.exporting.set(false);
      },
      error: () => {
        this.snackBar.open(this.i18n.t('common.exportFailed'), this.i18n.t('common.close'), { duration: 3000 });
        this.exporting.set(false);
      },
    });
  }

  createPeriod(): void {
    const val = this.newPeriodCtrl.value;
    if (!val) return;
    const [year, month] = val.split('-').map(Number);
    this.service.createPeriod(month, year).subscribe({
      next: (p) => {
        this.snackBar.open(this.i18n.t('pay.periodCreated', { m: p.month, y: p.year }), this.i18n.t('common.ok'), { duration: 2500 });
        this.loadPeriods(p.id);
      },
      error: (err) =>
        this.snackBar.open(err?.error?.message ?? this.i18n.t('pay.createPeriodFailed'), this.i18n.t('common.ok'), { duration: 3000 }),
    });
  }

  generate(): void {
    const periodId = this.periodCtrl.value;
    if (!periodId) return;
    this.loading.set(true);
    this.service.generate(periodId).subscribe({
      next: (slips) => {
        this.payslips.set(slips);
        this.loading.set(false);
        this.snackBar.open(this.i18n.t('pay.generated', { n: slips.length }), this.i18n.t('common.ok'), { duration: 2500 });
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err?.error?.message ?? this.i18n.t('pay.generateFailed'), this.i18n.t('common.ok'), { duration: 3000 });
      },
    });
  }

  lock(p: PayrollPeriod): void {
    this.service.lock(p.id).subscribe(() => {
      this.snackBar.open(this.i18n.t('pay.locked'), this.i18n.t('common.ok'), { duration: 2000 });
      this.loadPeriods(p.id);
    });
  }

  unlock(p: PayrollPeriod): void {
    this.service.unlock(p.id).subscribe(() => {
      this.snackBar.open(this.i18n.t('pay.unlocked'), this.i18n.t('common.ok'), { duration: 2000 });
      this.loadPeriods(p.id);
    });
  }

  viewDetail(s: Payslip): void {
    this.dialog.open(PayslipDetailComponent, { width: '460px', data: s });
  }

  private loadPeriods(selectId?: number): void {
    this.service.listPeriods().subscribe((list) => {
      this.periods.set(list);
      const target = selectId ?? this.periodCtrl.value ?? list[0]?.id ?? null;
      if (target !== this.periodCtrl.value) {
        this.periodCtrl.setValue(target);
      } else {
        this.loadPayslips();
      }
    });
  }

  private loadPayslips(): void {
    const periodId = this.periodCtrl.value;
    if (!periodId) {
      this.payslips.set([]);
      return;
    }
    this.loading.set(true);
    this.service.listPayslips(periodId).subscribe({
      next: (res) => {
        this.payslips.set(res);
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
