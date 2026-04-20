import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Customer,
  DashboardMetrics,
  DashboardOpenBalanceRow,
  DashboardOpenSaleRow,
  DashboardOverdueRow,
  DashboardPeriod,
  DashboardRecentSaleRow,
  HomeKpiTotals,
  PaymentStatus,
  Sale,
  SaleHistoryRow,
} from "@/lib/types";

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

type SaleWithCustomerRecord = {
  id: string;
  customer_id: string;
  total_amount: number | string | null;
  outstanding_amount: number | string | null;
  payment_status: PaymentStatus;
  sale_date: string;
  due_date: string | null;
  customers: { name?: string | null } | { name?: string | null }[] | null;
};

type SaleInstallmentRecord = {
  id: string;
  installment_number: number;
  amount: number | string | null;
  paid_amount: number | string | null;
  total_installments: number;
  due_date: string;
  status: PaymentStatus;
};

type SaleWithInstallmentsRecord = SaleWithCustomerRecord & {
  sale_installments: SaleInstallmentRecord[] | null;
};

function getCustomerName(customer: SaleWithCustomerRecord["customers"]) {
  if (Array.isArray(customer)) {
    return customer[0]?.name ?? "Cliente";
  }

  return customer?.name ?? "Cliente";
}

function getDaysOverdue(dueDate: string | null) {
  if (!dueDate) {
    return 0;
  }

  const today = new Date();
  const due = new Date(`${dueDate}T00:00:00`);
  const diff = today.getTime() - due.getTime();

  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

function getPeriodStartDate(period: DashboardPeriod) {
  if (period === "all") {
    return null;
  }

  const daysMap: Record<Exclude<DashboardPeriod, "all">, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  const date = new Date();
  date.setDate(date.getDate() - daysMap[period]);
  return date.toISOString().slice(0, 10);
}

export async function getDashboardMetrics(period: DashboardPeriod = "all"): Promise<DashboardMetrics> {
  const supabase = await createSupabaseServerClient();
  const periodStart = getPeriodStartDate(period);

  let salesQuery = supabase.from("sales").select("*");
  let saleItemsQuery = supabase.from("sale_items").select("quantity, sales!inner(sale_date)");

  if (periodStart) {
    salesQuery = salesQuery.gte("sale_date", periodStart);
    saleItemsQuery = saleItemsQuery.gte("sales.sale_date", periodStart);
  }

  const [{ data: customers }, { data: sales }, { data: saleItems }] = await Promise.all([
    supabase.from("customers").select("*"),
    salesQuery,
    saleItemsQuery,
  ]);

  const customerList = (customers ?? []) as Customer[];
  const saleList = (sales ?? []) as Sale[];
  const itemList = saleItems ?? [];

  const lateCustomers = new Set(
    saleList
      .filter(
        (sale) =>
          toNumber(sale.outstanding_amount) > 0 &&
          sale.due_date &&
          new Date(sale.due_date) < new Date(),
      )
      .map((sale) => sale.customer_id),
  );

  const customersWithOpenPayments = new Set(
    saleList
      .filter((sale) => toNumber(sale.outstanding_amount) > 0)
      .map((sale) => sale.customer_id),
  );

  const totalSold = saleList.reduce((total, sale) => total + toNumber(sale.total_amount), 0);
  const totalOutstanding = saleList.reduce(
    (total, sale) => total + toNumber(sale.outstanding_amount),
    0,
  );

  return {
    totalSold,
    totalOutstanding,
    totalCustomers: customerList.length,
    activeCustomers: customerList.filter((customer) => customer.is_active).length,
    customersUpToDate: customerList.filter(
      (customer) => !lateCustomers.has(customer.id) && !customersWithOpenPayments.has(customer.id),
    ).length,
    customersLate: lateCustomers.size,
    productsSold: itemList.reduce((total, item) => total + toNumber(item.quantity), 0),
  };
}

export async function getLateCustomersSnapshot(
  period: DashboardPeriod = "all",
): Promise<DashboardOverdueRow[]> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const periodStart = getPeriodStartDate(period);
  let query = supabase
    .from("sales")
    .select("id, customer_id, outstanding_amount, payment_status, sale_date, due_date, customers(name)")
    .gt("outstanding_amount", 0)
    .not("due_date", "is", null)
    .lt("due_date", today)
    .order("due_date", { ascending: true })
    .limit(8);

  if (periodStart) {
    query = query.gte("sale_date", periodStart);
  }

  const { data } = await query;

  return ((data ?? []) as SaleWithCustomerRecord[]).map((sale) => ({
    id: sale.id,
    customerId: sale.customer_id,
    customerName: getCustomerName(sale.customers),
    dueDate: sale.due_date,
    outstandingAmount: toNumber(sale.outstanding_amount),
    paymentStatus: sale.payment_status,
    daysOverdue: getDaysOverdue(sale.due_date),
  }));
}

