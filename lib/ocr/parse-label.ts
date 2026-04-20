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
    .filter((l) => !/(^|\s)(ref|cor|tam|tamanho|col|c[oó]d)\s*[:\-]/i.test(l))
    .filter((l) => !/^\d[\d\s\-]{6,}$/.test(l)) // mostly numeric lines
    .filter((l) => /[a-zA-ZÀ-ÿ]/.test(l))
    .map((l) => l.replace(/\s{2,}/g, " ").trim());

  if (!candidates.length) return undefined;

  const scored = candidates
    .map((line, index) => {
      const upperRatio =
        line.length > 0 ? (line.replace(/[^A-ZÀ-Ý]/g, "").length / line.length) : 0;
      const hasWord = /(blusa|cal[cç]a|saia|vestido|jaqueta|camiseta|conjunto|short|bermuda|cropped|macac[aã]o|moletom|blazer|cardigan|sueter|su[eé]ter|casaco|kimono|body|regata|top|tshirt|t-shirt)/i.test(
        line,
      );
      const lengthScore = Math.min(line.length, 40) / 40;
      const earlyBias = index === 0 ? 0.15 : index === 1 ? 0.08 : 0;
      const upperScore = Math.min(Math.max(upperRatio - 0.35, 0), 0.65);
      const wordScore = hasWord ? 0.35 : 0;
      return { line, index, score: lengthScore + upperScore + wordScore + earlyBias };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.line;
  const bestIndex = scored[0]?.index ?? 0;
  const secondBestSameBlock = candidates[bestIndex + 1];

  // Many labels split the name across 1-2 lines (e.g. "JAQUETA FEMININA" + "ADULTO").
  const merged =
    best &&
    secondBestSameBlock &&
    best.length <= 28 &&
    secondBestSameBlock.length <= 28
      ? `${best} ${secondBestSameBlock}`
      : best;

  return merged?.replace(/\s{2,}/g, " ").trim();
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
  // For checkout, we want the horizontal barcode digits (EAN-13) when available.
  // Fall back to Ref:XXXXX only if we couldn't read the barcode digits.
  const barcode = barcodeDigits ?? ref;

  return {
    rawText,
    name,
    barcode,
    price,
    size,
  };
}

