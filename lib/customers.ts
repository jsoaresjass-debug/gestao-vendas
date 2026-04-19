import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerWithHistory } from "@/lib/types";

export async function getCustomersWithHistory(searchTerm?: string) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("customers")
    .select(
      "id, name, phone, email, is_active, created_at, updated_at, sales(id, customer_id, total_amount, outstanding_amount, payment_status, sale_date, due_date, created_at, sale_items(id, sale_id, product_name, quantity, unit_price))",
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
