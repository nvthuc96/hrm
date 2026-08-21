import { Directive, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { I18nService } from '../core/i18n/i18n.service';

/** Base for create/edit dialog forms: owns the `saving`/`error` state and the
 *  standard submit flow (toggle spinner, close on success, show error). A
 *  subclass builds the create/update request and calls `submit(req$)`. */
@Directive()
export abstract class DialogFormBase {
  protected i18n = inject(I18nService);
  readonly ref = inject<MatDialogRef<unknown, boolean>>(MatDialogRef);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  /** Run the request, close with `true` on success, surface the error otherwise. */
  protected submit(req$: Observable<unknown>, fallbackKey = 'common.saveFailed'): void {
    this.saving.set(true);
    this.error.set(null);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.ref.close(true);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        const msg = (err as { error?: { message?: string } })?.error?.message;
        this.error.set(msg ?? this.i18n.t(fallbackKey));
      },
    });
  }
}
