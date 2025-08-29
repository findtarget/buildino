// scripts/setup-database.ts
import 'dotenv/config'; // ✅ این خط اضافه شد تا env ها لود بشن
import mysql from 'mysql2/promise';
import { db } from '../src/lib/db/connection.ts';
import { seedDatabase } from '../src/lib/db/seeds.ts';
import { dbConfig } from '../src/lib/db/config.ts';

async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
  });

  await connection.query(`
    CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  await connection.end();
}

async function setupDatabase() {
  try {
    console.log('Script started');
    console.log('Checking database...');
    await createDatabaseIfNotExists();
    console.log('✓ Database exists or created');

    console.log('Setting up tables...');
    await db.initializeDatabase();

    console.log('Seeding data...');
    await seedDatabase();

    console.log('✓ Setup complete');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
