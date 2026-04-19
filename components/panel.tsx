import { ReactNode } from "react";

type PanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function Panel({ title, description, children }: PanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
