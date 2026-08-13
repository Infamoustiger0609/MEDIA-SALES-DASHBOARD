import { Link, Navigate, useParams } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import { useFilterStore } from "../store/filterStore";
import { getTerritory } from "../lib/loadData";
import { formatMonthLabel } from "../lib/periods";
import { MANAGERS, MANAGER_TERRITORY_LABEL, type Manager } from "../types";
import BusinessPlanningSection from "./sections/BusinessPlanningSection";
import AcBucketSection from "./sections/AcBucketSection";
import PriceControlSection from "./sections/PriceControlSection";
import SalesQualitySection from "./sections/SalesQualitySection";
import ProductivitySection from "./sections/ProductivitySection";
import FinancialControlSection from "./sections/FinancialControlSection";
import BillingChallengesSection from "./sections/BillingChallengesSection";

export default function TerritoryDetail() {
  const { manager } = useParams<{ manager: string }>();
  const { month, comparisonMode } = useFilterStore();

  if (!manager || !MANAGERS.includes(manager as Manager)) {
    return <Navigate to="/" replace />;
  }

  const territory = getTerritory(month, manager);
  const territoryLabel = MANAGER_TERRITORY_LABEL[manager as Manager];

  return (
    <div className="min-h-screen">
      <FilterBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-700">
            ← Overview
          </Link>
          <div className="mt-2 flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-slate-900">{manager}</h1>
            <span className="text-sm text-slate-500">{territoryLabel}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{formatMonthLabel(month)}</p>
        </div>

        {!territory ? (
          <p className="text-sm text-slate-500">No data available for {manager} in this period.</p>
        ) : (
          <div className="flex flex-col gap-5">
            <BusinessPlanningSection territory={territory} comparisonMode={comparisonMode} />
            <AcBucketSection territory={territory} />
            <PriceControlSection territory={territory} />
            <SalesQualitySection territory={territory} />
            <ProductivitySection territory={territory} />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <FinancialControlSection territory={territory} comparisonMode={comparisonMode} />
              <BillingChallengesSection territory={territory} comparisonMode={comparisonMode} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
