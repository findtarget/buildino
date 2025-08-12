// src/types/index.d.ts

export type UnitStatus = 'OwnerOccupied' | 'TenantOccupied' | 'Vacant';
export type UnitType = 'Residential' | 'Commercial';

export interface Unit {
  id: number;
  unitNumber: string;
  floor: number;
  area: number;
  type: UnitType;
  ownerName: string;
  ownerContact: string;
  status: UnitStatus;
  residentName: string;
  residentContact: string;
  parkingSpots: number;
  hasStorage: boolean;
  balance: number;
  ownerSince: string | null;
  residentSince: string | null;
  // F: فیلد جدید برای تعداد ساکنین اضافه شد
  residentCount: number; 
}
