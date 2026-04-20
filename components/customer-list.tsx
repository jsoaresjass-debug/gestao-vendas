import Link from "next/link";

import { formatCurrency, formatDate } from "@/lib/format";
import type { CustomerWithHistory } from "@/lib/types";

type CustomerListProps = {
  customers: CustomerWithHistory[];
};

const paymentStatusLabels: Record<string, string> = {
  paid: "Pago",
  partial: "Parcial",
  pending: "Pendente",
  overdue: "Atrasado",
};

const tone = {
  active: {
    card: "rounded-[1.8rem] border border-[#8fbf99] bg-[linear-gradient(165deg,#e8f8ea,#c5e6cb)] p-5 shadow-[0_16px_44px_rgba(28,90,42,0.16)]",
    badge: "bg-[#1f5c2e] text-white shadow-[0_2px_8px_rgba(20,70,32,0.25)]",
    contact: "text-[#2d4d34]",
    link: "border-[#6aa678] bg-white/80 text-[#143d1c] hover:border-[#3d8f52] hover:bg-white",
    details:
      "border-[#7eb88a] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(210,235,216,0.75))]",
    sale: "border-[#9cc9a5] bg-white/92",
    itemRow: "bg-[rgba(180,220,188,0.55)]",
  },
  inactive: {
    card: "rounded-[1.8rem] border border-[#d87878] bg-[linear-gradient(165deg,#ffecec,#f0a8a8)] p-5 shadow-[0_16px_44px_rgba(120,28,35,0.18)]",
    badge: "bg-[#7a1c1c] text-white shadow-[0_2px_8px_rgba(90,20,22,0.3)]",
    contact: "text-[#5c2828]",
    link: "border-[#c45c5c] bg-white/80 text-[#3d1010] hover:border-[#9a2a2a] hover:bg-white",
    details:
      "border-[#e08080] bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,200,200,0.72))]",
    sale: "border-[#e09090] bg-white/92",
    itemRow: "bg-[rgba(255,200,200,0.55)]",
  },
} as const;

export function CustomerList({ customers }: CustomerListProps) {
  if (!customers.length) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-[#cfb7a8] bg-[rgba(255,251,247,0.78)] px-6 py-12 text-center text-sm text-[var(--muted)]">
        Nenhuma cliente encontrada para os filtros atuais.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => {
        const t = customer.is_active ? tone.active : tone.inactive;
        return (
          <article key={customer.id} className={t.card}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[1.8rem] leading-none text-[var(--foreground)]">
                  {customer.name}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${t.badge}`}
                >
                  {customer.is_active ? "Ativa" : "Inativa"}
                </span>
              </div>
              <p className={`text-sm ${t.contact}`}>
                {customer.phone || "Sem telefone"} • {customer.email || "Sem e-mail"}
              </p>
            </div>

            <Link
              href={`/cadastro?edit=${customer.id}`}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${t.link}`}
            >
              Editar cadastro
            </Link>
          </div>

          <details className={`mt-5 rounded-[1.5rem] border p-4 ${t.details}`}>
            <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">
              Historico de compras ({customer.sales.length})
            </summary>

            <div className="mt-4 space-y-3">
              {customer.sales.length ? (
                customer.sales.map((sale) => (
                  <div key={sale.id} className={`rounded-[1.25rem] border p-4 ${t.sale}`}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          Venda em {formatDate(sale.sale_date)}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          Vencimento: {formatDate(sale.due_date)}
                        </p>
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        <p>Total: {formatCurrency(Number(sale.total_amount))}</p>
                        <p>Em aberto: {formatCurrency(Number(sale.outstanding_amount))}</p>
                        <p>Status: {paymentStatusLabels[sale.payment_status] ?? sale.payment_status}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {sale.sale_items.length ? (
                        sale.sale_items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex flex-col justify-between gap-1 rounded-xl px-3 py-2 text-sm text-[var(--muted)] md:flex-row ${t.itemRow}`}
                          >
                            <span>{item.product_name}</span>
                            <span>
                              {item.quantity} x {formatCurrency(Number(item.unit_price))}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[var(--muted)]">
                          Sem itens registrados nessa venda.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Esta cliente ainda nao possui compras registradas.
                </p>
              )}
            </div>
          </details>
          </article>
        );
      })}
    </div>
  );
}
