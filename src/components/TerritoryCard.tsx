import { Link } from "react-router-dom";
import type { Territory } from "../types";
import GradeBadge from "./GradeBadge";
import DeltaBadge from "./DeltaBadge";
import { aopAchievementPct, territoryPlanningGrade, totalActualRevenue } from "../lib/aggregate";
import { fmtCr, fmtPct } from "../lib/format";
import { useComparison } from "../lib/useComparison";
import { useFilterStore } from "../store/filterStore";

interface TerritoryCardProps {
  territory: Territory;
}

const GRADE_BAR_COLOR: Record<string, string> = {
  "A+": "var(--color-grade-a)",
  A: "var(--color-grade-a)",
  B: "var(--color-grade-b)",
  C: "var(--color-grade-c)",
};

export default function TerritoryCard({ territory }: TerritoryCardProps) {
  const comparisonMode = useFilterStore((s) => s.comparisonMode);
  const achievementComparison = useComparison(territory.manager, aopAchievementPct, comparisonMode);
  const revenueComparison = useComparison(territory.manager, totalActualRevenue, comparisonMode);

  const grade = territoryPlanningGrade(territory);
  const barPct = achievementComparison.current !== null
    ? Math.max(0, Math.min(100, achievementComparison.current * 100))
    : 0;
  const barColor = grade ? (GRADE_BAR_COLOR[grade] ?? "var(--color-grade-n)") : "var(--color-grade-n)";

  return (
    <Link
      to={`/territory/${territory.manager}`}
      className="group flex flex-col gap-4 rounded-2xl border border-hairline bg-cream p-6 shadow-[0_2px_10px_rgba(36,31,24,0.05)] transition-shadow duration-150 hover:border-gold/40 hover:shadow-[0_6px_20px_rgba(36,31,24,0.12)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-charcoal">{territory.manager}</h3>
          <p className="mt-0.5 text-xs font-medium text-muted">{territory.territoryLabel}</p>
        </div>
        <GradeBadge grade={grade} />
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[26px] font-semibold leading-none text-charcoal">
            {fmtPct(achievementComparison.current)}
          </span>
          <span className="text-xs font-medium text-muted-2">of AOP</span>
          <span className="ml-auto">
            <DeltaBadge result={achievementComparison} mode={comparisonMode} />
          </span>
        </div>
        <div className="mt-2.5 mb-1 h-1.5 overflow-hidden rounded-full bg-gold-soft-2/60">
          <div
            className="h-full rounded-full transition-[width]"
            style={{ width: `${barPct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {territory.subRegions.map((sr) => (
          <div key={sr.regionName} className="flex items-center gap-1 rounded-lg bg-gold-soft/25 px-2 py-1">
            {territory.subRegions.length > 1 && (
              <span className="text-[11px] font-medium text-muted-2">{sr.regionName}</span>
            )}
            <GradeBadge grade={sr.businessPlanning?.planningGrade} label="P" />
            <GradeBadge grade={sr.businessPlanning?.controlGrade} label="C" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-hairline pt-3">
        <span className="text-xs font-medium text-muted">Actual revenue</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tabular-nums text-charcoal">
            {fmtCr(revenueComparison.current)}
          </span>
          <DeltaBadge result={revenueComparison} mode={comparisonMode} />
        </span>
      </div>
    </Link>
  );
}
