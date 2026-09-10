import { Link, Navigate, useParams } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import { primaryMonth, useFilterStore } from "../store/filterStore";
import { getTerritory } from "../lib/loadData";
import { formatMonthLabel } from "../lib/periods";
import { MANAGERS, MANAGER_TERRITORY_LABEL, type Manager, type Territory } from "../types";
import BusinessPlanningSection from "./sections/BusinessPlanningSection";
import AcBucketSection from "./sections/AcBucketSection";
import PriceControlSection from "./sections/PriceControlSection";
import SalesQualitySection from "./sections/SalesQualitySection";
import ProductivitySection from "./sections/ProductivitySection";
import FinancialControlSection from "./sections/FinancialControlSection";
import BillingChallengesSection from "./sections/BillingChallengesSection";

export default function TerritoryDetail() {
  const { manager } = useParams<{ manager: string }>();
  const { selectedMonths, comparisonMode } = useFilterStore();
  const month = primaryMonth(selectedMonths);
  const monthLabel = month ? formatMonthLabel(month) : "no month selected";

  if (!manager || !MANAGERS.includes(manager as Manager)) {
    return <Navigate to="/" replace />;
  }

  const territoryLabel = MANAGER_TERRITORY_LABEL[manager as Manager];

  // Sorted ascending regardless of toggle order, one entry per selected month
  // that actually has data for this manager -- this is what each section
  // renders a side-by-side column/block for once more than one is selected.
  const territories: Territory[] = [...selectedMonths]
    .sort()
    .map((m) => getTerritory(m, manager))
    .filter((t): t is Territory => !!t);

  return (
    <div className="min-h-screen">
      <FilterBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/" className="text-sm font-medium text-muted hover:text-charcoal">
            ← Overview
          </Link>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div>
              <span className="font-serif text-2xl font-semibold text-charcoal">{manager}</span>
              <span className="ml-2.5 text-sm font-medium text-muted">{territoryLabel}</span>
            </div>
            {territories[0] && (
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                Sub-regions: {territories[territories.length - 1]?.subRegions.map((sr) => sr.regionName).join(", ")}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {selectedMonths.length > 1 ? `As of ${monthLabel}` : monthLabel}
          </p>
        </div>

        {territories.length === 0 ? (
          <p className="text-sm text-muted">No data available for {manager} in this period.</p>
        ) : (
          <div className="flex flex-col gap-5">
            <BusinessPlanningSection territories={territories} comparisonMode={comparisonMode} />
            <AcBucketSection territories={territories} />
            <PriceControlSection territories={territories} />
            <SalesQualitySection territories={territories} />
            <ProductivitySection territories={territories} />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <FinancialControlSection territories={territories} comparisonMode={comparisonMode} />
              <BillingChallengesSection territories={territories} comparisonMode={comparisonMode} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
