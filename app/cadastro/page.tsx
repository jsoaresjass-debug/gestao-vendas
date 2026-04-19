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
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold text-slate-950">Cadastro de clientes</h2>
        <p className="text-slate-500">
          Cadastre novas clientes, atualize dados e acompanhe o historico de compras por perfil.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title={editCustomer ? "Editar cadastro" : "Nova cliente"}
          description="Use o formulario para manter a base comercial sempre atualizada."
        >
          <div className="space-y-4">
            {editCustomer ? (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span>Editando: {editCustomer.name}</span>
                <Link href="/cadastro" className="font-semibold text-slate-950">
                  Cancelar
                </Link>
              </div>
            ) : null}
            <CustomerForm customer={editCustomer} />
          </div>
        </Panel>

        <Panel
          title="Buscar clientes"
          description="Filtre por nome, telefone ou e-mail para localizar um cadastro rapidamente."
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
