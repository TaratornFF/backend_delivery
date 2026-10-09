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

export const createCustomer = (req: Request, res: Response) => {
    const { firstname, lastname, phone, lat, lng } = req.body;
    db.run(`INSERT INTO customers (firstname, lastname, phone, lat, lng) VALUES (?, ?, ?, ?, ?)`,
        [firstname, lastname, phone, lat, lng], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID, firstname, lastname, phone, lat, lng });
        });
};

export const getCustomers = (req: Request, res: Response) => {
    db.all(`SELECT * FROM customers`, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
};

export const updateCustomer = (req: Request, res: Response) => {
    const { firstname, lastname, phone, lat, lng } = req.body;
    db.run(`UPDATE customers SET firstname = ?, lastname = ?, phone = ?, lat = ?, lng = ? WHERE id = ?`,
        [firstname, lastname, phone, lat, lng, req.params.id], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Customer updated successfully" });
        });
};

export const deleteCustomer = (req: Request, res: Response) => {
    db.run(`DELETE FROM customers WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Customer deleted successfully" });
    });
};

export const searchCustomers = (req: Request, res: Response) => {
    const { keyword } = req.query;
    const searchPattern = `%${keyword}%`;
    db.all(`SELECT * FROM customers WHERE firstname LIKE ? OR lastname LIKE ?`,
        [searchPattern, searchPattern], (err, rows) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json(rows);
        });
};

export const getNearbyCustomers = (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ error: "Invalid lat/lng" });

    db.all(`SELECT * FROM customers`, [], (err, rows: any[]) => {
        if (err) return res.status(400).json({ error: err.message });
        const nearby = rows.filter(c => calculateDistance(lat, lng, c.lat, c.lng) <= 1.0);
        res.json({ total: nearby.length, data: nearby });
    });
};
