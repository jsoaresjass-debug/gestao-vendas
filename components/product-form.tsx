"use client";

import { useActionState } from "react";

import { createProductAction, updateProductAction } from "@/app/actions/products";
import type { Product } from "@/lib/types";

type ProductFormProps = {
  product?: Product | null;
};

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "w-full rounded-[1.25rem] border border-[var(--border)] bg-white px-4 py-3 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#95a8bd] focus:border-[#8ebbf3]";

const labelClassName =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]";

export function ProductForm({ product }: ProductFormProps) {
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-5 md:grid-cols-2">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="md:col-span-2">
        <label htmlFor="name" className={labelClassName}>
          Nome do produto
        </label>
        <input
          id="name"
          name="name"
          defaultValue={product?.name}
          required
          className={inputClassName}
          placeholder="Ex.: Vestido Midi Azul"
        />
      </div>

      <div>
        <label htmlFor="barcode" className={labelClassName}>
          Codigo da etiqueta
        </label>
        <input
          id="barcode"
          name="barcode"
          defaultValue={product?.barcode}
          required
          className={inputClassName}
          placeholder="Ex.: 789100000001"
        />
      </div>

      <div>
        <label htmlFor="price" className={labelClassName}>
          Preco
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={product?.price ?? ""}
          required
          className={inputClassName}
          placeholder="0,00"
        />
      </div>

      <div>
        <label htmlFor="stock_quantity" className={labelClassName}>
          Estoque
        </label>
        <input
          id="stock_quantity"
          name="stock_quantity"
          type="number"
          min="0"
          step="1"
          defaultValue={product?.stock_quantity ?? 0}
          required
          className={inputClassName}
          placeholder="0"
        />
      </div>

      <div>
        <label htmlFor="is_active" className={labelClassName}>
          Status
        </label>
        <select
          id="is_active"
          name="is_active"
          defaultValue={String(product?.is_active ?? true)}
          className={inputClassName}
        >
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[1.25rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3e7fc8] disabled:cursor-not-allowed disabled:bg-[#9ebfe2]"
        >
          {isPending ? "Salvando..." : product ? "Atualizar produto" : "Cadastrar produto"}
        </button>
      </div>

      {state.error ? (
        <p className="md:col-span-2 rounded-[1.25rem] border border-[#e6c9cc] bg-[#fff1f2] px-4 py-3 text-sm text-[#8c4b57]">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="md:col-span-2 rounded-[1.25rem] border border-[#cadacb] bg-[#f2f8f2] px-4 py-3 text-sm text-[#456050]">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
