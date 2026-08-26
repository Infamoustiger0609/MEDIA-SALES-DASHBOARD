import Card from "../../components/Card";
import StatTile from "../../components/StatTile";
import DeltaBadge from "../../components/DeltaBadge";
import { useCombinedComparison } from "../../lib/useComparison";
import { combinedAopTarget, combinedActualRevenue, combinedAchievementPct } from "../../lib/aggregate";
import { fmtCr, fmtPct } from "../../lib/format";
import { useFilterStore } from "../../store/filterStore";

export default function CombinedTotalsSection() {
  const comparisonMode = useFilterStore((s) => s.comparisonMode);

  const targetComparison = useCombinedComparison(combinedAopTarget, comparisonMode);
  const revenueComparison = useCombinedComparison(combinedActualRevenue, comparisonMode);
  const achievementComparison = useCombinedComparison(combinedAchievementPct, comparisonMode);

  return (
    <Card title="Combined Totals" subtitle="All 4 territories, current period">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <StatTile
          label="Combined AOP Target"
          value={fmtCr(targetComparison.current)}
          delta={<DeltaBadge result={targetComparison} mode={comparisonMode} />}
        />
        <StatTile
          label="Combined Actual Revenue"
          value={fmtCr(revenueComparison.current)}
          delta={<DeltaBadge result={revenueComparison} mode={comparisonMode} />}
        />
        <StatTile
          label="Combined Achievement %"
          value={fmtPct(achievementComparison.current)}
          delta={<DeltaBadge result={achievementComparison} mode={comparisonMode} />}
        />
      </div>
    </Card>
  );
}
