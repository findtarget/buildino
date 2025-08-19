// src/lib/mockData.ts

import { Unit } from '@/types/index.d';

export const mockUnits: Unit[] = [
  { id: 1, unitNumber: '101', floor: 1, area: 85, type: 'Residential', ownerName: 'علی رضایی', ownerContact: '09121111111', status: 'OwnerOccupied', residentName: 'علی رضایی', residentContact: '09121111111', parkingSpots: 1, hasStorage: true, balance: -50000, ownerSince: '1398/05/10', residentSince: '1398/05/10', residentCount: 3 },
  { id: 2, unitNumber: '102', floor: 1, area: 92, type: 'Residential', ownerName: 'مریم احمدی', ownerContact: '09122222222', status: 'TenantOccupied', residentName: 'سارا کریمی', residentContact: '09355555555', parkingSpots: 1, hasStorage: true, balance: 0, ownerSince: '1400/11/20', residentSince: '1402/03/01', residentCount: 2 },
  { id: 3, unitNumber: '103', floor: 1, area: 85, type: 'Residential', ownerName: 'شرکت سازنده', ownerContact: '02188888888', status: 'Vacant', residentName: ' - ', residentContact: ' - ', parkingSpots: 1, hasStorage: false, balance: 120000, ownerSince: '1397/01/01', residentSince: null, residentCount: 0 },
  { id: 4, unitNumber: '201', floor: 2, area: 120, type: 'Residential', ownerName: 'رضا قاسمی', ownerContact: '09123333333', status: 'OwnerOccupied', residentName: 'رضا قاسمی', residentContact: '09123333333', parkingSpots: 2, hasStorage: true, balance: -250000, ownerSince: '1401/02/15', residentSince: '1401/02/15', residentCount: 4 },
  { id: 5, unitNumber: 'G1', floor: 0, area: 250, type: 'Commercial', ownerName: 'فروشگاه زنجیره‌ای', ownerContact: '09124444444', status: 'TenantOccupied', residentName: 'مدیر فروشگاه', residentContact: '09109999999', parkingSpots: 0, hasStorage: false, balance: 0, ownerSince: '1399/06/01', residentSince: '1399/07/01', residentCount: 5 },
];
