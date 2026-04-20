type MetricCardProps = {
  label: string;
  value: string;
  helperText?: string;
};

export function MetricCard({ label, value, helperText }: MetricCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[1.8rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,252,248,0.96),rgba(249,242,235,0.88))] p-5 shadow-[0_18px_45px_rgba(79,54,40,0.08)] transition hover:-translate-y-0.5">
      <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(190,154,133,0.9),transparent)]" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-4 text-4xl leading-none text-[var(--foreground)]">{value}</p>
      {helperText ? (
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{helperText}</p>
      ) : null}
    </article>
  );
}
