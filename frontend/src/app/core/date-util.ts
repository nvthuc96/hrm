/** Tiện ích chuyển đổi giữa `Date` (dùng cho Material Datepicker) và
 *  chuỗi ISO `YYYY-MM-DD` (dùng cho API). Tính theo giờ local để tránh
 *  lệch ngày do quy đổi UTC. */

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
