// scripts/setup-database.ts

// ✅✅✅ راه حل جایگزین و مطمئن‌تر برای لود کردن متغیرها
import dotenv from 'dotenv';
import path from 'path';

// به صورت دستی به dotenv می‌گوییم فایل .env.local در ریشه پروژه را بخواند
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// ----------------------------------------------------------------

import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '../src/lib/db/seeds';
import mysql from 'mysql2/promise';

// تابع برای ساخت دیتابیس اگر وجود نداشته باشد
async function createDatabaseIfNotExists() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_PORT || !DB_NAME) {
    // برای دیباگ، ببینیم چه متغیرهایی لود شده‌اند
    console.log('DEBUG: Environment variables loaded:', {
        DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME
    });
    throw new Error('Database environment variables are not set. Please check your .env.local file.');
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    // رمز عبور باید بدون کوتیشن باشد
    password: DB_PASSWORD,
    port: parseInt(DB_PORT, 10),
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
}

async function setupDatabase() {
  const prisma = new PrismaClient(); 
  try {
    console.log('🌱 Checking and creating database if not exists...');
    await createDatabaseIfNotExists();
    console.log('✅ Database exists or was created.');

    console.log('🌱 Seeding data into the database...');
    // ما از Prisma برای seed استفاده می‌کنیم، پس prisma client را به آن پاس می‌دهیم
    await seedDatabase(prisma); 

    console.log('✅✅✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Connection to database closed.');
  }
}

// اجرای تابع اصلی
setupDatabase();
