import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import StatTile from "../../components/StatTile";
import DeltaBadge from "../../components/DeltaBadge";
import { useComparison } from "../../lib/useComparison";
import { fmtCr, fmtPct } from "../../lib/format";
import type { ComparisonMode, Territory } from "../../types";

interface FinancialControlSectionProps {
  territory: Territory;
  comparisonMode: ComparisonMode;
}

export default function FinancialControlSection({
  territory,
  comparisonMode,
}: FinancialControlSectionProps) {
  const fc = territory.financialControl;

  const ytdIncomeComparison = useComparison(
    territory.manager,
    (t) => t.financialControl?.ytdIncomeBilled ?? null,
    comparisonMode,
  );
  const collectionComparison = useComparison(
    territory.manager,
    (t) => t.financialControl?.collectionPct ?? null,
    comparisonMode,
  );

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
