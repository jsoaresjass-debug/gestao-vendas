import Link from "next/link";

import { ProductForm } from "@/components/product-form";
import { ProductList } from "@/components/product-list";
import { Panel } from "@/components/panel";
import { SearchForm } from "@/components/search-form";
import { requireUser } from "@/lib/auth";
import { getProductById, getProducts } from "@/lib/products";

type ProdutosPageProps = {
  searchParams: Promise<{
    q?: string;
    edit?: string;
  }>;
};

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  await requireUser();

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const editId = params.edit;

  const [products, editProduct] = await Promise.all([
    getProducts(query),
    editId ? getProductById(editId) : Promise.resolve(null),
  ]);

  return (
    <main className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.8rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,247,255,0.96))] p-6 shadow-[0_18px_36px_rgba(103,139,184,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            Catalogo
          </p>
          <h1 className="mt-3 text-4xl leading-[0.98] text-[var(--foreground)]">
            Produtos prontos para bipagem.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Cadastre a etiqueta, o nome e o valor para usar direto no fluxo de vendas.
          </p>
        </div>

        <div className="rounded-[1.8rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_36px_rgba(103,139,184,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Base ativa
          </p>
          <p className="mt-3 text-4xl leading-none text-[var(--foreground)]">{products.length}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">produtos exibidos no filtro atual</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title={editProduct ? "Editar produto" : "Novo produto"}
          description="Mantenha o catalogo com etiquetas validas para agilizar o caixa e a venda."
        >
          <div className="space-y-4">
            {editProduct ? (
              <div className="flex items-center justify-between rounded-[1.25rem] border border-[var(--border)] bg-[rgba(232,243,255,0.65)] px-4 py-3 text-sm text-[var(--muted)]">
                <span>Editando: {editProduct.name}</span>
                <Link href="/produtos" className="font-semibold text-[var(--foreground)]">
                  Cancelar
                </Link>
              </div>
            ) : null}

            <ProductForm product={editProduct} />
          </div>
        </Panel>

        <Panel
          title="Buscar produtos"
          description="Encontre por nome ou codigo da etiqueta para revisar rapidamente o cadastro."
        >
          <SearchForm defaultValue={query} placeholder="Buscar produto ou codigo" />
        </Panel>
      </section>

      <Panel
        title="Catalogo de produtos"
        description="Os itens ativos aparecem na bipagem da venda para a equipe localizar e incluir com rapidez."
      >
        <ProductList products={products} />
      </Panel>
    </main>
  );
}
