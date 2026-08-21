import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LeaveService } from '../../core/leave.service';
import { Employee, LeaveType } from '../../core/models';
import { toIsoDate } from '../../core/date-util';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { DialogFormBase } from '../../shared/dialog-form.base';

export interface LeaveFormData {
  employees: Employee[];
  leaveTypes: LeaveType[];
  defaultEmployeeId: number | null;
}

@Component({
  selector: 'app-leave-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDatepickerModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'leaveForm.title' | translate }}</h2>
    @if (saving()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
    <mat-dialog-content>
      <form [formGroup]="form" class="grid grid-cols-2 gap-x-4 pt-2 min-w-[420px]">
        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>{{ 'leaveForm.employee' | translate }}</mat-label>
          <mat-select formControlName="employeeId">
            @for (e of data.employees; track e.id) {
              <mat-option [value]="e.id">{{ e.fullName }} ({{ e.employeeCode }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>{{ 'leaveForm.type' | translate }}</mat-label>
          <mat-select formControlName="leaveTypeId">
            @for (t of data.leaveTypes; track t.id) {
              <mat-option [value]="t.id"
                >{{ t.name }}{{ t.paid ? '' : ('leaveForm.unpaidSuffix' | translate) }}</mat-option
              >
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'leaveForm.from' | translate }}</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
          <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'leaveForm.to' | translate }}</mat-label>
          <input
            matInput
            [matDatepicker]="endPicker"
            [min]="form.controls.startDate.value"
            formControlName="endDate"
          />
          <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>{{ 'leaveForm.reason' | translate }}</mat-label>
          <input matInput formControlName="reason" />
        </mat-form-field>
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
        {{ 'leaveForm.submit' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class LeaveFormComponent extends DialogFormBase {
  private fb = inject(FormBuilder);
  private service = inject(LeaveService);
  data = inject<LeaveFormData>(MAT_DIALOG_DATA);

  form = this.fb.nonNullable.group({
    employeeId: [this.data.defaultEmployeeId, Validators.required],
    leaveTypeId: [null as number | null, Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
    reason: [''],
  });

  save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.submit(
      this.service.create({
        employeeId: raw.employeeId!,
        leaveTypeId: raw.leaveTypeId!,
        startDate: toIsoDate(raw.startDate!),
        endDate: toIsoDate(raw.endDate!),
        reason: raw.reason || undefined,
      }),
      'leaveForm.submitFailed',
    );
  }
}
