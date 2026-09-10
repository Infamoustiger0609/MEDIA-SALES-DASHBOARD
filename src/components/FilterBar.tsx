import { useNavigate, useParams } from "react-router-dom";
import { useFilterStore } from "../store/filterStore";
import { availableMonths, getLatestMonth } from "../lib/loadData";
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
          className="text-xs font-semibold text-gold-link hover:text-gold-link disabled:cursor-default disabled:text-muted-2"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={clearMonths}
          disabled={selectedMonths.length === 0}
          className="text-xs font-medium text-muted hover:text-charcoal disabled:cursor-default disabled:text-muted-2"
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
              className="h-4 w-4 rounded border-hairline accent-terracotta focus:ring-terracotta/40"
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
  const latestMonth = getLatestMonth();

  return (
    <>
      {/* ===== Top bar ===== */}
      <div className="sticky top-0 z-30 bg-charcoal">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline gap-3">
            <span className="font-sans text-lg font-bold tracking-wide text-cream">
              PVR<span className="text-gold">INOX</span>
            </span>
            <span className="hidden h-4 w-px bg-cream/25 sm:inline-block" />
            <span className="hidden text-xs font-medium uppercase tracking-wider text-cream/60 sm:inline-block">
              CRD Leads Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            {latestMonth && (
              <span className="hidden text-xs font-medium text-cream/50 md:inline-block">
                Report: CRD_Leads · refreshed {formatMonthLabel(latestMonth)}
              </span>
            )}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-charcoal">
              AM
            </span>
          </div>
        </div>
      </div>

      {/* ===== Territory nav + filter controls ===== */}
      <div className="sticky top-16 z-20 border-b border-hairline bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Persistent territory nav -- always visible, on every page, at every screen size */}
          <div className="flex flex-wrap items-center gap-1.5">
            {TERRITORY_NAV_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                aria-current={activeTerritory === t ? "page" : undefined}
                onClick={() => goToTerritory(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTerritory === t
                    ? "bg-charcoal text-cream"
                    : "border border-hairline bg-transparent text-ink-soft hover:bg-charcoal/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Desktop / tablet controls */}
          <div className="hidden flex-wrap items-center gap-5 sm:flex">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Months</span>
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-hairline bg-cream px-2.5 py-1.5 shadow-[0_1px_2px_rgba(36,31,24,0.04)]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedMonths.length === 0 ? (
                      <span className="px-1 text-xs font-medium text-muted-2">No months</span>
                    ) : (
                      selectedMonths
                        .slice()
                        .sort()
                        .map((m) => (
                          <span
                            key={m}
                            className="rounded-md bg-app-bg px-2 py-1 text-xs font-semibold text-charcoal"
                          >
                            {formatMonthLabel(m)}
                          </span>
                        ))
                    )}
                  </div>
                  <span className="text-muted-2 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="absolute left-0 z-20 mt-2 w-56 rounded-xl border border-hairline bg-cream p-2 shadow-lg">
                  <PeriodChecklist
                    selectedMonths={selectedMonths}
                    toggleMonth={toggleMonth}
                    selectAllMonths={selectAllMonths}
                    clearMonths={clearMonths}
                    allSelected={allSelected}
                  />
                </div>
              </details>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Compare</span>
              <div className="flex items-center gap-0.5 rounded-lg bg-track p-1">
                {COMPARISON_OPTIONS.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setComparisonMode(mode)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      comparisonMode === mode
                        ? "bg-cream text-charcoal shadow-sm"
                        : "text-muted hover:text-charcoal"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: month + comparison collapsed into a details/summary dropdown
              (territory nav above stays persistent/uncollapsed on every size) */}
          <details className="group sm:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink-soft">
              <span>
                {allSelected
                  ? `All months (${availableMonths.length})`
                  : selectedMonths.length === 0
                    ? "No months selected"
                    : selectedMonths.length === 1
                      ? formatMonthLabel(selectedMonths[0])
                      : `${selectedMonths.length} months selected`}{" "}
                · {comparisonMode}
              </span>
              <span className="text-muted-2 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <div className="rounded-lg border border-hairline px-1 py-2 text-xs font-medium text-muted">
                <PeriodChecklist
                  selectedMonths={selectedMonths}
                  toggleMonth={toggleMonth}
                  selectAllMonths={selectAllMonths}
                  clearMonths={clearMonths}
                  allSelected={allSelected}
                />
              </div>
              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                Comparison
                <select
                  value={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.value as ComparisonMode)}
                  className="rounded-lg border border-hairline bg-cream px-2.5 py-1.5 text-sm font-medium text-charcoal"
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
    </>
  );
}