export async function getRecentSalesSnapshot(
  period: DashboardPeriod = "all",
): Promise<DashboardRecentSaleRow[]> {
  const supabase = await createSupabaseServerClient();
  const periodStart = getPeriodStartDate(period);
  let query = supabase
    .from("sales")
    .select("id, customer_id, total_amount, outstanding_amount, payment_status, sale_date, customers(name)")
    .order("sale_date", { ascending: false })
    .limit(8);

  if (periodStart) {
    query = query.gte("sale_date", periodStart);
  }

  const { data } = await query;

  return ((data ?? []) as SaleWithCustomerRecord[]).map((sale) => ({
    id: sale.id,
    customerId: sale.customer_id,
    customerName: getCustomerName(sale.customers),
    saleDate: sale.sale_date,
    totalAmount: toNumber(sale.total_amount),
    outstandingAmount: toNumber(sale.outstanding_amount),
    paymentStatus: sale.payment_status,
  }));
}

function mapSaleToHistoryRow(sale: SaleWithInstallmentsRecord): SaleHistoryRow {
  const installments = sale.sale_installments ?? [];
  const totalAmount = toNumber(sale.total_amount);
  const outstandingAmount = toNumber(sale.outstanding_amount);

  if (!installments.length) {
    const openInstallmentCount = outstandingAmount > 0 ? 1 : 0;
    const paidInstallmentCount = outstandingAmount <= 0 && totalAmount > 0 ? 1 : 0;
    return {
      id: sale.id,
      customerId: sale.customer_id,
      customerName: getCustomerName(sale.customers),
      saleDate: sale.sale_date,
      totalAmount,
      outstandingAmount,
      paymentStatus: sale.payment_status,
      openInstallmentCount,
      paidInstallmentCount,
      installmentNominalValue: totalAmount,
    };
  }

  const openInstallmentCount = installments.filter(
    (installment) => toNumber(installment.paid_amount) < toNumber(installment.amount),
  ).length;
  const paidInstallmentCount = installments.filter(
    (installment) => toNumber(installment.paid_amount) >= toNumber(installment.amount),
  ).length;
  const totalInstallmentAmount = installments.reduce(
    (sum, installment) => sum + toNumber(installment.amount),
    0,
  );
  const planCount = installments[0]?.total_installments ?? installments.length;
  const installmentNominalValue = planCount ? totalInstallmentAmount / planCount : totalAmount;

  return {
    id: sale.id,
    customerId: sale.customer_id,
    customerName: getCustomerName(sale.customers),
    saleDate: sale.sale_date,
    totalAmount,
    outstandingAmount,
    paymentStatus: sale.payment_status,
    openInstallmentCount,
    paidInstallmentCount,
    installmentNominalValue,
  };
}

/** Histórico de vendas (mais linhas) com filtro opcional por nome da cliente. */
export async function getSalesHistoryRows(
  period: DashboardPeriod = "all",
  customerSearchTerm = "",
): Promise<SaleHistoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const periodStart = getPeriodStartDate(period);
  let query = supabase
    .from("sales")
    .select(
      "id, customer_id, total_amount, outstanding_amount, payment_status, sale_date, customers(name), sale_installments(id, installment_number, amount, paid_amount, total_installments, due_date, status)",
    )
    .order("sale_date", { ascending: false })
    .limit(250);

  if (periodStart) {
    query = query.gte("sale_date", periodStart);
  }

  const { data } = await query;

  const rows = ((data ?? []) as SaleWithInstallmentsRecord[]).map(mapSaleToHistoryRow);

  const normalized = customerSearchTerm.trim().toLowerCase();
  if (!normalized) {
    return rows;
  }

  return rows.filter((row) => row.customerName.toLowerCase().includes(normalized));
}

