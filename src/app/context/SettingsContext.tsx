// src/app/context/SettingsContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';

// F: حالا که settings به صفحه مستقل تبدیل شده، ممکنه این context رو نیاز نباشه
// اما برای سازگاری نگه می‌داریمش

interface SettingsContextType {
  // در آینده تنظیمات دیگه رو اینجا اضافه می‌کنیم
  placeholder?: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    placeholder: true,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
