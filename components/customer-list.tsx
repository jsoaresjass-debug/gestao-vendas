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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        Nenhuma cliente encontrada para os filtros atuais.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <article key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">{customer.name}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    customer.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {customer.is_active ? "Ativa" : "Inativa"}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {customer.phone || "Sem telefone"} • {customer.email || "Sem e-mail"}
              </p>
            </div>

            <Link
              href={`/cadastro?edit=${customer.id}`}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            >
              Editar cadastro
            </Link>
          </div>

          <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800">
              Historico de compras ({customer.sales.length})
            </summary>

            <div className="mt-4 space-y-3">
              {customer.sales.length ? (
                customer.sales.map((sale) => (
                  <div key={sale.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          Venda em {formatDate(sale.sale_date)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Vencimento: {formatDate(sale.due_date)}
                        </p>
                      </div>
                      <div className="text-sm text-slate-600">
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
                            className="flex flex-col justify-between gap-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 md:flex-row"
                          >
                            <span>{item.product_name}</span>
                            <span>
                              {item.quantity} x {formatCurrency(Number(item.unit_price))}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Sem itens registrados nessa venda.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Esta cliente ainda nao possui compras registradas.</p>
              )}
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}
