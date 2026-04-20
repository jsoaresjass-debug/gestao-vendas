import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-[86vh] items-center py-8">
      <section className="grid overflow-hidden rounded-[2.2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_32px_100px_rgba(77,55,42,0.08)] backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex min-h-[360px] flex-col justify-between bg-[linear-gradient(135deg,#efe4da,#dcc8bb)] px-8 py-10 text-[var(--foreground)] md:px-12 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_35%)]" />
          <div className="relative space-y-6">
            <span className="inline-flex rounded-full border border-[rgba(84,60,47,0.12)] bg-white/45 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--muted)]">
              Ingria Modas
            </span>
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-[var(--muted)]">
                Gestao de Vendas
              </p>
              <h1 className="max-w-xl text-5xl leading-[0.95] md:text-6xl">
                Sua loja sob controle.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-[var(--muted)] md:text-base">
                Vendas, clientes e pagamentos em um so lugar.
              </p>
            </div>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-[rgba(84,60,47,0.12)] bg-white/45 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">Clientes</p>
              <p className="mt-2 text-2xl">Base ativa</p>
            </div>
            <div className="rounded-[1.4rem] border border-[rgba(84,60,47,0.12)] bg-white/45 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">Vendas</p>
              <p className="mt-2 text-2xl">Fluxo diario</p>
            </div>
            <div className="rounded-[1.4rem] border border-[rgba(84,60,47,0.12)] bg-white/45 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">Financeiro</p>
              <p className="mt-2 text-2xl">Visão Clara</p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[rgba(255,252,248,0.92)] px-6 py-8 md:px-10 xl:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Acesso ao sistema
              </p>
              <h2 className="text-4xl text-[var(--foreground)] md:text-[2.8rem]">
                Entre e veja suas vendas.
              </h2>
            </div>

            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
