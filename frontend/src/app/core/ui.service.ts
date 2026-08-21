import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { I18nService } from './i18n/i18n.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

/** Shared dialog + snackbar UX used by every list screen, so the
 *  confirm-delete and save-then-reload flows live in one place. */
@Injectable({ providedIn: 'root' })
export class UiService {
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private i18n = inject(I18nService);

  /** Success/info toast with a translated message. */
  toast(key: string, params?: Record<string, string | number>): void {
    this.snack.open(this.i18n.t(key, params), this.i18n.t('common.ok'), { duration: 2500 });
  }

  /** Error toast: prefers the server message, falls back to a translated key. */
  error(err: unknown, fallbackKey = 'common.saveFailed'): void {
    const msg = (err as { error?: { message?: string } })?.error?.message ?? this.i18n.t(fallbackKey);
    this.snack.open(msg, this.i18n.t('common.ok'), { duration: 3000 });
  }

  /** Confirm, then run the delete request, toast the result and reload. */
  confirmDelete(opts: {
    titleKey: string;
    messageKey: string;
    messageParams?: Record<string, string | number>;
    delete$: Observable<unknown>;
    successKey: string;
    onDone: () => void;
  }): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.i18n.t(opts.titleKey),
        message: this.i18n.t(opts.messageKey, opts.messageParams),
        confirmText: this.i18n.t('common.delete'),
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      opts.delete$.subscribe({
        next: () => {
          this.toast(opts.successKey);
          opts.onDone();
        },
        error: (err) => this.error(err, 'common.deleteFailed'),
      });
    });
  }

  /** When a form dialog closes with `true`, toast added/updated and reload. */
  afterSaved(
    ref: MatDialogRef<unknown, boolean>,
    isNew: boolean,
    addedKey: string,
    updatedKey: string,
    onDone: () => void,
  ): void {
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.toast(isNew ? addedKey : updatedKey);
        onDone();
      }
    });
  }
}
