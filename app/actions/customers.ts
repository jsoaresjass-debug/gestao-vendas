"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: string;
};

const customerSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo da cliente."),
  phone: z.string().trim().optional(),
  email: z
    .union([z.literal(""), z.email("Informe um e-mail valido.")])
    .optional()
    .transform((value) => value || null),
  is_active: z.enum(["true", "false"]).transform((value) => value === "true"),
});

function normalizePhone(value: string | undefined) {
  const sanitized = value?.trim();
  return sanitized ? sanitized : null;
}

export async function createCustomerAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    is_active: formData.get("is_active") ?? "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nao foi possivel cadastrar." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").insert({
    name: parsed.data.name,
    phone: normalizePhone(parsed.data.phone),
    email: parsed.data.email,
    is_active: parsed.data.is_active,
  });

  if (error) {
    return { error: "Falha ao salvar cliente. Confira se o banco ja foi criado." };
  }

  revalidatePath("/cadastro");
  revalidatePath("/home");
  return { success: "Cliente cadastrada com sucesso." };
}

export async function updateCustomerAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const customerId = formData.get("id");
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    is_active: formData.get("is_active") ?? "true",
  });

  if (typeof customerId !== "string" || !customerId) {
    return { error: "Cliente nao identificada." };
  }

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nao foi possivel atualizar." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      phone: normalizePhone(parsed.data.phone),
      email: parsed.data.email,
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) {
    return { error: "Falha ao atualizar cliente." };
  }

  revalidatePath("/cadastro");
  revalidatePath("/home");
  return { success: "Cadastro atualizado com sucesso." };
}
