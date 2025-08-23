// src/data/mockUnits.ts
import { UnitChargeInfo } from '@/types/charge';

export const mockUnitsData: UnitChargeInfo[] = [
  // طبقه همکف (تجاری)
  { id: 1, unitNumber: '001', area: 120, ownerType: 'owner', hasParking: true, parkingCount: 2, isCommercial: true, floorCoefficient: 0.9, balconyArea: 0 },
  { id: 2, unitNumber: '002', area: 80, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: true, floorCoefficient: 0.9, balconyArea: 0 },

  // طبقه اول
  { id: 3, unitNumber: '101', area: 95, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.0, balconyArea: 8 },
  { id: 4, unitNumber: '102', area: 110, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.0, balconyArea: 12 },
  { id: 5, unitNumber: '103', area: 85, ownerType: 'tenant', hasParking: false, parkingCount: 0, isCommercial: false, floorCoefficient: 1.0, balconyArea: 6 },
  { id: 6, unitNumber: '104', area: 105, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.0, balconyArea: 10 },

  // طبقه دوم
  { id: 7, unitNumber: '201', area: 95, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.1, balconyArea: 8 },
  { id: 8, unitNumber: '202', area: 110, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.1, balconyArea: 12 },
  { id: 9, unitNumber: '203', area: 85, ownerType: 'owner', hasParking: false, parkingCount: 0, isCommercial: false, floorCoefficient: 1.1, balconyArea: 6 },
  { id: 10, unitNumber: '204', area: 105, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.1, balconyArea: 10 },

  // طبقه سوم
  { id: 11, unitNumber: '301', area: 95, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.2, balconyArea: 8 },
  { id: 12, unitNumber: '302', area: 110, ownerType: 'owner', hasParking: true, parkingCount: 2, isCommercial: false, floorCoefficient: 1.2, balconyArea: 12 },
  { id: 13, unitNumber: '303', area: 85, ownerType: 'tenant', hasParking: false, parkingCount: 0, isCommercial: false, floorCoefficient: 1.2, balconyArea: 6 },
  { id: 14, unitNumber: '304', area: 105, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.2, balconyArea: 10 },

  // طبقه چهارم
  { id: 15, unitNumber: '401', area: 95, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.3, balconyArea: 8 },
  { id: 16, unitNumber: '402', area: 110, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.3, balconyArea: 12 },
  { id: 17, unitNumber: '403', area: 85, ownerType: 'owner', hasParking: false, parkingCount: 0, isCommercial: false, floorCoefficient: 1.3, balconyArea: 6 },
  { id: 18, unitNumber: '404', area: 105, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.3, balconyArea: 10 },

  // طبقه پنجم (پنت‌هاوس)
  { id: 19, unitNumber: '501', area: 150, ownerType: 'owner', hasParking: true, parkingCount: 2, isCommercial: false, floorCoefficient: 1.4, balconyArea: 25 },
  { id: 20, unitNumber: '502', area: 130, ownerType: 'owner', hasParking: true, parkingCount: 2, isCommercial: false, floorCoefficient: 1.4, balconyArea: 20 },
];
