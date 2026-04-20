import Link from "next/link";

import { HomeKpiCards } from "@/components/home-kpi-cards";
import { HomePeriodFilter } from "@/components/home-period-filter";
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
    <main className="space-y-6">
      <header className="sticky top-2 z-20 rounded-[1.6rem] border border-[var(--border)] bg-[rgba(255,255,255,0.78)] px-4 py-3 shadow-[0_10px_28px_rgba(103,139,184,0.10)] backdrop-blur md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight text-[var(--foreground)] md:text-3xl">
              Painel de Gestao
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Bem-vinda de volta. Aqui esta o resumo do seu atelie hoje.
            </p>
          </div>

          <div className="min-w-fit">
            <HomePeriodFilter />
          </div>
        </div>
      </header>

      <section>
        <HomeKpiCards
          totalSold={kpis.totalSold}
          totalPaid={kpis.totalPaid}
          totalOpen={kpis.totalOpen}
          totalOverdue={kpis.totalOverdue}
          period={selectedPeriod}
        />
      </section>

      <section className="rounded-[1.9rem] border border-[rgba(129,172,220,0.16)] bg-[rgba(244,250,255,0.55)] p-4 shadow-[0_16px_34px_rgba(103,139,184,0.08)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl leading-tight text-[var(--foreground)]">Historico por cliente</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Visualize e gerencie os recebiveis de cada cliente individualmente.
            </p>
          </div>
        </div>

        <form className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              🔎
            </span>
            <input
              type="text"
              name="q"
              defaultValue={customerSearch}
              placeholder="Pesquisar cliente pelo nome..."
              className="w-full rounded-[1.2rem] border border-[var(--border)] bg-white px-10 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[#95a8bd] focus:border-[#8ebbf3] focus:bg-white"
            />
          </div>
          <input type="hidden" name="period" value={selectedPeriod} />
          <div className="relative flex shrink-0 items-center justify-end md:w-auto">
            <Link
              href="/nova-venda"
              aria-label="Nova venda"
              className="absolute -top-14 right-0 inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[var(--foreground)] text-white shadow-[0_14px_34px_rgba(22,50,79,0.22)] transition hover:bg-[#0f2640] active:scale-95"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5v14M5 12h14"
                  stroke="#ffffff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
            <button
              type="submit"
              className="h-12 rounded-[1.2rem] bg-[var(--foreground)] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#0f2640]"
            >
              Buscar
            </button>
          </div>
        </form>

        <div className="mt-5">
          <SalesHistoryTable rows={historyRows} />
        </div>
      </section>
    </main>
  );
}
