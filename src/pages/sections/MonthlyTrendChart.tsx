import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import { monthlyData } from "../../lib/loadData";
import { combinedActualRevenue, combinedAopTarget } from "../../lib/aggregate";
import { formatMonthLabel } from "../../lib/periods";
import { BRAND_ACCENT, CHART_CHROME, GOLD_SERIES } from "../../lib/chartColors";
import { fmtCr } from "../../lib/format";
import { useFilterStore } from "../../store/filterStore";

export default function MonthlyTrendChart() {
  const selectedMonths = useFilterStore((s) => s.selectedMonths);
  const chartData = monthlyData
    .filter((md) => selectedMonths.includes(md.month))
    .map((md) => ({
      month: formatMonthLabel(md.month),
      Actual: combinedActualRevenue(md.territories),
      "AOP Target": combinedAopTarget(md.territories),
    }));

  return (
    <Card title="Actual Revenue vs. AOP Target" subtitle="Combined across all territories, for the selected months">
      {chartData.length === 0 ? (
        <p className="text-sm text-muted">No monthly data available.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={CHART_CHROME.gridline} />
              <XAxis
                dataKey="month"
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
              <Tooltip
                formatter={(value) => fmtCr(Number(value))}
                contentStyle={{ fontSize: 12, borderRadius: 8, borderTop: `2px solid ${BRAND_ACCENT.gold}` }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Actual" fill={GOLD_SERIES.actual} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="AOP Target" fill={GOLD_SERIES.target} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
