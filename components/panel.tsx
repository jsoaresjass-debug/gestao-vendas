import { ReactNode } from "react";

type PanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Panel({ title, description, children }: PanelProps) {
  return (
    <section className="rounded-[1.9rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_50px_rgba(79,54,40,0.08)] backdrop-blur md:p-7">
      <div className="mb-5 border-b border-[rgba(84,60,47,0.08)] pb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
          Ingria Modas
        </p>
        <h2 className="text-[2rem] leading-none text-[var(--foreground)]">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
