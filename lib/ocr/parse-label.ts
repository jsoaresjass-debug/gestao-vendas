type ParsedLabel = {
  name?: string;
  barcode?: string;
  price?: number;
  size?: "P" | "M" | "G";
  rawText: string;
};

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pickMostLikelyName(lines: string[]) {
  const candidates = lines
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/(^|\s)(ref|cor|tam|tamanho)\s*[:\-]/i.test(l))
    .filter((l) => !/^\d[\d\s\-]{6,}$/.test(l)) // mostly numeric lines
    .filter((l) => /[a-zA-ZÀ-ÿ]/.test(l))
    .map((l) => l.replace(/\s{2,}/g, " ").trim());

  if (!candidates.length) return undefined;

  // Many labels split the name across 1-2 lines.
  const first = candidates[0];
  const second = candidates[1];

  const merged =
    second && first.length <= 28 && second.length <= 28 ? `${first} ${second}` : first;

  return merged.replace(/\s{2,}/g, " ").trim();
}

function parsePrice(text: string) {
  const matches = [...text.matchAll(/\b(\d{1,4}[,.]\d{2})\b/g)].map((m) => m[1]);
  if (!matches.length) return undefined;

  // Prefer the last currency-like value (often the price tag).
  const raw = matches[matches.length - 1]!;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function parseSize(text: string) {
  const m = text.match(/(?:^|\s)(?:tam|tamanho)\s*[:\-]?\s*([PMG])\b/i);
  const size = (m?.[1] ?? "").toUpperCase();
  if (size === "P" || size === "M" || size === "G") return size;
  return undefined;
}

function parseRef(text: string) {
  const m = text.match(/(?:^|\s)ref\s*[:\-]?\s*([0-9A-Z]{3,})\b/i);
  return m?.[1]?.trim();
}

function parseBarcodeDigits(text: string) {
  const digits = [...text.matchAll(/\b(\d{8,14})\b/g)].map((m) => m[1]);
  if (!digits.length) return undefined;
  const ean13 = digits.find((d) => d.length === 13);
  return ean13 ?? digits.sort((a, b) => b.length - a.length)[0];
}

export function parseLabelText(input: string): ParsedLabel {
  const rawText = normalizeText(input);
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  const ref = parseRef(rawText);
  const barcodeDigits = parseBarcodeDigits(rawText);
  const size = parseSize(rawText);
  const price = parsePrice(rawText);
  const name = pickMostLikelyName(lines);

  // In this app, "barcode" is the label code used at checkout.
  // Prefer Ref:XXXXX when present; otherwise use the digit barcode.
  const barcode = ref ?? barcodeDigits;

  return {
    rawText,
    name,
    barcode,
    price,
    size,
  };
}

