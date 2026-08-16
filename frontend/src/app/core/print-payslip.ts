import { Payslip } from './models';

const esc = (s: string) =>
  (s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/** Translator signature compatible with I18nService.t */
export type Translate = (key: string, params?: Record<string, string | number>) => string;

/**
 * Open a print-optimised payslip in a new window and trigger the browser print
 * dialog. The user can print or "Save as PDF"; Vietnamese renders via system
 * fonts, so no font embedding is needed. Labels come from the caller's
 * translator so the sheet follows the active language.
 */
export function printPayslip(p: Payslip, t: Translate, locale: 'vi' | 'en' = 'vi'): void {
  const nf = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US');
  const money = (n: number) => `${nf.format(Math.round(n))} ₫`;

  const lines = p.details
    .map((d) => {
      const sign = d.type === 'ALLOWANCE' ? '+' : '−';
      const cls = d.type === 'ALLOWANCE' ? 'pos' : 'neg';
      return `<tr><td>${sign} ${esc(d.name)}</td><td class="num ${cls}">${money(d.amount)}</td></tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8" />
<title>${esc(t('print.docTitle', { name: p.employeeName, m: p.month, y: p.year }))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
  .sheet { max-width: 640px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px; }
  .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
  .brand span { color: #4f46e5; }
  .sub { color: #64748b; font-size: 12px; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .meta { text-align: right; font-size: 13px; color: #334155; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  td { padding: 6px 0; font-size: 14px; border-bottom: 1px solid #eef2f7; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .pos { color: #15803d; } .neg { color: #b91c1c; }
  .section { margin-top: 18px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; font-weight: 700; }
  .total td { border: none; padding-top: 12px; font-size: 18px; font-weight: 700; color: #1d4ed8; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 24px; font-size: 13px; margin-bottom: 8px; }
  .grid .k { color: #64748b; }
  .sign { display: flex; justify-content: space-between; margin-top: 48px; font-size: 13px; color: #334155; text-align: center; }
  .sign div { width: 45%; }
  .sign .role { font-weight: 600; margin-bottom: 56px; }
  .foot { margin-top: 28px; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 0; } @page { margin: 16mm; } }
</style></head>
<body><div class="sheet">
  <div class="head">
    <div><div class="brand">HR<span>M</span></div><div class="sub">${esc(t('print.subtitle'))}</div></div>
    <div class="meta"><h1>${esc(t('print.payslip'))}</h1><div>${esc(t('print.period', { m: p.month, y: p.year }))}</div></div>
  </div>

  <div class="grid">
    <div><span class="k">${esc(t('print.employee'))}</span> <strong>${esc(p.employeeName)}</strong></div>
    <div><span class="k">${esc(t('print.workingDays'))}</span> ${p.workingDays}</div>
  </div>

  <div class="section">${esc(t('print.incomeSection'))}</div>
  <table>
    <tr><td>${esc(t('print.base'))}</td><td class="num">${money(p.baseSalary)}</td></tr>
    ${lines}
    <tr><td><strong>${esc(t('print.gross'))}</strong></td><td class="num"><strong>${money(p.gross)}</strong></td></tr>
  </table>

  <div class="section">${esc(t('print.deductSection'))}</div>
  <table>
    <tr><td>${esc(t('print.insurance'))}</td><td class="num neg">${money(p.insurance)}</td></tr>
    <tr><td>${esc(t('print.tax'))}</td><td class="num neg">${money(p.tax)}</td></tr>
    <tr><td>${esc(t('print.otherDeduction'))}</td><td class="num neg">${money(p.totalDeduction)}</td></tr>
  </table>

  <table><tr class="total"><td>${esc(t('print.net'))}</td><td class="num">${money(p.netSalary)}</td></tr></table>

  <div class="sign">
    <div><div class="role">${esc(t('print.preparer'))}</div>………………………</div>
    <div><div class="role">${esc(t('print.receiver'))}</div>………………………</div>
  </div>

  <div class="foot">${esc(t('print.footer', { date: new Date().toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US') }))}</div>
</div>
<script>window.onload = function(){ window.focus(); window.print(); };</script>
</body></html>`;

  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) {
    alert(t('print.popupBlocked'));
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
