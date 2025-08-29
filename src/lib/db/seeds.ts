// src/lib/db/seeds.ts
import { db } from './connection.ts';
import bcrypt from 'bcryptjs';

export async function seedDatabase(): Promise<void> {
  try {
    // بررسی وجود ساختمان
    const existingBuildings = await db.query<any[]>(
      `SELECT id FROM buildings WHERE name = ? LIMIT 1`,
      ['ساختمان نمونه']
    );

    let buildingId: number;

    if (existingBuildings.length === 0) {
      const buildingResult = await db.query(
        `INSERT INTO buildings (name, address, total_units, manager_name, manager_phone)
         VALUES (?, ?, ?, ?, ?)`,
        ['ساختمان نمونه', 'آدرس نمونه', 10, 'مدیر ساختمان', '09123456789']
      );
      buildingId = (buildingResult as any).insertId;
    } else {
      buildingId = existingBuildings[0].id;
    }

    // بررسی وجود واحدها برای این ساختمان
    const existingUnits = await db.query<any[]>(
      `SELECT COUNT(*) as count FROM units WHERE building_id = ?`,
      [buildingId]
    );

    if (existingUnits[0].count === 0) {
      const units = [
        { unit_number: '1', area: 80.5, floor_number: 1, rent_amount: 5000000 },
        { unit_number: '2', area: 95.0, floor_number: 1, rent_amount: 6000000 },
        { unit_number: '3', area: 80.5, floor_number: 2, rent_amount: 5000000 },
        { unit_number: '4', area: 95.0, floor_number: 2, rent_amount: 6000000 },
      ];
      for (const unit of units) {
        await db.query(
          `INSERT INTO units (building_id, unit_number, area, floor_number, rent_amount, is_occupied)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [buildingId, unit.unit_number, unit.area, unit.floor_number, unit.rent_amount, false]
        );
      }
    }

    // بررسی وجود کاربر admin
    const existingAdmin = await db.query<any[]>(
      `SELECT id FROM users WHERE username = ? LIMIT 1`,
      ['admin']
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(
        `INSERT INTO users (building_id, username, password_hash, full_name, role)
         VALUES (?, ?, ?, ?, ?)`,
        [buildingId, 'admin', hashedPassword, 'مدیر سیستم', 'admin']
      );
    }

    // بررسی وجود تنظیمات شارژ
    const existingChargeSettings = await db.query<any[]>(
      `SELECT id FROM charge_settings WHERE building_id = ? LIMIT 1`,
      [buildingId]
    );

    if (existingChargeSettings.length === 0) {
      await db.query(
        `INSERT INTO charge_settings (building_id, charge_per_square_meter, parking_charge)
         VALUES (?, ?, ?)`,
        [buildingId, 50000, 200000]
      );
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
