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
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,252,248,0.95),rgba(246,236,226,0.88))] p-7 shadow-[0_20px_50px_rgba(79,54,40,0.08)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            Ingria Modas
          </p>
          <h2 className="mt-3 text-5xl leading-[0.95] text-[var(--foreground)]">
            Resumo elegante da operacao da boutique.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
            Visualize o desempenho de vendas, a carteira de clientes e os pagamentos em um
            painel pensado para leitura rapida e apresentacao mais refinada.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[rgba(49,36,32,0.96)] p-7 text-white shadow-[0_20px_50px_rgba(41,27,20,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
            Radar financeiro
          </p>
          <p className="mt-4 text-4xl">{formatCurrency(metrics.totalOutstanding)}</p>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Valor total em aberto para acompanhar de perto e agir com mais rapidez nas
            cobrancas.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-white/10 bg-white/8 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Em dia</p>
              <p className="mt-2 text-2xl">{metrics.customersUpToDate}</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/8 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">
                Atrasadas
              </p>
              <p className="mt-2 text-2xl">{metrics.customersLate}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total vendido"
          value={formatCurrency(metrics.totalSold)}
          helperText="Volume comercial acumulado nas vendas registradas."
        />
        <MetricCard
          label="Total em aberto"
          value={formatCurrency(metrics.totalOutstanding)}
          helperText="Saldo financeiro que ainda precisa de acompanhamento."
        />
        <MetricCard
          label="Clientes cadastradas"
          value={String(metrics.totalCustomers)}
          helperText="Base total de relacionamento ativo no sistema."
        />
        <MetricCard
          label="Clientes ativas"
          value={String(metrics.activeCustomers)}
          helperText="Clientes com cadastro marcado como ativo."
        />
        <MetricCard
          label="Clientes com pagamentos em dia"
          value={String(metrics.customersUpToDate)}
          helperText="Perfis sem valores pendentes ou vencidos."
        />
        <MetricCard
          label="Clientes com pagamentos atrasados"
          value={String(metrics.customersLate)}
          helperText="Perfis que exigem contato e acompanhamento imediato."
        />
        <MetricCard
          label="Produtos vendidos"
          value={String(metrics.productsSold)}
          helperText="Quantidade de itens movimentados nas vendas registradas."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Leitura comercial do painel"
          description="Os dados sao lidos das tabelas customers, sales e sale_items para manter o acompanhamento consistente."
        >
          <ul className="space-y-3 text-sm leading-7 text-[var(--muted)]">
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
          description="Uma vitrine rapida das clientes que pedem contato prioritario."
        >
          <div className="space-y-3">
            {lateCustomers.length ? (
              lateCustomers.map((sale) => (
                <div
                  key={sale.id}
                  className="rounded-[1.3rem] border border-[var(--border)] bg-[rgba(247,239,231,0.65)] px-4 py-4"
                >
                  <p className="font-medium text-[var(--foreground)]">
                    {(sale.customers as { name?: string } | null)?.name ?? "Cliente"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Venceu em {sale.due_date} com saldo de{" "}
                    {formatCurrency(Number(sale.outstanding_amount))}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                Nenhuma cliente com pagamento atrasado no momento.
              </p>
            )}
          </div>
        </Panel>
      </section>
    </main>
  );
}
