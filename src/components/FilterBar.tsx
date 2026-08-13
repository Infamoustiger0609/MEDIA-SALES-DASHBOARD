import { useFilterStore, type TerritoryFilter } from "../store/filterStore";
import { availableMonths } from "../lib/loadData";
import { formatMonthLabel } from "../lib/periods";
import type { ComparisonMode } from "../types";

const TERRITORY_OPTIONS: TerritoryFilter[] = ["All", "Gaurav", "Rajesh", "Shalini", "Sharda"];
const COMPARISON_OPTIONS: ComparisonMode[] = ["None", "MoM", "QoQ", "YoY"];

interface FilterBarProps {
  showTerritoryPills?: boolean;
}

export default function FilterBar({ showTerritoryPills = false }: FilterBarProps) {
  const { territory, month, comparisonMode, setTerritory, setMonth, setComparisonMode } =
    useFilterStore();

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Desktop / tablet controls */}
        <div className="hidden flex-wrap items-center justify-between gap-4 sm:flex">
          {showTerritoryPills ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {TERRITORY_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerritory(t)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    territory === t
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-500">Period</span>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {COMPARISON_OPTIONS.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setComparisonMode(mode)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    comparisonMode === mode
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: collapsed into a details/summary dropdown */}
        <details className="group sm:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            <span>
              Filters — {territory} · {formatMonthLabel(month)} · {comparisonMode}
            </span>
            <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {showTerritoryPills && (
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                Territory
                <select
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value as TerritoryFilter)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800"
                >
                  {TERRITORY_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              Period
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              Comparison
              <select
                value={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.value as ComparisonMode)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800"
              >
                {COMPARISON_OPTIONS.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}
