export interface Order {
    id?: number;
    customer_id: number;
    quantity: number;
    order_date?: string;
}