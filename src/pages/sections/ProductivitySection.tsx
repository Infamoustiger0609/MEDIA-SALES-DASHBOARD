import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import { CATEGORICAL, CHART_CHROME } from "../../lib/chartColors";
import { fmtCr } from "../../lib/format";
import type { Territory } from "../../types";

interface ProductivitySectionProps {
  territory: Territory;
}

export default function ProductivitySection({ territory }: ProductivitySectionProps) {
  const regions = territory.subRegions.filter((sr) => sr.productivity);

  const chartData = regions.map((sr) => ({
    name: sr.regionName,
    Actual: sr.productivity?.actual ?? null,
    Target: sr.productivity?.targetPerHead ?? null,
    "National Actual": sr.productivity?.nationalActual ?? null,
  }));

  return (
    <Card title="Productivity per Head" subtitle="Actual vs. target vs. national">
      {regions.length === 0 ? (
        <p className="text-sm text-slate-400">No productivity data for this period.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="25%">
                <CartesianGrid vertical={false} stroke={CHART_CHROME.gridline} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: CHART_CHROME.mutedText, fontSize: 12 }}
                  axisLine={{ stroke: CHART_CHROME.axis }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART_CHROME.mutedText, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Actual" fill={CATEGORICAL[0]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Target" fill={CATEGORICAL[1]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="National Actual" fill={CATEGORICAL[2]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="pb-2 font-medium">Region</th>
                  <th className="pb-2 font-medium">Target / Head</th>
                  <th className="pb-2 font-medium">National Target / Head</th>
                  <th className="pb-2 font-medium">Actual</th>
                  <th className="pb-2 font-medium">National Actual</th>
                  <th className="pb-2 font-medium">Ranking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regions.map((sr) => (
                  <tr key={sr.regionName}>
                    <td className="py-2 font-medium text-slate-700">{sr.regionName}</td>
                    <td className="py-2 tabular-nums text-slate-600">{fmtCr(sr.productivity?.targetPerHead)}</td>
                    <td className="py-2 tabular-nums text-slate-600">
                      {fmtCr(sr.productivity?.targetPerHeadNational)}
                    </td>
                    <td className="py-2 tabular-nums text-slate-600">{fmtCr(sr.productivity?.actual)}</td>
                    <td className="py-2 tabular-nums text-slate-600">{fmtCr(sr.productivity?.nationalActual)}</td>
                    <td className="py-2">
                      <GradeBadge grade={sr.productivity?.ranking} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
