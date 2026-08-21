import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { EmployeeService } from '../../core/employee.service';
import { DepartmentService } from '../../core/department.service';
import { PositionService } from '../../core/position.service';
import { Department, Employee, EmployeeStatus, Position } from '../../core/models';
import { toIsoDate, parseIsoDate } from '../../core/date-util';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { DialogFormBase } from '../../shared/dialog-form.base';

const STATUSES: EmployeeStatus[] = ['ACTIVE', 'ON_LEAVE', 'TERMINATED'];

@Component({
  selector: 'app-employee-form',
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
    <h2 mat-dialog-title>{{ (isEdit ? 'emp.form.edit' : 'emp.form.add') | translate }}</h2>
    @if (saving()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
    <mat-dialog-content>
      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.code' | translate }}</mat-label>
          <input matInput formControlName="employeeCode" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.name' | translate }}</mat-label>
          <input matInput formControlName="fullName" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.dob' | translate }}</mat-label>
          <input matInput [matDatepicker]="dobPicker" [max]="today" formControlName="dob" />
          <mat-datepicker-toggle matIconSuffix [for]="dobPicker"></mat-datepicker-toggle>
          <mat-datepicker #dobPicker startView="multi-year"></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.gender' | translate }}</mat-label>
          <mat-select formControlName="gender">
            <mat-option value="MALE">{{ 'gender.MALE' | translate }}</mat-option>
            <mat-option value="FEMALE">{{ 'gender.FEMALE' | translate }}</mat-option>
            <mat-option value="OTHER">{{ 'gender.OTHER' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.nationalId' | translate }}</mat-label>
          <input matInput formControlName="nationalId" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.email' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.phone' | translate }}</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.hireDate' | translate }}</mat-label>
          <input matInput [matDatepicker]="hirePicker" formControlName="hireDate" />
          <mat-datepicker-toggle matIconSuffix [for]="hirePicker"></mat-datepicker-toggle>
          <mat-datepicker #hirePicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.department' | translate }}</mat-label>
          <mat-select formControlName="departmentId">
            <mat-option [value]="null">{{ 'common.none' | translate }}</mat-option>
            @for (d of departments(); track d.id) {
              <mat-option [value]="d.id">{{ d.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.position' | translate }}</mat-label>
          <mat-select formControlName="positionId">
            <mat-option [value]="null">{{ 'common.none' | translate }}</mat-option>
            @for (p of positions(); track p.id) {
              <mat-option [value]="p.id">{{ p.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'emp.f.status' | translate }}</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{ 'status.' + s | translate }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="sm:col-span-2">
          <mat-label>{{ 'emp.f.address' | translate }}</mat-label>
          <input matInput formControlName="address" />
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
        {{ 'common.save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class EmployeeFormComponent extends DialogFormBase implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private positionService = inject(PositionService);
  private data = inject<Employee | null>(MAT_DIALOG_DATA);

  isEdit = !!this.data;
  statuses = STATUSES;
  today = new Date();
  departments = signal<Department[]>([]);
  positions = signal<Position[]>([]);

  form = this.fb.nonNullable.group({
    employeeCode: ['', Validators.required],
    fullName: ['', Validators.required],
    dob: [null as Date | null],
    gender: [''],
    nationalId: [''],
    email: ['', Validators.email],
    phone: [''],
    address: [''],
    departmentId: [null as number | null],
    positionId: [null as number | null],
    hireDate: [null as Date | null],
    status: ['ACTIVE' as EmployeeStatus],
  });

  ngOnInit(): void {
    this.departmentService.list().subscribe((d) => this.departments.set(d));
    this.positionService.list().subscribe((p) => this.positions.set(p));
    if (this.data) {
      this.form.patchValue({
        employeeCode: this.data.employeeCode,
        fullName: this.data.fullName,
        dob: parseIsoDate(this.data.dob),
        gender: this.data.gender ?? '',
        nationalId: this.data.nationalId ?? '',
        email: this.data.email ?? '',
        phone: this.data.phone ?? '',
        address: this.data.address ?? '',
        departmentId: this.data.departmentId ?? null,
        positionId: this.data.positionId ?? null,
        hireDate: parseIsoDate(this.data.hireDate),
        status: this.data.status,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const { dob, hireDate, ...rest } = this.form.getRawValue();
    const payload: Partial<Employee> = {
      ...rest,
      dob: dob ? toIsoDate(dob) : undefined,
      hireDate: hireDate ? toIsoDate(hireDate) : undefined,
      gender: rest.gender || undefined,
      departmentId: rest.departmentId ?? undefined,
      positionId: rest.positionId ?? undefined,
    };
    this.submit(
      this.isEdit
        ? this.employeeService.update(this.data!.id, payload)
        : this.employeeService.create(payload),
    );
  }
}
