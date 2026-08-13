import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import { CATEGORICAL, CHART_CHROME } from "../../lib/chartColors";
import { fmtCr, fmtPct } from "../../lib/format";
import type { Territory } from "../../types";

interface AcBucketSectionProps {
  territory: Territory;
}

export default function AcBucketSection({ territory }: AcBucketSectionProps) {
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
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
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
