// src/app/context/ChargeSettingsContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChargeCategory } from '@/types/charge';

interface ChargeSettings {
  year: number;
  categories: Record<string, { baseAmount?: number; isActive?: boolean }>;
  coefficients: {
    commercial: number;
    floor: number;
    parking: number;
  };
}

interface ChargeSettingsContextType {
  getCurrentYearSettings: () => ChargeSettings;
  updateSettings: (settings: Partial<ChargeSettings>) => void;
  resetToDefaults: () => void;
}

const ChargeSettingsContext = createContext<ChargeSettingsContextType | undefined>(undefined);

const defaultSettings: ChargeSettings = {
  year: 1404,
  categories: {},
  coefficients: {
    commercial: 1.5,
    floor: 1.0,
    parking: 1.0,
  }
};

export function ChargeSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ChargeSettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem('chargeSettings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading charge settings:', error);
      }
    }
  }, []);

  const getCurrentYearSettings = (): ChargeSettings => {
    return settings;
  };

  const updateSettings = (newSettings: Partial<ChargeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('chargeSettings', JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.setItem('chargeSettings', JSON.stringify(defaultSettings));
  };

  return (
    <ChargeSettingsContext.Provider value={{
      getCurrentYearSettings,
      updateSettings,
      resetToDefaults
    }}>
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
