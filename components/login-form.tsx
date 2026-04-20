"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";

const initialState = {
  error: "",
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-[1.25rem] border border-[var(--border)] px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#a28e81] focus:border-[#b68f79] focus:bg-white"
          placeholder="contato@ingriamodas.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-[1.25rem] border border-[var(--border)] px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#a28e81] focus:border-[#b68f79] focus:bg-white"
          placeholder="Digite sua senha"
        />
      </div>

      {state?.error ? (
        <p className="rounded-[1.25rem] border border-[#e6c9cc] bg-[#fff1f2] px-4 py-3 text-sm text-[#8c4b57]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[1.3rem] bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#1c1512] disabled:cursor-not-allowed disabled:bg-[#7d6a60]"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
