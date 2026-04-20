import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteSaleItemAction } from "@/app/actions/sales";
import { settleInstallmentAction } from "@/app/actions/installments";
import { Panel } from "@/components/panel";
import { requireUser } from "@/lib/auth";
import { getCustomerWorkspaceById } from "@/lib/customers";
import { formatCurrency, formatDate } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export default async function CustomerHistoryPage({ params }: PageProps) {
  await requireUser();
  const { id } = await params;
  const workspace = await getCustomerWorkspaceById(id);

  if (!workspace) {
    notFound();
  }

  return (
    <main className="space-y-5">
      <section className="flex flex-col gap-3 rounded-[1.7rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,247,255,0.96))] p-5 shadow-[0_16px_30px_rgba(103,139,184,0.08)] md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            Historico da cliente
          </p>
          <h1 className="mt-2 text-3xl leading-[1.02] text-[var(--foreground)]">{workspace.name}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Total vendido: {formatCurrency(toNumber(workspace.summary.totalSold))} • Em aberto:{" "}
            {formatCurrency(toNumber(workspace.summary.totalOutstanding))}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/home"
            className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] transition hover:bg-[#f4f9ff]"
          >
            Voltar
          </Link>
          <Link
            href={`/cadastro?edit=${workspace.id}`}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#3e7fc8]"
          >
            Editar cadastro
          </Link>
        </div>
      </section>

      <Panel
        title="Vendas e parcelas"
        description="Use 'Dar baixa' para quitar a proxima parcela e 'Excluir item' para remover um item vendido (ajusta total, em aberto e estoque quando o produto estiver vinculado)."
      >
        <div className="space-y-4">
          {workspace.sales.map((sale) => {
            const pendingInstallments = (sale.sale_installments ?? [])
              .filter((i) => toNumber(i.paid_amount) < toNumber(i.amount))
              .sort((a, b) => a.installment_number - b.installment_number);
            const nextInstallment = pendingInstallments[0];

            return (
              <article
                key={sale.id}
                className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[0_12px_28px_rgba(103,139,184,0.06)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Venda em {formatDate(sale.sale_date)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Total: {formatCurrency(toNumber(sale.total_amount))} • Em aberto:{" "}
                      {formatCurrency(toNumber(sale.outstanding_amount))}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Vencimento: {sale.due_date ? formatDate(sale.due_date) : "—"}
                    </p>
                  </div>

                  {nextInstallment ? (
                    <form action={settleInstallmentAction} className="flex items-center gap-2">
                      <input type="hidden" name="sale_id" value={sale.id} />
                      <input type="hidden" name="installment_id" value={nextInstallment.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#3e7fc8]"
                      >
                        Dar baixa {nextInstallment.installment_number}/{nextInstallment.total_installments}
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-full border border-[var(--border)] bg-[#f4f9ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]">
                      Sem parcelas em aberto
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(244,250,255,0.72)] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      Itens vendidos
                    </p>
                    <div className="mt-3 space-y-2">
                      {(sale.sale_items ?? []).length ? (
                        sale.sale_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2 rounded-[1rem] border border-[rgba(129,172,220,0.18)] bg-white px-3 py-2 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-[var(--muted)]">
                                {item.quantity} x {formatCurrency(toNumber(item.unit_price))}
                              </p>
                            </div>

                            <form action={deleteSaleItemAction}>
                              <input type="hidden" name="sale_id" value={sale.id} />
                              <input type="hidden" name="sale_item_id" value={item.id} />
                              <button
                                type="submit"
                                className="rounded-full border border-[#e6c9cc] bg-[#fff1f2] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8c4b57] transition hover:bg-white"
                              >
                                Excluir item
                              </button>
                            </form>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--muted)]">Sem itens registrados.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(244,250,255,0.72)] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      Parcelas
                    </p>
                    <div className="mt-3 space-y-2">
                      {(sale.sale_installments ?? []).length ? (
                        sale.sale_installments
                          .slice()
                          .sort((a, b) => a.installment_number - b.installment_number)
                          .map((inst) => {
                            const amount = toNumber(inst.amount);
                            const paid = toNumber(inst.paid_amount);
                            const remaining = Math.max(amount - paid, 0);
                            const isOpen = remaining > 0;
                            return (
                              <div
                                key={inst.id}
                                className="flex flex-col gap-1 rounded-[1rem] border border-[rgba(129,172,220,0.18)] bg-white px-3 py-2 md:flex-row md:items-center md:justify-between"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-[var(--foreground)]">
                                    {inst.installment_number}/{inst.total_installments} •{" "}
                                    {formatDate(inst.due_date)}
                                  </p>
                                  <p className="text-xs text-[var(--muted)]">
                                    Valor: {formatCurrency(amount)} • Pago: {formatCurrency(paid)} • Restante:{" "}
                                    {formatCurrency(remaining)}
                                  </p>
                                </div>

                                {isOpen ? (
                                  <form action={settleInstallmentAction}>
                                    <input type="hidden" name="sale_id" value={sale.id} />
                                    <input type="hidden" name="installment_id" value={inst.id} />
                                    <button
                                      type="submit"
                                      className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition hover:bg-[#f4f9ff]"
                                    >
                                      Dar baixa
                                    </button>
                                  </form>
                                ) : (
                                  <span className="rounded-full bg-[#e2efff] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3d6fa8]">
                                    Pago
                                  </span>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-xs text-[var(--muted)]">Sem parcelas registradas.</p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {!workspace.sales.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#bfd8f6] bg-[rgba(244,250,255,0.82)] px-6 py-10 text-center text-sm text-[var(--muted)]">
              Nenhuma venda registrada para esta cliente.
            </div>
          ) : null}
        </div>
      </Panel>
    </main>
  );
}

