import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 text-center">
      <div class="max-w-md w-full">
        <div
          class="mx-auto mb-8 grid place-items-center w-20 h-20 rounded-3xl text-white shadow-lg"
          style="background: var(--brand-gradient)"
        >
          <mat-icon class="!text-[40px] !w-10 !h-10">travel_explore</mat-icon>
        </div>

        <h1
          class="font-extrabold leading-none tracking-tighter m-0 text-transparent bg-clip-text"
          style="font-size: clamp(5rem, 22vw, 9rem); background-image: var(--brand-gradient); -webkit-background-clip: text; background-clip: text;"
        >
          404
        </h1>

        <h2 class="text-xl sm:text-2xl font-bold tracking-tight mt-2 mb-2 text-[var(--ink)]">
          {{ 'notFound.title' | translate }}
        </h2>
        <p class="text-[var(--muted)] mb-8">
          {{ 'notFound.desc' | translate }}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button mat-flat-button color="primary" class="!h-11 w-full sm:w-auto" [routerLink]="home">
            <mat-icon>home</mat-icon> {{ 'notFound.home' | translate }}
          </button>
          <button mat-stroked-button class="!h-11 w-full sm:w-auto" (click)="back()">
            <mat-icon>arrow_back</mat-icon> {{ 'notFound.back' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  get home(): string {
    return this.auth.isLoggedIn ? '/employees' : '/login';
  }

  back(): void {
    if (history.length > 1) {
      history.back();
    } else {
      this.router.navigateByUrl(this.home);
    }
  }
}
