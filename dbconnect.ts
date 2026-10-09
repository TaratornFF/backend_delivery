import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./lunchbox.db', (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Connected to SQLite database.');
        db.serialize(() => {
            // บังคับลบตารางเก่าทิ้ง เพื่อให้สร้างใหม่พร้อมฟิลด์ order_date แน่นอน
            db.run(`DROP TABLE IF EXISTS orders`);
            db.run(`DROP TABLE IF EXISTS customers`);

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
            )`);
        });
    }
});

export default db;