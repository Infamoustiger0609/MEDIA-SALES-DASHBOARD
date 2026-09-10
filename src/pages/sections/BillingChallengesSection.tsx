import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import DeltaBadge from "../../components/DeltaBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { useComparison } from "../../lib/useComparison";
import { GOLD_SERIES } from "../../lib/chartColors";
import { fmtCr, fmtPct } from "../../lib/format";
import { formatMonthLabel } from "../../lib/periods";
import type { ComparisonMode, Territory } from "../../types";

/** ≤5% green, 5–7% gold, >7% terracotta -- lower is better here. */
function challengeColor(pct: number | null | undefined): string {
  if (pct == null) return "var(--color-grade-n)";
  if (pct <= 0.05) return "var(--color-grade-a)";
  if (pct <= 0.07) return "var(--color-grade-b)";
  return "var(--color-grade-c)";
}

function BillingChallengesChart({ territories }: { territories: Territory[] }) {
  const maxIncome = Math.max(1, ...territories.map((t) => t.billingChallenges?.monthlyIncomeBilled ?? 0));

  return (
    <div>
      <div className="flex h-36 items-end gap-7 border-b border-hairline px-2 pb-0">
        {territories.map((t) => {
          const bc = t.billingChallenges;
          const incomeH = bc?.monthlyIncomeBilled != null ? Math.max(4, (bc.monthlyIncomeBilled / maxIncome) * 120) : 0;
          const challengeH =
            bc?.billingChallengesPct != null ? Math.max(4, Math.min(120, bc.billingChallengesPct * 800)) : 0;
          return (
            <div key={t.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex items-end gap-2.5" style={{ height: 120 }}>
                <div
                  className="w-7 rounded-t"
                  style={{ height: incomeH, backgroundColor: GOLD_SERIES.actual }}
                  title={fmtCr(bc?.monthlyIncomeBilled)}
                />
                <div
                  className="w-1.5 rounded"
                  style={{ height: challengeH, backgroundColor: challengeColor(bc?.billingChallengesPct) }}
                  title={fmtPct(bc?.billingChallengesPct)}
                />
              </div>
              <span className="text-xs font-semibold text-ink-soft">{formatMonthLabel(t.month)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: GOLD_SERIES.actual }} />
          Income Billed
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <span className="inline-block h-2.5 w-1.5 rounded-sm" style={{ backgroundColor: "var(--color-grade-b)" }} />
          Billing Challenges %
        </span>
      </div>
    </div>
  );
}

interface BillingChallengesSectionProps {
  territories: Territory[];
  comparisonMode: ComparisonMode;
}

export default function BillingChallengesSection({
  territories,
  comparisonMode,
}: BillingChallengesSectionProps) {
  // Hooks run unconditionally -- see BusinessPlanningSection for why.
  const primaryManager = territories[0]?.manager ?? "";
  const incomeComparison = useComparison(
    primaryManager,
    (t) => t.billingChallenges?.monthlyIncomeBilled ?? null,
    comparisonMode,
  );
  const challengesPctComparison = useComparison(
    primaryManager,
    (t) => t.billingChallenges?.billingChallengesPct ?? null,
    comparisonMode,
  );

  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
    const bc = territory.billingChallenges;

    return (
      <Card title="7 · Billing Challenges" subtitle="Monthly income billed vs. billing challenges %">
        {!bc ? (
          <p className="text-sm text-muted">No billing challenges data for this period.</p>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">{bc.territory ?? territory.territoryLabel}</span>
              <GradeBadge grade={bc.ranking} />
            </div>
            <BillingChallengesChart territories={territories} />
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-2">Income Billed</span>
                  <DeltaBadge result={incomeComparison} mode={comparisonMode} />
                </div>
                <div className="mt-1 font-mono text-lg font-semibold text-charcoal">
                  {fmtCr(incomeComparison.current)}
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                    Billing Challenges %
                  </span>
                  <DeltaBadge result={challengesPctComparison} mode={comparisonMode} invert />
                </div>
                <div
                  className="mt-1 font-mono text-lg font-semibold"
                  style={{ color: challengeColor(challengesPctComparison.current) }}
                >
                  {fmtPct(challengesPctComparison.current)}
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
    {
      label: "Monthly Income Billed",
      values: territories.map((t) => fmtCr(t.billingChallenges?.monthlyIncomeBilled)),
    },
    {
      label: "Monthly Billing Challenges",
      values: territories.map((t) => fmtCr(t.billingChallenges?.monthlyBillingChallenges)),
    },
    {
      label: "Billing Challenges %",
      values: territories.map((t, i) => (
        <span key={i} className="font-semibold" style={{ color: challengeColor(t.billingChallenges?.billingChallengesPct) }}>
          {fmtPct(t.billingChallenges?.billingChallengesPct)}
        </span>
      )),
    },
    {
      label: "Ranking",
      values: territories.map((t, i) => <GradeBadge key={i} grade={t.billingChallenges?.ranking} />),
    },
  ];

  return (
    <Card title="7 · Billing Challenges" subtitle="Monthly income billed vs. billing challenges %, by month">
      <div className="flex flex-col gap-5">
        <BillingChallengesChart territories={territories} />
        <MonthComparisonTable months={months} rows={rows} />
      </div>
    </Card>
  );
}
