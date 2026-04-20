import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-[86vh] place-items-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,226,255,0.55),transparent_35%)]" />
        <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[rgba(76,142,217,0.18)] blur-3xl" />
        <div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-[rgba(79,139,107,0.14)] blur-3xl" />
      </div>

      <section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[rgba(129,172,220,0.22)] bg-[rgba(255,255,255,0.92)] shadow-[0_36px_120px_rgba(2,36,72,0.18)]">
        <div className="px-7 pb-7 pt-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[rgba(30,58,95,0.08)]">
              <svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
                aria-hidden
              >
                <circle cx="22" cy="22" r="18" stroke="#c8a24c" strokeWidth="2" />
                <path
                  d="M14.3 28V16.2h3.1l4.6 7 4.6-7h3.1V28h-3v-6.8l-3.6 5.3h-2.2l-3.6-5.3V28h-3z"
                  fill="#c8a24c"
                />
              </svg>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">
              Ingria Modas
            </p>
            <h1 className="mt-2 text-2xl leading-tight text-[var(--foreground)]">Bem-vindo(a)</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Preencha seus dados de acesso</p>
          </div>

          <div className="mt-7">
            <LoginForm />
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] text-[var(--muted)]">PORTAL - Versao 2026/01.0</p>
            <p className="mt-1 text-[11px] font-semibold text-[var(--muted)]">
              OPSYNC Desenvolvimentos de sistemas Web
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
