import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { BRAND_ACCENT, CATEGORICAL, CHART_CHROME } from "../../lib/chartColors";
import { fmtCr, fmtPct } from "../../lib/format";
import { formatMonthLabel } from "../../lib/periods";
import type { AcBucket, Territory } from "../../types";

interface AcBucketSectionProps {
  territories: Territory[];
}

function regionNamesOf(territories: Territory[]): string[] {
  return Array.from(new Set(territories.flatMap((t) => t.subRegions.map((sr) => sr.regionName))));
}

function acBucketOf(t: Territory, regionName: string): AcBucket | null {
  return t.subRegions.find((sr) => sr.regionName === regionName)?.acBucket ?? null;
}

export default function AcBucketSection({ territories }: AcBucketSectionProps) {
  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
    const regionsWithData = territory.subRegions.filter((sr) => sr.acBucket);

    return (
      <Card title="A/c Bucket" subtitle="Key + Growth vs. Rotating contribution to AOP">
        <div className="flex flex-col gap-6">
          {regionsWithData.map((sr) => {
            const bucket = sr.acBucket!;
            const chartData = [
              {
                name: bucket.keyGrowth?.division ?? "Key + Growth",
                value: bucket.keyGrowth?.pctContributionOfAop ?? 0,
                hasData: bucket.keyGrowth?.pctContributionOfAop != null,
              },
              {
                name: bucket.rotating?.division ?? "Rotating",
                value: bucket.rotating?.pctContributionOfAop ?? 0,
                hasData: bucket.rotating?.pctContributionOfAop != null,
              },
            ];

            return (
              <div key={sr.regionName}>
                {territory.subRegions.length > 1 && (
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">{sr.regionName}</h4>
                )}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barCategoryGap="30%">
                        <CartesianGrid vertical={false} stroke={CHART_CHROME.gridline} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: CHART_CHROME.mutedText, fontSize: 12 }}
                          axisLine={{ stroke: CHART_CHROME.axis }}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                          tick={{ fill: CHART_CHROME.mutedText, fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <Tooltip
                          formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "% of AOP"]}
                          contentStyle={{ fontSize: 12, borderRadius: 8, borderTop: `2px solid ${BRAND_ACCENT.gold}` }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
                          {chartData.map((entry, i) => (
                            <Cell key={entry.name} fill={entry.hasData ? CATEGORICAL[i] : CHART_CHROME.gridline} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left text-xs">
                      <thead>
                        <tr className="text-slate-400">
                          <th className="pb-2 font-medium">Division</th>
                          <th className="pb-2 font-medium">Target Idx</th>
                          <th className="pb-2 font-medium">% of AOP</th>
                          <th className="pb-2 font-medium">Top A/Cs Value</th>
                          <th className="pb-2 font-medium">Ranking</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[bucket.keyGrowth, bucket.rotating].map((b, i) => (
                          <tr key={i}>
                            <td className="py-2 font-medium text-slate-700">{b?.division ?? "—"}</td>
                            <td className="py-2 tabular-nums text-slate-600">{fmtPct(b?.targetIndex)}</td>
                            <td className="py-2 tabular-nums text-slate-600">
                              {fmtPct(b?.pctContributionOfAop)}
                            </td>
                            <td className="py-2 tabular-nums text-slate-600">{fmtCr(b?.topAccountsValue)}</td>
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
            <p className="text-sm text-slate-400">No A/c Bucket data for this period.</p>
          )}
        </div>
      </Card>
    );
  }

  const months = territories.map((t) => t.month);
  const monthLabels = months.map(formatMonthLabel);
  const regionNames = regionNamesOf(territories).filter((regionName) =>
    territories.some((t) => acBucketOf(t, regionName)),
  );

  return (
    <Card title="A/c Bucket" subtitle="Key + Growth vs. Rotating contribution to AOP, grouped by month">
      <div className="flex flex-col gap-6">
        {regionNames.map((regionName) => {
          const chartData = ["Key + Growth", "Rotating"].map((name, divisionIndex) => {
            const row: Record<string, string | number> = { name };
            territories.forEach((t, i) => {
              const bucket = acBucketOf(t, regionName);
              const entry = divisionIndex === 0 ? bucket?.keyGrowth : bucket?.rotating;
              row[monthLabels[i]] = entry?.pctContributionOfAop ?? 0;
            });
            return row;
          });

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
                <h4 className="mb-2 text-sm font-semibold text-slate-800">{regionName}</h4>
              )}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke={CHART_CHROME.gridline} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: CHART_CHROME.mutedText, fontSize: 12 }}
                        axisLine={{ stroke: CHART_CHROME.axis }}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                        tick={{ fill: CHART_CHROME.mutedText, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip
                        formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`}
                        contentStyle={{ fontSize: 12, borderRadius: 8, borderTop: `2px solid ${BRAND_ACCENT.gold}` }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {monthLabels.map((label, i) => (
                        <Bar key={label} dataKey={label} fill={CATEGORICAL[i]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <MonthComparisonTable months={months} rows={rows} metricHeader="Metric" />
              </div>
            </div>
          );
        })}

        {regionNames.length === 0 && (
          <p className="text-sm text-slate-400">No A/c Bucket data for the selected months.</p>
        )}
      </div>
    </Card>
  );
}
