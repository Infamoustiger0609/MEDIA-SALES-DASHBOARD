import FilterBar from "../components/FilterBar";
import TerritoryCard from "../components/TerritoryCard";
import CombinedTotalsSection from "./sections/CombinedTotalsSection";
import OverallDiscountSummarySection from "./sections/OverallDiscountSummarySection";
import MonthlyTrendChart from "./sections/MonthlyTrendChart";
import SalesQualityContributionSummary from "./sections/SalesQualityContributionSummary";
import { useFilterStore } from "../store/filterStore";
import { getMonthData } from "../lib/loadData";
import { MANAGERS, MANAGER_TERRITORY_LABEL } from "../types";
import { formatPeriodPhrase } from "../lib/periods";

export default function Overview() {
  const { selectedMonths } = useFilterStore();

  // Every summary/card on this page is aggregated across EVERY selected
  // month, not just the latest -- selecting only July must show different
  // numbers than selecting June+July, and the territory cards must never
  // silently disagree with CombinedTotalsSection above them about what
  // "the selected period" means.
  const selectedTerritories = selectedMonths.flatMap((m) => getMonthData(m)?.territories ?? []);

  return (
    <div className="min-h-screen">
      <FilterBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold text-charcoal">CRD Leads Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Territory performance {formatPeriodPhrase(selectedMonths)}</p>
        </div>

        <div className="flex flex-col gap-5">
          <CombinedTotalsSection />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <OverallDiscountSummarySection territories={selectedTerritories} />
            <MonthlyTrendChart />
          </div>

          <SalesQualityContributionSummary territories={selectedTerritories} />

          <div>
            <h2 className="mb-3.5 font-serif text-[15px] font-semibold text-charcoal">Territories</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {MANAGERS.map((manager) => (
                <TerritoryCard
                  key={manager}
                  manager={manager}
                  territoryLabel={MANAGER_TERRITORY_LABEL[manager]}
                  territories={selectedTerritories.filter((t) => t.manager === manager)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
