import type { ReactNode } from "react";

type Column = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
};

type ManagementTableProps = {
  columns: Column[];
  children: ReactNode;
  emptyMessage?: string;
  hasRows: boolean;
};

function getAlignmentClassName(align: Column["align"]) {
  if (align === "right") {
    return "text-right";
  }

  if (align === "center") {
    return "text-center";
  }

  return "text-left";
}

export function ManagementTable({
  columns,
  children,
  emptyMessage = "Nenhum registro encontrado.",
  hasRows,
}: ManagementTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-[rgba(129,172,220,0.16)] bg-white/90">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-[rgba(129,172,220,0.14)] bg-[rgba(232,243,255,0.9)]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] ${getAlignmentClassName(column.align)}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasRows ? (
              children
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-xs text-[var(--muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
