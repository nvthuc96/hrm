import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartConfiguration, ChartData } from 'chart.js';
import { forkJoin } from 'rxjs';

// Register only the Chart.js pieces this dashboard uses, from within the lazy
// dashboard chunk — keeps chart.js out of the eager initial bundle.
Chart.register(BarController, BarElement, DoughnutController, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);
import { EmployeeService } from '../../core/employee.service';
import { DepartmentService } from '../../core/department.service';
import { PositionService } from '../../core/position.service';
import { LeaveService } from '../../core/leave.service';
import { ThemeService } from '../../core/theme.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Employee, LeaveRequest } from '../../core/models';

interface Kpi {
  label: string;
  value: number;
  icon: string;
  accent: string; // css color for the icon chip
  link?: string;
  queryParams?: Record<string, string>;
}
interface BarItem { label: string; value: number; }
interface StatusSlice { key: string; label: string; value: number; color: string; }

// Shared chart cosmetics tuned to the app's design tokens.
const CHART_FONT = 'Inter, Roboto, "Helvetica Neue", system-ui, sans-serif';

interface ChartPalette { ink: string; muted: string; grid: string; surface: string; }
const LIGHT_PALETTE: ChartPalette = { ink: '#334155', muted: '#64748b', grid: '#f1f5f9', surface: '#ffffff' };
const DARK_PALETTE: ChartPalette = { ink: '#c4cdda', muted: '#8b97a8', grid: 'rgba(148,163,184,0.16)', surface: '#161d27' };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatProgressBarModule, MatTooltipModule, BaseChartDirective, TranslatePipe],
  template: `
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ 'dash.title' | translate }}</h1>
        <p class="page-sub">{{ 'dash.sub' | translate }}</p>
      </div>
    </div>

    @if (loading()) {
      <mat-progress-bar mode="indeterminate" class="!rounded-full mb-4"></mat-progress-bar>
    }

    <!-- KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      @for (k of kpis(); track k.label) {
        <a
          [routerLink]="k.link"
          [queryParams]="k.queryParams"
          class="surface no-underline !p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform"
        >
          <span class="grid place-items-center w-12 h-12 rounded-2xl text-white shrink-0"
            [style.background]="k.accent">
            <mat-icon>{{ k.icon }}</mat-icon>
          </span>
          <div class="min-w-0">
            <div class="text-2xl font-bold leading-none text-[var(--ink)]">{{ k.value }}</div>
            <div class="text-sm text-[var(--muted)] mt-1 truncate">{{ k.label }}</div>
          </div>
        </a>
      }
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Employees by department -->
      <section class="surface !p-6 lg:col-span-2">
        <h2 class="text-base font-semibold m-0 mb-1 text-[var(--ink)]">{{ 'dash.byDept' | translate }}</h2>
        <p class="text-xs text-[var(--muted)] mb-3">{{ 'dash.byDept.sub' | translate }}</p>
        @if (byDepartment().length === 0) {
          <p class="text-sm text-[var(--muted)] py-6 text-center m-0">{{ 'common.noData' | translate }}</p>
        } @else {
          <div [style.height.px]="barHeight(byDepartment().length)">
            <canvas baseChart type="bar"
              [data]="deptChart()" [options]="barOptions()"></canvas>
          </div>
        }
      </section>

      <!-- Employees by status (donut) -->
      <section class="surface !p-6">
        <h2 class="text-base font-semibold m-0 mb-1 text-[var(--ink)]">{{ 'dash.byStatus' | translate }}</h2>
        <p class="text-xs text-[var(--muted)] mb-2">{{ 'dash.byStatus.sub' | translate }}</p>
        @if (totalEmployees() === 0) {
          <p class="text-sm text-[var(--muted)] py-6 text-center m-0">{{ 'common.noData' | translate }}</p>
        } @else {
          <div class="h-[260px]">
            <canvas baseChart type="doughnut"
              [data]="statusChart()" [options]="donutOptions()"></canvas>
          </div>
        }
      </section>

      <!-- By position -->
      <section class="surface !p-6">
        <h2 class="text-base font-semibold m-0 mb-1 text-[var(--ink)]">{{ 'dash.byPosition' | translate }}</h2>
        <p class="text-xs text-[var(--muted)] mb-3">{{ 'dash.byPosition.sub' | translate }}</p>
        @if (byPosition().length === 0) {
          <p class="text-sm text-[var(--muted)] py-6 text-center m-0">{{ 'common.noData' | translate }}</p>
        } @else {
          <div [style.height.px]="barHeight(byPosition().length)">
            <canvas baseChart type="bar"
              [data]="posChart()" [options]="barOptions()"></canvas>
          </div>
        }
      </section>

      <!-- Recent hires -->
      <section class="surface !p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-semibold m-0 text-[var(--ink)]">{{ 'dash.recent' | translate }}</h2>
            <p class="text-xs text-[var(--muted)] mt-1 mb-0">{{ 'dash.recent.sub' | translate }}</p>
          </div>
          <a routerLink="/employees" class="text-sm font-medium text-[var(--brand)] no-underline hover:underline">
            {{ 'dash.viewAll' | translate }}
          </a>
        </div>
        @if (recentHires().length === 0) {
          <p class="text-sm text-[var(--muted)] py-6 text-center m-0">{{ 'common.noData' | translate }}</p>
        } @else {
          <ul class="flex flex-col gap-1 m-0 p-0 list-none">
            @for (e of recentHires(); track e.id) {
              <li class="flex items-center gap-3 py-2 border-b border-[var(--line-soft)] last:border-0">
                <span class="grid place-items-center w-9 h-9 rounded-full text-white text-xs font-semibold shrink-0"
                  style="background: var(--brand-gradient)">{{ initials(e.fullName) }}</span>
                <div class="min-w-0">
                  <div class="text-sm font-medium text-[var(--ink)] truncate">{{ e.fullName }}</div>
                  <div class="text-xs text-[var(--muted)] truncate">
                    {{ e.positionName || '—' }} · {{ e.departmentName || '—' }}
                  </div>
                </div>
                <div class="ml-auto text-xs text-[var(--muted)] shrink-0">{{ e.hireDate || '' }}</div>
              </li>
            }
          </ul>
        }
      </section>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private employees = inject(EmployeeService);
  private departments = inject(DepartmentService);
  private positions = inject(PositionService);
  private leaves = inject(LeaveService);
  private i18n = inject(I18nService);

  loading = signal(true);
  private emps = signal<Employee[]>([]);
  private deptCount = signal(0);
  private posCount = signal(0);
  private leaveReqs = signal<LeaveRequest[]>([]);

  totalEmployees = computed(() => this.emps().length);
  private onLeaveCount = computed(() => this.emps().filter((e) => e.status === 'ON_LEAVE').length);
  private pendingLeaves = computed(() => this.leaveReqs().filter((l) => l.status === 'PENDING').length);

  kpis = computed<Kpi[]>(() => [
    { label: this.i18n.t('dash.kpi.totalEmployees'), value: this.totalEmployees(), icon: 'groups', accent: 'var(--brand-gradient)', link: '/employees' },
    { label: this.i18n.t('dash.kpi.departments'), value: this.deptCount(), icon: 'apartment', accent: 'linear-gradient(135deg,#0ea5e9,#2563eb)', link: '/departments' },
    { label: this.i18n.t('dash.kpi.onLeave'), value: this.onLeaveCount(), icon: 'beach_access', accent: 'linear-gradient(135deg,#f59e0b,#d97706)', link: '/employees' },
    { label: this.i18n.t('dash.kpi.pending'), value: this.pendingLeaves(), icon: 'pending_actions', accent: 'linear-gradient(135deg,#8b5cf6,#6366f1)', link: '/leaves', queryParams: { status: 'PENDING' } },
  ]);

  byDepartment = computed<BarItem[]>(() => this.groupBy((e) => e.departmentName));
  byPosition = computed<BarItem[]>(() => this.groupBy((e) => e.positionName));

  statusSlices = computed<StatusSlice[]>(() => {
    const defs: { key: Employee['status']; label: string; color: string }[] = [
      { key: 'ACTIVE', label: this.i18n.t('status.ACTIVE'), color: '#16a34a' },
      { key: 'ON_LEAVE', label: this.i18n.t('status.ON_LEAVE'), color: '#d97706' },
      { key: 'TERMINATED', label: this.i18n.t('status.TERMINATED'), color: '#64748b' },
    ];
    return defs.map((d) => ({ ...d, value: this.emps().filter((e) => e.status === d.key).length }));
  });

  private theme = inject(ThemeService);
  private palette = computed<ChartPalette>(() => (this.theme.theme() === 'dark' ? DARK_PALETTE : LIGHT_PALETTE));

  // --- Chart.js: options (theme-aware, recompute on light/dark toggle) -------
  barOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const p = this.palette();
    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 12 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          titleFont: { family: CHART_FONT },
          bodyFont: { family: CHART_FONT },
          callbacks: { label: (c) => ` ${this.i18n.t('dash.chart.employeesUnit', { n: c.parsed.x })}` },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0, color: p.muted, font: { family: CHART_FONT } },
          grid: { color: p.grid },
          border: { display: false },
        },
        y: {
          ticks: { color: p.ink, font: { family: CHART_FONT, size: 12 } },
          grid: { display: false },
          border: { display: false },
        },
      },
    };
  });

  donutOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => {
    const p = this.palette();
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '66%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: p.ink,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 14,
            font: { family: CHART_FONT, size: 13 },
          },
        },
        tooltip: {
          bodyFont: { family: CHART_FONT },
          callbacks: { label: (c) => ` ${c.label}: ${this.i18n.t('dash.chart.employeesUnit', { n: c.parsed })}` },
        },
      },
    };
  });

  barHeight(count: number): number {
    return Math.max(160, count * 42 + 40);
  }

  // --- Chart.js: per-section data builders ----------------------------------
  deptChart = computed<ChartData<'bar'>>(() => this.barData(this.byDepartment(), '#6366f1'));
  posChart = computed<ChartData<'bar'>>(() => this.barData(this.byPosition(), '#0ea5e9'));

  statusChart = computed<ChartData<'doughnut'>>(() => {
    const slices = this.statusSlices().filter((s) => s.value > 0);
    return {
      labels: slices.map((s) => s.label),
      datasets: [
        {
          data: slices.map((s) => s.value),
          backgroundColor: slices.map((s) => s.color),
          borderColor: this.palette().surface,
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  });

  private barData(items: BarItem[], color: string): ChartData<'bar'> {
    return {
      labels: items.map((i) => i.label),
      datasets: [
        {
          label: this.i18n.t('dash.chart.employees'),
          data: items.map((i) => i.value),
          backgroundColor: color,
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          maxBarThickness: 34,
        },
      ],
    };
  }

  recentHires = computed<Employee[]>(() =>
    [...this.emps()]
      .sort((a, b) => (b.hireDate ?? '').localeCompare(a.hireDate ?? ''))
      .slice(0, 5),
  );

  ngOnInit(): void {
    forkJoin({
      emps: this.employees.search('', 0, 500),
      depts: this.departments.list(),
      pos: this.positions.list(),
      leaves: this.leaves.search(),
    }).subscribe({
      next: ({ emps, depts, pos, leaves }) => {
        this.emps.set(emps.content);
        this.deptCount.set(depts.length);
        this.posCount.set(pos.length);
        this.leaveReqs.set(leaves);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private groupBy(key: (e: Employee) => string | undefined): BarItem[] {
    const map = new Map<string, number>();
    for (const e of this.emps()) {
      const k = key(e) || this.i18n.t('dash.unassigned');
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
  }
}
