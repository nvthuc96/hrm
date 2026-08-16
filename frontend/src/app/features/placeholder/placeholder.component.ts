import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center text-[var(--muted)] py-20">
      <mat-icon class="!w-16 !h-16 !text-6xl">construction</mat-icon>
      <p class="mt-4 text-lg">{{ i18n.t('placeholder.text', { title: title }) }}</p>
    </div>
  `,
})
export class PlaceholderComponent {
  i18n = inject(I18nService);
  @Input() title = this.i18n.t('placeholder.default');
}
