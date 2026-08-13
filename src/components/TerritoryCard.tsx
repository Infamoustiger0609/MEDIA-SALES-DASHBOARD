import { Link } from "react-router-dom";
import type { Territory } from "../types";
import GradeBadge from "./GradeBadge";
import DeltaBadge from "./DeltaBadge";
import { aopAchievementPct, totalActualRevenue } from "../lib/aggregate";
import { fmtCr, fmtPct } from "../lib/format";
import { useComparison } from "../lib/useComparison";
import { useFilterStore } from "../store/filterStore";

interface TerritoryCardProps {
  territory: Territory;
}

export default function TerritoryCard({ territory }: TerritoryCardProps) {
  const comparisonMode = useFilterStore((s) => s.comparisonMode);
  const achievementComparison = useComparison(territory.manager, aopAchievementPct, comparisonMode);
  const revenueComparison = useComparison(territory.manager, totalActualRevenue, comparisonMode);

  return (
    <Link
      to={`/territory/${territory.manager}`}
      className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{territory.manager}</h3>
          <p className="text-sm text-slate-500">{territory.territoryLabel}</p>
        </div>
        <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400">
          →
        </span>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tabular-nums text-slate-900">
          {fmtPct(achievementComparison.current)}
        </span>
        <span className="pb-0.5 text-xs text-slate-400">AOP achieved</span>
        <span className="ml-auto pb-0.5">
          <DeltaBadge result={achievementComparison} mode={comparisonMode} />
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {territory.subRegions.map((sr) => (
          <div key={sr.regionName} className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
            {territory.subRegions.length > 1 && (
              <span className="text-[11px] font-medium text-slate-400">{sr.regionName}</span>
            )}
            <GradeBadge grade={sr.businessPlanning?.planningGrade} label="P" />
            <GradeBadge grade={sr.businessPlanning?.controlGrade} label="C" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-500">Actual revenue</span>
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums text-slate-900">
            {fmtCr(revenueComparison.current)}
          </span>
          <DeltaBadge result={revenueComparison} mode={comparisonMode} />
        </span>
      </div>
    </Link>
  );
}
