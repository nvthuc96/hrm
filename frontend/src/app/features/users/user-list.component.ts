import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../core/user.service';
import { EmployeeService } from '../../core/employee.service';
import { Employee, Role, User } from '../../core/models';
import { UserFormComponent } from './user-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { UiService } from '../../core/ui.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ 'user.title' | translate }}</h1>
        <p class="page-sub">{{ 'user.sub' | translate }}</p>
      </div>
      <button mat-flat-button color="primary" (click)="openForm(null)">
        <mat-icon>person_add</mat-icon> {{ 'user.add' | translate }}
      </button>
    </div>

    <div class="surface">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
      <div class="tbl-scroll">
        <table mat-table [dataSource]="users()" class="w-full">
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>{{ 'user.col.username' | translate }}</th>
            <td mat-cell *matCellDef="let u" class="font-medium text-[var(--ink)]">
              {{ u.username }}
            </td>
          </ng-container>

          <ng-container matColumnDef="roles">
            <th mat-header-cell *matHeaderCellDef>{{ 'user.col.roles' | translate }}</th>
            <td mat-cell *matCellDef="let u">
              <span class="inline-flex flex-wrap gap-1">
                @for (r of u.roles; track r) {
                  <span class="badge badge-brand">{{ label(r) }}</span>
                }
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef>{{ 'user.col.employee' | translate }}</th>
            <td mat-cell *matCellDef="let u">{{ u.employeeName || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'user.col.status' | translate }}</th>
            <td mat-cell *matCellDef="let u">
              <span class="badge" [class]="u.enabled ? 'badge-ok' : 'badge-muted'">
                {{ (u.enabled ? 'user.active' : 'user.locked') | translate }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">
              {{ 'common.actions' | translate }}
            </th>
            <td mat-cell *matCellDef="let u" class="text-right whitespace-nowrap">
              <button
                mat-icon-button
                [matTooltip]="'common.edit' | translate"
                (click)="openForm(u)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                [matTooltip]="'user.resetPwTip' | translate"
                (click)="resetPassword(u)"
              >
                <mat-icon>lock_reset</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                [matTooltip]="'common.delete' | translate"
                (click)="remove(u)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!loading() && users().length === 0) {
        <p class="text-center text-[var(--muted)] py-8 m-0">{{ 'user.empty' | translate }}</p>
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private service = inject(UserService);
  private employeeService = inject(EmployeeService);
  private dialog = inject(MatDialog);
  private ui = inject(UiService);
  private i18n = inject(I18nService);

  columns = ['username', 'roles', 'employee', 'status', 'actions'];
  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  employees = signal<Employee[]>([]);
  loading = signal(false);

  label = (name: string) => this.i18n.t('role.' + name.replace(/^ROLE_/, ''));

  ngOnInit(): void {
    this.service.roles().subscribe((r) => this.roles.set(r));
    this.employeeService.search('', 0, 1000).subscribe((res) => this.employees.set(res.content));
    this.load();
  }

  openForm(user: User | null): void {
    const ref = this.dialog.open(UserFormComponent, {
      width: '480px',
      data: { user, roles: this.roles(), employees: this.employees() },
    });
    this.ui.afterSaved(ref, !user, 'user.created', 'user.updated', () => this.load());
  }

  resetPassword(u: User): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      data: {
        title: this.i18n.t('user.resetTitle'),
        message: this.i18n.t('user.resetMsg', { name: u.username }),
        confirmText: this.i18n.t('user.resetConfirm'),
        prompt: {
          label: this.i18n.t('user.newPwLabel'),
          placeholder: this.i18n.t('user.newPwPlaceholder'),
          required: true,
        },
      },
    });
    ref.afterClosed().subscribe((pwd) => {
      if (pwd === false || pwd === undefined) return;
      if ((pwd as string).length < 6) {
        this.ui.toast('user.pwMin');
        return;
      }
      this.service.resetPassword(u.id, pwd as string).subscribe({
        next: () => this.ui.toast('user.pwReset'),
        error: (err) => this.ui.error(err, 'user.actionFailed'),
      });
    });
  }

  remove(u: User): void {
    this.ui.confirmDelete({
      titleKey: 'user.deleteTitle',
      messageKey: 'user.deleteMsg',
      messageParams: { name: u.username },
      delete$: this.service.delete(u.id),
      successKey: 'user.deleted',
      onDone: () => this.load(),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (u) => {
        this.users.set(u);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
