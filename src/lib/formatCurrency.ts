// src/lib/formatCurrency.ts
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '۰';
  return amount
    .toLocaleString('fa-IR', { maximumFractionDigits: 0 })
    .replace(/\٬/g, ',')
    + ' تومان';
}
