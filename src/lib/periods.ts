import { format, parse, subMonths, subYears } from "date-fns";
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
