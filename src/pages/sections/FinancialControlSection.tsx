import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import DeltaBadge from "../../components/DeltaBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { useComparison } from "../../lib/useComparison";
import { fmtCr, fmtPct } from "../../lib/format";
import type { ComparisonMode, Territory } from "../../types";

/** ≥85% green, 75–85% gold, <75% terracotta. */
function collectionColor(pct: number | null | undefined): string {
  if (pct == null) return "var(--color-grade-n)";
  if (pct >= 0.85) return "var(--color-grade-a)";
  if (pct >= 0.75) return "var(--color-grade-b)";
  return "var(--color-grade-c)";
}

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
      <Card title="6 · Financial Control" subtitle="Year-to-date income, outstanding & collection">
        {!fc ? (
          <p className="text-sm text-muted">No financial control data for this period.</p>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">{fc.territory ?? territory.territoryLabel}</span>
              <GradeBadge grade={fc.ranking} />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                    YTD Income Billed
                  </div>
                  <DeltaBadge result={ytdIncomeComparison} mode={comparisonMode} />
                </div>
                <div className="mt-1 font-serif text-2xl font-semibold text-charcoal">
                  {fmtCr(ytdIncomeComparison.current)}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-2">YTD Outstanding</div>
                <div className="mt-1 font-serif text-2xl font-semibold text-charcoal">{fmtCr(fc.ytdOS)}</div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-2">Collection %</div>
                  <span className="flex items-center gap-2">
                    <span
                      className="font-mono text-base font-bold"
                      style={{ color: collectionColor(collectionComparison.current) }}
                    >
                      {fmtPct(collectionComparison.current, 0)}
                    </span>
                    <DeltaBadge result={collectionComparison} mode={comparisonMode} />
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-app-bg">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, (collectionComparison.current ?? 0) * 100))}%`,
                      backgroundColor: collectionColor(collectionComparison.current),
                    }}
                  />
                </div>
              </div>
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
    {
      label: "Collection %",
      values: territories.map((t, i) => (
        <span key={i} className="font-semibold" style={{ color: collectionColor(t.financialControl?.collectionPct) }}>
          {fmtPct(t.financialControl?.collectionPct, 0)}
        </span>
      )),
    },
    {
      label: "Ranking",
      values: territories.map((t, i) => <GradeBadge key={i} grade={t.financialControl?.ranking} />),
    },
  ];

  return (
    <Card title="6 · Financial Control" subtitle="Year-to-date income, outstanding & collection, by month">
      <MonthComparisonTable months={months} rows={rows} />
    </Card>
  );
}
