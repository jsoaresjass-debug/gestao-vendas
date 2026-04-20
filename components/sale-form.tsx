"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

import { createSaleAction } from "@/app/actions/sales";
import { formatCurrency } from "@/lib/format";
import type { CustomerSelectorItem, ProductSelectorItem } from "@/lib/types";

type SaleFormProps = {
  customer?: CustomerSelectorItem | null;
  products: ProductSelectorItem[];
  customers?: CustomerSelectorItem[];
  showTrigger?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `page` = fluxo em pagina dedicada (sem overlay). `modal` = comportamento anterior. */
  mode?: "modal" | "page";
};

const initialState = {
  error: "",
  success: "",
};

type SaleItemDraft = {
  id: string;
  productId: string;
  barcode: string;
  productName: string;
  stockQuantity: number;
  quantity: number;
  unitPrice: number;
};

const inputClassName =
  "w-full rounded-[0.95rem] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[#95a8bd] focus:border-[#8ebbf3] focus:bg-white";

const labelClassName =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]";

function createItem(product: ProductSelectorItem): SaleItemDraft {
  return {
    id: crypto.randomUUID(),
    productId: product.id,
    barcode: product.barcode,
    productName: product.name,
    stockQuantity: product.stock_quantity,
    quantity: 1,
    unitPrice: Number(product.price),
  };
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultFirstDueDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export function SaleForm({
  customer,
  products,
  customers = [],
  showTrigger = true,
  isOpen,
  onOpenChange,
  mode = "modal",
}: SaleFormProps) {
  const [state, formAction, isPending] = useActionState(createSaleAction, initialState);
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customer?.id ?? "");
  const [customerSearchValue, setCustomerSearchValue] = useState(customer?.name ?? "");
  const [scanValue, setScanValue] = useState("");
  const [items, setItems] = useState<SaleItemDraft[]>([]);
  const [lookupMessage, setLookupMessage] = useState("");
  const [initialPaidAmount, setInitialPaidAmount] = useState("0");
  const [installmentCount, setInstallmentCount] = useState("1");
  const [installmentIntervalDays, setInstallmentIntervalDays] = useState<"15" | "30">("30");
  const isPage = mode === "page";
  const modalOpen = isOpen ?? internalOpen;
  const showSheet = isPage || modalOpen;
  const availableCustomers = useMemo(
    () => (customers.length ? customers : customer ? [customer] : []),
    [customer, customers],
  );
  const activeCustomer =
    availableCustomers.find((item) => item.id === selectedCustomerId) ?? customer ?? null;

  function setModalOpen(open: boolean) {
    if (typeof isOpen === "boolean") {
      onOpenChange?.(open);
      return;
    }

    setInternalOpen(open);
    onOpenChange?.(open);
  }

  const estimatedTotal = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
    [items],
  );

  const installmentPreview = useMemo(() => {
    const paidAmount = Number(initialPaidAmount || 0);
    const count = Math.max(Number(installmentCount || 1), 1);
    const remaining = Math.max(estimatedTotal - paidAmount, 0);

    return remaining / count;
  }, [estimatedTotal, initialPaidAmount, installmentCount]);

  const filteredCustomers = useMemo(() => {
    const normalized = customerSearchValue.trim().toLowerCase();

    if (!normalized) {
      return availableCustomers.slice(0, 8);
    }

    return availableCustomers
      .filter(
        (item) =>
          item.name.toLowerCase().includes(normalized) ||
          (item.phone ?? "").toLowerCase().includes(normalized) ||
          (item.email ?? "").toLowerCase().includes(normalized),
      )
      .slice(0, 8);
  }, [availableCustomers, customerSearchValue]);

  const shouldShowCustomerSuggestions =
    customerSearchValue.trim().length > 0 && customerSearchValue !== (activeCustomer?.name ?? "");

  const filteredProducts = useMemo(() => {
    const normalized = scanValue.trim().toLowerCase();

    if (!normalized) {
      return products.slice(0, 8);
    }

    return products
      .filter(
        (product) =>
          product.barcode.toLowerCase().includes(normalized) ||
          product.name.toLowerCase().includes(normalized),
      )
      .slice(0, 8);
  }, [products, scanValue]);

  const shouldShowSuggestions = scanValue.trim().length > 0;

  useEffect(() => {
    if (!state.success) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (typeof isOpen === "boolean") {
        onOpenChange?.(false);
      } else {
        setInternalOpen(false);
      }
      setItems([]);
      setLookupMessage("");
      setScanValue("");
      setInitialPaidAmount("0");
      setInstallmentCount("1");
      setInstallmentIntervalDays("30");
      setSelectedCustomerId(customer?.id ?? "");
      setCustomerSearchValue(customer?.name ?? "");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [customer?.id, customer?.name, isOpen, onOpenChange, state.success]);

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  function updateItem(
    id: string,
    field: keyof Pick<SaleItemDraft, "quantity" | "unitPrice" | "stockQuantity">,
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "quantity"
                  ? Math.min(Math.max(Number(value || 0), 1), Math.max(item.stockQuantity, 1))
                  : Number(value || 0),
            }
          : item,
      ),
    );
  }

  function addProduct(product: ProductSelectorItem) {
    setLookupMessage("");

    if (product.stock_quantity <= 0) {
      setLookupMessage(`Produto ${product.name} sem estoque disponivel.`);
      return;
    }

    setItems((current) => {
      const existingItem = current.find((item) => item.productId === product.id);

      if (existingItem) {
        if (existingItem.quantity >= existingItem.stockQuantity) {
          setLookupMessage(`Estoque maximo atingido para ${existingItem.productName}.`);
          return current;
        }

        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, createItem(product)];
    });
    setScanValue("");
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function handleScanSubmit() {
    const normalized = scanValue.trim().toLowerCase();

    if (!normalized) {
      setLookupMessage("Digite ou bipa uma etiqueta para localizar o produto.");
      return;
    }

    const exactMatch = products.find((product) => product.barcode.toLowerCase() === normalized);

    if (!exactMatch) {
      setLookupMessage("Produto nao encontrado na etiqueta informada.");
      return;
    }

    addProduct(exactMatch);
  }

  function selectCustomer(customerOption: CustomerSelectorItem) {
    setSelectedCustomerId(customerOption.id);
    setCustomerSearchValue(customerOption.name);
  }

  return (
    <div className="space-y-4">
      {showTrigger ? (
        <div className="flex flex-col gap-2.5 rounded-[1.15rem] border border-[rgba(129,172,220,0.14)] bg-[rgba(232,243,255,0.72)] p-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Nova venda
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Selecione a cliente e abra a janela para bipar os produtos da compra.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-[0.95rem] bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#3e7fc8]"
        >
          Incluir venda
        </button>
        </div>
      ) : null}

      {state.error ? (
        <p className="rounded-[1.25rem] border border-[#e6c9cc] bg-[#fff1f2] px-4 py-3 text-sm text-[#8c4b57]">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-[1.25rem] border border-[#cadacb] bg-[#f2f8f2] px-4 py-3 text-sm text-[#456050]">
          {state.success}
        </p>
      ) : null}

      {showSheet ? (
        <div
          className={
            isPage
              ? "relative z-[1] w-full min-w-0"
              : "fixed z-[120] flex min-h-0 flex-col bg-[#16324f]/35 p-3 sm:p-4 max-lg:inset-0 max-lg:h-[100dvh] max-lg:max-h-[100dvh] lg:p-0 lg:inset-auto lg:h-auto lg:max-h-none lg:rounded-[1.1rem] lg:border lg:border-[rgba(22,50,79,0.12)] lg:bg-[#16324f]/22 lg:bottom-[var(--sale-sheet-bottom,0.75rem)] lg:left-[var(--sale-sheet-left,1rem)] lg:right-[var(--sale-sheet-right,0.75rem)] lg:top-[var(--sale-sheet-top,7.5rem)] lg:shadow-[0_24px_56px_rgba(22,50,79,0.18)]"
          }
        >
          <div
            className={
              isPage
                ? "flex max-h-[calc(100dvh-10rem)] min-h-[min(36rem,78vh)] w-full flex-col overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white shadow-[0_16px_34px_rgba(103,139,184,0.12)]"
                : "flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-[1.25rem] bg-white lg:rounded-[1.05rem]"
            }
          >
            <div className="grid h-full max-h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-white shadow-[0_18px_48px_rgba(22,50,79,0.12)] lg:shadow-none">
              <div className="relative z-[130] flex shrink-0 flex-col gap-2 border-b border-[rgba(129,172,220,0.18)] bg-white px-3 py-2.5 shadow-[0_6px_16px_rgba(103,139,184,0.08)] sm:px-4 sm:py-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Venda por cliente
                  </p>
                  <h3 className="mt-1 break-words text-lg leading-snug text-[var(--foreground)] sm:text-xl">
                    {activeCustomer?.name ?? "Selecione a cliente"}
                  </h3>
                  <p className="mt-1 max-w-[52rem] text-[11px] leading-snug text-[var(--muted)] sm:text-xs">
                    Bipe a etiqueta ou pesquise o produto para montar a venda e gerar as parcelas.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 md:pt-0.5">
                  {isPage ? (
                    <Link
                      href="/home"
                      className="rounded-[0.85rem] border border-[var(--border)] bg-[#f4f9ff] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-white"
                    >
                      Historico na Home
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="rounded-[0.85rem] border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="rounded-[0.85rem] border border-[var(--border)] bg-[#f4f9ff] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
                      >
                        Fechar
                      </button>
                    </>
                  )}
                </div>
              </div>

              <form
                action={formAction}
                className={`relative min-w-0 overflow-hidden ${isPage ? "flex min-h-0 flex-1 flex-col" : "h-full min-h-0"}`}
              >
                <div
                  className={
                    isPage
                      ? "relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2.5 py-2.5 [scrollbar-gutter:stable] [scrollbar-color:rgba(129,172,220,0.55)_rgba(244,250,255,0.95)] [scrollbar-width:thin] sm:px-3 sm:py-3 md:px-4 md:py-3 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(129,172,220,0.55)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[rgba(244,250,255,0.95)]"
                      : "absolute inset-0 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain px-2.5 py-2.5 [scrollbar-gutter:stable] [scrollbar-color:rgba(129,172,220,0.55)_rgba(244,250,255,0.95)] [scrollbar-width:thin] sm:px-3 sm:py-3 md:px-4 md:py-3 lg:flex lg:flex-col lg:overflow-hidden lg:py-2.5 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(129,172,220,0.55)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[rgba(244,250,255,0.95)]"
                  }
                >
                <div className="min-h-0 min-w-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
                  <input type="hidden" name="customer_id" value={selectedCustomerId} />

                  <div className="flex min-h-0 min-w-0 flex-col gap-3 lg:flex lg:min-h-0 lg:flex-1 lg:flex-row lg:items-stretch">
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 sm:gap-3 lg:min-h-0">
                    <div className="rounded-[1rem] border border-[rgba(129,172,220,0.14)] bg-white p-2.5 sm:p-3">
                      <label htmlFor="customer_search" className={labelClassName}>
                        Cliente
                      </label>
                      <div className="relative">
                        <input
                          id="customer_search"
                          type="text"
                          value={customerSearchValue}
                          onChange={(event) => {
                            setCustomerSearchValue(event.target.value);
                            setSelectedCustomerId("");
                          }}
                          placeholder="Digite o nome da cliente"
                          className={inputClassName}
                        />
                        {shouldShowCustomerSuggestions ? (
                          <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-[0.95rem] border border-[var(--border)] bg-white shadow-[0_14px_28px_rgba(103,139,184,0.12)]">
                            <div className="max-h-44 overflow-y-auto">
                              {filteredCustomers.length ? (
                                filteredCustomers.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => selectCustomer(item)}
                                    className="flex w-full items-start justify-between gap-3 border-b border-[rgba(129,172,220,0.08)] px-3 py-2 text-left transition last:border-b-0 hover:bg-[#f8fbff]"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-[11px] font-semibold text-[var(--foreground)]">
                                        {item.name}
                                      </p>
                                      <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                                        {item.phone || "Sem telefone"}
                                      </p>
                                    </div>
                                    <p className="shrink-0 text-[10px] text-[var(--muted)]">
                                      {item.email || "Sem e-mail"}
                                    </p>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-3 text-[11px] text-[var(--muted)]">
                                  Nenhuma cliente encontrada.
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      {activeCustomer ? (
                        <p className="mt-2 text-[10px] text-[var(--muted)]">
                          {activeCustomer.phone || "Sem telefone"} • {activeCustomer.email || "Sem e-mail"}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-[1rem] border border-[rgba(129,172,220,0.14)] bg-[rgba(232,243,255,0.5)] p-2.5 sm:p-3">
                      <label htmlFor="scan_input" className={labelClassName}>
                        Bipar etiqueta ou buscar produto
                      </label>
                      <div className="relative flex flex-col gap-2 md:flex-row">
                        <input
                          id="scan_input"
                          type="text"
                          value={scanValue}
                          onChange={(event) => setScanValue(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleScanSubmit();
                            }
                          }}
                          placeholder="Leia a etiqueta ou digite o nome"
                          className={inputClassName}
                        />
                        <button
                          type="button"
                          onClick={handleScanSubmit}
                          className="rounded-[0.9rem] border border-[var(--border)] bg-[#edf5ff] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1b4f8c]"
                        >
                          Bipar
                        </button>

                        {shouldShowSuggestions ? (
                          <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-[0.95rem] border border-[var(--border)] bg-white shadow-[0_14px_28px_rgba(103,139,184,0.12)] md:right-[7.2rem]">
                            <div className="max-h-44 overflow-y-auto">
                              {filteredProducts.length ? (
                                filteredProducts.map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => addProduct(product)}
                                    className="flex w-full items-start justify-between gap-3 border-b border-[rgba(129,172,220,0.08)] px-3 py-2 text-left transition last:border-b-0 hover:bg-[#f8fbff]"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-[11px] font-semibold text-[var(--foreground)]">
                                        {product.name}
                                      </p>
                                      <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                                        {product.barcode}
                                      </p>
                                    </div>
                                    <p className="shrink-0 text-[10px] text-[var(--muted)]">
                                      {formatCurrency(Number(product.price))} • est. {product.stock_quantity}
                                    </p>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-3 text-[11px] text-[var(--muted)]">
                                  Nenhum produto encontrado.
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {lookupMessage ? (
                        <p className="mt-2 text-[11px] text-[#8c4b57]">{lookupMessage}</p>
                      ) : null}
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-col rounded-[1rem] border border-[rgba(129,172,220,0.14)] bg-white p-2.5 sm:p-3 lg:min-h-0 lg:flex-1">
                      <p className="mb-2 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Produtos bipados
                      </p>
                      <div className="max-h-[min(52vh,22rem)] min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain rounded-[0.65rem] border border-[rgba(129,172,220,0.1)] sm:max-h-[min(48vh,26rem)] lg:max-h-none lg:min-h-[8rem] lg:overflow-y-auto [scrollbar-color:rgba(129,172,220,0.55)_rgba(244,250,255,0.95)] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(129,172,220,0.55)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[rgba(244,250,255,0.85)]">
                        <table className="w-full min-w-0 table-fixed border-collapse text-[11px] sm:text-[12px]">
                          <thead className="sticky top-0 z-[1] bg-[rgba(244,250,255,0.97)] shadow-[0_1px_0_rgba(129,172,220,0.14)]">
                            <tr className="border-b border-[rgba(129,172,220,0.12)]">
                              <th className="w-[36%] px-2 py-1.5 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:px-2.5 sm:py-2">
                                Produto
                              </th>
                              <th className="w-[11%] px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:px-2 sm:py-2">
                                Qtd
                              </th>
                              <th className="w-[17%] px-1 py-1.5 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:px-2 sm:py-2">
                                Valor
                              </th>
                              <th className="w-[10%] px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:px-2 sm:py-2">
                                Est.
                              </th>
                              <th className="w-[16%] px-1 py-1.5 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:px-2 sm:py-2">
                                Total
                              </th>
                              <th className="w-[10%] px-1 py-1.5 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:px-2 sm:py-2">
                                Acao
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.length ? (
                              items.map((item) => (
                                <tr key={item.id} className="border-b border-[rgba(129,172,220,0.08)] last:border-b-0">
                                  <td className="max-w-0 px-2 py-1.5 sm:px-2.5 sm:py-2">
                                    <input type="hidden" name="item_product_id" value={item.productId} />
                                    <input type="hidden" name="item_product_name" value={item.productName} />
                                    <input type="hidden" name="item_unit_price" value={item.unitPrice} />
                                    <p
                                      className="truncate font-medium text-[var(--foreground)]"
                                      title={item.productName}
                                    >
                                      {item.productName}
                                    </p>
                                    <p className="truncate text-[10px] text-[var(--muted)]" title={item.barcode}>
                                      {item.barcode}
                                    </p>
                                  </td>
                                  <td className="px-1 py-1.5 text-center sm:px-2 sm:py-2">
                                    <input
                                      name="item_quantity"
                                      type="number"
                                      min="1"
                                      max={Math.max(item.stockQuantity, 1)}
                                      step="1"
                                      required
                                      value={item.quantity}
                                      onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                                      className="mx-auto w-full max-w-[4rem] rounded-[0.65rem] border border-[var(--border)] px-1 py-0.5 text-center text-[var(--foreground)] outline-none focus:border-[#8ebbf3] sm:max-w-[4.5rem] sm:rounded-[0.75rem] sm:px-1.5 sm:py-1"
                                    />
                                  </td>
                                  <td className="whitespace-nowrap px-1 py-1.5 text-right tabular-nums text-[var(--foreground)] sm:px-2 sm:py-2">
                                    {formatCurrency(item.unitPrice)}
                                  </td>
                                  <td className="px-1 py-1.5 text-center tabular-nums text-[var(--foreground)] sm:px-2 sm:py-2">
                                    {item.stockQuantity}
                                  </td>
                                  <td className="whitespace-nowrap px-1 py-1.5 text-right text-[11px] font-semibold tabular-nums text-[var(--foreground)] sm:px-2 sm:py-2 sm:text-[12px]">
                                    {formatCurrency(item.unitPrice * item.quantity)}
                                  </td>
                                  <td className="px-1 py-1.5 text-right sm:px-2 sm:py-2">
                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.id)}
                                      className="rounded-[0.7rem] border border-[#f0c7cd] bg-[#fff1f2] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#9b5b65]"
                                    >
                                      Remover
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-2 py-4 text-center text-[11px] text-[var(--muted)] sm:px-2.5 sm:py-5">
                                  Nenhum produto adicionado ainda.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-0 w-full min-w-0 shrink-0 flex-col lg:sticky lg:top-0 lg:z-10 lg:w-[min(340px,34%)] lg:max-w-full lg:self-start xl:w-[340px]">
                    <div className="grid min-w-0 gap-2.5 rounded-[1rem] border border-[rgba(129,172,220,0.14)] bg-white p-2.5 sm:grid-cols-2 sm:p-3">
                      <div className="sm:col-span-2 rounded-[0.9rem] border border-[rgba(129,172,220,0.14)] bg-[rgba(232,243,255,0.7)] p-2.5">
                        <div className="flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                              Resumo da venda
                            </p>
                            <p className="mt-1.5 text-[1.35rem] leading-none text-[var(--foreground)] xl:text-[1.5rem]">
                              {formatCurrency(estimatedTotal)}
                            </p>
                          </div>
                          <p className="text-[10px] text-[var(--muted)]">
                            {items.length} produto(s)
                          </p>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="sale_date" className={labelClassName}>
                          Data da venda
                        </label>
                        <input
                          id="sale_date"
                          name="sale_date"
                          type="date"
                          required
                          defaultValue={getTodayDate()}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label htmlFor="first_due_date" className={labelClassName}>
                          Primeiro vencimento
                        </label>
                        <input
                          id="first_due_date"
                          name="first_due_date"
                          type="date"
                          required
                          defaultValue={getDefaultFirstDueDate()}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label htmlFor="installment_count" className={labelClassName}>
                          Total de parcelas
                        </label>
                        <input
                          id="installment_count"
                          name="installment_count"
                          type="number"
                          min="1"
                          max="24"
                          required
                          value={installmentCount}
                          onChange={(event) => setInstallmentCount(event.target.value)}
                          className={inputClassName}
                        />
                      </div>

                      <div>
                        <label htmlFor="installment_interval_days" className={labelClassName}>
                          Intervalo
                        </label>
                        <select
                          id="installment_interval_days"
                          name="installment_interval_days"
                          value={installmentIntervalDays}
                          onChange={(event) =>
                            setInstallmentIntervalDays(event.target.value as "15" | "30")
                          }
                          className={inputClassName}
                        >
                          <option value="15">15 em 15 dias</option>
                          <option value="30">30 em 30 dias</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="initial_paid_amount" className={labelClassName}>
                          Entrada paga
                        </label>
                        <input
                          id="initial_paid_amount"
                          name="initial_paid_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={initialPaidAmount}
                          onChange={(event) => setInitialPaidAmount(event.target.value)}
                          className={inputClassName}
                        />
                      </div>

                      <div className="sm:col-span-2 rounded-[0.9rem] border border-[rgba(129,172,220,0.14)] bg-[#f8fbff] p-2.5">
                        <div className="grid gap-1.5 text-[11px] text-[var(--muted)] sm:grid-cols-2">
                          <div className="flex items-center justify-between gap-3">
                            <span>Total</span>
                            <span className="font-semibold text-[var(--foreground)]">
                              {formatCurrency(estimatedTotal)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Entrada</span>
                            <span className="font-semibold text-[var(--foreground)]">
                              {formatCurrency(Number(initialPaidAmount || 0))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Valor por parcela</span>
                            <span className="font-semibold text-[var(--foreground)]">
                              {formatCurrency(installmentPreview)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Parcelamento</span>
                            <span className="font-semibold text-[var(--foreground)]">
                              {installmentCount}x / {installmentIntervalDays} dias
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2 mt-1">
                        <button
                          type="submit"
                          disabled={isPending || items.length === 0 || !selectedCustomerId}
                          className="w-full rounded-[0.95rem] bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#3e7fc8] disabled:cursor-not-allowed disabled:bg-[#9ebfe2]"
                        >
                          {isPending ? "Salvando venda..." : "Finalizar venda"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
