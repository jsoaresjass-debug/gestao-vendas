"use client";

import { useMemo, useRef, useState } from "react";

import { settleInstallmentsAction } from "@/app/actions/installments";
import { formatCurrency, formatDate } from "@/lib/format";

type OpenInstallment = {
  id: string;
  label: string;
  remaining: number;
  dueDate: string;
  isOverdue: boolean;
};

type SettleInstallmentsDialogProps = {
  saleId: string;
  installments: OpenInstallment[];
  buttonLabel?: string;
};

export function SettleInstallmentsDialog({
  saleId,
  installments,
  buttonLabel = "Dar baixa",
}: SettleInstallmentsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(
    () => installments.filter((i) => selected[i.id]).map((i) => i.id),
    [installments, selected],
  );

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function toggleAll(value: boolean) {
    const next: Record<string, boolean> = {};
    for (const inst of installments) next[inst.id] = value;
    setSelected(next);
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded-full border border-[var(--border)] bg-[#f4f9ff] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition hover:bg-white"
      >
        {buttonLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(560px,92vw)] rounded-[1.4rem] border border-[var(--border)] bg-white p-0 shadow-[0_40px_140px_rgba(22,50,79,0.28)]"
      >
        <div className="border-b border-[rgba(129,172,220,0.16)] bg-[rgba(232,243,255,0.62)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            Dar baixa em parcelas
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            Selecione as parcelas pagas e confirme.
          </p>
        </div>

        <form action={settleInstallmentsAction} className="px-5 py-4">
          <input type="hidden" name="sale_id" value={saleId} />
          {selectedIds.map((id) => (
            <input key={id} type="hidden" name="installment_id" value={id} />
          ))}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition hover:bg-[#f4f9ff]"
            >
              Marcar todas
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)] transition hover:bg-[#f4f9ff]"
            >
              Limpar
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {installments.map((inst) => (
              <label
                key={inst.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-[1.1rem] border border-[rgba(129,172,220,0.16)] bg-white px-4 py-3 transition hover:bg-[#f4f9ff]"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[inst.id])}
                    onChange={(e) =>
                      setSelected((prev) => ({ ...prev, [inst.id]: e.target.checked }))
                    }
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--foreground)]">
                      Parcela {inst.label}
                    </span>
                    <span className={`block text-xs ${inst.isOverdue ? "text-[#8c4b57]" : "text-[var(--muted)]"}`}>
                      Vence: {formatDate(inst.dueDate)} {inst.isOverdue ? "• Em atraso" : ""}
                    </span>
                  </span>
                </span>
                <span className="text-sm text-[var(--muted)]">
                  Restante: {formatCurrency(inst.remaining)}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              className="rounded-[1.1rem] border border-[var(--border)] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] transition hover:bg-[#f4f9ff]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedIds.length === 0}
              className="rounded-[1.1rem] bg-[var(--accent)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#3e7fc8] disabled:cursor-not-allowed disabled:bg-[#9ebfe2]"
            >
              Confirmar baixa ({selectedIds.length})
            </button>
          </div>
        </form>
      </dialog>

    </>
  );
}

