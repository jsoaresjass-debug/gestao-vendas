"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const settleSchema = z.object({
  saleId: z.uuid("Venda nao identificada."),
  installmentId: z.uuid("Parcela nao identificada."),
});

const settleManySchema = z.object({
  saleId: z.uuid("Venda nao identificada."),
  installmentIds: z.array(z.uuid("Parcela nao identificada.")).min(1),
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

async function recalcSaleFromInstallments(saleId: string, installments: InstallmentRow[]) {
  const totalAmount = installments.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const totalPaid = installments.reduce((sum, row) => sum + toNumber(row.paid_amount), 0);
  const totalOutstanding = Math.max(totalAmount - totalPaid, 0);
  const hasOverdue = installments.some(
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

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("sales")
    .update({
      outstanding_amount: Number(totalOutstanding.toFixed(2)),
      payment_status: paymentStatus,
    })
    .eq("id", saleId);
}

async function settleInstallmentsInternal(saleId: string, installmentIds: string[]) {
  const supabase = await createSupabaseServerClient();

  const { data: installmentsToSettle, error } = await supabase
    .from("sale_installments")
    .select("id, sale_id, amount, paid_amount")
    .eq("sale_id", saleId)
    .in("id", installmentIds);

  if (error || !installmentsToSettle?.length) {
    return;
  }

  for (const installment of installmentsToSettle) {
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
  }

  const { data: allInstallments, error: allInstallmentsError } = await supabase
    .from("sale_installments")
    .select("id, amount, paid_amount, due_date")
    .eq("sale_id", saleId);

  if (allInstallmentsError || !allInstallments) {
    return;
  }

  await recalcSaleFromInstallments(saleId, allInstallments as InstallmentRow[]);

  revalidatePath("/home");
  revalidatePath("/cadastro");
  // The detailed history page is keyed by customer id, not sale id, so we can't reliably target it here.
}

export async function settleInstallmentsAction(formData: FormData) {
  const saleId = formData.get("sale_id");
  const installmentIds = formData.getAll("installment_id");

  const parsed = settleManySchema.safeParse({
    saleId,
    installmentIds,
  });

  if (!parsed.success) {
    return;
  }

  await settleInstallmentsInternal(parsed.data.saleId, parsed.data.installmentIds);
}

export async function settleInstallmentAction(formData: FormData) {
  const parsed = settleSchema.safeParse({
    saleId: formData.get("sale_id"),
    installmentId: formData.get("installment_id"),
  });

  if (!parsed.success) {
    return;
  }

  await settleInstallmentsInternal(parsed.data.saleId, [parsed.data.installmentId]);
}
