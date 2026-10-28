import { Request, Response } from 'express';
import { conn } from '../dbconnect';

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
}
//kuy44

export const createOrder = async (req: Request, res: Response) => {
    const { customer_id, quantity } = req.body;
    try {
        const [result]: any = await conn.execute(
            `INSERT INTO orders (customer_id, quantity) VALUES (?, ?)`,
            [customer_id, quantity]
        );
        res.json({ id: result.insertId, customer_id, quantity });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const [rows] = await conn.execute(`
            SELECT orders.id, orders.quantity, orders.order_date, 
                   customers.id as customer_id, customers.firstname, customers.lastname, 
                   customers.lat, customers.lng 
            FROM orders JOIN customers ON orders.customer_id = customers.id
        `);
        res.json(rows);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    const { quantity } = req.body;
    try {
        await conn.execute(`UPDATE orders SET quantity = ? WHERE id = ?`, [quantity, req.params.id]);
        res.json({ message: "Order updated successfully" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        await conn.execute(`DELETE FROM orders WHERE id = ?`, [req.params.id]);
        res.json({ message: "Order deleted successfully" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const mockOrders = async (req: Request, res: Response) => {
    const mockCustomers = [
        ['John', 'Doe', '0801111111', 13.7563, 100.5018],
        ['Jane', 'Smith', '0802222222', 13.7570, 100.5020],
        ['Somchai', 'Jaidee', '0803333333', 13.7500, 100.4900],
        ['Suda', 'Rakngam', '0804444444', 13.7580, 100.5050],
        ['Piti', 'Maneerat', '0805555555', 13.7600, 100.5100]
    ];

    try {
        for (const c of mockCustomers) {
            await conn.execute(`INSERT INTO customers (firstname, lastname, phone, lat, lng) VALUES (?, ?, ?, ?, ?)`, c);
        }

        for (let i = 0; i < 25; i++) {
            const randomCustomerId = Math.floor(Math.random() * 5) + 1;
            const randomQty = Math.floor(Math.random() * 3) + 1;
            const randomMinutesAgo = Math.floor(Math.random() * 1440);
            const orderDate = new Date(Date.now() - randomMinutesAgo * 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
            
            await conn.execute(`INSERT INTO orders (customer_id, quantity, order_date) VALUES (?, ?, ?)`, 
                [randomCustomerId, randomQty, orderDate]);
        }
        res.json({ message: "Mock data generated successfully with random order dates." });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const clearAllOrders = async (req: Request, res: Response) => {
    try {
        await conn.execute(`DELETE FROM orders`);
        res.json({ message: "All orders cleared successfully" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getNearbyOrders = async (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ error: "Invalid lat/lng" });

    try {
        const [rows]: any = await conn.execute(`
            SELECT orders.id, orders.quantity, orders.order_date, 
                   customers.id as customer_id, customers.firstname, customers.lat, customers.lng 
            FROM orders JOIN customers ON orders.customer_id = customers.id
        `);
        const nearby = rows.filter((o: any) => calculateDistance(lat, lng, o.lat, o.lng) <= 2.0);
        res.json({ total: nearby.length, data: nearby });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};