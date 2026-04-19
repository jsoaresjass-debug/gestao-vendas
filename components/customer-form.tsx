"use client";

import { useActionState } from "react";

import { createCustomerAction, updateCustomerAction } from "@/app/actions/customers";
import type { Customer } from "@/lib/types";

type CustomerFormProps = {
  customer?: Customer | null;
};

const initialState = {
  error: "",
  success: "",
};

export function CustomerForm({ customer }: CustomerFormProps) {
  const action = customer ? updateCustomerAction : createCustomerAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      {customer ? <input type="hidden" name="id" value={customer.id} /> : null}

      <div className="md:col-span-2">
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
          Nome da cliente
        </label>
        <input
          id="name"
          name="name"
          defaultValue={customer?.name}
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
          placeholder="Ex.: Maria Silva"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={customer?.phone ?? ""}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={customer?.email ?? ""}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
          placeholder="cliente@email.com"
        />
      </div>

      <div>
        <label htmlFor="is_active" className="mb-2 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="is_active"
          name="is_active"
          defaultValue={String(customer?.is_active ?? true)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
        >
          <option value="true">Ativa</option>
          <option value="false">Inativa</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {isPending
            ? "Salvando..."
            : customer
              ? "Atualizar cadastro"
              : "Cadastrar cliente"}
        </button>
      </div>

      {state?.error ? (
        <p className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state?.success ? (
        <p className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
