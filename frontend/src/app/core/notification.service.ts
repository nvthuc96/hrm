import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AppNotification } from './models';

/** Current user's in-app notification inbox. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/me/notifications`;

  /** Cached list + unread count, so the header bell and any page can share state. */
  readonly items = signal<AppNotification[]>([]);
  readonly unread = signal(0);

  refresh(): void {
    this.http.get<AppNotification[]>(this.api).subscribe({
      next: (list) => {
        this.items.set(list);
        this.unread.set(list.filter((n) => !n.read).length);
      },
      error: () => {},
    });
  }

  refreshCount(): void {
    this.http.get<{ count: number }>(`${this.api}/unread-count`).subscribe({
      next: (r) => this.unread.set(r.count),
      error: () => {},
    });
  }

  markRead(id: number): void {
    const item = this.items().find((n) => n.id === id);
    if (!item || item.read) return;
    this.http.post<void>(`${this.api}/${id}/read`, {}).subscribe({
      next: () => {
        this.items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
        this.unread.update((c) => Math.max(0, c - 1));
      },
      error: () => {},
    });
  }

  markAllRead(): void {
    if (this.unread() === 0) return;
    this.http.post<void>(`${this.api}/read-all`, {}).subscribe({
      next: () => {
        this.items.update((list) => list.map((n) => ({ ...n, read: true })));
        this.unread.set(0);
      },
      error: () => {},
    });
  }
}
