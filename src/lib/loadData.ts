import type { Manager, MonthData, Territory } from "../types";

// Auto-pick-up every monthly JSON file dropped into /data — no code changes
// needed when a new month lands. Files must be named YYYY-MM.json to be
// picked up (this excludes ad-hoc/sample files that don't follow the
// convention, e.g. "2026-06_sample_output.json").
const modules = import.meta.glob<MonthData>("/data/*.json", {
  eager: true,
  import: "default",
});

const MONTH_FILENAME_RE = /^(\d{4}-\d{2})\.json$/;

export const monthlyData: MonthData[] = Object.entries(modules)
  .filter(([path]) => MONTH_FILENAME_RE.test(path.split("/").pop() ?? ""))
  .map(([, data]) => data)
  .sort((a, b) => a.month.localeCompare(b.month));

export const availableMonths: string[] = monthlyData.map((d) => d.month);

export function getMonthData(month: string): MonthData | undefined {
  return monthlyData.find((d) => d.month === month);
}

export function getLatestMonth(): string | undefined {
  return availableMonths[availableMonths.length - 1];
}

export function getTerritory(month: string, manager: Manager | string): Territory | undefined {
  return getMonthData(month)?.territories.find((t) => t.manager === manager);
}
