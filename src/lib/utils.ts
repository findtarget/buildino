// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// تبدیل اعداد انگلیسی به فارسی
export function toPersianDigits(s: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(s).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

// تبدیل اعداد فارسی به انگلیسی
export function toEnglishDigits(s: string): string {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  let result = s;
  for (let i = 0; i < persianDigits.length; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
  }
  return result;
}

// تبدیل تاریخ میلادی به شمسی
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = 0;
  let jm = 0;
  let jd = 0;

  if (gy <= 1600) {
    jy = 0;
    gy -= 621;
  } else {
    jy = 979;
    gy -= 1600;
  }

  if (gm > 2) {
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    const days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    let jd2 = days % 12053;
    jy += 4 * Math.floor(jd2 / 1461);
    jd2 %= 1461;

    if (jd2 > 365) {
      jy += Math.floor((jd2 - 1) / 365);
      jd2 = (jd2 - 1) % 365;
    }

    if (jd2 < 186) {
      jm = 1 + Math.floor(jd2 / 31);
      jd = 1 + (jd2 % 31);
    } else {
      jm = 7 + Math.floor((jd2 - 186) / 30);
      jd = 1 + ((jd2 - 186) % 30);
    }
  } else {
    const days = (365 * gy) + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) - 80 + gd + ((gm < 3) ? 0 : (isLeapYear(gy) ? -1 : -2)) + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    let jd2 = days % 12053;
    jy += 4 * Math.floor(jd2 / 1461);
    jd2 %= 1461;

    if (jd2 > 365) {
      jy += Math.floor((jd2 - 1) / 365);
      jd2 = (jd2 - 1) % 365;
    }

    if (jd2 < 186) {
      jm = 1 + Math.floor(jd2 / 31);
      jd = 1 + (jd2 % 31);
    } else {
      jm = 7 + Math.floor((jd2 - 186) / 30);
      jd = 1 + ((jd2 - 186) % 30);
    }
  }

  return [jy, jm, jd];
}

// تبدیل تاریخ شمسی به میلادی
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = 0;
  let gm = 0;
  let gd_result = 0;

  jy += 1595;
  let days = -355668 + (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy = 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;

    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  gd_result = days + 1;

  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  for (let i = 0; i < 13 && gd_result > sal_a[i]; i++) {
    gd_result -= sal_a[i];
    gm++;
  }

  return [gy, gm, gd_result];
}

// بررسی سال کبیسه شمسی
function isLeapYear(year: number) {
  return ((((((year - (year > 0 ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
}

// فرمت کردن تاریخ شمسی
export function formatJalaliDate(date: Date): string {
  const [jy, jm, jd] = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );

  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

// تبدیل رشته تاریخ شمسی به Date
export function parseJalaliDate(dateString: string): Date {
  try {
    // تبدیل اعداد فارسی به انگلیسی
    const englishDateString = toEnglishDigits(dateString);
    const [year, month, day] = englishDateString.split('/').map(Number);

    const [gy, gm, gd] = jalaliToGregorian(year, month, day);
    return new Date(gy, gm - 1, gd);
  } catch (error) {
    console.error("Error parsing jalali date:", dateString);
    return new Date();
  }
}

// فرمت کردن پول
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${toPersianDigits(formatted)} تومان`;
}
