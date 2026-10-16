import { createPool } from 'mysql2/promise';

export const conn = createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'tripbooking',
    password: process.env.DB_PASSWORD || 'tripbooking@csmsu',
    database: process.env.DB_NAME || 'tripbooking',
    
    ssl: {
        rejectUnauthorized: false
    }
});