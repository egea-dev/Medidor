import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'medidor_user',
    password: process.env.DB_PASSWORD || 'MedidorPass1234!',
    database: process.env.DB_NAME || 'medidor_egea',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const query = async (sql: string, params?: any[]) => {
    const [results] = await pool.execute(sql, params);
    return results;
};
