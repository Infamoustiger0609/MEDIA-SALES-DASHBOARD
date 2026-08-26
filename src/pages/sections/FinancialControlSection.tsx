import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import StatTile from "../../components/StatTile";
import DeltaBadge from "../../components/DeltaBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { useComparison } from "../../lib/useComparison";
import { fmtCr, fmtPct } from "../../lib/format";
import type { ComparisonMode, Territory } from "../../types";

interface FinancialControlSectionProps {
  territories: Territory[];
  comparisonMode: ComparisonMode;
}

export default function FinancialControlSection({
  territories,
  comparisonMode,
}: FinancialControlSectionProps) {
  // Hooks run unconditionally -- see BusinessPlanningSection for why.
  const primaryManager = territories[0]?.manager ?? "";
  const ytdIncomeComparison = useComparison(
    primaryManager,
    (t) => t.financialControl?.ytdIncomeBilled ?? null,
    comparisonMode,
  );
  const collectionComparison = useComparison(
    primaryManager,
    (t) => t.financialControl?.collectionPct ?? null,
    comparisonMode,
  );

  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
    const fc = territory.financialControl;

    return (
      <Card title="Financial Control" subtitle="Year-to-date income, outstanding & collection">
        {!fc ? (
          <p className="text-sm text-slate-400">No financial control data for this period.</p>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">{fc.territory ?? territory.territoryLabel}</span>
              <GradeBadge grade={fc.ranking} />
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <StatTile
                label="YTD Income Billed"
                value={fmtCr(ytdIncomeComparison.current)}
                delta={<DeltaBadge result={ytdIncomeComparison} mode={comparisonMode} />}
              />
              <StatTile label="YTD Outstanding" value={fmtCr(fc.ytdOS)} />
              <StatTile
                label="Collection %"
                value={fmtPct(collectionComparison.current)}
                delta={<DeltaBadge result={collectionComparison} mode={comparisonMode} />}
              />
            </div>
          </div>
        )}
      </Card>
    );
  }

  const months = territories.map((t) => t.month);
  const rows = [
    { label: "YTD Income Billed", values: territories.map((t) => fmtCr(t.financialControl?.ytdIncomeBilled)) },
    { label: "YTD Outstanding", values: territories.map((t) => fmtCr(t.financialControl?.ytdOS)) },
    { label: "Collection %", values: territories.map((t) => fmtPct(t.financialControl?.collectionPct)) },
    {
      label: "Ranking",
      values: territories.map((t, i) => <GradeBadge key={i} grade={t.financialControl?.ranking} />),
    },
  ];

  return (
    <Card title="Financial Control" subtitle="Year-to-date income, outstanding & collection, by month">
      <MonthComparisonTable months={months} rows={rows} />
    </Card>
  );
}
