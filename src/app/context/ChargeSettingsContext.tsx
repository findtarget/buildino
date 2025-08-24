// src/app/context/ChargeSettingsContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ChargeCategory {
  id: string;
  title: string;
  baseAmount: number;
  isActive: boolean;
}

interface ChargeSettings {
  year: number;
  categories: Record<string, ChargeCategory>;
  coefficients: {
    commercial: number;
    floor: number;
    parking: number;
  };
}

interface ChargeSettingsContextType {
  currentYear: number;
  setCurrentYear: (year: number) => void;
  getCurrentYearSettings: () => ChargeSettings;
  updateCategorySettings: (categoryId: string, updates: Partial<ChargeCategory>) => void;
  updateCoefficients: (coefficients: Partial<ChargeSettings['coefficients']>) => void;
}

const ChargeSettingsContext = createContext<ChargeSettingsContextType | undefined>(undefined);

const defaultSettings: ChargeSettings = {
  year: 1403,
  categories: {
    maintenance: { id: 'maintenance', title: 'تعمیرات و نگهداری', baseAmount: 120000, isActive: true },
    cleaning: { id: 'cleaning', title: 'نظافت و بهداشت', baseAmount: 80000, isActive: true },
    security: { id: 'security', title: 'حراست و نگهبانی', baseAmount: 250000, isActive: true },
    utilities: { id: 'utilities', title: 'مشاعات و قبوض', baseAmount: 90000, isActive: true },
    management: { id: 'management', title: 'مدیریت ساختمان', baseAmount: 180000, isActive: true },
    parking: { id: 'parking', title: 'نگهداری پارکینگ', baseAmount: 50000, isActive: true }
  },
  coefficients: {
    commercial: 1.5,
    floor: 1.0,
    parking: 1.0
  }
};

export function ChargeSettingsProvider({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState(1403);
  const [settings, setSettings] = useState<Record<number, ChargeSettings>>({
    1403: defaultSettings
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('chargeSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chargeSettings', JSON.stringify(settings));
  }, [settings]);

  const getCurrentYearSettings = (): ChargeSettings => {
    return settings[currentYear] || defaultSettings;
  };

  const updateCategorySettings = (categoryId: string, updates: Partial<ChargeCategory>) => {
    setSettings(prev => ({
      ...prev,
      [currentYear]: {
        ...prev[currentYear],
        categories: {
          ...prev[currentYear]?.categories,
          [categoryId]: { ...prev[currentYear]?.categories[categoryId], ...updates }
        }
      }
    }));
  };

  const updateCoefficients = (coefficients: Partial<ChargeSettings['coefficients']>) => {
    setSettings(prev => ({
      ...prev,
      [currentYear]: {
        ...prev[currentYear],
        coefficients: { ...prev[currentYear]?.coefficients, ...coefficients }
      }
    }));
  };

  return (
    <ChargeSettingsContext.Provider value={{
      currentYear,
      setCurrentYear,
      getCurrentYearSettings,
      updateCategorySettings,
      updateCoefficients
    }}>
      {children}
    </ChargeSettingsContext.Provider>
  );
}

export const useChargeSettings = () => {
  const context = useContext(ChargeSettingsContext);
  if (context === undefined) {
    throw new Error('useChargeSettings must be used within a ChargeSettingsProvider');
  }
  return context;
};
