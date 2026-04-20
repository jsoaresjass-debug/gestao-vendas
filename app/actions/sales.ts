"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
  success?: string;
};

const deleteSaleItemSchema = z.object({
  saleId: z.uuid("Venda nao identificada."),
  saleItemId: z.uuid("Item nao identificado."),
});

const saleSchema = z.object({
  customerId: z.uuid("Cliente nao identificada."),
  saleDate: z.string().min(1, "Informe a data da venda."),
  firstDueDate: z.string().min(1, "Informe o primeiro vencimento."),
  installmentCount: z.coerce
    .number()
    .int("Informe uma quantidade valida de parcelas.")
    .min(1, "Informe pelo menos uma parcela.")
    .max(24, "Use no maximo 24 parcelas."),
  installmentIntervalDays: z
    .union([z.literal("15"), z.literal("30")])
    .transform((value) => Number(value)),
  initialPaidAmount: z.coerce.number().min(0, "Informe um valor de entrada valido."),
});

const saleItemSchema = z.object({
  productId: z.uuid("Produto nao identificado."),
  productName: z.string().trim().min(2, "Informe o nome do produto."),
  quantity: z.coerce.number().int().min(1, "Quantidade invalida."),
  unitPrice: z.coerce.number().min(0, "Valor unitario invalido."),
});

function getPaymentStatus(outstandingAmount: number, dueDate: string) {
  if (outstandingAmount <= 0) {
    return "paid" as const;
  }

  if (new Date(`${dueDate}T00:00:00`) < new Date()) {
    return "overdue" as const;
  }

  return "pending" as const;
}

function splitAmount(totalAmount: number, installmentCount: number) {
  const totalInCents = Math.round(totalAmount * 100);
  const baseAmount = Math.floor(totalInCents / installmentCount);
  const remainder = totalInCents % installmentCount;

  return Array.from({ length: installmentCount }, (_, index) => {
    const amountInCents = baseAmount + (index < remainder ? 1 : 0);
    return amountInCents / 100;
  });
}

function addDays(baseDate: string, daysToAdd: number) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function getInstallmentStatus(amount: number, paidAmount: number, dueDate: string) {
  if (paidAmount >= amount && amount > 0) {
    return "paid" as const;
  }

  if (paidAmount > 0) {
    return "partial" as const;
  }

  if (new Date(`${dueDate}T00:00:00`) < new Date()) {
    return "overdue" as const;
  }

  return "pending" as const;
}

export async function deleteSaleItemAction(formData: FormData) {
  const parsed = deleteSaleItemSchema.safeParse({
    saleId: formData.get("sale_id"),
    saleItemId: formData.get("sale_item_id"),
  });

  if (!parsed.success) {
    return;
  }

  const supabase = await createSupabaseServerClient();

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("id, total_amount, outstanding_amount, payment_status, due_date")
    .eq("id", parsed.data.saleId)
    .single();

  if (saleError || !sale) {
    return;
  }

  const { data: saleItem, error: itemError } = await supabase
    .from("sale_items")
    .select("id, sale_id, product_id, quantity, unit_price")
    .eq("id", parsed.data.saleItemId)
    .eq("sale_id", parsed.data.saleId)
    .single();

  if (itemError || !saleItem) {
    return;
  }

  const itemTotal = toNumber(saleItem.unit_price) * toNumber(saleItem.quantity);
  const oldTotal = toNumber(sale.total_amount);
  const oldOutstanding = toNumber(sale.outstanding_amount);
  const oldPaid = Math.max(oldTotal - oldOutstanding, 0);

  const newTotal = Math.max(oldTotal - itemTotal, 0);
  const newOutstanding = Math.max(newTotal - oldPaid, 0);

  const { error: deleteError } = await supabase
    .from("sale_items")
    .delete()
    .eq("id", saleItem.id);

  if (deleteError) {
    return;
  }

  // Restore stock (when the sale item is linked to a product).
  if (saleItem.product_id) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock_quantity")
      .eq("id", saleItem.product_id)
      .single();

    if (!productError && product) {
      const updatedStock = toNumber(product.stock_quantity) + toNumber(saleItem.quantity);
      await supabase
        .from("products")
        .update({ stock_quantity: updatedStock, updated_at: new Date().toISOString() })
        .eq("id", product.id);
    }
  }

  // Recalculate installments plan if it exists.
  const { data: installments, error: installmentsError } = await supabase
    .from("sale_installments")
    .select("id, installment_number, total_installments, amount, paid_amount, due_date")
    .eq("sale_id", parsed.data.saleId)
    .order("installment_number", { ascending: true });

  if (!installmentsError && installments && installments.length) {
    const planCount = installments[0]?.total_installments ?? installments.length;
    const planBase = newOutstanding > 0 ? newOutstanding : newTotal;
    const newAmounts = splitAmount(planBase, planCount);

    for (const installment of installments) {
      const newAmount = newAmounts[(installment.installment_number ?? 1) - 1] ?? 0;
      const paidAmount = Math.min(toNumber(installment.paid_amount), newAmount);
      const status = getInstallmentStatus(newAmount, paidAmount, installment.due_date);

      await supabase
        .from("sale_installments")
        .update({
          amount: Number(newAmount.toFixed(2)),
          paid_amount: Number(paidAmount.toFixed(2)),
          status,
        })
        .eq("id", installment.id);
    }
  }

  // Update sale payment status.
  let paymentStatus: "paid" | "partial" | "pending" | "overdue" = "pending";
  if (newOutstanding <= 0) {
    paymentStatus = "paid";
  } else if (sale.due_date && new Date(`${sale.due_date}T00:00:00`) < new Date()) {
    paymentStatus = "overdue";
  } else if (oldPaid > 0) {
    paymentStatus = "partial";
  }

  await supabase
    .from("sales")
    .update({
      total_amount: Number(newTotal.toFixed(2)),
      outstanding_amount: Number(newOutstanding.toFixed(2)),
      payment_status: paymentStatus,
    })
    .eq("id", parsed.data.saleId);

  revalidatePath("/home");
  revalidatePath("/cadastro");
}

