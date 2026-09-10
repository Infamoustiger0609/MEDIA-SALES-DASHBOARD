import Card from "../../components/Card";
import DeltaBadge from "../../components/DeltaBadge";
import { useCombinedComparison } from "../../lib/useComparison";
import { combinedAopTarget, combinedActualRevenue, combinedAchievementPct } from "../../lib/aggregate";
import { fmtCr, fmtPct } from "../../lib/format";
import { useFilterStore } from "../../store/filterStore";
import type { ComparisonResult } from "../../lib/useComparison";
import type { ComparisonMode } from "../../types";
import type { ReactNode } from "react";

interface KpiTileProps {
  label: string;
  value: ReactNode;
  comparison: ComparisonResult;
  comparisonMode: ComparisonMode;
  sub: string;
}

function KpiTile({ label, value, comparison, comparisonMode, sub }: KpiTileProps) {
  return (
    <div className="rounded-xl border border-hairline bg-cream p-5 shadow-[0_2px_10px_rgba(36,31,24,0.05)]">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2.5 flex flex-wrap items-baseline gap-2.5">
        <span className="font-serif text-[34px] font-semibold leading-none text-charcoal">{value}</span>
        <DeltaBadge result={comparison} mode={comparisonMode} />
      </div>
      <div className="mt-2 text-xs font-medium text-muted-2">{sub}</div>
    </div>
  );
}

export default function CombinedTotalsSection() {
  const comparisonMode = useFilterStore((s) => s.comparisonMode);

  const targetComparison = useCombinedComparison(combinedAopTarget, comparisonMode);
  const revenueComparison = useCombinedComparison(combinedActualRevenue, comparisonMode);
  const achievementComparison = useCombinedComparison(combinedAchievementPct, comparisonMode);

  return (
    <Card title="Combined Totals" subtitle="All 4 territories, current period">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiTile
          label="Combined AOP Target"
          value={fmtCr(targetComparison.current)}
          comparison={targetComparison}
          comparisonMode={comparisonMode}
          sub="across 4 territories"
        />
        <KpiTile
          label="Combined Actual Revenue"
          value={fmtCr(revenueComparison.current)}
          comparison={revenueComparison}
          comparisonMode={comparisonMode}
          sub="across 4 territories"
        />
        <KpiTile
          label="Combined Achievement %"
          value={fmtPct(achievementComparison.current)}
          comparison={achievementComparison}
          comparisonMode={comparisonMode}
          sub="revenue vs. AOP target"
        />
      </div>
    </Card>
  );
}
