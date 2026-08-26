import Card from "../../components/Card";
import { SALES_QUALITY_KEYS, type Territory } from "../../types";
import { fmtCr, fmtPct } from "../../lib/format";

interface SalesQualityContributionSummaryProps {
  territories: Territory[];
}

export default function SalesQualityContributionSummary({
  territories,
}: SalesQualityContributionSummaryProps) {
  const sums = SALES_QUALITY_KEYS.map((key) => {
    const values = territories
      .flatMap((t) => t.subRegions)
      .map((sr) => sr.salesQuality?.[key]?.cm)
      .filter((v): v is number => v !== null && v !== undefined);
    const sum = values.length > 0 ? values.reduce((a, b) => a + b, 0) : null;
    return { key, sum };
  });

  const grandTotal = sums.reduce((total, s) => total + (s.sum ?? 0), 0);
  const hasAnyData = sums.some((s) => s.sum !== null);

  return (
    <Card
      title="Sales Quality — Combined Contribution"
      subtitle="Combined CM value and % of combined CM, across all territories"
    >
      {!hasAnyData ? (
        <p className="text-sm text-slate-400">No sales quality data for this period.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          {sums.map(({ key, sum }) => (
            <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <span className="text-xs font-medium leading-tight text-slate-500">{key}</span>
              <div className="mt-2 text-base font-semibold tabular-nums text-slate-900">{fmtCr(sum)}</div>
              <div className="mt-1 text-[11px] text-slate-400">
                {sum !== null && grandTotal > 0 ? fmtPct(sum / grandTotal) : "—"} of combined
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
