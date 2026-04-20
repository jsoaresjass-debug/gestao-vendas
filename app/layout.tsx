import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/auth";

import "./globals.css";

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
      <body>
        <div className="mx-auto min-h-screen max-w-none px-2 py-2 sm:px-3 lg:px-4 xl:px-5">
          {user ? (
            <div className="grid min-h-screen gap-3 lg:grid-cols-[212px_minmax(0,1fr)]">
              <AppSidebar userEmail={user.email ?? undefined} />
              <div className="sale-main-interior min-w-0">{children}</div>
            </div>
          ) : (
            children
          )}
        </div>
      </body>
    </html>
  );
}
