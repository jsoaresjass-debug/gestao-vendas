"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: string;
};

const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto."),
  barcode: z.string().trim().min(4, "Informe o codigo da etiqueta."),
  price: z.coerce.number().min(0, "Informe um preco valido."),
  size: z
    .enum(["P", "M", "G"])
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  stock_quantity: z.coerce.number().int("Informe um estoque inteiro.").min(0, "Estoque invalido."),
  is_active: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export async function createProductAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    barcode: formData.get("barcode"),
    price: formData.get("price"),
    size: formData.get("size") ?? null,
    stock_quantity: formData.get("stock_quantity"),
    is_active: formData.get("is_active") ?? "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nao foi possivel cadastrar o produto." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").insert(parsed.data);

  if (error) {
    return { error: "Falha ao salvar produto. Verifique se o codigo ja existe." };
  }

  revalidatePath("/produtos");
  return { success: "Produto cadastrado com sucesso." };
}

export async function updateProductAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = formData.get("id");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    barcode: formData.get("barcode"),
    price: formData.get("price"),
    size: formData.get("size") ?? null,
    stock_quantity: formData.get("stock_quantity"),
    is_active: formData.get("is_active") ?? "true",
  });

  if (typeof productId !== "string" || !productId) {
    return { error: "Produto nao identificado." };
  }

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nao foi possivel atualizar o produto." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return { error: "Falha ao atualizar produto." };
  }

  revalidatePath("/produtos");
  return { success: "Produto atualizado com sucesso." };
}
