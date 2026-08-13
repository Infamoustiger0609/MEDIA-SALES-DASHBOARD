import FilterBar from "../components/FilterBar";
import TerritoryCard from "../components/TerritoryCard";
import { useFilterStore } from "../store/filterStore";
import { getMonthData } from "../lib/loadData";
import { MANAGERS, MANAGER_TERRITORY_LABEL } from "../types";
import { formatMonthLabel } from "../lib/periods";

export default function Overview() {
  const { month, territory: territoryFilter } = useFilterStore();
  const monthData = getMonthData(month);

  const territories = MANAGERS.filter(
    (m) => territoryFilter === "All" || territoryFilter === m,
  ).map((manager) => {
    const found = monthData?.territories.find((t) => t.manager === manager);
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
      <FilterBar showTerritoryPills />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">CRD Leads Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Territory performance for {formatMonthLabel(month)}
          </p>
        </div>

        {territories.length === 0 ? (
          <p className="text-sm text-slate-500">No data for the selected filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {territories.map((t) => (
              <TerritoryCard key={t.manager} territory={t} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
