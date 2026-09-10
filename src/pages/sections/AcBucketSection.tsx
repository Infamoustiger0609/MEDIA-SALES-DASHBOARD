import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { GOLD_SERIES } from "../../lib/chartColors";
import { fmtCr, fmtPct } from "../../lib/format";
import { formatMonthLabel } from "../../lib/periods";
import type { AcBucket, AcBucketEntry, Territory } from "../../types";

interface AcBucketSectionProps {
  territories: Territory[];
}

function regionNamesOf(territories: Territory[]): string[] {
  return Array.from(new Set(territories.flatMap((t) => t.subRegions.map((sr) => sr.regionName))));
}

function acBucketOf(t: Territory, regionName: string): AcBucket | null {
  return t.subRegions.find((sr) => sr.regionName === regionName)?.acBucket ?? null;
}

/** A single Key+Growth (gold) / Rotating (pale tan) segmented bar, each
 * segment's width its own % contribution to AOP -- unfilled remainder is
 * AOP outside these two buckets. */
function AcBucketBar({ keyGrowth, rotating }: { keyGrowth: AcBucketEntry | null; rotating: AcBucketEntry | null }) {
  const keyPct = keyGrowth?.pctContributionOfAop != null ? Math.max(0, keyGrowth.pctContributionOfAop * 100) : 0;
  const rotPct = rotating?.pctContributionOfAop != null ? Math.max(0, rotating.pctContributionOfAop * 100) : 0;
  return (
    <div className="flex h-6 w-full overflow-hidden rounded-md bg-app-bg">
      {keyPct > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden whitespace-nowrap text-[11px] font-bold text-cream"
          style={{ width: `${keyPct}%`, backgroundColor: GOLD_SERIES.actual }}
        >
          {keyPct >= 12 ? fmtPct(keyGrowth?.pctContributionOfAop) : ""}
        </div>
      )}
      {rotPct > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden whitespace-nowrap text-[11px] font-bold text-ink-soft"
          style={{ width: `${rotPct}%`, backgroundColor: GOLD_SERIES.target }}
        >
          {rotPct >= 12 ? fmtPct(rotating?.pctContributionOfAop) : ""}
        </div>
      )}
    </div>
  );
}

function BucketLegend() {
  return (
    <div className="mt-2 flex gap-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: GOLD_SERIES.actual }} />
        Key+Growth
      </span>
      <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: GOLD_SERIES.target }} />
        Rotating
      </span>
    </div>
  );
}

export default function AcBucketSection({ territories }: AcBucketSectionProps) {
  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
    const regionsWithData = territory.subRegions.filter((sr) => sr.acBucket);

    return (
      <Card title="2 · A/c Bucket — Key+Growth vs. Rotating" subtitle="Contribution to AOP">
        <div className="flex flex-col gap-6">
          {regionsWithData.map((sr) => {
            const bucket = sr.acBucket!;

            return (
              <div key={sr.regionName}>
                {territory.subRegions.length > 1 && (
                  <h4 className="mb-2 text-sm font-semibold text-charcoal">{sr.regionName}</h4>
                )}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">
                  <div>
                    <AcBucketBar keyGrowth={bucket.keyGrowth} rotating={bucket.rotating} />
                    <BucketLegend />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left text-xs">
                      <thead>
                        <tr className="text-muted-2 uppercase tracking-wide">
                          <th className="pb-2 font-semibold">Division</th>
                          <th className="pb-2 font-semibold">Target Idx</th>
                          <th className="pb-2 font-semibold">% of AOP</th>
                          <th className="pb-2 font-semibold">Top A/Cs Value</th>
                          <th className="pb-2 font-semibold">Ranking</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline">
                        {[bucket.keyGrowth, bucket.rotating].map((b, i) => (
                          <tr key={i}>
                            <td className="py-2 font-semibold text-charcoal">{b?.division ?? "—"}</td>
                            <td className="py-2 font-mono tabular-nums text-ink-soft">{fmtPct(b?.targetIndex)}</td>
                            <td className="py-2 font-mono font-semibold tabular-nums text-charcoal">
                              {fmtPct(b?.pctContributionOfAop)}
                            </td>
                            <td className="py-2 font-mono tabular-nums text-ink-soft">{fmtCr(b?.topAccountsValue)}</td>
                            <td className="py-2">
                              <GradeBadge grade={b?.ranking} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}

          {regionsWithData.length === 0 && (
            <p className="text-sm text-muted">No A/c Bucket data for this period.</p>
          )}
        </div>
      </Card>
    );
  }

  const months = territories.map((t) => t.month);
  const regionNames = regionNamesOf(territories).filter((regionName) =>
    territories.some((t) => acBucketOf(t, regionName)),
  );

  return (
    <Card title="2 · A/c Bucket — Key+Growth vs. Rotating" subtitle="Contribution to AOP, by month">
      <div className="flex flex-col gap-6">
        {regionNames.map((regionName) => {
          const rows = [
            {
              label: "Key + Growth — % of AOP",
              values: territories.map((t) => fmtPct(acBucketOf(t, regionName)?.keyGrowth?.pctContributionOfAop)),
            },
            {
              label: "Key + Growth — Ranking",
              values: territories.map((t, i) => (
                <GradeBadge key={i} grade={acBucketOf(t, regionName)?.keyGrowth?.ranking} />
              )),
            },
            {
              label: "Rotating — % of AOP",
              values: territories.map((t) => fmtPct(acBucketOf(t, regionName)?.rotating?.pctContributionOfAop)),
            },
            {
              label: "Rotating — Ranking",
              values: territories.map((t, i) => (
                <GradeBadge key={i} grade={acBucketOf(t, regionName)?.rotating?.ranking} />
              )),
            },
          ];

          return (
            <div key={regionName}>
              {regionNames.length > 1 && (
                <h4 className="mb-2 text-sm font-semibold text-charcoal">{regionName}</h4>
              )}
              <div className="mb-4 flex flex-col gap-2">
                {territories.map((t, i) => {
                  const bucket = acBucketOf(t, regionName);
                  return (
                    <div key={t.month} className="flex items-center gap-3">
                      <span className="w-16 flex-none text-xs font-semibold text-ink-soft">
                        {formatMonthLabel(months[i])}
                      </span>
                      <AcBucketBar keyGrowth={bucket?.keyGrowth ?? null} rotating={bucket?.rotating ?? null} />
                    </div>
                  );
                })}
                <div className="pl-[76px]">
                  <BucketLegend />
                </div>
              </div>
              <MonthComparisonTable months={months} rows={rows} metricHeader="Metric" />
            </div>
          );
        })}

        {regionNames.length === 0 && (
          <p className="text-sm text-muted">No A/c Bucket data for the selected months.</p>
        )}
      </div>
    </Card>
  );
}
