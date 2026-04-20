import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";

import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sansFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ingria Modas | Gestao de Vendas",
  description: "Painel comercial da Ingria Modas com clientes, vendas e acompanhamento financeiro.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="pt-BR">
      <body className={`${displayFont.variable} ${sansFont.variable}`}>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {user ? (
            <header className="mb-10 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[0_24px_80px_rgba(82,56,40,0.08)] backdrop-blur md:px-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-[var(--border)] bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--muted)]">
                      Ingria Modas
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                      Gestao de Vendas
                    </span>
                  </div>
                  <h1 className="text-4xl leading-none text-[var(--foreground)] md:text-5xl">
                    Boutique em movimento, com visao comercial clara.
                  </h1>
                  <p className="max-w-2xl text-sm text-[var(--muted)] md:text-[15px]">
                    Acompanhe clientes, vendas e pagamentos em um painel com linguagem de marca
                    mais elegante e atual.
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                    <Link
                      href="/home"
                      className="rounded-full border border-[var(--border)] bg-white/60 px-4 py-2 transition hover:border-[#cdb2a2] hover:bg-white hover:text-[var(--foreground)]"
                    >
                      Home
                    </Link>
                    <Link
                      href="/cadastro"
                      className="rounded-full border border-[var(--border)] bg-white/60 px-4 py-2 transition hover:border-[#cdb2a2] hover:bg-white hover:text-[var(--foreground)]"
                    >
                      Cadastro
                    </Link>
                  </nav>
                  <div className="flex items-center gap-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                      Painel autenticado
                    </p>
                    <LogoutButton />
                  </div>
                </div>
              </div>
            </header>
          ) : null}

          {children}
        </div>
      </body>
    </html>
  );
}
