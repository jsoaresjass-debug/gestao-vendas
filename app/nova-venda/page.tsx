import Link from "next/link";

import { SaleForm } from "@/components/sale-form";
import { requireUser } from "@/lib/auth";
import { getCustomersForSelector } from "@/lib/customers";
import { getProductsForSale } from "@/lib/products";

export default async function NovaVendaPage() {
  await requireUser();

  const [customers, products] = await Promise.all([getCustomersForSelector(), getProductsForSale()]);

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,247,255,0.96))] p-4 shadow-[0_12px_28px_rgba(103,139,184,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Nova venda</p>
          <h1 className="mt-1.5 text-[1.5rem] leading-tight text-[var(--foreground)]">
            Incluir cliente, produtos e condicoes de parcelamento.
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            O historico de vendas por cliente fica na Home.
          </p>
        </div>
        <Link
          href="/home"
          className="shrink-0 rounded-[0.95rem] border border-[var(--border)] bg-white px-4 py-2.5 text-center text-xs font-semibold text-[var(--foreground)] transition hover:border-[#8ebbf3]"
        >
          Ver historico na Home
        </Link>
      </div>

      <div className="min-h-0 min-w-0 flex-1">
        <SaleForm mode="page" customers={customers} products={products} showTrigger={false} />
      </div>
    </main>
  );
}
