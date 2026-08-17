import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { NotificationService } from '../../core/notification.service';
import { AppNotification } from '../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    TranslatePipe,
  ],
  template: `
    <header
      class="h-16 px-3 sm:px-6 flex items-center justify-between backdrop-blur border-b border-[var(--line)] sticky top-0 z-30"
      style="background: color-mix(in srgb, var(--surface) 82%, transparent)"
    >
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        @if (isMobile()) {
          <button mat-icon-button (click)="drawer.toggle()" aria-label="Menu">
            <mat-icon>menu</mat-icon>
          </button>
        }
        <span
          class="grid place-items-center w-9 h-9 rounded-xl text-white shadow-md shrink-0"
          style="background: var(--brand-gradient)"
        >
          <mat-icon class="!text-[20px] !w-5 !h-5">groups</mat-icon>
        </span>
        <div class="leading-tight min-w-0">
          <div class="font-bold tracking-tight text-[var(--ink)] truncate">
            {{ 'app.name' | translate }}
          </div>
          <div class="text-[11px] text-[var(--muted)] -mt-0.5 truncate">
            {{ 'app.tagline' | translate }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          type="button"
          class="lang-trigger"
          [matMenuTriggerFor]="langMenu"
          [attr.aria-label]="'lang.label' | translate"
          [matTooltip]="'lang.switchTo' | translate"
        >
          <span class="lang-flag">{{ i18n.lang() === 'vi' ? '🇻🇳' : '🇬🇧' }}</span>
          <span>{{ i18n.lang() === 'vi' ? 'VI' : 'EN' }}</span>
          <mat-icon class="lang-caret">arrow_drop_down</mat-icon>
        </button>
        <mat-menu #langMenu="matMenu" class="lang-menu">
          <button
            mat-menu-item
            (click)="i18n.set('vi')"
            [class.lang-item-on]="i18n.lang() === 'vi'"
          >
            <span class="lang-flag">🇻🇳</span>
            <span class="lang-name">Tiếng Việt</span>
          </button>
          <button
            mat-menu-item
            (click)="i18n.set('en')"
            [class.lang-item-on]="i18n.lang() === 'en'"
          >
            <span class="lang-flag">🇬🇧</span>
            <span class="lang-name">English</span>
          </button>
        </mat-menu>
        <button
          mat-icon-button
          [matMenuTriggerFor]="notifMenu"
          (menuOpened)="notif.refresh()"
          [attr.aria-label]="'notif.title' | translate"
          [matTooltip]="'notif.title' | translate"
        >
          <mat-icon
            [matBadge]="notif.unread()"
            [matBadgeHidden]="notif.unread() === 0"
            matBadgeColor="warn"
            matBadgeSize="small"
            >notifications</mat-icon
          >
        </button>
        <mat-menu #notifMenu="matMenu" class="notif-menu">
          <div class="flex items-center justify-between px-3 py-2 border-b border-[var(--line)]">
            <span class="font-semibold text-[var(--ink)]">{{ 'notif.title' | translate }}</span>
            @if (notif.unread() > 0) {
              <button
                mat-button
                class="!min-w-0 !px-2 !text-xs"
                (click)="notif.markAllRead(); $event.stopPropagation()"
              >
                {{ 'notif.markAllRead' | translate }}
              </button>
            }
          </div>
          @if (notif.items().length === 0) {
            <p class="text-center text-[var(--muted)] text-sm py-6 px-4 m-0">
              {{ 'notif.empty' | translate }}
            </p>
          } @else {
            <div class="max-h-96 overflow-y-auto w-full">
              @for (n of notif.items(); track n.id) {
                <button
                  mat-menu-item
                  class="!h-auto !py-2 !leading-normal"
                  (click)="onNotifClick(n)"
                >
                  <div class="flex items-start gap-2 whitespace-normal">
                    @if (!n.read) {
                      <span class="mt-1.5 w-2 h-2 rounded-full bg-[var(--brand)] shrink-0"></span>
                    } @else {
                      <span class="mt-1.5 w-2 h-2 shrink-0"></span>
                    }
                    <span class="min-w-0">
                      <span
                        class="block text-sm font-medium text-[var(--ink)]"
                        [class.!font-normal]="n.read"
                        >{{ n.title }}</span
                      >
                      @if (n.message) {
                        <span class="block text-xs text-[var(--muted)]">{{ n.message }}</span>
                      }
                      <span class="block text-[11px] text-[var(--muted)] mt-0.5">{{
                        timeAgo(n.createdAt)
                      }}</span>
                    </span>
                  </div>
                </button>
              }
            </div>
          }
        </mat-menu>

        <button
          mat-icon-button
          (click)="theme.toggle()"
          [attr.aria-label]="
            (theme.theme() === 'dark' ? 'shell.themeLight' : 'shell.themeDark') | translate
          "
          [matTooltip]="
            (theme.theme() === 'dark' ? 'shell.themeLight' : 'shell.themeDark') | translate
          "
        >
          <mat-icon>{{ theme.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <button
          type="button"
          class="profile-trigger"
          [matMenuTriggerFor]="profileMenu"
          [attr.aria-label]="auth.currentUser()?.username || ''"
        >
          <span class="profile-avatar" style="background: var(--brand-gradient)">{{
            initials()
          }}</span>
          <span
            class="hidden sm:block max-w-[140px] truncate text-sm font-medium text-[var(--ink-soft)]"
          >
            {{ auth.currentUser()?.username }}
          </span>
          <mat-icon class="lang-caret hidden sm:block">arrow_drop_down</mat-icon>
        </button>
        <mat-menu #profileMenu="matMenu" class="profile-menu">
          <button mat-menu-item routerLink="/my-profile">
            <mat-icon>account_circle</mat-icon>
            <span>{{ 'nav.myProfile' | translate }}</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>{{ 'shell.logout' | translate }}</span>
          </button>
        </mat-menu>
      </div>
    </header>

    <mat-sidenav-container class="h-[calc(100vh-64px)] !bg-transparent">
      <mat-sidenav
        #drawer
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        [fixedInViewport]="isMobile()"
        [fixedTopGap]="64"
        class="w-64 !border-r-0 px-3 py-4"
        [style.background]="isMobile() ? 'var(--surface)' : 'transparent'"
      >
        <p class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          {{ 'nav.section.personal' | translate }}
        </p>
        <nav class="flex flex-col gap-1 mb-4">
          @for (item of personalNav; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="nav-active"
              (click)="onNavClick(drawer)"
              class="group no-underline flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface)] hover:shadow-sm"
            >
              <mat-icon
                class="!text-[20px] !w-5 !h-5 text-[var(--muted)] group-hover:text-[var(--brand)]"
              >
                {{ item.icon }}
              </mat-icon>
              <span>{{ item.label | translate }}</span>
            </a>
          }
        </nav>

        <p class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          {{ 'nav.section.admin' | translate }}
        </p>
        <nav class="flex flex-col gap-1">
          @for (item of visibleNav(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="nav-active"
              (click)="onNavClick(drawer)"
              class="group no-underline flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface)] hover:shadow-sm"
            >
              <mat-icon
                class="!text-[20px] !w-5 !h-5 text-[var(--muted)] group-hover:text-[var(--brand)]"
              >
                {{ item.icon }}
              </mat-icon>
              <span>{{ item.label | translate }}</span>
            </a>
          }
        </nav>
      </mat-sidenav>

      <mat-sidenav-content class="!bg-transparent p-4 sm:p-6 lg:p-8">
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .nav-active {
        background: var(--brand-gradient);
        color: #fff !important;
        box-shadow: 0 10px 20px -12px rgba(79, 70, 229, 0.8);
      }
      .nav-active mat-icon {
        color: #fff !important;
      }

      .lang-trigger {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 6px 6px 12px;
        border-radius: 9999px;
        border: 1px solid var(--line);
        background: color-mix(in srgb, var(--surface) 70%, transparent);
        color: var(--ink-soft);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        line-height: 1;
        cursor: pointer;
        transition:
          color 0.18s ease,
          background 0.18s ease,
          box-shadow 0.18s ease;
      }
      .lang-trigger:hover {
        color: var(--ink);
        background: var(--brand-50);
        box-shadow: 0 8px 16px -12px rgba(79, 70, 229, 0.8);
      }
      .lang-caret {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-left: -3px;
        color: var(--muted);
      }
      .profile-trigger {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 6px 4px 4px;
        border-radius: 9999px;
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        transition:
          background 0.18s ease,
          border-color 0.18s ease;
      }
      .profile-trigger:hover {
        background: var(--brand-50);
        border-color: var(--line);
      }
      .profile-avatar {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .lang-flag {
        font-size: 14px;
        line-height: 1;
      }
      .lang-name {
        margin-left: 8px;
      }
      .lang-item-on .lang-name {
        color: var(--brand);
        font-weight: 600;
      }
      @media (max-width: 640px) {
        .lang-trigger {
          padding: 6px 4px 6px 8px;
        }
      }
    `,
  ],
})
export class ShellComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  i18n = inject(I18nService);
  notif = inject(NotificationService);
  private router = inject(Router);
  private breakpoints = inject(BreakpointObserver);
  private pollId?: ReturnType<typeof setInterval>;

  isMobile = toSignal(
    this.breakpoints
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  personalNav: NavItem[] = [
    { label: 'nav.myAttendance', icon: 'event_note', route: '/my-attendance' },
    { label: 'nav.myLeaves', icon: 'beach_access', route: '/my-leaves' },
  ];

  nav: NavItem[] = [
    { label: 'nav.dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'nav.employees', icon: 'people', route: '/employees' },
    { label: 'nav.departments', icon: 'apartment', route: '/departments' },
    { label: 'nav.positions', icon: 'badge', route: '/positions' },
    { label: 'nav.attendance', icon: 'schedule', route: '/attendance' },
    { label: 'nav.leaves', icon: 'event_available', route: '/leaves' },
    { label: 'nav.leaveTypes', icon: 'category', route: '/leave-types' },
    { label: 'nav.payroll', icon: 'payments', route: '/payroll' },
    { label: 'nav.salaryComponents', icon: 'request_quote', route: '/salary-components' },
    { label: 'nav.users', icon: 'manage_accounts', route: '/users', adminOnly: true },
  ];

  private isAdmin = computed(() =>
    (this.auth.currentUser()?.roles ?? []).some((r) => r.replace(/^ROLE_/, '') === 'ADMIN'),
  );

  visibleNav = computed(() => this.nav.filter((i) => !i.adminOnly || this.isAdmin()));

  ngOnInit(): void {
    this.notif.refreshCount();
    // Light polling so the badge stays roughly current without a websocket.
    this.pollId = setInterval(() => this.notif.refreshCount(), 45_000);
  }

  ngOnDestroy(): void {
    if (this.pollId) clearInterval(this.pollId);
  }

  onNotifClick(n: AppNotification): void {
    this.notif.markRead(n.id);
    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  timeAgo(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const s = Math.floor((Date.now() - then) / 1000);
    if (s < 60) return this.i18n.t('notif.justNow');
    const m = Math.floor(s / 60);
    if (m < 60) return this.i18n.t('notif.minutesAgo', { n: m });
    const h = Math.floor(m / 60);
    if (h < 24) return this.i18n.t('notif.hoursAgo', { n: h });
    const d = Math.floor(h / 24);
    if (d < 7) return this.i18n.t('notif.daysAgo', { n: d });
    return new Date(iso).toLocaleDateString(this.i18n.lang() === 'vi' ? 'vi-VN' : 'en-US');
  }

  onNavClick(drawer: { close: () => void }): void {
    if (this.isMobile()) {
      drawer.close();
    }
  }

  initials(): string {
    const name = this.auth.currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase() || '?';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
