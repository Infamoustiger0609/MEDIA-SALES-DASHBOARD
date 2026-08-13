import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import StatTile from "../../components/StatTile";
import DeltaBadge from "../../components/DeltaBadge";
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
    <div className="rounded-lg border border-slate-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">{subRegion.regionName}</h4>
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

interface BusinessPlanningSectionProps {
  territory: Territory;
  comparisonMode: ComparisonMode;
}

export default function BusinessPlanningSection({
  territory,
  comparisonMode,
}: BusinessPlanningSectionProps) {
  const revenueComparison = useComparison(territory.manager, totalActualRevenue, comparisonMode);
  const achievementComparison = useComparison(territory.manager, aopAchievementPct, comparisonMode);
  const targetComparison = useComparison(territory.manager, totalAopTarget, comparisonMode);

  const showCombined = territory.subRegions.length > 1;

  return (
    <Card
      title="Business Planning & Control"
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
          <div className="rounded-lg border border-slate-900/10 bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Combined Total</h4>
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

        {territory.subRegions.length === 0 && (
          <p className="text-sm text-slate-400">No business planning data for this period.</p>
        )}
      </div>
    </Card>
  );
}
