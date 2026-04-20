"use client";

import { useActionState } from "react";

import { createCustomerAction, updateCustomerAction } from "@/app/actions/customers";
import type { Customer } from "@/lib/types";

type CustomerFormProps = {
  customer?: Customer | null;
  /** Shown after redirect from successful update (Nova cliente card). */
  flashSuccess?: string;
};

const initialState = {
  error: "",
  success: "",
};

export function CustomerForm({ customer, flashSuccess }: CustomerFormProps) {
  const action = customer ? updateCustomerAction : createCustomerAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const inputClassName =
    "w-full rounded-[1.25rem] border border-[var(--border)] px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#a28e81] focus:border-[#b68f79] focus:bg-white";
  const labelClassName =
    "mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]";

  return (
    <form action={formAction} className="grid gap-5 md:grid-cols-2">
      {customer ? <input type="hidden" name="id" value={customer.id} /> : null}

      <div className="md:col-span-2">
        <label htmlFor="name" className={labelClassName}>
          Nome da cliente
        </label>
        <input
          id="name"
          name="name"
          defaultValue={customer?.name}
          required
          className={inputClassName}
          placeholder="Ex.: Maria Silva"
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClassName}>
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={customer?.phone ?? ""}
          className={inputClassName}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClassName}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={customer?.email ?? ""}
          className={inputClassName}
          placeholder="cliente@email.com"
        />
      </div>

      <div>
        <label htmlFor="is_active" className={labelClassName}>
          Status
        </label>
        <select
          id="is_active"
          name="is_active"
          defaultValue={String(customer?.is_active ?? true)}
          className={inputClassName}
        >
          <option value="true">Ativa</option>
          <option value="false">Inativa</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-[1.3rem] bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#1c1512] disabled:cursor-not-allowed disabled:bg-[#7d6a60]"
        >
          {isPending
            ? "Salvando..."
            : customer
              ? "Atualizar cadastro"
              : "Cadastrar cliente"}
        </button>
      </div>

      {state?.error ? (
        <p className="md:col-span-2 rounded-[1.25rem] border border-[#e6c9cc] bg-[#fff1f2] px-4 py-3 text-sm text-[#8c4b57]">
          {state.error}
        </p>
      ) : null}

      {state?.success ? (
        <p className="md:col-span-2 rounded-[1.25rem] border border-[#cadacb] bg-[#f2f8f2] px-4 py-3 text-sm text-[#456050]">
          {state.success}
        </p>
      ) : null}

      {!customer && flashSuccess ? (
        <p className="md:col-span-2 rounded-[1.25rem] border border-[#cadacb] bg-[#f2f8f2] px-4 py-3 text-sm text-[#456050]">
          {flashSuccess}
        </p>
      ) : null}
    </form>
  );
}
