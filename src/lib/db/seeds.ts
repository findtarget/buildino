// src/lib/db/seeds.ts
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { BuildingType, UsageType } from '@prisma/client';

export async function seedDatabase(): Promise<void> {
  // --- Seed Building ---
  console.log('Searching for sample building...');
  const existingBuilding = await prisma.building.findFirst({
    where: { name: 'ساختمان نمونه' },
  });

  let buildingId: number;

  if (!existingBuilding) {
    console.log('Creating sample building...');
    const newBuilding = await prisma.building.create({
      data: {
        name: 'ساختمان نمونه',
        address: 'آدرس نمونه',
        // ✅✅✅ تصحیح شده: استفاده از camelCase
        totalUnits: 10,
        managerName: 'مدیر ساختمان',
        managerPhone: '09123456789',
        type: BuildingType.APARTMENT,
        usage: UsageType.RESIDENTIAL,
        description: 'این یک ساختمان نمونه برای تست است.',
        hasBlocks: false,
        blocksCount: 0,
      },
    });
    buildingId = newBuilding.id;
    console.log(`Building created with ID: ${buildingId}`);
  } else {
    buildingId = existingBuilding.id;
    console.log(`Building already exists with ID: ${buildingId}`);
  }

  // --- Seed Units for the building ---
  console.log('Checking for units...');
  const unitsCount = await prisma.unit.count({
    where: { buildingId: buildingId },
  });

  if (unitsCount === 0) {
    console.log('Creating sample units...');
    await prisma.unit.createMany({
      data: [
        { buildingId: buildingId, unitNumber: '1', area: 80.5, floorNumber: 1, rentAmount: 5000000 },
        { buildingId: buildingId, unitNumber: '2', area: 95.0, floorNumber: 1, rentAmount: 6000000 },
        { buildingId: buildingId, unitNumber: '3', area: 80.5, floorNumber: 2, rentAmount: 5000000 },
        { buildingId: buildingId, unitNumber: '4', area: 95.0, floorNumber: 2, rentAmount: 6000000 },
      ],
    });
    console.log('Sample units created.');
  } else {
    console.log('Units already exist.');
  }

  // --- Seed Admin User ---
  console.log('Searching for admin user...');
  // ✅✅✅ تصحیح شده: استفاده از prisma.user (مفرد و camelCase)
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    // ✅✅✅ تصحیح شده: استفاده از prisma.user و فیلدهای camelCase
    await prisma.user.create({
      data: {
        buildingId: buildingId,
        username: 'admin',
        password: hashedPassword, // ✅ فیلد صحیح مطابق با Prisma schema
        fullName: 'مدیر سیستم',
        role: 'admin',
      },
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }
  
  // --- Seed Charge Settings ---
  console.log('Searching for charge settings...');
  // ✅✅✅ تصحیح شده: استفاده از prisma.chargeSettings (camelCase)
  const existingChargeSettings = await prisma.chargeSettings.findUnique({
    // ✅✅✅ تصحیح شده: استفاده از buildingId (camelCase)
    where: { buildingId: buildingId },
  });

  if (!existingChargeSettings) {
    console.log('Creating charge settings...');
    // ✅✅✅ تصحیح شده: استفاده از prisma.chargeSettings و فیلدهای camelCase
    await prisma.chargeSettings.create({
      data: {
        buildingId: buildingId,
        chargePerSquareMeter: 50000,
        parkingCharge: 200000
      }
    });
    console.log('Charge settings created.');
  } else {
    console.log('Charge settings already exist.');
  }

  console.log('Database seeded successfully! ✅');
}
