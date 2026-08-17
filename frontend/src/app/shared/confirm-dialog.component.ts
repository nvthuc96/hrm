import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '../core/i18n/translate.pipe';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  color?: 'primary' | 'warn';
  /** When set, shows a text input. The dialog then closes with the entered
   *  string (or false on cancel) instead of a boolean. */
  prompt?: {
    label: string;
    placeholder?: string;
    required?: boolean;
  };
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="m-0 mb-3 text-[var(--ink-soft)]">{{ data.message }}</p>
      @if (data.prompt) {
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ data.prompt.label }}</mat-label>
          <textarea
            matInput
            rows="3"
            [placeholder]="data.prompt.placeholder ?? ''"
            [(ngModel)]="text"
            (ngModelChange)="value.set($event)"
          ></textarea>
        </mat-form-field>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ 'common.cancel' | translate }}</button>
      <button
        mat-flat-button
        [color]="data.color ?? 'primary'"
        [disabled]="data.prompt?.required && !value().trim()"
        (click)="confirm()"
      >
        {{ data.confirmText ?? ('common.confirm' | translate) }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef<ConfirmDialogComponent>);

  text = '';
  value = signal('');

  confirm(): void {
    this.ref.close(this.data.prompt ? this.value().trim() : true);
  }
}
