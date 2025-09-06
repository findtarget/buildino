// src/app/context/ActiveBuildingContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ActiveBuildingContextType {
  buildingId: number | null;
  setBuildingId: (id: number) => void;
}

const ActiveBuildingContext = createContext<ActiveBuildingContextType | undefined>(undefined);

export const ActiveBuildingProvider = ({ children }: { children: ReactNode }) => {
  const [buildingId, setBuildingIdState] = useState<number | null>(null);

  useEffect(() => {
    // تلاش برای خواندن مقدار از localStorage بعد از mount
    const savedId = localStorage.getItem('activeBuildingId');
    if (savedId) {
      setBuildingIdState(parseInt(savedId, 10));
    }
  }, []);

  const setBuildingId = (id: number) => {
    setBuildingIdState(id);
    localStorage.setItem('activeBuildingId', String(id));
  };

  return (
    <ActiveBuildingContext.Provider value={{ buildingId, setBuildingId }}>
      {children}
    </ActiveBuildingContext.Provider>
  );
};

export const useActiveBuilding = () => {
  const context = useContext(ActiveBuildingContext);
  if (!context) {
    throw new Error('useActiveBuilding باید داخل ActiveBuildingProvider استفاده شود');
  }
  return context;
};
