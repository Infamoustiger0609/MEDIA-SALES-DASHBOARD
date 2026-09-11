import { addMonths, format, isSameMonth, parse, subMonths, subYears } from "date-fns";
import type { ComparisonMode } from "../types";

/** Returns the YYYY-MM string for the comparable prior period, or null for mode "None". */
export function priorPeriod(month: string, mode: ComparisonMode): string | null {
  if (mode === "None") return null;
  const date = parse(month, "yyyy-MM", new Date());
  let prior: Date;
  switch (mode) {
    case "MoM":
      prior = subMonths(date, 1);
      break;
    case "QoQ":
      prior = subMonths(date, 3);
      break;
    case "YoY":
      prior = subYears(date, 1);
      break;
  }
  return format(prior, "yyyy-MM");
}

export function formatMonthLabel(month: string): string {
  const date = parse(month, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
}

/**
 * Renders the currently selected months as a single phrase, e.g. for the
 * Overview page subtitle: "for Aug 2026" (one month), "for Jun–Aug 2026"
 * (a contiguous run), or "across 3 selected months" (a non-contiguous
 * pick) -- so the page never implies a single snapshot month when the
 * selection actually spans several, possibly non-adjacent, months.
 */
export function formatPeriodPhrase(selectedMonths: string[]): string {
  if (selectedMonths.length === 0) return "for no month selected";

  const sorted = [...selectedMonths].sort();
  if (sorted.length === 1) return `for ${formatMonthLabel(sorted[0])}`;

  const dates = sorted.map((m) => parse(m, "yyyy-MM", new Date()));
  const isContiguous = dates.every((d, i) => i === 0 || isSameMonth(addMonths(dates[i - 1], 1), d));

  if (!isContiguous) return `across ${sorted.length} selected months`;

  const first = dates[0];
  const last = dates[dates.length - 1];
  const range =
    format(first, "yyyy") === format(last, "yyyy")
      ? `${format(first, "MMM")}–${format(last, "MMM yyyy")}`
      : `${format(first, "MMM yyyy")} – ${format(last, "MMM yyyy")}`;
  return `for ${range}`;
}
