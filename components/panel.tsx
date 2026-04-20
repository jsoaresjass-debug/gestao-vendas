import { ReactNode } from "react";

type PanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Panel({ title, description, children }: PanelProps) {
  return (
    <section className="rounded-[1.45rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,248,255,0.96))] p-4 shadow-[0_16px_30px_rgba(103,139,184,0.08)] backdrop-blur md:p-4.5">
      <div className="mb-3 border-b border-[rgba(129,172,220,0.14)] pb-3">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Ingria Modas
        </p>
        <h2 className="text-[1.35rem] leading-none text-[var(--foreground)]">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[11px] leading-[1.1rem] text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
