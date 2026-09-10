export function fmtNum(v: number | null | undefined, decimals = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return v.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtInt(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return Math.round(v).toLocaleString();
}

/** v is a fraction (0.5 = 50%). */
export function fmtPct(v: number | null | undefined, decimals = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(decimals)}%`;
}

export function fmtCr(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `₹${fmtNum(v, decimals)} Cr`;
}

/**
 * For figures stored in Cr (per the schema) that are naturally sub-1-Crore
 * and read more cleanly in Lakhs (1 Cr = 100 L) -- e.g. per-head productivity.
 * Only use where the source figure is genuinely small; everything else in
 * the app stays on fmtCr.
 */
export function fmtLakh(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `₹${fmtNum(v * 100, decimals)} L`;
}
