import { useMemo } from "react";
import { getTerritory } from "./loadData";
import { priorPeriod } from "./periods";
import { useFilterStore } from "../store/filterStore";
import type { ComparisonMode, Territory } from "../types";

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
 * Compares a metric for a given territory (manager) between the currently
 * selected month and the comparable prior period (MoM / QoQ / YoY).
 * Falls back gracefully to "not available" if the prior period isn't
 * loaded rather than showing a misleading 0%.
 */
export function useComparison(
  manager: string,
  metric: (territory: Territory) => number | null | undefined,
  mode: ComparisonMode,
): ComparisonResult {
  const month = useFilterStore((s) => s.month);

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
