export type PaymentStatus = "paid" | "partial" | "pending" | "overdue";
export type DashboardPeriod = "7d" | "30d" | "90d" | "all";

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
  installment_interval_days?: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  size?: "P" | "M" | "G" | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type SaleInstallment = {
  id: string;
  sale_id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: PaymentStatus;
  created_at: string;
};

export type SaleWithItems = Sale & {
  sale_items: SaleItem[];
  sale_installments: SaleInstallment[];
};

export type CustomerWithHistory = Customer & {
  sales: SaleWithItems[];
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

/** KPIs do topo da Home (respeitam o periodo selecionado, exceto atrasos em parcelas). */
export type HomeKpiTotals = {
  totalSold: number;
  totalPaid: number;
  totalOpen: number;
  totalOverdue: number;
};

export type DashboardOverdueRow = {
  id: string;
  customerId: string;
  customerName: string;
  dueDate: string | null;
  outstandingAmount: number;
  paymentStatus: PaymentStatus;
  daysOverdue: number;
};

export type DashboardRecentSaleRow = {
  id: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  outstandingAmount: number;
  paymentStatus: PaymentStatus;
};

/** Linha do histórico na Home (inclui totais de parcelas quando existem em `sale_installments`). */
export type SaleHistoryRow = DashboardRecentSaleRow & {
  openInstallmentCount: number;
  paidInstallmentCount: number;
  /** Valor médio nominal da parcela no plano (soma dos amount / total de parcelas). */
  installmentNominalValue: number;
  /** Próxima parcela em aberto (para dar baixa rápido). */
  nextInstallmentId?: string | null;
  nextInstallmentLabel?: string | null;
  nextInstallmentDueDate?: string | null;
  isNextInstallmentOverdue?: boolean;
  /** Parcelas em aberto para seleção múltipla na Home. */
  openInstallments?: Array<{
    id: string;
    label: string;
    remaining: number;
    dueDate: string;
    isOverdue: boolean;
  }>;
};

export type DashboardOpenBalanceRow = {
  id: string;
  customerId: string;
  customerName: string;
  dueDate: string | null;
  outstandingAmount: number;
  paymentStatus: PaymentStatus;
};

export type DashboardOpenSaleRow = {
  id: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  totalPaid: number;
  totalRemaining: number;
  paymentStatus: PaymentStatus;
  nextInstallmentId: string | null;
  nextInstallmentLabel: string | null;
  nextInstallmentAmount: number;
  pendingInstallments: number;
};

export type CustomerSelectorItem = Pick<
  Customer,
  "id" | "name" | "phone" | "email" | "is_active"
>;

export type ProductSelectorItem = Pick<
  Product,
  "id" | "name" | "barcode" | "price" | "stock_quantity" | "is_active"
>;

export type CustomerWorkspace = Customer & {
  sales: SaleWithItems[];
  summary: {
    totalOrders: number;
    totalSold: number;
    totalOutstanding: number;
    lastSaleDate: string | null;
  };
};
