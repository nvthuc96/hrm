import { Component, inject } from '@angular/core';
import { LocaleNumberPipe } from '../../core/i18n/locale-number.pipe';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Payslip } from '../../core/models';
import { printPayslip } from '../../core/print-payslip';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-payslip-detail',
  standalone: true,
  imports: [
    LocaleNumberPipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'slip.titlePrefix' | translate }} — {{ data.employeeName }}</h2>
    <mat-dialog-content>
      <div class="text-sm text-[var(--muted)] mb-2">
        {{ 'slip.period' | translate }} {{ data.month }}/{{ data.year }} ·
        {{ 'slip.workingDays' | translate }}: {{ data.workingDays }}
      </div>

      <div class="flex justify-between py-1">
        <span>{{ 'slip.base' | translate }}</span>
        <span class="font-medium">{{ data.baseSalary | localeNumber }} ₫</span>
      </div>

      @for (d of data.details; track d.name) {
        <div
          class="flex justify-between py-1 text-sm"
          [class.text-green-700]="d.type === 'ALLOWANCE'"
          [class.text-red-700]="d.type === 'DEDUCTION'"
        >
          <span>{{ d.type === 'ALLOWANCE' ? '+ ' : '− ' }}{{ d.name }}</span>
          <span>{{ d.amount | localeNumber }} ₫</span>
        </div>
      }

      <mat-divider class="!my-2"></mat-divider>

      <div class="flex justify-between py-1">
        <span>{{ 'slip.gross' | translate }}</span>
        <span class="font-medium">{{ data.gross | localeNumber }} ₫</span>
      </div>
      <div class="flex justify-between py-1 text-red-700">
        <span>{{ 'slip.insurance' | translate }}</span>
        <span>{{ data.insurance | localeNumber }} ₫</span>
      </div>
      <div class="flex justify-between py-1 text-red-700">
        <span>{{ 'slip.tax' | translate }}</span>
        <span>{{ data.tax | localeNumber }} ₫</span>
      </div>
      <div class="flex justify-between py-1 text-red-700">
        <span>{{ 'slip.otherDeduction' | translate }}</span>
        <span>{{ data.totalDeduction | localeNumber }} ₫</span>
      </div>

      <mat-divider class="!my-2"></mat-divider>

      <div class="flex justify-between py-2 text-lg font-semibold text-blue-700">
        <span>{{ 'slip.net' | translate }}</span>
        <span>{{ data.netSalary | localeNumber }} ₫</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.close' | translate }}</button>
      <button mat-flat-button color="primary" (click)="print()">
        <mat-icon>print</mat-icon> {{ 'slip.print' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class PayslipDetailComponent {
  data = inject<Payslip>(MAT_DIALOG_DATA);
  private i18n = inject(I18nService);

  print(): void {
    printPayslip(this.data, (k, p) => this.i18n.t(k, p), this.i18n.lang());
  }
}
