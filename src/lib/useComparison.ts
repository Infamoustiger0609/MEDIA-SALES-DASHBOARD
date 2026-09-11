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
 * Shared by useCombinedComparison and useManagerComparison: "current" sums
 * `metric` over every SELECTED month for the given set of managers (all 4,
 * or just one); "prior" is a single well-defined period (one period before
 * the latest selected month) so MoM/QoQ/YoY stay meaningful. Aggregating
 * "current" this way -- rather than snapshotting the latest selected month
 * -- is what keeps a metric consistent when 1 vs. several months are
 * selected: with exactly one month selected this is identical to a plain
 * snapshot of that month, so nothing downstream needs to special-case it.
 */
function useAggregateComparison(
  managers: readonly string[],
  metric: (territories: Territory[]) => number | null | undefined,
  mode: ComparisonMode,
): ComparisonResult {
  const selectedMonths = useFilterStore((s) => s.selectedMonths);

  return useMemo(() => {
    const territoriesForMonths = (months: string[]): Territory[] =>
      months.flatMap((m) => managers.map((manager) => getTerritory(m, manager)).filter((t): t is Territory => !!t));

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
  }, [selectedMonths, mode, managers.join(",")]);
}

/**
 * Compares a metric for a given territory (manager) between the currently
 * selected month and the comparable prior period (MoM / QoQ / YoY).
 * Falls back gracefully to "not available" if the prior period isn't
 * loaded rather than showing a misleading 0%.
 *
 * NOTE: this is a plain single-month lookup at `primaryMonth` -- only use
 * it somewhere that's already gated to render exclusively when exactly one
 * month is selected (e.g. a section's `territories.length === 1` branch).
 * Anywhere the result is shown regardless of how many months are selected
 * (e.g. the Overview territory cards), use useManagerComparison instead, or
 * this will silently disagree with aggregate summaries elsewhere on the
 * page the moment more than one month is selected.
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
 * Same shape as useComparison, but "current" is summed across every
 * SELECTED month for ONE manager (via aggregate.ts's combined* helpers,
 * which already sum/ratio correctly over any Territory[]) instead of
 * snapshotting the latest selected month. Use this anywhere a per-manager
 * figure is displayed unconditionally, independent of how many months are
 * selected -- e.g. the Overview territory cards -- so it never disagrees
 * with CombinedTotalsSection's aggregation above it.
 */
export function useManagerComparison(
  manager: string,
  metric: (territories: Territory[]) => number | null | undefined,
  mode: ComparisonMode,
): ComparisonResult {
  const managers = useMemo(() => [manager], [manager]);
  return useAggregateComparison(managers, metric, mode);
}

/**
 * Same shape as useComparison, but the metric operates on the combined set of
 * all 4 managers' territories across every SELECTED month (e.g.
 * src/lib/aggregate.ts's combined* helpers) instead of a single manager/
 * single month -- used by the Overview page's cross-territory summary tiles.
 */
export function useCombinedComparison(
  metric: (territories: Territory[]) => number | null | undefined,
  mode: ComparisonMode,
): ComparisonResult {
  return useAggregateComparison(MANAGERS, metric, mode);
}
