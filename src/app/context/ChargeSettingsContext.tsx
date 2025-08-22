// src/app/context/ChargeSettingsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChargeSettings, AppSettings } from '@/types/charge';
import { defaultChargeCategories } from '@/lib/chargeCalculator';

interface ChargeSettingsContextType {
  chargeSettings: AppSettings;
  updateChargeSettings: (year: number, settings: Partial<ChargeSettings>) => void;
  getCurrentYearSettings: () => ChargeSettings;
  resetToDefaults: (year: number) => void;
  setCurrentYear: (year: number) => void;
}

const ChargeSettingsContext = createContext<ChargeSettingsContextType | undefined>(undefined);

// تنظیمات پیش‌فرض برای سال 1404
const getDefaultSettingsForYear = (year: number): ChargeSettings => ({
  year,
  categories: defaultChargeCategories.reduce((acc, cat) => ({
    ...acc,
    [cat.id]: {
      baseAmount: cat.baseAmount,
      isActive: cat.isActive,
      lastUpdated: new Date().toISOString(),
    }
  }), {}),
  coefficients: {
    commercial: 1.5,
    floor: 1.0,
    parking: 1.0,
  },
  lastUpdated: new Date().toISOString(),
});

const defaultAppSettings: AppSettings = {
  chargeSettings: {
    1404: getDefaultSettingsForYear(1404),
  },
  currentYear: 1404,
};

export function ChargeSettingsProvider({ children }: { children: ReactNode }) {
  const [chargeSettings, setChargeSettings] = useState<AppSettings>(defaultAppSettings);

  // بارگذاری از localStorage هنگام mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('buildino-charge-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setChargeSettings(parsed);
      }
    } catch (error) {
      console.error('Error loading charge settings:', error);
    }
  }, []);

  // ذخیره در localStorage هنگام تغییر
  useEffect(() => {
    try {
      localStorage.setItem('buildino-charge-settings', JSON.stringify(chargeSettings));
    } catch (error) {
      console.error('Error saving charge settings:', error);
    }
  }, [chargeSettings]);

  const updateChargeSettings = (year: number, newSettings: Partial<ChargeSettings>) => {
    setChargeSettings(prev => ({
      ...prev,
      chargeSettings: {
        ...prev.chargeSettings,
        [year]: {
          ...prev.chargeSettings[year] || getDefaultSettingsForYear(year),
          ...newSettings,
          lastUpdated: new Date().toISOString(),
        }
      }
    }));
  };

  const getCurrentYearSettings = (): ChargeSettings => {
    return chargeSettings.chargeSettings[chargeSettings.currentYear] || getDefaultSettingsForYear(chargeSettings.currentYear);
  };

  const resetToDefaults = (year: number) => {
    setChargeSettings(prev => ({
      ...prev,
      chargeSettings: {
        ...prev.chargeSettings,
        [year]: getDefaultSettingsForYear(year),
      }
    }));
  };

  const setCurrentYear = (year: number) => {
    setChargeSettings(prev => ({
      ...prev,
      currentYear: year,
      chargeSettings: {
        ...prev.chargeSettings,
        [year]: prev.chargeSettings[year] || getDefaultSettingsForYear(year),
      }
    }));
  };

  return (
    <ChargeSettingsContext.Provider
      value={{
        chargeSettings,
        updateChargeSettings,
        getCurrentYearSettings,
        resetToDefaults,
        setCurrentYear,
      }}
    >
      {children}
    </ChargeSettingsContext.Provider>
  );
}

export function useChargeSettings() {
  const context = useContext(ChargeSettingsContext);
  if (context === undefined) {
    throw new Error('useChargeSettings must be used within a ChargeSettingsProvider');
  }
  return context;
}
