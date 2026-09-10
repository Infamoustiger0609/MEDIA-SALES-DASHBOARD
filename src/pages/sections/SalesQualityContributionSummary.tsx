import Card from "../../components/Card";
import { SALES_QUALITY_KEYS, type Territory } from "../../types";
import { combinedActualRevenue } from "../../lib/aggregate";
import { SALES_QUALITY_TONES } from "../../lib/chartColors";
import { fmtCr, fmtPct } from "../../lib/format";

interface SalesQualityContributionSummaryProps {
  territories: Territory[];
}

export default function SalesQualityContributionSummary({
  territories,
}: SalesQualityContributionSummaryProps) {
  const sums = SALES_QUALITY_KEYS.map((key, i) => {
    const values = territories
      .flatMap((t) => t.subRegions)
      .map((sr) => sr.salesQuality?.[key]?.cm)
      .filter((v): v is number => v !== null && v !== undefined);
    const sum = values.length > 0 ? values.reduce((a, b) => a + b, 0) : null;
    return { key, sum, color: SALES_QUALITY_TONES[i % SALES_QUALITY_TONES.length] };
  });

  // Matches the source sheet's own formula: each initiative's CM as a % of
  // combined actual revenue, not as a % of the other initiatives' CM total
  // (those aren't on the same base, so they never summed to anything
  // meaningful anyway). The segmented bar below therefore doesn't fill to
  // 100% -- the unfilled remainder is revenue outside these 6 initiatives.
  const revenue = combinedActualRevenue(territories);
  const hasAnyData = sums.some((s) => s.sum !== null);

  const pctOf = (sum: number | null) =>
    sum !== null && revenue !== null && revenue > 0 ? (sum / revenue) * 100 : null;

  return (
    <Card
      title="Sales Quality — Combined Contribution"
      subtitle="Combined CM value and % of combined actual revenue, across all territories"
    >
      {!hasAnyData ? (
        <p className="text-sm text-muted">No sales quality data for this period.</p>
      ) : (
        <div>
          <div className="mb-5 flex h-3.5 w-full overflow-hidden rounded-full bg-app-bg">
            {sums.map(({ key, sum, color }) => {
              const pct = pctOf(sum);
              if (pct === null || pct <= 0) return null;
              return <div key={key} title={key} style={{ width: `${pct}%`, backgroundColor: color }} />;
            })}
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
            {sums.map(({ key, sum, color }) => {
              const pct = pctOf(sum);
              return (
                <div key={key} className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 flex-none rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-charcoal">{key}</div>
                    <div className="font-mono text-xs text-muted">
                      {fmtCr(sum)} · {pct !== null ? fmtPct(pct / 100) : "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
