import { useNavigate, useParams } from "react-router-dom";
import { useFilterStore } from "../store/filterStore";
import { availableMonths } from "../lib/loadData";
import { formatMonthLabel } from "../lib/periods";
import { MANAGERS, type ComparisonMode, type Manager } from "../types";

interface PeriodChecklistProps {
  selectedMonths: string[];
  toggleMonth: (month: string) => void;
  selectAllMonths: () => void;
  clearMonths: () => void;
  allSelected: boolean;
}

/** The "Select All" / "Clear" row + one checkbox per loaded month, shared by
 * the desktop dropdown panel and the mobile disclosure. */
function PeriodChecklist({
  selectedMonths,
  toggleMonth,
  selectAllMonths,
  clearMonths,
  allSelected,
}: PeriodChecklistProps) {
  return (
    <>
      <div className="flex items-center justify-between px-1 pb-1">
        <button
          type="button"
          onClick={selectAllMonths}
          disabled={allSelected}
          className="text-xs font-semibold text-gold hover:text-gold disabled:cursor-default disabled:text-slate-300"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={clearMonths}
          disabled={selectedMonths.length === 0}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 disabled:cursor-default disabled:text-slate-300"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {availableMonths.map((m) => (
          <label
            key={m}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-charcoal hover:bg-charcoal/5"
          >
            <input
              type="checkbox"
              checked={selectedMonths.includes(m)}
              onChange={() => toggleMonth(m)}
              className="h-4 w-4 rounded border-slate-300 accent-terracotta focus:ring-terracotta/40"
            />
            {formatMonthLabel(m)}
          </label>
        ))}
      </div>
    </>
  );
}

const TERRITORY_NAV_OPTIONS: Array<"All" | Manager> = ["All", ...MANAGERS];
const COMPARISON_OPTIONS: ComparisonMode[] = ["None", "MoM", "QoQ", "YoY"];

export default function FilterBar() {
  const navigate = useNavigate();
  const { manager } = useParams<{ manager?: string }>();
  const activeTerritory: "All" | Manager =
    manager && (MANAGERS as string[]).includes(manager) ? (manager as Manager) : "All";

  const { selectedMonths, comparisonMode, toggleMonth, selectAllMonths, setSelectedMonths, setComparisonMode } =
    useFilterStore();

  const goToTerritory = (t: "All" | Manager) => {
    navigate(t === "All" ? "/" : `/territory/${t}`);
  };

  const clearMonths = () => setSelectedMonths([]);

  const allSelected = selectedMonths.length === availableMonths.length;
  const periodSummary =
    selectedMonths.length === 0
      ? "No months selected"
      : allSelected
        ? `All months (${availableMonths.length})`
        : selectedMonths.length === 1
          ? formatMonthLabel(selectedMonths[0])
          : `${selectedMonths.length} months selected`;

  return (
    <div className="sticky top-0 z-10 border-b-2 border-gold/30 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Persistent territory nav -- always visible, on every page, at every screen size */}
        <div className="flex flex-wrap items-center gap-1.5">
          {TERRITORY_NAV_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              aria-current={activeTerritory === t ? "page" : undefined}
              onClick={() => goToTerritory(t)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTerritory === t
                  ? "bg-gold text-white"
                  : "bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Desktop / tablet controls */}
        <div className="hidden flex-wrap items-center gap-4 sm:flex">
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full bg-charcoal/5 px-3 py-1.5 text-sm font-medium text-charcoal/80 hover:bg-charcoal/10">
              <span className="text-slate-500">Period</span>
              <span className="font-semibold text-terracotta">{periodSummary}</span>
              <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="absolute left-0 z-20 mt-2 w-56 rounded-xl border border-slate-900/10 bg-cream p-2 shadow-lg">
              <PeriodChecklist
                selectedMonths={selectedMonths}
                toggleMonth={toggleMonth}
                selectAllMonths={selectAllMonths}
                clearMonths={clearMonths}
                allSelected={allSelected}
              />
            </div>
          </details>

          <div className="flex items-center gap-1 rounded-lg bg-charcoal/5 p-1">
            {COMPARISON_OPTIONS.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setComparisonMode(mode)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  comparisonMode === mode
                    ? "bg-white text-charcoal shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: month + comparison collapsed into a details/summary dropdown
            (territory nav above stays persistent/uncollapsed on every size) */}
        <details className="group sm:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            <span>
              {periodSummary} · {comparisonMode}
            </span>
            <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            <div className="rounded-lg border border-slate-200 px-1 py-2 text-xs font-medium text-slate-500">
              <PeriodChecklist
                selectedMonths={selectedMonths}
                toggleMonth={toggleMonth}
                selectAllMonths={selectAllMonths}
                clearMonths={clearMonths}
                allSelected={allSelected}
              />
            </div>
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
