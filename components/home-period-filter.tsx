"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const periodOptions = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "all", label: "Tudo" },
] as const;

export function HomePeriodFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname !== "/home") {
    return null;
  }

  const selectedPeriod = searchParams.get("period") ?? "30d";

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {periodOptions.map((option) => {
        const params = new URLSearchParams(searchParams.toString());

        if (option.value === "30d") {
          params.delete("period");
        } else {
          params.set("period", option.value);
        }

        const href = params.toString() ? `/home?${params.toString()}` : "/home";

        return (
          <Link
            key={option.value}
            href={href}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              selectedPeriod === option.value
                ? "border-[#8ebbf3] bg-[#dfeeff] text-[#1b4f8c]"
                : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[#bfd8f6] hover:bg-[#f3f9ff]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
