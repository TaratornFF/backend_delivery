import { Request, Response } from 'express';
import db from '../dbconnect';

// Haversine formula calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const createOrder = (req: Request, res: Response) => {
    const { customer_id, quantity } = req.body;
    db.run(`INSERT INTO orders (customer_id, quantity) VALUES (?, ?)`,
        [customer_id, quantity], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID, customer_id, quantity });
        });
};

export const getOrders = (req: Request, res: Response) => {
    db.all(`SELECT orders.id, orders.quantity, orders.order_date, customers.id as customer_id, customers.firstname, customers.lastname, customers.lat, customers.lng 
            FROM orders JOIN customers ON orders.customer_id = customers.id`, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
};

export const updateOrder = (req: Request, res: Response) => {
    const { quantity } = req.body;
    db.run(`UPDATE orders SET quantity = ? WHERE id = ?`,
        [quantity, req.params.id], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Order updated successfully" });
        });
};

export const deleteOrder = (req: Request, res: Response) => {
    db.run(`DELETE FROM orders WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Order deleted successfully" });
    });
};

export const mockOrders = (req: Request, res: Response) => {
    const mockCustomers = [
        ['John', 'Doe', '0801111111', 13.7563, 100.5018],
        ['Jane', 'Smith', '0802222222', 13.7570, 100.5020],
        ['Somchai', 'Jaidee', '0803333333', 13.7500, 100.4900],
        ['Suda', 'Rakngam', '0804444444', 13.7580, 100.5050],
        ['Piti', 'Maneerat', '0805555555', 13.7600, 100.5100]
    ];

    db.serialize(() => {
        const stmtCust = db.prepare(`INSERT INTO customers (firstname, lastname, phone, lat, lng) VALUES (?, ?, ?, ?, ?)`);
        mockCustomers.forEach(c => stmtCust.run(c));
        stmtCust.finalize();

        // เพิ่ม order_date เข้าไปในคำสั่ง SQL
        const stmtOrd = db.prepare(`INSERT INTO orders (customer_id, quantity, order_date) VALUES (?, ?, ?)`);
        
        for (let i = 0; i < 25; i++) {
            const randomCustomerId = Math.floor(Math.random() * 5) + 1;
            const randomQty = Math.floor(Math.random() * 3) + 1;

            // สุ่มเวลาสตรีมย้อนหลังไปในช่วง 24 ชั่วโมงที่ผ่านมา (หน่วยเป็นนาที)
            const randomMinutesAgo = Math.floor(Math.random() * 1440);
            const orderDate = new Date(Date.now() - randomMinutesAgo * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');

            stmtOrd.run(randomCustomerId, randomQty, orderDate);
        }
        stmtOrd.finalize();
    });

    res.json({ message: "Mock data generated successfully with random order dates." });
};

export const clearAllOrders = (req: Request, res: Response) => {
    db.run(`DELETE FROM orders`, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "All orders cleared successfully" });
    });
};

export const getNearbyOrders = (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ error: "Invalid lat/lng" });

    db.all(`SELECT orders.id, orders.quantity, orders.order_date, customers.id as customer_id, customers.firstname, customers.lat, customers.lng 
            FROM orders JOIN customers ON orders.customer_id = customers.id`, [], (err, rows: any[]) => {
        if (err) return res.status(400).json({ error: err.message });
        const nearby = rows.filter(o => calculateDistance(lat, lng, o.lat, o.lng) <= 2.0);
        res.json({ total: nearby.length, data: nearby });
    });
};
