import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import StatTile from "../../components/StatTile";
import DeltaBadge from "../../components/DeltaBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { useComparison } from "../../lib/useComparison";
import { fmtCr, fmtPct } from "../../lib/format";
import type { ComparisonMode, Territory } from "../../types";

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
      <Card title="Billing Challenges" subtitle="Monthly income vs. billing challenges">
        {!bc ? (
          <p className="text-sm text-slate-400">No billing challenges data for this period.</p>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">{bc.territory ?? territory.territoryLabel}</span>
              <GradeBadge grade={bc.ranking} />
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <StatTile
                label="Monthly Income Billed"
                value={fmtCr(incomeComparison.current)}
                delta={<DeltaBadge result={incomeComparison} mode={comparisonMode} />}
              />
              <StatTile label="Monthly Billing Challenges" value={fmtCr(bc.monthlyBillingChallenges)} />
              <StatTile
                label="Billing Challenges %"
                value={fmtPct(challengesPctComparison.current)}
                delta={<DeltaBadge result={challengesPctComparison} mode={comparisonMode} invert />}
              />
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
      values: territories.map((t) => fmtPct(t.billingChallenges?.billingChallengesPct)),
    },
    {
      label: "Ranking",
      values: territories.map((t, i) => <GradeBadge key={i} grade={t.billingChallenges?.ranking} />),
    },
  ];

  return (
    <Card title="Billing Challenges" subtitle="Monthly income vs. billing challenges, by month">
      <MonthComparisonTable months={months} rows={rows} />
    </Card>
  );
}
