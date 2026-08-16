import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MeService } from '../../core/me.service';
import { LeaveBalance, MeProfile } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressBarModule, TranslatePipe],
  template: `
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ 'me.profile.title' | translate }}</h1>
        <p class="page-sub">{{ 'me.profile.sub' | translate }}</p>
      </div>
    </div>

    @if (loading()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    @if (error(); as e) {
      <div class="surface p-6 text-center text-[var(--muted)]">
        <mat-icon class="!w-10 !h-10 !text-[40px] text-[var(--muted)] mb-2">badge</mat-icon>
        <p class="m-0">{{ e }}</p>
      </div>
    }

    @if (profile()?.employee; as emp) {
      <div class="surface p-5 mb-5">
        <div class="flex items-center gap-4 mb-5">
          <span class="grid place-items-center w-14 h-14 rounded-2xl text-white text-lg font-semibold shrink-0"
            style="background: var(--brand-gradient)">{{ initials() }}</span>
          <div class="min-w-0">
            <div class="text-xl font-bold text-[var(--ink)] truncate">{{ emp.fullName }}</div>
            <div class="text-sm text-[var(--muted)]">
              {{ emp.employeeCode }} · {{ 'status.' + emp.status | translate }}
            </div>
            <div class="text-xs text-[var(--muted)] mt-0.5">{{ rolesText() }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <div><div class="text-xs text-[var(--muted)]">{{ 'me.profile.dept' | translate }}</div>
            <div class="text-[var(--ink-soft)]">{{ emp.departmentName || '—' }}</div></div>
          <div><div class="text-xs text-[var(--muted)]">{{ 'me.profile.position' | translate }}</div>
            <div class="text-[var(--ink-soft)]">{{ emp.positionName || '—' }}</div></div>
          <div><div class="text-xs text-[var(--muted)]">{{ 'me.profile.hireDate' | translate }}</div>
            <div class="text-[var(--ink-soft)]">{{ emp.hireDate || '—' }}</div></div>
          <div><div class="text-xs text-[var(--muted)]">{{ 'me.profile.email' | translate }}</div>
            <div class="text-[var(--ink-soft)] break-all">{{ emp.email || '—' }}</div></div>
          <div><div class="text-xs text-[var(--muted)]">{{ 'me.profile.phone' | translate }}</div>
            <div class="text-[var(--ink-soft)]">{{ emp.phone || '—' }}</div></div>
          <div><div class="text-xs text-[var(--muted)]">{{ 'me.profile.dob' | translate }}</div>
            <div class="text-[var(--ink-soft)]">{{ emp.dob || '—' }}</div></div>
          <div><div class="text-xs text-[var(--muted)]">{{ 'me.profile.gender' | translate }}</div>
            <div class="text-[var(--ink-soft)]">{{ genderLabel(emp.gender) }}</div></div>
          <div class="sm:col-span-2"><div class="text-xs text-[var(--muted)]">{{ 'me.profile.address' | translate }}</div>
            <div class="text-[var(--ink-soft)]">{{ emp.address || '—' }}</div></div>
        </div>
      </div>

      <h2 class="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
        {{ 'me.profile.balYear' | translate:{ year: year } }}
      </h2>
      @if (balances().length) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (b of balances(); track b.leaveTypeId) {
            <mat-card class="p-3">
              <div class="text-xs text-[var(--muted)]">{{ b.leaveTypeName }}</div>
              <div class="text-2xl font-medium">{{ b.remaining }}<span
                class="text-sm text-[var(--muted)]">/{{ b.entitled }}</span></div>
              <div class="text-xs text-[var(--muted)]">{{ 'leave.balUsed' | translate:{ n: b.used } }}</div>
            </mat-card>
          }
        </div>
      } @else {
        <p class="text-[var(--muted)] text-sm m-0">{{ 'me.profile.noBalance' | translate }}</p>
      }
    }
  `,
})
export class MyProfileComponent implements OnInit {
  private me = inject(MeService);
  private i18n = inject(I18nService);

  profile = signal<MeProfile | null>(null);
  balances = signal<LeaveBalance[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  year = new Date().getFullYear();

  initials = computed(() => {
    const n = this.profile()?.employee?.fullName ?? '';
    const parts = n.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase() || '?';
  });

  rolesText = computed(() =>
    (this.profile()?.roles ?? []).map((r) => this.i18n.t('role.' + r.replace(/^ROLE_/, ''))).join(', '),
  );

  ngOnInit(): void {
    this.me.profile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.loading.set(false);
        if (!p.employee) {
          this.error.set(this.i18n.t('me.profile.notLinked'));
          return;
        }
        this.me.leaveBalances(this.year).subscribe((b) => this.balances.set(b));
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? this.i18n.t('me.profile.loadError'));
      },
    });
  }

  genderLabel(g?: string): string {
    return g ? this.i18n.t('gender.' + g) : '—';
  }
}
