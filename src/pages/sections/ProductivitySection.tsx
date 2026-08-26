import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { BRAND_ACCENT, CATEGORICAL, CHART_CHROME } from "../../lib/chartColors";
import { fmtCr } from "../../lib/format";
import { formatMonthLabel } from "../../lib/periods";
import type { Productivity, Territory } from "../../types";

interface ProductivitySectionProps {
  territories: Territory[];
}

function regionNamesOf(territories: Territory[]): string[] {
  return Array.from(new Set(territories.flatMap((t) => t.subRegions.map((sr) => sr.regionName))));
}

function productivityOf(t: Territory, regionName: string): Productivity | null {
  return t.subRegions.find((sr) => sr.regionName === regionName)?.productivity ?? null;
}

export default function ProductivitySection({ territories }: ProductivitySectionProps) {
  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
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
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderTop: `2px solid ${BRAND_ACCENT.gold}` }} />
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

  const months = territories.map((t) => t.month);
  const monthLabels = months.map(formatMonthLabel);
  const regionNames = regionNamesOf(territories).filter((regionName) =>
    territories.some((t) => productivityOf(t, regionName)),
  );

  return (
    <Card title="Productivity per Head" subtitle="Actual per head, grouped by month">
      <div className="flex flex-col gap-6">
        {regionNames.length > 0 && (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionNames.map((regionName) => {
                  const row: Record<string, string | number | null> = { name: regionName };
                  territories.forEach((t, i) => {
                    row[monthLabels[i]] = productivityOf(t, regionName)?.actual ?? null;
                  });
                  return row;
                })}
                barCategoryGap="25%"
              >
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
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderTop: `2px solid ${BRAND_ACCENT.gold}` }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {monthLabels.map((label, i) => (
                  <Bar key={label} dataKey={label} name={`Actual (${label})`} fill={CATEGORICAL[i]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {regionNames.map((regionName) => {
          const rows = [
            { label: "Target / Head", values: territories.map((t) => fmtCr(productivityOf(t, regionName)?.targetPerHead)) },
            {
              label: "National Target / Head",
              values: territories.map((t) => fmtCr(productivityOf(t, regionName)?.targetPerHeadNational)),
            },
            { label: "Actual", values: territories.map((t) => fmtCr(productivityOf(t, regionName)?.actual)) },
            {
              label: "National Actual",
              values: territories.map((t) => fmtCr(productivityOf(t, regionName)?.nationalActual)),
            },
            {
              label: "Ranking",
              values: territories.map((t, i) => <GradeBadge key={i} grade={productivityOf(t, regionName)?.ranking} />),
            },
          ];

          return (
            <div key={regionName}>
              {regionNames.length > 1 && (
                <h4 className="mb-2 text-sm font-semibold text-slate-800">{regionName}</h4>
              )}
              <MonthComparisonTable months={months} rows={rows} />
            </div>
          );
        })}

        {regionNames.length === 0 && (
          <p className="text-sm text-slate-400">No productivity data for the selected months.</p>
        )}
      </div>
    </Card>
  );
}
