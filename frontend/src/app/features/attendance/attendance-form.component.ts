import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AttendanceService } from '../../core/attendance.service';
import { Attendance, AttendanceStatus } from '../../core/models';
import { toIsoDate, parseIsoDate } from '../../core/date-util';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { DialogFormBase } from '../../shared/dialog-form.base';

export interface AttendanceFormData {
  attendance: Attendance | null;
  employeeId: number;
  defaultDate: string;
}

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LEAVE', 'HOLIDAY'];

@Component({
  selector: 'app-attendance-form',
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
    <h2 mat-dialog-title>{{ (isEdit ? 'att.form.edit' : 'att.form.add') | translate }}</h2>
    @if (saving()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
    <mat-dialog-content>
      <form [formGroup]="form" class="grid grid-cols-2 gap-x-4 pt-2 min-w-[380px]">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'att.f.date' | translate }}</mat-label>
          <input matInput [matDatepicker]="datePicker" formControlName="workDate" />
          <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
          <mat-datepicker #datePicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'att.f.status' | translate }}</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{ 'attStatus.' + s | translate }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'att.f.in' | translate }}</mat-label>
          <input matInput type="time" formControlName="checkIn" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'att.f.out' | translate }}</mat-label>
          <input matInput type="time" formControlName="checkOut" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>{{ 'att.f.note' | translate }}</mat-label>
          <input matInput formControlName="note" />
        </mat-form-field>
      </form>
      <p class="text-xs text-[var(--muted)] m-0">{{ 'att.f.hint' | translate }}</p>
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
export class AttendanceFormComponent extends DialogFormBase implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(AttendanceService);
  private data = inject<AttendanceFormData>(MAT_DIALOG_DATA);

  isEdit = !!this.data.attendance;
  statuses = STATUSES;

  form = this.fb.nonNullable.group({
    workDate: [null as Date | null, Validators.required],
    status: ['PRESENT' as AttendanceStatus, Validators.required],
    checkIn: [''],
    checkOut: [''],
    note: [''],
  });

  ngOnInit(): void {
    const a = this.data.attendance;
    if (a) {
      this.form.patchValue({
        workDate: parseIsoDate(a.workDate),
        status: a.status,
        checkIn: (a.checkIn ?? '').substring(0, 5),
        checkOut: (a.checkOut ?? '').substring(0, 5),
        note: a.note ?? '',
      });
    } else {
      this.form.patchValue({ workDate: parseIsoDate(this.data.defaultDate) });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload: Partial<Attendance> = {
      employeeId: this.data.employeeId,
      workDate: toIsoDate(raw.workDate!),
      status: raw.status,
      checkIn: raw.checkIn || undefined,
      checkOut: raw.checkOut || undefined,
      note: raw.note || undefined,
    };
    this.submit(
      this.isEdit
        ? this.service.update(this.data.attendance!.id, payload)
        : this.service.create(payload),
    );
  }
}
