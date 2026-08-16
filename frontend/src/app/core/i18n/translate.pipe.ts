import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * Impure pipe so it re-evaluates on every change-detection pass; reading the
 * `lang` signal registers the dependency so a language switch repaints all text.
 * Usage: {{ 'key' | translate }} or {{ 'key' | translate:{ name: x } }}
 */
@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    this.i18n.lang();
    return this.i18n.t(key, params);
  }
}
