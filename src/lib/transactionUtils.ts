// src/lib/transactionUtils.ts

/**
 * سرویسی برای مدیریت منطق‌های مربوط به تراکنش‌ها.
 * این کار به ما کمک می‌کند تا محاسبات و قوانین تجاری را در یک مکان متمرکز نگه داریم.
 */
export class TransactionService {
  /**
   * مبلغ نهایی یک تراکنش را بر اساس مبلغ پایه، مالیات و تخفیف محاسبه می‌کند.
   * @param baseAmount - مبلغ اصلی
   * @param taxAmount - مبلغ مالیات (اضافه می‌شود)
   * @param discountAmount - مبلغ تخفیف (کسر می‌شود)
   * @returns مبلغ نهایی
   */
  static calculateTotalAmount(baseAmount: number, taxAmount: number, discountAmount: number): number {
    const base = Number(baseAmount) || 0;
    const tax = Number(taxAmount) || 0;
    const discount = Number(discountAmount) || 0;
    
    return base + tax - discount;
  }
}

/**
 * یک شماره تراکنش جدید و موقتی تولید می‌کند.
 * در یک سیستم واقعی، این شماره باید از سمت سرور (پایگاه داده) تولید شود تا از یکتایی آن اطمینان حاصل شود.
 * @returns یک رشته به عنوان شماره تراکنش (مثلاً: TXN-1404-12345)
 */
export function getNextTransactionNumber(): string {
  const year = '1404'; // این می‌تواند به صورت داینامیک بر اساس تاریخ فعلی تنظیم شود
  const randomPart = Math.floor(Math.random() * 90000) + 10000; // تولید یک عدد تصادفی ۵ رقمی
  return `TXN-${year}-${randomPart}`;
}

