import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';
import { I18nService } from './core/i18n/i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  // Instantiate ThemeService early so the saved/system theme applies at startup.
  private theme = inject(ThemeService);
  // Instantiate I18nService early so the saved language applies at startup.
  private i18n = inject(I18nService);
}
