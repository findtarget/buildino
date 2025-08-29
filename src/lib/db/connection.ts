// src/lib/db/connection.ts
import mysql from 'mysql2/promise';
import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { dbConfig } from './config.ts';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port,
      waitForConnections: true,
      connectionLimit: dbConfig.connectionLimit,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+03:30' // تنظیم زمان ایران
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async query<T extends RowDataPacket[][] | RowDataPacket[] | ResultSetHeader>(
    sql: string,
    params?: any[]
  ): Promise<T> {
    try {
      const [rows] = await this.pool.execute<T>(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  public async transaction(queries: { sql: string; params?: any[] }[]): Promise<any[]> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const results = [];
      for (const query of queries) {
        const [result] = await connection.execute(query.sql, query.params);
        results.push(result);
      }

      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      console.error('Database transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  public async initializeDatabase(): Promise<void> {
    const createTablesQueries = [
      `CREATE TABLE IF NOT EXISTS buildings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        total_units INT DEFAULT 0,
        manager_name VARCHAR(255),
        manager_phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS units (
        id INT PRIMARY KEY AUTO_INCREMENT,
        building_id INT NOT NULL,
        unit_number VARCHAR(50) NOT NULL,
        area DECIMAL(10,2),
        floor_number INT,
        resident_name VARCHAR(255),
        resident_phone VARCHAR(20),
        rent_amount DECIMAL(15,0) DEFAULT 0,
        is_occupied BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
        UNIQUE KEY unique_unit_building (building_id, unit_number)
      )`,

      `CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        building_id INT NOT NULL,
        unit_id INT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15,0) NOT NULL,
        type ENUM('Income', 'Expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        transaction_date DATE NOT NULL,
        description TEXT,
        is_charge BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        building_id INT NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        role ENUM('admin', 'manager', 'accountant') DEFAULT 'manager',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        building_id INT NOT NULL,
        report_type VARCHAR(50) NOT NULL,
        period_start DATE,
        period_end DATE,
        total_income DECIMAL(15,0) DEFAULT 0,
        total_expenses DECIMAL(15,0) DEFAULT 0,
        net_balance DECIMAL(15,0) DEFAULT 0,
        generated_by INT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
        FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
      )`,

      `CREATE TABLE IF NOT EXISTS charge_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        building_id INT NOT NULL,
        charge_per_square_meter DECIMAL(10,2) DEFAULT 0,
        parking_charge DECIMAL(10,0) DEFAULT 0,
        other_fees DECIMAL(10,0) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
        UNIQUE KEY unique_building_charge (building_id)
      )`
    ];

    try {
      for (const query of createTablesQueries) {
        await this.query(query);
      }
      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating database tables:', error);
      throw error;
    }
  }
}

export const db = DatabaseConnection.getInstance();
