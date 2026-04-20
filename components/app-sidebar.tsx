"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/home", label: "Home", shortLabel: "HM" },
  { href: "/nova-venda", label: "Nova venda", shortLabel: "NV" },
  { href: "/cadastro", label: "Clientes", shortLabel: "CL" },
  { href: "/produtos", label: "Produtos", shortLabel: "PR" },
] as const;

type AppSidebarProps = {
  userEmail?: string;
};

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-[1.55rem] border border-[var(--border)] bg-[linear-gradient(180deg,#183958_0%,#264d76_100%)] p-3 text-white shadow-[0_20px_40px_rgba(22,50,79,0.18)]">
      <div className="border-b border-white/10 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
          Ingria Modas
        </p>
        <h1 className="mt-2 text-[1.55rem] leading-none">Gestao</h1>
        <p className="mt-1.5 text-[11px] text-white/72">Painel comercial e financeiro</p>
      </div>

      <nav className="mt-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[1rem] px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                isActive
                  ? "bg-white text-[#1b4f8c] shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                  : "text-white/78 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[10px] uppercase tracking-[0.18em] ${
                  isActive ? "bg-[#dfeeff] text-[#1b4f8c]" : "bg-white/10 text-white/80"
                }`}
              >
                {item.shortLabel}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Acesso</p>
        <p className="mt-1.5 break-all text-[11px] text-white/85">{userEmail ?? "Usuario autenticado"}</p>
        <div className="mt-2.5">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
