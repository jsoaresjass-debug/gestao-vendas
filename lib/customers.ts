import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CustomerSelectorItem,
  CustomerWithHistory,
  CustomerWorkspace,
  SaleWithItems,
} from "@/lib/types";

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export async function getCustomersWithHistory(searchTerm?: string) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("customers")
    .select(
      "id, name, phone, email, is_active, created_at, updated_at, sales(id, customer_id, total_amount, outstanding_amount, payment_status, sale_date, due_date, created_at, sale_items(id, sale_id, product_id, product_name, quantity, unit_price), sale_installments(id, sale_id, installment_number, total_installments, amount, paid_amount, due_date, status, created_at))",
    )
    .order("created_at", { ascending: false });

  if (searchTerm) {
    const sanitized = searchTerm.replace(/,/g, "");
    query = query.or(
      `name.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,email.ilike.%${sanitized}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CustomerWithHistory[];
}

export async function getCustomerById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, email, is_active, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getCustomersForSelector(searchTerm?: string) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("customers")
    .select("id, name, phone, email, is_active")
    .order("name", { ascending: true })
    .limit(12);

  if (searchTerm) {
    const sanitized = searchTerm.replace(/,/g, "");
    query = query.or(
      `name.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,email.ilike.%${sanitized}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CustomerSelectorItem[];
}

export async function getCustomerWorkspaceById(id: string): Promise<CustomerWorkspace | null> {
  const supabase = await createSupabaseServerClient();

  const [{ data: customer, error: customerError }, { data: sales, error: salesError }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, phone, email, is_active, created_at, updated_at")
        .eq("id", id)
        .single(),
      supabase
        .from("sales")
        .select(
          "id, customer_id, total_amount, outstanding_amount, payment_status, sale_date, due_date, created_at, sale_items(id, sale_id, product_id, product_name, quantity, unit_price), sale_installments(id, sale_id, installment_number, total_installments, amount, paid_amount, due_date, status, created_at)",
        )
        .eq("customer_id", id)
        .order("sale_date", { ascending: false }),
    ]);

  if (customerError || !customer) {
    return null;
  }

  if (salesError) {
    throw salesError;
  }

  const salesList = ((sales ?? []) as SaleWithItems[]).map((sale) => ({
    ...sale,
    sale_items: sale.sale_items ?? [],
    sale_installments: sale.sale_installments ?? [],
  }));

  return {
    ...customer,
    sales: salesList,
    summary: {
      totalOrders: salesList.length,
      totalSold: salesList.reduce((total, sale) => total + toNumber(sale.total_amount), 0),
      totalOutstanding: salesList.reduce(
        (total, sale) => total + toNumber(sale.outstanding_amount),
        0,
      ),
      lastSaleDate: salesList[0]?.sale_date ?? null,
    },
  };
}
