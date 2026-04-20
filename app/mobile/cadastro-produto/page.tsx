import { MobileProductForm } from "@/components/mobile-product-form";
import { requireUserEmail } from "@/lib/auth";

export default async function MobileCadastroProdutoPage() {
  await requireUserEmail("cadastro@modas.com");

  return (
    <main className="mx-auto w-full max-w-lg space-y-4 px-4 py-6">
      <header className="rounded-[1.6rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,247,255,0.96))] p-5 shadow-[0_18px_36px_rgba(103,139,184,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
          Cadastro mobile
        </p>
        <h1 className="mt-2 text-3xl leading-[1.02] text-[var(--foreground)]">
          Cadastrar produto pela etiqueta
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Tire a foto, confirme os campos e salve.
        </p>
      </header>

      <MobileProductForm />
    </main>
  );
}

