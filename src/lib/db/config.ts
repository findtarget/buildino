// src/lib/db/config.ts
import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1363@Majid#129',
  database: process.env.DB_NAME || 'buildino',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
};
