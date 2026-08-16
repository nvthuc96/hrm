import { Injectable, effect, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { I18nService } from './i18n.service';

/**
 * Language-aware mat-paginator labels. Re-applies translations and notifies
 * open paginators whenever the active language changes.
 */
@Injectable()
export class I18nPaginatorIntl extends MatPaginatorIntl {
  private i18n = inject(I18nService);

  constructor() {
    super();
    effect(() => {
      // Read the signal so this effect re-runs on language change.
      this.i18n.lang();
      this.apply();
    });
  }

  private apply(): void {
    const t = (k: string) => this.i18n.t(k);
    this.itemsPerPageLabel = t('pag.itemsPerPage');
    this.nextPageLabel = t('pag.nextPage');
    this.previousPageLabel = t('pag.prevPage');
    this.firstPageLabel = t('pag.firstPage');
    this.lastPageLabel = t('pag.lastPage');
    this.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      const of = this.i18n.t('pag.of');
      if (length === 0 || pageSize === 0) {
        return `0 ${of} ${length}`;
      }
      const start = page * pageSize;
      const end = Math.min(start + pageSize, length);
      return `${start + 1}–${end} ${of} ${length}`;
    };
    this.changes.next();
  }
}
