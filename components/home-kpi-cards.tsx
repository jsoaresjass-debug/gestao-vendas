import { formatCurrency } from "@/lib/format";
import type { DashboardPeriod, HomeKpiTotals } from "@/lib/types";

type HomeKpiCardsProps = HomeKpiTotals & {
  period: DashboardPeriod;
};

const periodHint: Record<DashboardPeriod, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  all: "Todo o período",
};

function IconTrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16l4-4 4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 8h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPaid({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 11l3 3L22 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconOpen({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12V7H5a2 2 0 00-2 2v8a2 2 0 002 2h16v-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 10h18M16 16h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconOverdue({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10v4l2 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3h6M12 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeKpiCards({ totalSold, totalPaid, totalOpen, totalOverdue, period }: HomeKpiCardsProps) {
  const hintPeriod = periodHint[period];

  const items = [
    {
      label: "Total vendido",
      value: formatCurrency(totalSold),
      hint: hintPeriod,
      iconBox: "bg-[#e8f5ee] text-[#1f6b45]",
      Icon: IconTrendingUp,
    },
    {
      label: "Total pago",
      value: formatCurrency(totalPaid),
      hint: "Soma do já quitado nas vendas do período",
      iconBox: "bg-[#e0f2f1] text-[#0f5c57]",
      Icon: IconPaid,
    },
    {
      label: "Total em aberto",
      value: formatCurrency(totalOpen),
      hint: "Saldo ainda não pago nas vendas do período",
      iconBox: "bg-[#fff0e5] text-[#b45309]",
      Icon: IconOpen,
    },
    {
      label: "Total em atraso",
      value: formatCurrency(totalOverdue),
      hint: "Parcelas vencidas com valor restante (todas as vendas)",
      iconBox: "bg-[#fce8f0] text-[#9d174d]",
      Icon: IconOverdue,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-[1rem] border border-[rgba(129,172,220,0.16)] bg-white p-4 shadow-[0_10px_24px_rgba(103,139,184,0.07)]"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.75rem] ${item.iconBox}`}
            >
              <item.Icon className="h-5 w-5" />
            </div>
            <p className="min-w-0 text-[11px] font-medium leading-tight text-[var(--muted)]">{item.label}</p>
          </div>
          <p className="mt-3 text-[1.35rem] font-semibold leading-none tracking-tight text-[var(--foreground)]">
            {item.value}
          </p>
          <p className="mt-2 text-[10px] leading-snug text-[var(--muted)]">{item.hint}</p>
        </article>
      ))}
    </div>
  );
}
