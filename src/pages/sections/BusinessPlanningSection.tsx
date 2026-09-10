import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import StatTile from "../../components/StatTile";
import DeltaBadge from "../../components/DeltaBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { useComparison } from "../../lib/useComparison";
import { totalActualRevenue, totalAopTarget, aopAchievementPct } from "../../lib/aggregate";
import { fmtCr, fmtPct } from "../../lib/format";
import type { ComparisonMode, SubRegion, Territory } from "../../types";

interface SubRegionCardProps {
  manager: string;
  subRegion: SubRegion;
  comparisonMode: ComparisonMode;
}

function SubRegionCard({ manager, subRegion, comparisonMode }: SubRegionCardProps) {
  const bp = subRegion.businessPlanning;

  const revenueComparison = useComparison(
    manager,
    (t) =>
      t.subRegions.find((sr) => sr.regionName === subRegion.regionName)?.businessPlanning
        ?.actualRevenue ?? null,
    comparisonMode,
  );
  const achievementComparison = useComparison(
    manager,
    (t) =>
      t.subRegions.find((sr) => sr.regionName === subRegion.regionName)?.businessPlanning
        ?.actualPctOfTarget ?? null,
    comparisonMode,
  );

  return (
    <div className="rounded-lg border border-hairline p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-charcoal">{subRegion.regionName}</h4>
        <div className="flex gap-1.5">
          <GradeBadge grade={bp?.planningGrade} label="Planning" />
          <GradeBadge grade={bp?.controlGrade} label="Control" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <StatTile label="AOP Target" value={fmtCr(bp?.aopTarget)} />
        <StatTile label="Business Confirmed" value={fmtCr(bp?.businessConfirmed)} />
        <StatTile
          label="Actual Revenue"
          value={fmtCr(revenueComparison.current)}
          delta={<DeltaBadge result={revenueComparison} mode={comparisonMode} />}
        />
        <StatTile
          label="Actual % of Target"
          value={fmtPct(achievementComparison.current)}
          delta={<DeltaBadge result={achievementComparison} mode={comparisonMode} />}
        />
        <StatTile label="Month-Beginning %" value={fmtPct(bp?.monthBeginningPct)} />
      </div>
    </div>
  );
}

function regionNamesOf(territories: Territory[]): string[] {
  return Array.from(new Set(territories.flatMap((t) => t.subRegions.map((sr) => sr.regionName))));
}

function regionComparisonRows(regionName: string, territories: Territory[]) {
  const bps = territories.map(
    (t) => t.subRegions.find((sr) => sr.regionName === regionName)?.businessPlanning ?? null,
  );
  return [
    { label: "AOP Target", values: bps.map((bp) => fmtCr(bp?.aopTarget)) },
    { label: "Business Confirmed", values: bps.map((bp) => fmtCr(bp?.businessConfirmed)) },
    { label: "Actual Revenue", values: bps.map((bp) => fmtCr(bp?.actualRevenue)) },
    { label: "Actual % of Target", values: bps.map((bp) => fmtPct(bp?.actualPctOfTarget)) },
    { label: "Month-Beginning %", values: bps.map((bp) => fmtPct(bp?.monthBeginningPct)) },
    {
      label: "Planning Grade",
      values: bps.map((bp, i) => <GradeBadge key={i} grade={bp?.planningGrade} />),
    },
    {
      label: "Control Grade",
      values: bps.map((bp, i) => <GradeBadge key={i} grade={bp?.controlGrade} />),
    },
  ];
}

function combinedComparisonRows(territories: Territory[]) {
  return [
    { label: "AOP Target", values: territories.map((t) => fmtCr(totalAopTarget(t))) },
    { label: "Actual Revenue", values: territories.map((t) => fmtCr(totalActualRevenue(t))) },
    { label: "Actual % of Target", values: territories.map((t) => fmtPct(aopAchievementPct(t))) },
  ];
}

interface BusinessPlanningSectionProps {
  territories: Territory[];
  comparisonMode: ComparisonMode;
}

export default function BusinessPlanningSection({
  territories,
  comparisonMode,
}: BusinessPlanningSectionProps) {
  // Hooks must run unconditionally every render (territories.length can flip
  // between 1 and >1 on the same mounted instance as the month filter
  // changes) -- only their result is used conditionally, in the single-month
  // branch below.
  const primaryManager = territories[0]?.manager ?? "";
  const revenueComparison = useComparison(primaryManager, totalActualRevenue, comparisonMode);
  const achievementComparison = useComparison(primaryManager, aopAchievementPct, comparisonMode);
  const targetComparison = useComparison(primaryManager, totalAopTarget, comparisonMode);

  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
    const showCombined = territory.subRegions.length > 1;

    return (
      <Card
        title="1 · Business Planning & Control"
        subtitle={showCombined ? "Per sub-region, with combined total" : undefined}
      >
        <div className="flex flex-col gap-3">
          {territory.subRegions.map((sr) => (
            <SubRegionCard
              key={sr.regionName}
              manager={territory.manager}
              subRegion={sr}
              comparisonMode={comparisonMode}
            />
          ))}

          {showCombined && (
            <div className="rounded-lg border border-hairline bg-gold-soft/25 p-4">
              <h4 className="mb-3 text-sm font-semibold text-charcoal">Combined Total</h4>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <StatTile
                  label="AOP Target"
                  value={fmtCr(targetComparison.current)}
                  delta={<DeltaBadge result={targetComparison} mode={comparisonMode} />}
                />
                <StatTile
                  label="Actual Revenue"
                  value={fmtCr(revenueComparison.current)}
                  delta={<DeltaBadge result={revenueComparison} mode={comparisonMode} />}
                />
                <StatTile
                  label="Actual % of Target"
                  value={fmtPct(achievementComparison.current)}
                  delta={<DeltaBadge result={achievementComparison} mode={comparisonMode} />}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  const months = territories.map((t) => t.month);
  const regionNames = regionNamesOf(territories);
  const showCombined = regionNames.length > 1;

  return (
    <Card title="1 · Business Planning & Control" subtitle="Comparison across selected months">
      <div className="flex flex-col gap-5">
        {regionNames.map((regionName) => (
          <div key={regionName}>
            {regionNames.length > 1 && (
              <h4 className="mb-2 text-sm font-semibold text-charcoal">{regionName}</h4>
            )}
            <MonthComparisonTable months={months} rows={regionComparisonRows(regionName, territories)} />
          </div>
        ))}

        {showCombined && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-charcoal">Combined Total</h4>
            <MonthComparisonTable months={months} rows={combinedComparisonRows(territories)} />
          </div>
        )}
      </div>
    </Card>
  );
}
