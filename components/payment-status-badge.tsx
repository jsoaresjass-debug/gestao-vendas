import type { PaymentStatus } from "@/lib/types";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const statusMap: Record<
  PaymentStatus,
  {
    label: string;
    className: string;
  }
> = {
  paid: {
    label: "Pago",
    className: "bg-[#e8f6ef] text-[#42715a]",
  },
  partial: {
    label: "Parcial",
    className: "bg-[#eef4ff] text-[#5379a8]",
  },
  pending: {
    label: "Pendente",
    className: "bg-[#edf5ff] text-[#5f7da1]",
  },
  overdue: {
    label: "Atrasado",
    className: "bg-[#ffecee] text-[#b56371]",
  },
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const current = statusMap[status];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${current.className}`}
    >
      {current.label}
    </span>
  );
}