export async function createSaleAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsedSale = saleSchema.safeParse({
    customerId: formData.get("customer_id"),
    saleDate: formData.get("sale_date"),
    firstDueDate: formData.get("first_due_date"),
    installmentCount: formData.get("installment_count"),
    installmentIntervalDays: formData.get("installment_interval_days") ?? "30",
    initialPaidAmount: formData.get("initial_paid_amount") ?? "0",
  });

  const productIds = formData.getAll("item_product_id");
  const productNames = formData.getAll("item_product_name");
  const quantities = formData.getAll("item_quantity");
  const unitPrices = formData.getAll("item_unit_price");

  const parsedItems = productNames.map((productName, index) =>
    saleItemSchema.safeParse({
      productId: productIds[index],
      productName,
      quantity: quantities[index],
      unitPrice: unitPrices[index],
    }),
  );

  if (!parsedSale.success) {
    return { error: parsedSale.error.issues[0]?.message ?? "Nao foi possivel salvar a venda." };
  }

  const invalidItem = parsedItems.find((item) => !item.success);

  if (invalidItem && !invalidItem.success) {
    return { error: invalidItem.error.issues[0]?.message ?? "Revise os itens da venda." };
  }

  const items = parsedItems
    .filter((item): item is { success: true; data: z.infer<typeof saleItemSchema> } => item.success)
    .map((item) => item.data);

  if (!items.length) {
    return { error: "Adicione pelo menos um item na venda." };
  }

  const totalAmount = items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );

  if (parsedSale.data.initialPaidAmount > totalAmount) {
    return { error: "A entrada nao pode ser maior que o total da venda." };
  }

  const outstandingAmount = Number((totalAmount - parsedSale.data.initialPaidAmount).toFixed(2));
  const paymentStatus = getPaymentStatus(outstandingAmount, parsedSale.data.firstDueDate);
  const installmentAmounts = splitAmount(
    outstandingAmount > 0 ? outstandingAmount : totalAmount,
    parsedSale.data.installmentCount,
  );
  const supabase = await createSupabaseServerClient();
  const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
  const { data: stockRows, error: stockError } = await supabase
    .from("products")
    .select("id, stock_quantity")
    .in("id", uniqueProductIds);

  if (stockError || !stockRows) {
    return { error: "Nao foi possivel validar o estoque dos produtos." };
  }

  const stockMap = new Map(
    stockRows.map((product) => [product.id, Number(product.stock_quantity ?? 0)]),
  );

  const insufficientStockItem = items.find((item) => {
    const availableStock = stockMap.get(item.productId) ?? 0;
    return item.quantity > availableStock;
  });

  if (insufficientStockItem) {
    const availableStock = stockMap.get(insufficientStockItem.productId) ?? 0;
    return {
      error: `Estoque insuficiente para ${insufficientStockItem.productName}. Disponivel: ${availableStock}.`,
    };
  }

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      customer_id: parsedSale.data.customerId,
      total_amount: totalAmount,
      outstanding_amount: outstandingAmount,
      payment_status: outstandingAmount > 0 && parsedSale.data.initialPaidAmount > 0 ? "partial" : paymentStatus,
      sale_date: parsedSale.data.saleDate,
      due_date: parsedSale.data.firstDueDate,
      installment_interval_days: parsedSale.data.installmentIntervalDays,
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    return { error: "Falha ao registrar venda." };
  }

  const { error: itemsError } = await supabase.from("sale_items").insert(
    items.map((item) => ({
      sale_id: sale.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  );

  if (itemsError) {
    return { error: "A venda foi criada, mas os itens nao puderam ser salvos." };
  }

  const { error: installmentsError } = await supabase.from("sale_installments").insert(
    installmentAmounts.map((amount, index) => ({
      sale_id: sale.id,
      installment_number: index + 1,
      total_installments: parsedSale.data.installmentCount,
      amount,
      paid_amount: outstandingAmount === 0 ? amount : 0,
      due_date: addDays(
        parsedSale.data.firstDueDate,
        index * parsedSale.data.installmentIntervalDays,
      ),
      status:
        outstandingAmount === 0
          ? "paid"
          : getPaymentStatus(
              amount,
              addDays(
                parsedSale.data.firstDueDate,
                index * parsedSale.data.installmentIntervalDays,
              ),
            ),
    })),
  );

  if (installmentsError) {
    return { error: "A venda foi criada, mas as parcelas nao puderam ser salvas." };
  }

  for (const item of items) {
    const availableStock = stockMap.get(item.productId) ?? 0;
    const { error: updateStockError } = await supabase
      .from("products")
      .update({
        stock_quantity: Math.max(availableStock - item.quantity, 0),
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.productId);

    if (updateStockError) {
      return { error: "Venda registrada, mas o estoque nao foi atualizado corretamente." };
    }
  }

  revalidatePath("/home");
  revalidatePath("/cadastro");
  revalidatePath("/produtos");
  return { success: "Venda registrada com sucesso." };
}
