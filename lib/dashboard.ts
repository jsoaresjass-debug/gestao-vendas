import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Customer, DashboardMetrics, Sale } from "@/lib/types";

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createSupabaseServerClient();

  const [{ data: customers }, { data: sales }, { data: saleItems }] = await Promise.all([
    supabase.from("customers").select("*"),
    supabase.from("sales").select("*"),
    supabase.from("sale_items").select("quantity"),
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

export async function getLateCustomersSnapshot() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("sales")
    .select("id, customer_id, outstanding_amount, due_date, customers(name)")
    .gt("outstanding_amount", 0)
    .order("due_date", { ascending: true })
    .limit(5);

  return data ?? [];
}
