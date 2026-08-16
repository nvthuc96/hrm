import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserService } from '../../core/user.service';
import { Employee, Role, User } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

export interface UserFormData {
  user: User | null;
  roles: Role[];
  employees: Employee[];
}

@Component({
  selector: 'app-user-form',
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
    <h2 mat-dialog-title>{{ (isEdit ? 'user.form.edit' : 'user.form.add') | translate }}</h2>
    @if (saving()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
    <mat-dialog-content>
      <form [formGroup]="form" class="grid grid-cols-1 gap-x-4 pt-2 min-w-[420px]">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'user.f.username' | translate }}</mat-label>
          <input matInput formControlName="username" autocomplete="off" />
        </mat-form-field>

        @if (!isEdit) {
          <mat-form-field appearance="outline">
            <mat-label>{{ 'user.f.password' | translate }}</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password" />
            @if (form.controls.password.hasError('minlength')) {
              <mat-error>{{ 'user.f.pwMinErr' | translate }}</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline">
          <mat-label>{{ 'user.f.roles' | translate }}</mat-label>
          <mat-select formControlName="roles" multiple>
            @for (r of data.roles; track r.id) {
              <mat-option [value]="r.name">{{ label(r.name) }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'user.f.employee' | translate }}</mat-label>
          <mat-select formControlName="employeeId">
            <mat-option [value]="null">{{ 'common.none' | translate }}</mat-option>
            @for (e of data.employees; track e.id) {
              <mat-option [value]="e.id">{{ e.fullName }} ({{ e.employeeCode }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-slide-toggle formControlName="enabled" class="mb-2">
          {{ 'user.f.enabled' | translate }}
        </mat-slide-toggle>
      </form>
      @if (error()) {
        <p class="text-red-600 text-sm">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || saving()" (click)="save()">
        {{ 'common.save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(UserService);
  private i18n = inject(I18nService);
  ref = inject(MatDialogRef<UserFormComponent>);
  data = inject<UserFormData>(MAT_DIALOG_DATA);

  isEdit = !!this.data.user;
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: [{ value: this.data.user?.username ?? '', disabled: this.isEdit }, Validators.required],
    password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
    roles: [this.data.user?.roles ?? [], Validators.required],
    employeeId: [this.data.user?.employeeId ?? (null as number | null)],
    enabled: [this.data.user?.enabled ?? true],
  });

  label = (name: string) => this.i18n.t('role.' + name.replace(/^ROLE_/, ''));

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const raw = this.form.getRawValue();

    const req$ = this.isEdit
      ? this.service.update(this.data.user!.id, {
          roles: raw.roles,
          employeeId: raw.employeeId ?? null,
          enabled: raw.enabled,
        })
      : this.service.create({
          username: raw.username,
          password: raw.password,
          roles: raw.roles,
          employeeId: raw.employeeId ?? null,
          enabled: raw.enabled,
        });

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.ref.close(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? this.i18n.t('common.saveFailed'));
      },
    });
  }
}
