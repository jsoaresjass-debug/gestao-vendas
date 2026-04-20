"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import Tesseract from "tesseract.js";

import { createProductAction } from "@/app/actions/products";
import { parseLabelText } from "@/lib/ocr/parse-label";

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "w-full rounded-[1.25rem] border border-[var(--border)] bg-white px-4 py-3 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[#95a8bd] focus:border-[#8ebbf3]";

const labelClassName =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]";

type Size = "P" | "M" | "G" | "";

export function MobileProductForm() {
  const [state, formAction, isPending] = useActionState(createProductAction, initialState);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [rawText, setRawText] = useState("");

  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState<string>("");
  const [size, setSize] = useState<Size>("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [isActive, setIsActive] = useState(true);

  const canRunOcr = useMemo(() => Boolean(imageUrl) && !isOcrRunning, [imageUrl, isOcrRunning]);

  async function runOcr() {
    if (!imageUrl || isOcrRunning) return;
    setIsOcrRunning(true);
    setOcrProgress(0);
    setRawText("");

    try {
      const result = await Tesseract.recognize(imageUrl, "por", {
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") {
            setOcrProgress(m.progress);
          }
        },
      });

      const text = result.data.text ?? "";
      setRawText(text);

      const parsed = parseLabelText(text);
      if (parsed.name) setName(parsed.name);
      if (parsed.barcode) setBarcode(parsed.barcode);
      if (typeof parsed.price === "number") setPrice(parsed.price.toFixed(2));
      if (parsed.size) setSize(parsed.size);
    } finally {
      setIsOcrRunning(false);
    }
  }

  function onFileChange(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[0_18px_40px_rgba(77,55,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
          Foto da etiqueta
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Tire a foto bem de perto, com boa luz, e sem cortar o preço.
        </p>

        <div className="mt-4 grid gap-3">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />

          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Etiqueta selecionada"
              className="w-full rounded-[1.25rem] border border-[var(--border)] object-contain"
            />
          ) : null}

          <button
            type="button"
            onClick={runOcr}
            disabled={!canRunOcr}
            className="w-full rounded-[1.25rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3e7fc8] disabled:cursor-not-allowed disabled:bg-[#9ebfe2]"
          >
            {isOcrRunning ? `Lendo etiqueta... ${Math.round(ocrProgress * 100)}%` : "Reconhecer dados"}
          </button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[0_18px_40px_rgba(77,55,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
          Cadastro do produto
        </p>

        <form action={formAction} className="mt-4 grid gap-4">
          <div>
            <label htmlFor="name" className={labelClassName}>
              Nome do produto
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClassName}
              placeholder="Ex.: Jaqueta Feminina Adulta"
            />
          </div>

          <div>
            <label htmlFor="barcode" className={labelClassName}>
              Codigo de barras
            </label>
            <input
              id="barcode"
              name="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              required
              className={inputClassName}
              placeholder="Ex.: 7901008776535"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="price" className={labelClassName}>
                Preco
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className={inputClassName}
                placeholder="0,00"
              />
            </div>

            <div>
              <label htmlFor="size" className={labelClassName}>
                Tamanho
              </label>
              <select
                id="size"
                name="size"
                value={size}
                onChange={(e) => setSize(e.target.value as Size)}
                className={inputClassName}
              >
                <option value="">Nao informado</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="stock_quantity" className={labelClassName}>
                Estoque
              </label>
              <input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="is_active" className={labelClassName}>
                Status
              </label>
              <select
                id="is_active"
                name="is_active"
                value={String(isActive)}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className={inputClassName}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || isOcrRunning}
            className="w-full rounded-[1.25rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3e7fc8] disabled:cursor-not-allowed disabled:bg-[#9ebfe2]"
          >
            {isPending ? "Salvando..." : "Cadastrar produto"}
          </button>

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
        </form>
      </div>

      {rawText ? (
        <details className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
            Ver texto reconhecido (OCR)
          </summary>
          <pre className="mt-3 whitespace-pre-wrap text-xs text-[var(--muted)]">{rawText}</pre>
        </details>
      ) : null}
    </div>
  );
}

