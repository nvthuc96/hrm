import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    TranslatePipe,
  ],
  template: `
    <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <!-- Brand side -->
      <div
        class="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style="background: var(--brand-gradient)"
      >
        <div
          class="absolute inset-0 opacity-30"
          style="background: radial-gradient(600px 300px at 80% 10%, rgba(255,255,255,.4), transparent 60%), radial-gradient(500px 300px at 10% 90%, rgba(255,255,255,.25), transparent 55%)"
        ></div>
        <div class="relative flex items-center gap-3">
          <span class="grid place-items-center w-11 h-11 rounded-2xl bg-white/20 backdrop-blur">
            <mat-icon class="!text-[24px] !w-6 !h-6">groups</mat-icon>
          </span>
          <span class="text-xl font-bold tracking-tight">HRM</span>
        </div>
        <div class="relative">
          <h1 class="text-4xl font-bold leading-tight tracking-tight" style="white-space: pre-line">
            {{ 'login.heroTitle' | translate }}
          </h1>
          <p class="mt-4 text-white/80 max-w-sm">
            {{ 'login.heroSub' | translate }}
          </p>
        </div>
        <div class="relative text-sm text-white/60">{{ 'login.copyright' | translate }}</div>
      </div>

      <!-- Form side -->
      <div class="relative flex items-center justify-center p-4 sm:p-6 min-w-0">
        <button
          type="button"
          (click)="i18n.toggle()"
          class="absolute top-4 right-4 text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)] px-2 py-1 rounded-lg"
        >
          {{ i18n.lang() === 'vi' ? 'EN' : 'VI' }}
        </button>
        <mat-card class="w-full max-w-sm min-w-0 !shadow-none !border-0 lg:!shadow-md lg:!border">
          @if (loading()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }
          <mat-card-content class="!p-6 sm:!p-8">
            <div class="lg:hidden flex items-center gap-3 mb-6">
              <span
                class="grid place-items-center w-10 h-10 rounded-xl text-white"
                style="background: var(--brand-gradient)"
              >
                <mat-icon class="!text-[22px] !w-[22px] !h-[22px]">groups</mat-icon>
              </span>
              <span class="text-lg font-bold">HRM</span>
            </div>

            <h2 class="text-2xl font-bold tracking-tight m-0">{{ 'login.welcome' | translate }}</h2>
            <p class="text-sm text-[var(--muted)] mt-1 mb-6">{{ 'login.subtitle' | translate }}</p>

            <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-2">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'login.username' | translate }}</mat-label>
                <input matInput formControlName="username" autocomplete="username" />
                <mat-icon matPrefix class="!text-[var(--muted)] mr-1">person</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'login.password' | translate }}</mat-label>
                <input
                  matInput
                  type="password"
                  formControlName="password"
                  autocomplete="current-password"
                />
                <mat-icon matPrefix class="!text-[var(--muted)] mr-1">lock</mat-icon>
              </mat-form-field>
              @if (error()) {
                <p class="flex items-center gap-1.5 text-red-600 text-sm m-0">
                  <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">error_outline</mat-icon>
                  {{ error() }}
                </p>
              }
              <button
                mat-flat-button
                color="primary"
                type="submit"
                class="!h-11 !mt-1"
                [disabled]="form.invalid || loading()"
              >
                {{ 'login.submit' | translate }}
              </button>
              <p class="text-xs text-[var(--muted)] text-center mt-3 mb-0">
                {{ 'login.defaultHint' | translate }}
                <span class="font-medium">admin / admin123</span>
              </p>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  i18n = inject(I18nService);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: ['admin', Validators.required],
    password: ['admin123', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(this.i18n.t('login.error'));
      },
    });
  }
}
