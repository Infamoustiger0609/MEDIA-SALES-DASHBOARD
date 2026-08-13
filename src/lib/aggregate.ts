import type { BusinessPlanning, Territory } from "../types";

function sumField(t: Territory, selector: (bp: BusinessPlanning) => number | null): number | null {
  const values = t.subRegions
    .map((sr) => sr.businessPlanning)
    .filter((bp): bp is BusinessPlanning => !!bp)
    .map(selector)
    .filter((v): v is number => v !== null && v !== undefined);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0);
}

export function totalAopTarget(t: Territory): number | null {
  return sumField(t, (bp) => bp.aopTarget);
}

export function totalActualRevenue(t: Territory): number | null {
  return sumField(t, (bp) => bp.actualRevenue);
}

export function totalBusinessConfirmed(t: Territory): number | null {
  return sumField(t, (bp) => bp.businessConfirmed);
}

/** Weighted AOP achievement = total actual revenue / total AOP target across sub-regions. */
export function aopAchievementPct(t: Territory): number | null {
  const target = totalAopTarget(t);
  const revenue = totalActualRevenue(t);
  if (target === null || target === 0 || revenue === null) return null;
  return revenue / target;
}
