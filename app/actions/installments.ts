"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const settleSchema = z.object({
  saleId: z.uuid("Venda nao identificada."),
  installmentId: z.uuid("Parcela nao identificada."),
});

type InstallmentRow = {
  id: string;
  amount: number | string;
  paid_amount: number | string;
  due_date: string;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export async function settleInstallmentAction(formData: FormData) {
  const parsed = settleSchema.safeParse({
    saleId: formData.get("sale_id"),
    installmentId: formData.get("installment_id"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { data: installment, error: installmentError } = await supabase
    .from("sale_installments")
    .select("id, sale_id, amount, paid_amount")
    .eq("id", parsed.data.installmentId)
    .eq("sale_id", parsed.data.saleId)
    .single();

  if (installmentError || !installment) {
    return;
  }

  const amount = toNumber(installment.amount);
  const paidAmount = toNumber(installment.paid_amount);
  const updatedPaidAmount = Math.min(amount, paidAmount + (amount - paidAmount));

  const { error: updateInstallmentError } = await supabase
    .from("sale_installments")
    .update({
      paid_amount: updatedPaidAmount,
      status: updatedPaidAmount >= amount ? "paid" : "partial",
    })
    .eq("id", installment.id);

  if (updateInstallmentError) {
    return;
  }

  const { data: installments, error: allInstallmentsError } = await supabase
    .from("sale_installments")
    .select("id, amount, paid_amount, due_date")
    .eq("sale_id", parsed.data.saleId);

  if (allInstallmentsError || !installments) {
    return;
  }

  const totalAmount = (installments as InstallmentRow[]).reduce(
    (sum, row) => sum + toNumber(row.amount),
    0,
  );
  const totalPaid = (installments as InstallmentRow[]).reduce(
    (sum, row) => sum + toNumber(row.paid_amount),
    0,
  );
  const totalOutstanding = Math.max(totalAmount - totalPaid, 0);
  const hasOverdue = (installments as InstallmentRow[]).some(
    (row) => toNumber(row.paid_amount) < toNumber(row.amount) && new Date(row.due_date) < new Date(),
  );

  let paymentStatus: "paid" | "partial" | "pending" | "overdue" = "pending";

  if (totalOutstanding <= 0) {
    paymentStatus = "paid";
  } else if (hasOverdue) {
    paymentStatus = "overdue";
  } else if (totalPaid > 0) {
    paymentStatus = "partial";
  }

  await supabase
    .from("sales")
    .update({
      outstanding_amount: Number(totalOutstanding.toFixed(2)),
      payment_status: paymentStatus,
    })
    .eq("id", parsed.data.saleId);

  revalidatePath("/home");
  revalidatePath("/cadastro");
}
