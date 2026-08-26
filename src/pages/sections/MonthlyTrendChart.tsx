import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import { monthlyData } from "../../lib/loadData";
import { combinedActualRevenue, combinedAopTarget } from "../../lib/aggregate";
import { formatMonthLabel } from "../../lib/periods";
import { BRAND_ACCENT, CATEGORICAL, CHART_CHROME } from "../../lib/chartColors";
import { fmtCr } from "../../lib/format";
import { useFilterStore } from "../../store/filterStore";

export default function MonthlyTrendChart() {
  const selectedMonths = useFilterStore((s) => s.selectedMonths);
  const chartData = monthlyData
    .filter((md) => selectedMonths.includes(md.month))
    .map((md) => ({
      month: formatMonthLabel(md.month),
      "Actual Revenue": combinedActualRevenue(md.territories),
      "AOP Target": combinedAopTarget(md.territories),
    }));

  return (
    <Card title="Monthly Trend" subtitle="Combined actual revenue vs. AOP target, for the selected months">
      {chartData.length === 0 ? (
        <p className="text-sm text-slate-400">No monthly data available.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_CHROME.gridline} />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_CHROME.mutedText, fontSize: 12 }}
                axisLine={{ stroke: CHART_CHROME.axis }}
                tickLine={false}
                padding={{ left: 24, right: 24 }}
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
              <Line
                type="monotone"
                dataKey="Actual Revenue"
                stroke={CATEGORICAL[0]}
                strokeWidth={2}
                dot={{ r: 4, fill: CATEGORICAL[0] }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="AOP Target"
                stroke={CATEGORICAL[1]}
                strokeWidth={2}
                dot={{ r: 4, fill: CATEGORICAL[1] }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
