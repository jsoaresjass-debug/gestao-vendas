"use client";

import { useActionState } from "react";
import { useState } from "react";

import { loginAction } from "@/app/actions/auth";

const initialState = {
  error: "",
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]"
        >
          Usuario
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-[1.25rem] border border-[rgba(129,172,220,0.22)] bg-white px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#95a8bd] focus:border-[#8ebbf3] focus:bg-white"
          placeholder="Digite seu email"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            className="w-full rounded-[1.25rem] border border-[rgba(129,172,220,0.22)] bg-white px-4 py-3.5 pr-12 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#95a8bd] focus:border-[#8ebbf3] focus:bg-white"
            placeholder="Digite sua senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[rgba(217,235,255,0.6)] hover:text-[var(--foreground)]"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {state?.error ? (
        <p className="rounded-[1.25rem] border border-[#e6c9cc] bg-[#fff1f2] px-4 py-3 text-sm text-[#8c4b57]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-[1.3rem] bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3e7fc8] disabled:cursor-not-allowed disabled:bg-[#9ebfe2]"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
