// src/app/context/SettingsContext.tsx

'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

interface SettingsContextType {
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <SettingsContext.Provider value={{ isSettingsOpen, setSettingsOpen }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
