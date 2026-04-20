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
    atualizado?: string;
  }>;
};

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  await requireUser();

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const editId = params.edit;
  const updateFlash =
    params.atualizado === "1" ? "Cadastro atualizado com sucesso." : undefined;

  const [customers, editCustomer] = await Promise.all([
    getCustomersWithHistory(query),
    editId ? getCustomerById(editId) : Promise.resolve(null),
  ]);

  return (
    <main className="space-y-6">
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
            <CustomerForm customer={editCustomer} flashSuccess={updateFlash} />
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
