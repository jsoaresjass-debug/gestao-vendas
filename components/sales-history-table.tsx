import Link from "next/link";

import { ManagementTable } from "@/components/management-table";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { SettleInstallmentsDialog } from "@/components/settle-installments-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import type { SaleHistoryRow } from "@/lib/types";

type SalesHistoryTableProps = {
  rows: SaleHistoryRow[];
};

export function SalesHistoryTable({ rows }: SalesHistoryTableProps) {
  return (
    <ManagementTable
      columns={[
        { key: "date", label: "Data", align: "left" },
        { key: "customer", label: "Cliente", align: "left" },
        { key: "total", label: "Total", align: "right" },
        { key: "open", label: "Em aberto (R$)", align: "right" },
        { key: "parOpen", label: "Parcelas em aberto", align: "center" },
        { key: "parPaid", label: "Parcelas pagas", align: "center" },
        { key: "parVal", label: "Valor da parcela", align: "right" },
        { key: "next", label: "Proximo pgto", align: "center" },
        { key: "status", label: "Status", align: "center" },
        { key: "actions", label: "Acoes", align: "right" },
      ]}
      hasRows={rows.length > 0}
      emptyMessage="Nenhuma venda encontrada no periodo ou para a pesquisa informada."
    >
      {rows.map((row) => (
        <tr key={row.id} className="border-b border-[rgba(129,172,220,0.12)] last:border-b-0">
          <td className="px-3 py-3 text-[12px] text-[var(--foreground)]">{formatDate(row.saleDate)}</td>
          <td className="px-3 py-3">
            <p className="text-[12px] font-semibold text-[var(--foreground)]">{row.customerName}</p>
          </td>
          <td className="px-3 py-3 text-right text-[12px] font-medium text-[var(--foreground)]">
            {formatCurrency(row.totalAmount)}
          </td>
          <td className="px-3 py-3 text-right text-[12px] text-[var(--foreground)]">
            {formatCurrency(row.outstandingAmount)}
          </td>
          <td className="px-3 py-3 text-center text-[12px] tabular-nums text-[var(--foreground)]">
            {row.openInstallmentCount}
          </td>
          <td className="px-3 py-3 text-center text-[12px] tabular-nums text-[var(--foreground)]">
            {row.paidInstallmentCount}
          </td>
          <td className="px-3 py-3 text-right text-[12px] tabular-nums text-[var(--foreground)]">
            {formatCurrency(row.installmentNominalValue)}
          </td>
          <td className="px-3 py-3 text-center text-[12px]">
            {row.nextInstallmentDueDate ? (
              <span className={row.isNextInstallmentOverdue ? "font-semibold text-[#8c4b57]" : "text-[var(--foreground)]"}>
                {formatDate(row.nextInstallmentDueDate)}
                {row.isNextInstallmentOverdue ? " (Atraso)" : ""}
              </span>
            ) : (
              "-"
            )}
          </td>
          <td className="px-3 py-3 text-center">
            <PaymentStatusBadge status={row.paymentStatus} />
          </td>
          <td className="px-3 py-3">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {row.openInstallments?.length ? (
                <SettleInstallmentsDialog saleId={row.id} installments={row.openInstallments} />
              ) : null}

              <Link
                href={`/historico/cliente/${row.customerId}`}
                className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition hover:bg-[#f4f9ff]"
              >
                Historico
              </Link>
            </div>
          </td>
        </tr>
      ))}
    </ManagementTable>
  );
}
