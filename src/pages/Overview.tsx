import FilterBar from "../components/FilterBar";
import TerritoryCard from "../components/TerritoryCard";
import CombinedTotalsSection from "./sections/CombinedTotalsSection";
import OverallDiscountSummarySection from "./sections/OverallDiscountSummarySection";
import MonthlyTrendChart from "./sections/MonthlyTrendChart";
import SalesQualityContributionSummary from "./sections/SalesQualityContributionSummary";
import { primaryMonth, useFilterStore } from "../store/filterStore";
import { getMonthData } from "../lib/loadData";
import { MANAGERS, MANAGER_TERRITORY_LABEL } from "../types";
import { formatMonthLabel } from "../lib/periods";

export default function Overview() {
  const { selectedMonths } = useFilterStore();
  const month = primaryMonth(selectedMonths);
  const monthLabel = month ? formatMonthLabel(month) : "no month selected";

  // TerritoryCard grid: a single "current" snapshot per manager (primaryMonth).
  const primaryTerritories = getMonthData(month)?.territories ?? [];

  // Combined summary sections: flattened across EVERY selected month, not
  // just the latest -- selecting only July must show different totals than
  // selecting June+July, and selecting both should sum higher for the
  // Cr-denominated tiles.
  const selectedTerritories = selectedMonths.flatMap((m) => getMonthData(m)?.territories ?? []);

  // The territory nav in FilterBar now navigates to /territory/:manager
  // instead of filtering this grid -- so it always shows all 4 managers.
  const territories = MANAGERS.map((manager) => {
    const found = primaryTerritories.find((t) => t.manager === manager);
    return (
      found ?? {
        manager,
        territoryLabel: MANAGER_TERRITORY_LABEL[manager],
        month,
        subRegions: [],
        financialControl: null,
        billingChallenges: null,
      }
    );
  });

  return (
    <div className="min-h-screen">
      <FilterBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-charcoal">CRD Leads Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Territory performance {selectedMonths.length > 1 ? "as of" : "for"} {monthLabel}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <CombinedTotalsSection />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <OverallDiscountSummarySection territories={selectedTerritories} />
            <MonthlyTrendChart />
          </div>

          <SalesQualityContributionSummary territories={selectedTerritories} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {territories.map((t) => (
              <TerritoryCard key={t.manager} territory={t} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
