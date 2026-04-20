import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, ProductSelectorItem } from "@/lib/types";

function isMissingColumnError(error: { code?: string } | null) {
  return error?.code === "42703";
}

export async function getProducts(searchTerm?: string) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("products")
    .select("id, name, barcode, price, size, stock_quantity, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (searchTerm) {
    const sanitized = searchTerm.replace(/,/g, "");
    query = query.or(`name.ilike.%${sanitized}%,barcode.ilike.%${sanitized}%`);
  }

  const { data, error } = await query;

  if (error && !isMissingColumnError(error)) {
    throw error;
  }

  if (!error) {
    return (data ?? []) as Product[];
  }

  // Backward compatibility when stock_quantity migration was not executed yet.
  let fallbackQuery = supabase
    .from("products")
    .select("id, name, barcode, price, size, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (searchTerm) {
    const sanitized = searchTerm.replace(/,/g, "");
    fallbackQuery = fallbackQuery.or(`name.ilike.%${sanitized}%,barcode.ilike.%${sanitized}%`);
  }

  const { data: fallbackData, error: fallbackError } = await fallbackQuery;

  if (fallbackError) {
    throw fallbackError;
  }

  return (fallbackData ?? []).map((product) => ({
    ...product,
    stock_quantity: 0,
  })) as Product[];
}

export async function getProductById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, barcode, price, size, stock_quantity, is_active, created_at, updated_at")
    .eq("id", id)
    .single();

  if (!error) {
    return data as Product;
  }

  if (!isMissingColumnError(error)) {
    return null;
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("products")
    .select("id, name, barcode, price, size, is_active, created_at, updated_at")
    .eq("id", id)
    .single();

  if (fallbackError) {
    return null;
  }

  return {
    ...fallbackData,
    stock_quantity: 0,
  } as Product;
}

export async function getProductsForSale() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, barcode, price, size, stock_quantity, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(250);

  if (!error) {
    return (data ?? []) as ProductSelectorItem[];
  }

  if (!isMissingColumnError(error)) {
    throw error;
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("products")
    .select("id, name, barcode, price, size, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(250);

  if (fallbackError) {
    throw fallbackError;
  }

  return (fallbackData ?? []).map((product) => ({
    ...product,
    stock_quantity: 0,
  })) as ProductSelectorItem[];
}
