// src/lib/services/unitService.ts
import { db } from '@/lib/db/connection.ts';

interface UnitFilters {
  buildingId?: number;
  search?: string;
  status?: 'occupied' | 'vacant' | 'maintenance' | '';
  page?: number;
  limit?: number;
}

export async function getUnits(filters: UnitFilters) {
  const { buildingId, search, status, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  let whereClauses: string[] = [];
  let params: any[] = [];

  if (buildingId) {
    whereClauses.push('u.building_id = ?');
    params.push(buildingId);
  }

  if (search) {
    whereClauses.push('(u.unit_number LIKE ? OR u.resident_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    if (status === 'occupied') {
      whereClauses.push('u.is_occupied = TRUE');
    } else if (status === 'vacant') {
      whereClauses.push('u.is_occupied = FALSE');
    }
    // وضعیت 'maintenance' در آینده قابل توسعه است
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const units = await db.query<any[]>(
    `SELECT
       u.id,
       u.building_id AS buildingId,
       u.unit_number AS unitNumber,
       u.floor_number AS floorNumber,
       u.area,
       u.balcony_area AS balconyArea,
       u.owner_name AS ownerName,
       u.owner_national_id AS ownerNationalId,
       u.resident_name AS residentName,
       u.resident_name AS tenantName,
       u.resident_phone AS residentPhone,
       u.rent_amount AS rentAmount,
       u.is_occupied AS isOccupied,
       u.has_parking AS hasParking,
       u.parking_count AS parkingCount,
       u.description,
       b.name AS buildingName
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     ${whereSQL}
     ORDER BY u.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const totalResult = await db.query<any[]>(
    `SELECT COUNT(*) as count
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     ${whereSQL}`,
    params
  );

  return {
    units,
    total: totalResult[0]?.count || 0
  };
}

export async function createUnit(data: any) {
  // اطمینان از وجود building_id
  const buildingIdVal =
    data.building_id ??
    data.buildingId ??
    1; // مقدار پیش‌فرض برای تست — در نسخه نهایی باید از فرم یا context بیاد

  const result = await db.query<any>(
    `INSERT INTO units (
       building_id, unit_number, area, balcony_area, floor_number,
       owner_name, owner_national_id, resident_name, resident_phone,
       rent_amount, is_occupied, has_parking, parking_count, description
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      buildingIdVal,
      data.unit_number ?? data.unitNumber,
      data.area ?? null,
      data.balcony_area ?? data.balconyArea ?? 0,
      data.floor_number ?? data.floorNumber ?? null,
      data.owner_name ?? data.ownerName ?? null,
      data.owner_national_id ?? data.ownerNationalId ?? null,
      data.resident_name ?? data.residentName ?? null,
      data.resident_phone ?? data.residentPhone ?? null,
      data.rent_amount ?? data.rentAmount ?? 0,
      data.is_occupied ?? data.isOccupied ?? false,
      data.has_parking ?? data.hasParking ?? false,
      data.parking_count ?? data.parkingCount ?? 0,
      data.description ?? null
    ]
  );

  return {
    id: result.insertId,
    building_id: buildingIdVal,
    ...data
  };
}

export async function getUnitById(id: number) {
  const units = await db.query<any[]>(
    `SELECT
       u.id,
       u.building_id AS buildingId,
       u.unit_number AS unitNumber,
       u.floor_number AS floorNumber,
       u.area,
       u.balcony_area AS balconyArea,
       u.owner_name AS ownerName,
       u.owner_national_id AS ownerNationalId,
       u.resident_name AS residentName,
       u.resident_phone AS residentPhone,
       u.rent_amount AS rentAmount,
       u.is_occupied AS isOccupied,
       u.has_parking AS hasParking,
       u.parking_count AS parkingCount,
       u.description,
       b.name AS buildingName
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     WHERE u.id = ?`,
    [id]
  );
  return units[0] || null;
}

export async function updateUnit(id: number, data: any) {
  const buildingIdVal =
    data.building_id ??
    data.buildingId ??
    1;

  const result = await db.query<any>(
    `UPDATE units
     SET building_id = ?, unit_number = ?, area = ?, balcony_area = ?, floor_number = ?,
         owner_name = ?, owner_national_id = ?, resident_name = ?, resident_phone = ?,
         rent_amount = ?, is_occupied = ?, has_parking = ?, parking_count = ?, description = ?
     WHERE id = ?`,
    [
      buildingIdVal,
      data.unit_number ?? data.unitNumber,
      data.area ?? null,
      data.balcony_area ?? data.balconyArea ?? 0,
      data.floor_number ?? data.floorNumber ?? null,
      data.owner_name ?? data.ownerName ?? null,
      data.owner_national_id ?? data.ownerNationalId ?? null,
      data.resident_name ?? data.residentName ?? null,
      data.resident_phone ?? data.residentPhone ?? null,
      data.rent_amount ?? data.rentAmount ?? 0,
      data.is_occupied ?? data.isOccupied ?? false,
      data.has_parking ?? data.hasParking ?? false,
      data.parking_count ?? data.parkingCount ?? 0,
      data.description ?? null,
      id
    ]
  );

  if (result.affectedRows === 0) {
    return null;
  }
  return { id, building_id: buildingIdVal, ...data };
}

export async function deleteUnit(id: number) {
  const result = await db.query<any>(
    `DELETE FROM units WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}
