import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LeaveService } from '../../core/leave.service';
import { LeaveType } from '../../core/models';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { DialogFormBase } from '../../shared/dialog-form.base';

@Component({
  selector: 'app-leave-type-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ (isEdit ? 'ltype.form.edit' : 'ltype.form.add') | translate }}</h2>
    @if (saving()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-x-4 pt-2 min-w-[360px]">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'ltype.f.name' | translate }}</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'ltype.f.max' | translate }}</mat-label>
          <input matInput type="number" formControlName="maxDaysPerYear" />
        </mat-form-field>

        <mat-slide-toggle formControlName="paid" class="mb-2">{{
          'ltype.f.paid' | translate
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
export class LeaveTypeFormComponent extends DialogFormBase implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(LeaveService);
  private data = inject<LeaveType | null>(MAT_DIALOG_DATA);

  isEdit = !!this.data;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    maxDaysPerYear: [0, [Validators.required, Validators.min(0)]],
    paid: [true],
  });

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        maxDaysPerYear: this.data.maxDaysPerYear,
        paid: this.data.paid,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    this.submit(
      this.isEdit
        ? this.service.updateType(this.data!.id, payload)
        : this.service.createType(payload),
    );
  }
}