export async function getHomeKpiTotals(period: DashboardPeriod): Promise<HomeKpiTotals> {
  const supabase = await createSupabaseServerClient();
  const periodStart = getPeriodStartDate(period);
  let query = supabase.from("sales").select("total_amount, outstanding_amount");

  if (periodStart) {
    query = query.gte("sale_date", periodStart);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  let totalSold = 0;
  let totalOpen = 0;

  for (const row of rows) {
    totalSold += toNumber(row.total_amount);
    totalOpen += toNumber(row.outstanding_amount);
  }

  const totalPaid = totalSold - totalOpen;
  const totalOverdue = await getOverdueInstallmentsRemaining();

  return {
    totalSold,
    totalPaid,
    totalOpen,
    totalOverdue,
  };
}

export async function getOpenBalancesSnapshot(
  period: DashboardPeriod = "all",
): Promise<DashboardOpenBalanceRow[]> {
  const supabase = await createSupabaseServerClient();
  const periodStart = getPeriodStartDate(period);
  let query = supabase
    .from("sales")
    .select("id, customer_id, outstanding_amount, payment_status, sale_date, due_date, customers(name)")
    .gt("outstanding_amount", 0)
    .order("outstanding_amount", { ascending: false })
    .limit(6);

  if (periodStart) {
    query = query.gte("sale_date", periodStart);
  }

  const { data } = await query;

  return ((data ?? []) as SaleWithCustomerRecord[]).map((sale) => ({
    id: sale.id,
    customerId: sale.customer_id,
    customerName: getCustomerName(sale.customers),
    dueDate: sale.due_date,
    outstandingAmount: toNumber(sale.outstanding_amount),
    paymentStatus: sale.payment_status,
  }));
}

export async function getTotalReceivableOpenSales(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("sales").select("outstanding_amount").gt("outstanding_amount", 0);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce((sum, row) => sum + toNumber(row.outstanding_amount), 0);
}

/** Soma do valor em aberto de parcelas com vencimento anterior a hoje (valor restante por parcela). */
export async function getOverdueInstallmentsRemaining(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase.from("sale_installments").select("amount, paid_amount, due_date");

  if (error) {
    return 0;
  }

  return (data ?? []).reduce((sum, row) => {
    if (!row.due_date || row.due_date >= today) {
      return sum;
    }

    const remaining = toNumber(row.amount) - toNumber(row.paid_amount);
    return sum + Math.max(0, remaining);
  }, 0);
}

export async function getOpenSalesRows(
  period: DashboardPeriod = "all",
  customerSearchTerm = "",
): Promise<DashboardOpenSaleRow[]> {
  const supabase = await createSupabaseServerClient();
  const periodStart = getPeriodStartDate(period);
  let query = supabase
    .from("sales")
    .select(
      "id, customer_id, total_amount, outstanding_amount, payment_status, sale_date, due_date, customers(name), sale_installments(id, installment_number, amount, paid_amount, total_installments, due_date, status)",
    )
    .gt("outstanding_amount", 0)
    .order("sale_date", { ascending: false })
    .limit(40);

  if (periodStart) {
    query = query.gte("sale_date", periodStart);
  }

  const { data } = await query;

  const normalizedSearch = customerSearchTerm.trim().toLowerCase();

  return ((data ?? []) as SaleWithInstallmentsRecord[])
    .filter((sale) => {
      if (!normalizedSearch) {
        return true;
      }

      return getCustomerName(sale.customers).toLowerCase().includes(normalizedSearch);
    })
    .map((sale) => {
      const installments = sale.sale_installments ?? [];
      const pendingInstallments = installments
        .filter((installment) => toNumber(installment.paid_amount) < toNumber(installment.amount))
        .sort((a, b) => a.installment_number - b.installment_number);
      const nextInstallment = pendingInstallments[0];
    const installmentCount = installments[0]?.total_installments ?? 1;
    const totalRemaining = toNumber(sale.outstanding_amount);
    const totalAmount = toNumber(sale.total_amount);
    const totalPaid = totalAmount - totalRemaining;
    const totalInstallmentAmount = installments.reduce(
      (sum, installment) => sum + toNumber(installment.amount),
      0,
    );

      return {
        id: sale.id,
        customerId: sale.customer_id,
        customerName: getCustomerName(sale.customers),
        saleDate: sale.sale_date,
        totalAmount,
        installmentCount,
        installmentAmount: installmentCount ? totalInstallmentAmount / installmentCount : totalRemaining,
        totalPaid,
        totalRemaining,
        paymentStatus: sale.payment_status,
        nextInstallmentId: nextInstallment?.id ?? null,
        nextInstallmentLabel: nextInstallment
          ? `${nextInstallment.installment_number}/${nextInstallment.total_installments}`
          : null,
        nextInstallmentAmount: nextInstallment
          ? toNumber(nextInstallment.amount) - toNumber(nextInstallment.paid_amount)
          : 0,
        pendingInstallments: pendingInstallments.length,
      };
    });
}
