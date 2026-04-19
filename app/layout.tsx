import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = {
  title: "Gestao de Vendas",
  description: "Dashboard de vendas com login, cadastro de clientes e historico de compras.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="pt-BR">
      <body>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {user ? (
            <header className="mb-8 rounded-3xl border border-slate-200 bg-white/85 px-6 py-5 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Gestao de Vendas</p>
                  <h1 className="text-2xl font-semibold text-slate-950">
                    Painel comercial da operacao
                  </h1>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
                    <Link
                      href="/home"
                      className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      Home
                    </Link>
                    <Link
                      href="/cadastro"
                      className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      Cadastro
                    </Link>
                  </nav>
                  <LogoutButton />
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
