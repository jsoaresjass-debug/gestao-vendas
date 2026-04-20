import Link from "next/link";

import { HomeKpiCards } from "@/components/home-kpi-cards";
import { HomePeriodFilter } from "@/components/home-period-filter";
import { Panel } from "@/components/panel";
import { SalesHistoryTable } from "@/components/sales-history-table";
import { requireUser } from "@/lib/auth";
import { getHomeKpiTotals, getSalesHistoryRows } from "@/lib/dashboard";
import type { DashboardPeriod } from "@/lib/types";

type HomePageProps = {
  searchParams: Promise<{
    period?: string;
    q?: string;
  }>;
};

function getSelectedPeriod(period?: string): DashboardPeriod {
  if (period === "7d" || period === "30d" || period === "90d" || period === "all") {
    return period;
  }

  return "30d";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  await requireUser();
  const params = await searchParams;
  const selectedPeriod = getSelectedPeriod(params.period);
  const customerSearch = params.q?.trim() ?? "";

  const [kpis, historyRows] = await Promise.all([
    getHomeKpiTotals(selectedPeriod),
    getSalesHistoryRows(selectedPeriod, customerSearch),
  ]);

  return (
    <main className="space-y-4">
      <HomeKpiCards
        totalSold={kpis.totalSold}
        totalPaid={kpis.totalPaid}
        totalOpen={kpis.totalOpen}
        totalOverdue={kpis.totalOverdue}
        period={selectedPeriod}
      />

      <section className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,247,255,0.96))] p-4 shadow-[0_16px_30px_rgba(103,139,184,0.08)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">
            Historico de vendas
          </p>
          <h1 className="mt-1.5 text-[1.75rem] leading-[0.98] text-[var(--foreground)]">
            Vendas por cliente no periodo selecionado.
          </h1>
          <p className="mt-1 max-w-[40rem] text-xs text-[var(--muted)]">
            Registre uma nova compra na tela dedicada ou pelo menu na barra lateral.
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-stretch gap-4 sm:items-end">
          <Link
            href="/nova-venda"
            className="inline-flex items-center justify-center rounded-[1.15rem] bg-[var(--accent)] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_rgba(76,142,217,0.35)] transition hover:bg-[#3e7fc8]"
          >
            Nova venda
          </Link>
          <div className="min-w-fit">
            <p className="text-xs font-medium text-[var(--muted)]">Filtrar periodo</p>
            <HomePeriodFilter />
          </div>
        </div>
      </section>

      <Panel
        title="Historico por cliente"
        description="Pesquise pelo nome da cliente e veja vendas, parcelas em aberto/pagas, valor nominal da parcela e status."
      >
        <form className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={customerSearch}
            placeholder="Pesquisar cliente pelo nome"
            className="min-w-0 flex-1 rounded-[1.15rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[#95a8bd] focus:border-[#8ebbf3] focus:bg-white"
          />
          <input type="hidden" name="period" value={selectedPeriod} />
          <button
            type="submit"
            className="rounded-[1.15rem] border border-[var(--border)] bg-[#f4f9ff] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] transition hover:border-[#bfd8f6] hover:bg-white"
          >
            Buscar
          </button>
        </form>

        <SalesHistoryTable rows={historyRows} />
      </Panel>
    </main>
  );
}
