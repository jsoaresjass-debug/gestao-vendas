export type PaymentStatus = "paid" | "partial" | "pending" | "overdue";

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Sale = {
  id: string;
  customer_id: string;
  total_amount: number;
  outstanding_amount: number;
  payment_status: PaymentStatus;
  sale_date: string;
  due_date: string | null;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type CustomerWithHistory = Customer & {
  sales: (Sale & {
    sale_items: SaleItem[];
  })[];
};

export type DashboardMetrics = {
  totalSold: number;
  totalOutstanding: number;
  totalCustomers: number;
  activeCustomers: number;
  customersUpToDate: number;
  customersLate: number;
  productsSold: number;
};
