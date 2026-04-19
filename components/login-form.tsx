"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";

const initialState = {
  error: "",
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
          placeholder="voce@empresa.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
          placeholder="Digite sua senha"
        />
      </div>

      {state?.error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
