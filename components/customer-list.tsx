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
      {customers.map((customer) => (
        <article
          key={customer.id}
          className="rounded-[1.8rem] border border-[var(--border)] bg-[rgba(255,252,248,0.82)] p-5 shadow-[0_16px_40px_rgba(79,54,40,0.06)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[1.8rem] leading-none text-[var(--foreground)]">
                  {customer.name}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    customer.is_active
                      ? "bg-[#e7f0e8] text-[#4b6552]"
                      : "bg-[#ece3db] text-[#7a685f]"
                  }`}
                >
                  {customer.is_active ? "Ativa" : "Inativa"}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)]">
                {customer.phone || "Sem telefone"} • {customer.email || "Sem e-mail"}
              </p>
            </div>

            <Link
              href={`/cadastro?edit=${customer.id}`}
              className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[#c6a795] hover:bg-white"
            >
              Editar cadastro
            </Link>
          </div>

          <details className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-[rgba(247,239,231,0.65)] p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">
              Historico de compras ({customer.sales.length})
            </summary>

            <div className="mt-4 space-y-3">
              {customer.sales.length ? (
                customer.sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="rounded-[1.25rem] border border-[var(--border)] bg-white/85 p-4"
                  >
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
                            className="flex flex-col justify-between gap-1 rounded-xl bg-[rgba(247,239,231,0.7)] px-3 py-2 text-sm text-[var(--muted)] md:flex-row"
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
      ))}
    </div>
  );
}
