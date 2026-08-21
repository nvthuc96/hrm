import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PayrollService } from '../../core/payroll.service';
import { ComponentType, SalaryComponent } from '../../core/models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { DialogFormBase } from '../../shared/dialog-form.base';

@Component({
  selector: 'app-salary-component-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ (isEdit ? 'sc.form.edit' : 'sc.form.add') | translate }}</h2>
    @if (saving()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-x-4 pt-2 min-w-[380px]">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'sc.f.name' | translate }}</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'sc.f.type' | translate }}</mat-label>
          <mat-select formControlName="type">
            <mat-option value="ALLOWANCE">{{ 'sc.optAllowance' | translate }}</mat-option>
            <mat-option value="DEDUCTION">{{ 'sc.optDeduction' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'sc.f.default' | translate }}</mat-label>
          <input matInput type="number" formControlName="defaultAmount" />
          <span matTextSuffix>₫</span>
        </mat-form-field>

        <mat-slide-toggle formControlName="taxable" class="mb-2">{{
          'sc.f.taxable' | translate
        }}</mat-slide-toggle>
      </form>
      @if (error()) {
        <p class="text-red-600 text-sm">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">{{ 'common.cancel' | translate }}</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || saving()"
        (click)="save()"
      >
        {{ 'common.save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class SalaryComponentFormComponent extends DialogFormBase implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PayrollService);
  private data = inject<SalaryComponent | null>(MAT_DIALOG_DATA);

  isEdit = !!this.data;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    type: ['ALLOWANCE' as ComponentType, Validators.required],
    defaultAmount: [0, [Validators.required, Validators.min(0)]],
    taxable: [true],
  });

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        type: this.data.type,
        defaultAmount: this.data.defaultAmount,
        taxable: this.data.taxable,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    this.submit(
      this.isEdit
        ? this.service.updateComponent(this.data!.id, payload)
        : this.service.createComponent(payload),
    );
  }
}
