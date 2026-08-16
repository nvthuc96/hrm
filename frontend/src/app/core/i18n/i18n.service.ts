import { Injectable, signal } from '@angular/core';
import { TRANSLATIONS } from './translations';

export type Lang = 'vi' | 'en';
const KEY = 'hrm_lang';

/**
 * Lightweight runtime i18n. Language is a signal so templates re-render the
 * moment it changes (via the impure TranslatePipe). Vietnamese is the default
 * and also the fallback for any key missing an English entry.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.initial());

  constructor() {
    this.apply(this.lang());
  }

  toggle(): void {
    this.set(this.lang() === 'vi' ? 'en' : 'vi');
  }

  set(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem(KEY, lang);
    this.apply(lang);
  }

  /** Translate a key with optional {name} interpolation params. */
  t(key: string, params?: Record<string, string | number>): string {
    const dict = TRANSLATIONS[this.lang()] ?? {};
    let out = dict[key] ?? TRANSLATIONS.vi[key] ?? key;
    if (params) {
      for (const p of Object.keys(params)) {
        out = out.replace(new RegExp(`\\{${p}\\}`, 'g'), String(params[p]));
      }
    }
    return out;
  }

  private apply(lang: Lang): void {
    document.documentElement.lang = lang;
  }

  private initial(): Lang {
    const saved = localStorage.getItem(KEY);
    return saved === 'en' ? 'en' : 'vi';
  }
}
