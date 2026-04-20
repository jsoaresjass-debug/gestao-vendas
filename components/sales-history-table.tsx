import { ManagementTable } from "@/components/management-table";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
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
        { key: "status", label: "Status", align: "center" },
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
          <td className="px-3 py-3 text-center">
            <PaymentStatusBadge status={row.paymentStatus} />
          </td>
        </tr>
      ))}
    </ManagementTable>
  );
}
