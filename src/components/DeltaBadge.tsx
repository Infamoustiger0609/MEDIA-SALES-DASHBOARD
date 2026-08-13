import type { ComparisonResult } from "../lib/useComparison";
import type { ComparisonMode } from "../types";

interface DeltaBadgeProps {
  result: ComparisonResult;
  mode: ComparisonMode;
  /** If true, a positive delta is bad (e.g. billing challenges %) and colors invert. */
  invert?: boolean;
}

export default function DeltaBadge({ result, mode, invert = false }: DeltaBadgeProps) {
  if (mode === "None") return null;

  if (!result.available || result.deltaPct === null) {
    return <span className="whitespace-nowrap text-xs font-medium text-slate-400">No prior data</span>;
  }

  const isUp = result.deltaPct > 0;
  const isFlat = result.deltaPct === 0;
  const isGood = isFlat ? null : invert ? !isUp : isUp;

  const colorClass = isFlat
    ? "text-slate-500 bg-slate-100"
    : isGood
      ? "text-emerald-700 bg-emerald-100"
      : "text-rose-700 bg-rose-100";

  const arrow = isFlat ? "—" : isUp ? "▲" : "▼";

  return (
    <span
      className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${colorClass}`}
      title={`${mode} vs prior period`}
    >
      {arrow} {Math.abs(result.deltaPct).toFixed(1)}%
    </span>
  );
}
