import { useMemo } from "react";
import { getTerritory } from "./loadData";
import { priorPeriod } from "./periods";
import { primaryMonth, useFilterStore } from "../store/filterStore";
import { MANAGERS, type ComparisonMode, type Territory } from "../types";

export interface ComparisonResult {
  current: number | null;
  prior: number | null;
  delta: number | null;
  deltaPct: number | null;
  /** True only when both current and prior values were found and are comparable. */
  available: boolean;
}

const UNAVAILABLE: ComparisonResult = {
  current: null,
  prior: null,
  delta: null,
  deltaPct: null,
  available: false,
};

/**
 * Compares a metric for a given territory (manager) between the current
 * period and the comparable prior period (MoM / QoQ / YoY). "Current" is
 * primaryMonth -- the latest of the filter bar's (possibly multi-selected)
 * months -- so this keeps working unchanged when more than one month is
 * selected. Falls back gracefully to "not available" if the prior period
 * isn't loaded rather than showing a misleading 0%.
 */
export function useComparison(
  manager: string,
  metric: (territory: Territory) => number | null | undefined,
  mode: ComparisonMode,
): ComparisonResult {
  const month = useFilterStore((s) => primaryMonth(s.selectedMonths));

  return useMemo(() => {
    const currentTerritory = getTerritory(month, manager);
    const current = currentTerritory ? (metric(currentTerritory) ?? null) : null;

    if (mode === "None") {
      return { ...UNAVAILABLE, current };
    }

    const prevMonth = priorPeriod(month, mode);
    const priorTerritory = prevMonth ? getTerritory(prevMonth, manager) : undefined;
    if (!priorTerritory) {
      return { ...UNAVAILABLE, current };
    }

    const prior = metric(priorTerritory) ?? null;
    if (current === null || prior === null) {
      return { current, prior, delta: null, deltaPct: null, available: false };
    }

    const delta = current - prior;
    const deltaPct = prior !== 0 ? (delta / Math.abs(prior)) * 100 : null;
    return { current, prior, delta, deltaPct, available: true };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, manager, mode]);
}

/**
 * Same shape as useComparison, but the metric operates on the combined set of
 * all 4 managers' territories across every SELECTED month (e.g.
 * src/lib/aggregate.ts's combined* helpers) instead of a single manager/
 * single month -- used by the Overview page's cross-territory summary tiles.
 * "Current" sums over every month in the filter bar's (possibly multi-)
 * selection; "prior" is still a single well-defined period (one period
 * before the latest selected month), so MoM/QoQ/YoY stay meaningful.
 */
export function useCombinedComparison(
  metric: (territories: Territory[]) => number | null | undefined,
  mode: ComparisonMode,
): ComparisonResult {
  const selectedMonths = useFilterStore((s) => s.selectedMonths);

  return useMemo(() => {
    const territoriesForMonths = (months: string[]): Territory[] =>
      months.flatMap((m) => MANAGERS.map((manager) => getTerritory(m, manager)).filter((t): t is Territory => !!t));

    const current = metric(territoriesForMonths(selectedMonths)) ?? null;

    if (mode === "None") {
      return { ...UNAVAILABLE, current };
    }

    const anchorMonth = primaryMonth(selectedMonths);
    const prevMonth = anchorMonth ? priorPeriod(anchorMonth, mode) : null;
    const priorTerritories = prevMonth ? territoriesForMonths([prevMonth]) : [];
    if (priorTerritories.length === 0) {
      return { ...UNAVAILABLE, current };
    }

    const prior = metric(priorTerritories) ?? null;
    if (current === null || prior === null) {
      return { current, prior, delta: null, deltaPct: null, available: false };
    }

    const delta = current - prior;
    const deltaPct = prior !== 0 ? (delta / Math.abs(prior)) * 100 : null;
    return { current, prior, delta, deltaPct, available: true };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonths, mode]);
}
