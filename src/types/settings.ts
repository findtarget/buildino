// src/types/settings.ts
export interface ChargeSettings {
  year: string; // "1404"
  categories: {
    [categoryId: string]: {
      baseAmount: number;
      isActive: boolean;
      lastUpdated: string;
    };
  };
  coefficients: {
    commercial: number; // ضریب تجاری
    floors: { [floor: string]: number }; // ضریب طبقات
  };
}

export interface AppSettings {
  chargeSettings: { [year: string]: ChargeSettings };
  defaultYear: string;
  // سایر تنظیمات...
}
