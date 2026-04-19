import { MetricCard } from "@/components/metric-card";
import { Panel } from "@/components/panel";
import { requireUser } from "@/lib/auth";
import { getDashboardMetrics, getLateCustomersSnapshot } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/format";

export default async function HomePage() {
  await requireUser();

  const [metrics, lateCustomers] = await Promise.all([
    getDashboardMetrics(),
    getLateCustomersSnapshot(),
  ]);

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold text-slate-950">Resumo da operacao</h2>
        <p className="text-slate-500">
          Acompanhe vendas, pagamentos e a saude da sua base de clientes em tempo real.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total vendido" value={formatCurrency(metrics.totalSold)} />
        <MetricCard label="Total em aberto" value={formatCurrency(metrics.totalOutstanding)} />
        <MetricCard label="Clientes cadastradas" value={String(metrics.totalCustomers)} />
        <MetricCard label="Clientes ativas" value={String(metrics.activeCustomers)} />
        <MetricCard
          label="Clientes com pagamentos em dia"
          value={String(metrics.customersUpToDate)}
        />
        <MetricCard
          label="Clientes com pagamentos atrasados"
          value={String(metrics.customersLate)}
        />
        <MetricCard label="Produtos vendidos" value={String(metrics.productsSold)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Como os indicadores sao calculados"
          description="Os dados sao lidos das tabelas customers, sales e sale_items no Supabase."
        >
          <ul className="space-y-3 text-sm text-slate-600">
            <li>Total vendido soma o valor total de cada venda registrada.</li>
            <li>Total em aberto considera apenas os saldos pendentes das vendas.</li>
            <li>
              Clientes em dia sao as clientes sem parcelas em atraso e sem valores pendentes.
            </li>
            <li>Produtos vendidos e a soma das quantidades dos itens em cada venda.</li>
          </ul>
        </Panel>

        <Panel
          title="Clientes com atencao imediata"
          description="As proximas clientes com valores vencidos ajudam a priorizar cobranca."
        >
          <div className="space-y-3">
            {lateCustomers.length ? (
              lateCustomers.map((sale) => (
                <div key={sale.id} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-900">
                    {(sale.customers as { name?: string } | null)?.name ?? "Cliente"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Venceu em {sale.due_date} com saldo de{" "}
                    {formatCurrency(Number(sale.outstanding_amount))}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma cliente com pagamento atrasado no momento.
              </p>
            )}
          </div>
        </Panel>
      </section>
    </main>
  );
}
