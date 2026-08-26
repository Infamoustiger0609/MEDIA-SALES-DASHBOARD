import type { BusinessPlanning, Territory } from "../types";

function sumAcrossTerritories(
  territories: Territory[],
  selector: (t: Territory) => number | null,
): number | null {
  const values = territories.map(selector).filter((v): v is number => v !== null && v !== undefined);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0);
}

function weightedAverage(pairs: Array<{ value: number | null; weight: number | null }>): number | null {
  const usable = pairs.filter(
    (p): p is { value: number; weight: number } => p.value !== null && p.weight !== null && p.weight > 0,
  );
  if (usable.length === 0) return null;
  const totalWeight = usable.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return null;
  return usable.reduce((sum, p) => sum + p.value * p.weight, 0) / totalWeight;
}

const GRADE_ORDER: Record<string, number> = { "A+": 4, A: 3, B: 2, C: 1 };

function worstRanking(rankings: Array<string | null | undefined>): string | null {
  const valid = rankings.filter((r): r is string => !!r && r in GRADE_ORDER);
  if (valid.length === 0) return null;
  return valid.reduce((worst, r) => (GRADE_ORDER[r] < GRADE_ORDER[worst] ? r : worst));
}

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

// -- Combined-across-territories (Overview summary) --------------------------

export function combinedAopTarget(territories: Territory[]): number | null {
  return sumAcrossTerritories(territories, totalAopTarget);
}

export function combinedActualRevenue(territories: Territory[]): number | null {
  return sumAcrossTerritories(territories, totalActualRevenue);
}

export function combinedBusinessConfirmed(territories: Territory[]): number | null {
  return sumAcrossTerritories(territories, totalBusinessConfirmed);
}

/** Weighted achievement across ALL territories combined -- not an average of each territory's own %. */
export function combinedAchievementPct(territories: Territory[]): number | null {
  const target = combinedAopTarget(territories);
  const revenue = combinedActualRevenue(territories);
  if (target === null || target === 0 || revenue === null) return null;
  return revenue / target;
}

function discountWeightRows(subRegions: Territory["subRegions"]) {
  return subRegions.map((sr) => {
    const overallRow = sr.priceControl?.channels.find((c) => c.channel.toLowerCase().startsWith("overall"));
    return {
      ly: overallRow?.lyAvgDiscount ?? null,
      lyWeight: overallRow?.lyClientCount ?? null,
      cm: sr.priceControl?.overallOfferedDiscount ?? overallRow?.cmAvgDiscount ?? null,
      cmWeight: overallRow?.cmClientCount ?? null,
    };
  });
}

function averageDiscountRows(
  rows: ReturnType<typeof discountWeightRows>,
): { ly: number | null; cm: number | null } {
  return {
    ly: weightedAverage(rows.map((r) => ({ value: r.ly, weight: r.lyWeight }))),
    cm: weightedAverage(rows.map((r) => ({ value: r.cm, weight: r.cmWeight }))),
  };
}

/** Worst price-control ranking across every sub-region of every given territory (grades don't average). */
export function discountRankingAcross(territories: Territory[]): string | null {
  return worstRanking(territories.flatMap((t) => t.subRegions.map((sr) => sr.priceControl?.ranking)));
}

/** LY/CM overall discount weighted across every sub-region of every territory. */
export function combinedOverallDiscount(territories: Territory[]): { ly: number | null; cm: number | null } {
  return averageDiscountRows(territories.flatMap((t) => discountWeightRows(t.subRegions)));
}
