import express from 'express';
import cors from 'cors';
import { 
    createCustomer, getCustomers, updateCustomer, deleteCustomer, searchCustomers, getNearbyCustomers 
} from './controller/customer';
import { 
    createOrder, getOrders, updateOrder, deleteOrder, mockOrders, clearAllOrders, getNearbyOrders 
} from './controller/order';

const app = express();

app.use(cors());
app.use(express.json());

// Customer Routes
app.post('/api/customers', createCustomer);
app.get('/api/customers', getCustomers);
app.put('/api/customers/:id', updateCustomer);
app.delete('/api/customers/:id', deleteCustomer);
app.get('/api/customers/search', searchCustomers);
app.get('/api/customers/nearby', getNearbyCustomers);

// Order Routes
app.post('/api/orders', createOrder);
app.get('/api/orders', getOrders);
app.put('/api/orders/:id', updateOrder);
app.delete('/api/orders/:id', deleteOrder);
app.post('/api/orders/mock', mockOrders);
app.delete('/api/orders/clear-all', clearAllOrders);
app.get('/api/orders/nearby', getNearbyOrders);

export default app;
