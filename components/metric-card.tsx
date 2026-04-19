type MetricCardProps = {
  label: string;
  value: string;
  helperText?: string;
};

export function MetricCard({ label, value, helperText }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {helperText ? <p className="mt-2 text-sm text-slate-500">{helperText}</p> : null}
    </article>
  );
}
