import Link from "next/link";

import { CustomerForm } from "@/components/customer-form";
import { CustomerList } from "@/components/customer-list";
import { Panel } from "@/components/panel";
import { SearchForm } from "@/components/search-form";
import { requireUser } from "@/lib/auth";
import { getCustomerById, getCustomersWithHistory } from "@/lib/customers";

type CadastroPageProps = {
  searchParams: Promise<{
    q?: string;
    edit?: string;
  }>;
};

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  await requireUser();

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const editId = params.edit;

  const [customers, editCustomer] = await Promise.all([
    getCustomersWithHistory(query),
    editId ? getCustomerById(editId) : Promise.resolve(null),
  ]);

  return (
    <main className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,252,248,0.95),rgba(246,236,226,0.88))] p-7 shadow-[0_20px_50px_rgba(79,54,40,0.08)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            Relacionamento
          </p>
          <h2 className="mt-3 text-5xl leading-[0.95] text-[var(--foreground)]">
            Cadastro de clientes com leitura mais premium.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
            Organize a base da boutique, acompanhe o historico de compras e mantenha a equipe
            com uma visao mais refinada do atendimento.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[rgba(49,36,32,0.96)] p-7 text-white shadow-[0_20px_50px_rgba(41,27,20,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
            Curadoria da base
          </p>
          <p className="mt-4 text-4xl">{customers.length}</p>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Clientes visiveis com os filtros atuais. Mantenha nome, contato e status sempre
            atualizados para uma operacao mais organizada.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title={editCustomer ? "Editar cadastro" : "Nova cliente"}
          description="Use o formulario para manter a base da loja organizada e consistente."
        >
          <div className="space-y-4">
            {editCustomer ? (
              <div className="flex items-center justify-between rounded-[1.25rem] border border-[var(--border)] bg-[rgba(247,239,231,0.65)] px-4 py-3 text-sm text-[var(--muted)]">
                <span>Editando: {editCustomer.name}</span>
                <Link href="/cadastro" className="font-semibold text-[var(--foreground)]">
                  Cancelar
                </Link>
              </div>
            ) : null}
            <CustomerForm customer={editCustomer} />
          </div>
        </Panel>

        <Panel
          title="Buscar clientes"
          description="Filtre por nome, telefone ou e-mail para localizar um cadastro com rapidez."
        >
          <SearchForm defaultValue={query} />
        </Panel>
      </section>

      <Panel
        title="Base de clientes"
        description="Cada registro exibe o historico resumido de compras e o acesso rapido para edicao."
      >
        <CustomerList customers={customers} />
      </Panel>
    </main>
  );
}
