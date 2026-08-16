import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * Impure pipe that formats numbers according to the active language:
 *  - VI → thousands separated by "." (vi-VN), e.g. 1.234.567
 *  - EN → thousands separated by "," (en-US), e.g. 1,234,567
 * Reading the `lang` signal registers the dependency so switching language
 * reformats every number on the next change-detection pass.
 * Usage: {{ value | localeNumber }} or {{ value | localeNumber:2 }} (max decimals)
 */
@Pipe({ name: 'localeNumber', standalone: true, pure: false })
export class LocaleNumberPipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(value: number | string | null | undefined, maxFractionDigits = 0): string {
    if (value === null || value === undefined || value === '') return '';
    const n = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(n)) return '';
    const locale = this.i18n.lang() === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFractionDigits,
    }).format(n);
  }
}
