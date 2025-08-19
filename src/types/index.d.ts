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
  ownerNationalId: string | null; // F: [جدید] کد ملی مالک
  status: UnitStatus;
  residentName: string;
  residentContact: string;
  residentNationalId: string | null; // F: [جدید] کد ملی ساکن
  residentCount: number; // F: [اصلاح] این فیلد از قبل بود و حفظ شده
  parkingSpots: number;
  hasStorage: boolean;
  balance: number;
  ownerSince: string | null;
  residentSince: string | null;
}
