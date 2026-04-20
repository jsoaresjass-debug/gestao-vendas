type MetricCardProps = {
  label: string;
  value: string;
  helperText?: string;
  compact?: boolean;
};

export function MetricCard({ label, value, helperText, compact = false }: MetricCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(244,250,255,0.98),rgba(233,245,255,0.96))] shadow-[0_12px_24px_rgba(103,139,184,0.08)] transition hover:-translate-y-0.5 ${compact ? "p-3" : "p-4"}`}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(142,187,243,0.95),transparent)]" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
      <p className={`leading-none text-[var(--foreground)] ${compact ? "mt-2 text-[1.45rem]" : "mt-2.5 text-[1.95rem]"}`}>
        {value}
      </p>
      {helperText ? (
        <p
          className={`text-[var(--muted)] ${
            compact ? "mt-1.5 text-[10px] leading-[1rem]" : "mt-2 text-[11px] leading-[1.1rem]"
          }`}
        >
          {helperText}
        </p>
      ) : null}
    </article>
  );
}
