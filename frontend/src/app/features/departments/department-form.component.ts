import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DepartmentService } from '../../core/department.service';
import { Department } from '../../core/models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { DialogFormBase } from '../../shared/dialog-form.base';

export interface DepartmentFormData {
  department: Department | null;
  all: Department[];
}

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ (isEdit ? 'dept.form.edit' : 'dept.form.add') | translate }}</h2>
    @if (saving()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-x-4 pt-2 min-w-[360px]">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'dept.f.name' | translate }}</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'dept.f.parent' | translate }}</mat-label>
          <mat-select formControlName="parentId">
            <mat-option [value]="null">{{ 'common.none' | translate }}</mat-option>
            @for (d of parentOptions; track d.id) {
              <mat-option [value]="d.id">{{ d.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'dept.f.manager' | translate }}</mat-label>
          <input matInput type="number" formControlName="managerId" />
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
export class DepartmentFormComponent extends DialogFormBase implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DepartmentService);
  private data = inject<DepartmentFormData>(MAT_DIALOG_DATA);

  isEdit = !!this.data.department;
  parentOptions: Department[] = [];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    parentId: [null as number | null],
    managerId: [null as number | null],
  });

  ngOnInit(): void {
    const current = this.data.department;
    // Exclude self from parent options to avoid a cycle.
    this.parentOptions = this.data.all.filter((d) => d.id !== current?.id);
    if (current) {
      this.form.patchValue({
        name: current.name,
        parentId: current.parentId ?? null,
        managerId: current.managerId ?? null,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload: Partial<Department> = {
      name: raw.name,
      parentId: raw.parentId ?? undefined,
      managerId: raw.managerId ?? undefined,
    };
    this.submit(
      this.isEdit
        ? this.service.update(this.data.department!.id, payload)
        : this.service.create(payload),
    );
  }
}
