import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./lunchbox.db', (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Connected to SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstname TEXT,
                lastname TEXT,
                phone TEXT,
                lat REAL,
                lng REAL
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                quantity INTEGER,
                order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )`, () => {
                // คำสั่งช่วยเติมคอลัมน์ order_date อัตโนมัติ หากตารางเดิมยังไม่มีคอลัมน์นี้
                db.run(`ALTER TABLE orders ADD COLUMN order_date DATETIME DEFAULT CURRENT_TIMESTAMP`, (alterErr) => {
                    // ถ้ามีคอลัมน์อยู่แล้ว ระบบจะแจ้งเตือน Error ซึ่งปล่อยผ่านได้เลย
                });
            });
        });
    }
});

export default db;