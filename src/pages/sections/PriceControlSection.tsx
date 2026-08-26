import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { BRAND_ACCENT, CATEGORICAL, CHART_CHROME } from "../../lib/chartColors";
import { fmtInt, fmtPct } from "../../lib/format";
import { formatMonthLabel } from "../../lib/periods";
import type { PriceControlChannel, SubRegion, Territory } from "../../types";

const columns: ColumnDef<PriceControlChannel>[] = [
  { header: "Channel", accessorKey: "channel" },
  {
    header: "LY Avg. Disc.",
    accessorKey: "lyAvgDiscount",
    cell: (info) => fmtPct(info.getValue<number | null>()),
  },
  {
    header: "LY Clients",
    accessorKey: "lyClientCount",
    cell: (info) => fmtInt(info.getValue<number | null>()),
  },
  {
    header: "LY Contrib.",
    accessorKey: "lyContributionPct",
    cell: (info) => fmtPct(info.getValue<number | null>()),
  },
  {
    header: "CM Avg. Disc.",
    accessorKey: "cmAvgDiscount",
    cell: (info) => fmtPct(info.getValue<number | null>()),
  },
  {
    header: "CM Clients",
    accessorKey: "cmClientCount",
    cell: (info) => fmtInt(info.getValue<number | null>()),
  },
  {
    header: "CM Contrib.",
    accessorKey: "cmContributionPct",
    cell: (info) => fmtPct(info.getValue<number | null>()),
  },
];

function overallDiscountOf(sr: SubRegion | undefined): { ly: number | null; cm: number | null; ranking: string | null } {
  const overallRow = sr?.priceControl?.channels.find((c) => c.channel.toLowerCase().startsWith("overall"));
  return {
    ly: overallRow?.lyAvgDiscount ?? null,
    cm: sr?.priceControl?.overallOfferedDiscount ?? overallRow?.cmAvgDiscount ?? null,
    ranking: sr?.priceControl?.ranking ?? null,
  };
}

function PriceControlSubBlock({ subRegion, showLabel }: { subRegion: SubRegion; showLabel: boolean }) {
  const pc = subRegion.priceControl!;
  const table = useReactTable({ data: pc.channels, columns, getCoreRowModel: getCoreRowModel() });

  const { ly: lyOverall, cm: cmOverall } = overallDiscountOf(subRegion);
  const chartData = [
    { name: "LY", value: lyOverall ?? 0, hasData: lyOverall != null },
    { name: "CM", value: cmOverall ?? 0, hasData: cmOverall != null },
  ];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        {showLabel ? (
          <h4 className="text-sm font-semibold text-slate-800">{subRegion.regionName}</h4>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          Overall discount ranking <GradeBadge grade={pc.ranking} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="35%">
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
                formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "Avg. discount"]}
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
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="text-slate-400">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="pb-2 pr-3 font-medium">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 pr-3 tabular-nums text-slate-600 first:font-medium first:text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function regionNamesOf(territories: Territory[]): string[] {
  return Array.from(new Set(territories.flatMap((t) => t.subRegions.map((sr) => sr.regionName))));
}

interface PriceControlSectionProps {
  territories: Territory[];
}

export default function PriceControlSection({ territories }: PriceControlSectionProps) {
  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
    const regions = territory.subRegions.filter((sr) => sr.priceControl && sr.priceControl.channels.length > 0);

    return (
      <Card title="Price Control / Discount" subtitle="Channel breakdown and LY vs. CM overall discount">
        <div className="flex flex-col gap-6">
          {regions.map((sr) => (
            <PriceControlSubBlock key={sr.regionName} subRegion={sr} showLabel={territory.subRegions.length > 1} />
          ))}
          {regions.length === 0 && (
            <p className="text-sm text-slate-400">No price control data for this period.</p>
          )}
        </div>
      </Card>
    );
  }

  const months = territories.map((t) => t.month);
  const monthLabels = months.map(formatMonthLabel);
  const regionNames = regionNamesOf(territories).filter((regionName) =>
    territories.some((t) => t.subRegions.find((sr) => sr.regionName === regionName)?.priceControl),
  );

  return (
    <Card title="Price Control / Discount" subtitle="Overall LY vs. CM discount, grouped by month">
      <div className="flex flex-col gap-6">
        {regionNames.map((regionName) => {
          const perMonth = territories.map((t) =>
            overallDiscountOf(t.subRegions.find((sr) => sr.regionName === regionName)),
          );

          const chartData = ["LY", "CM"].map((name) => {
            const row: Record<string, string | number> = { name };
            perMonth.forEach((d, i) => {
              row[monthLabels[i]] = (name === "LY" ? d.ly : d.cm) ?? 0;
            });
            return row;
          });

          const rows = [
            { label: "LY Avg. Disc.", values: perMonth.map((d) => fmtPct(d.ly)) },
            { label: "CM Avg. Disc.", values: perMonth.map((d) => fmtPct(d.cm)) },
            {
              label: "Ranking",
              values: perMonth.map((d, i) => <GradeBadge key={i} grade={d.ranking} />),
            },
          ];

          return (
            <div key={regionName}>
              {regionNames.length > 1 && (
                <h4 className="mb-2 text-sm font-semibold text-slate-800">{regionName}</h4>
              )}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="35%">
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

                <MonthComparisonTable months={months} rows={rows} />
              </div>
            </div>
          );
        })}
        {regionNames.length === 0 && (
          <p className="text-sm text-slate-400">No price control data for the selected months.</p>
        )}
      </div>
    </Card>
  );
}
