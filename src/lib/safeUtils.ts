// src/lib/safeUtils.ts
export const safeToString = (value: any, fallback = '0'): string => {
  try {
    if (value === null || value === undefined) return fallback;
    return String(value);
  } catch (error) {
    console.error('Error converting to string:', value, error);
    return fallback;
  }
};

export const safeMath = {
  add: (a: number, b: number): number => (a || 0) + (b || 0),
  multiply: (a: number, b: number): number => (a || 0) * (b || 0),
  divide: (a: number, b: number): number => (b && b !== 0) ? (a || 0) / b : 0,
  round: (value: number): number => Math.round(value || 0),
};
