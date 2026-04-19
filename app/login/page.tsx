import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-[80vh] place-items-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Acesso ao sistema
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">Gestao de Vendas</h1>
          <p className="text-sm text-slate-500">
            Entre com o usuario cadastrado no Supabase para acessar o painel.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
