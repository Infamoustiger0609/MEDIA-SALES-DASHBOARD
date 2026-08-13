import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import StatTile from "../../components/StatTile";
import DeltaBadge from "../../components/DeltaBadge";
import { useComparison } from "../../lib/useComparison";
import { fmtCr, fmtPct } from "../../lib/format";
import type { ComparisonMode, Territory } from "../../types";

interface BillingChallengesSectionProps {
  territory: Territory;
  comparisonMode: ComparisonMode;
}

export default function BillingChallengesSection({
  territory,
  comparisonMode,
}: BillingChallengesSectionProps) {
  const bc = territory.billingChallenges;

  const incomeComparison = useComparison(
    territory.manager,
    (t) => t.billingChallenges?.monthlyIncomeBilled ?? null,
    comparisonMode,
  );
  const challengesPctComparison = useComparison(
    territory.manager,
    (t) => t.billingChallenges?.billingChallengesPct ?? null,
    comparisonMode,
  );

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
