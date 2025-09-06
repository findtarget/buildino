// src/lib/db/connection.ts
import mysql from 'mysql2/promise';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'buildino',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+00:00'
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T> {
    try {
      console.log('Executing SQL:', sql);
      
      // تبدیل پارامترها به نوع مناسب برای MySQL
      const safeParams = params.map(param => {
        if (param === null || param === undefined) {
          return null;
        }
        if (typeof param === 'boolean') {
          return param ? 1 : 0;
        }
        if (typeof param === 'number') {
          return param;
        }
        if (typeof param === 'string') {
          return param;
        }
        // برای انواع پیچیده‌تر، آن‌ها را به رشته تبدیل کن
        return String(param);
      });
      
      console.log('With params:', safeParams);

      // استفاده از query به جای execute
      const [rows] = await this.pool.query(sql, safeParams);
      return rows as T;
    } catch (error) {
      console.error('Database query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  public async transaction(queries: { sql: string; params?: any[] }[]): Promise<any[]> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const results = [];
      for (const query of queries) {
        const safeParams = (query.params || []).map(param => {
          if (param === null || param === undefined) {
            return null;
          }
          if (typeof param === 'boolean') {
            return param ? 1 : 0;
          }
          if (typeof param === 'number') {
            return param;
          }
          if (typeof param === 'string') {
            return param;
          }
          return String(param);
        });
        
        // استفاده از query به جای execute در transaction هم
        const [result] = await connection.query(query.sql, safeParams);
        results.push(result);
      }

      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = DatabaseConnection.getInstance();
