import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";

type ProductListProps = {
  products: Product[];
};

export function ProductList({ products }: ProductListProps) {
  if (!products.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#bfd8f6] bg-[rgba(244,250,255,0.82)] px-6 py-10 text-center text-sm text-[var(--muted)]">
        Nenhum produto encontrado para este filtro.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[0_12px_28px_rgba(103,139,184,0.06)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl leading-none text-[var(--foreground)]">{product.name}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    product.is_active
                      ? "bg-[#e2efff] text-[#3d6fa8]"
                      : "bg-[#eef3f8] text-[#71859d]"
                  }`}
                >
                  {product.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">Etiqueta: {product.barcode}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Estoque: {product.stock_quantity}</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {formatCurrency(Number(product.price))}
              </p>
              <Link
                href={`/produtos?edit=${product.id}`}
                className="rounded-full border border-[var(--border)] bg-[#f4f9ff] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
              >
                Editar
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
