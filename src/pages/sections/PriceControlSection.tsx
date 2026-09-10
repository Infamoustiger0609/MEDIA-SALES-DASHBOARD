import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { BRAND_ACCENT, CHART_CHROME, GOLD_SERIES } from "../../lib/chartColors";
import { fmtInt, fmtPct } from "../../lib/format";
import { formatMonthLabel } from "../../lib/periods";
import type { PriceControlChannel, SubRegion, Territory } from "../../types";

function MiniDiscountBar({ ly, cm }: { ly: number | null; cm: number | null }) {
  const lyPct = ly != null ? Math.max(0, Math.min(100, ly * 100)) : 0;
  const cmPct = cm != null ? Math.max(0, Math.min(100, cm * 100)) : 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2 w-16 overflow-hidden rounded bg-app-bg">
        <div className="h-full rounded" style={{ width: `${lyPct}%`, backgroundColor: GOLD_SERIES.target }} />
      </div>
      <div className="h-2 w-16 overflow-hidden rounded bg-app-bg">
        <div className="h-full rounded" style={{ width: `${cmPct}%`, backgroundColor: GOLD_SERIES.actual }} />
      </div>
    </div>
  );
}

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
  {
    header: "LY vs CM",
    id: "lyVsCm",
    cell: (info) => <MiniDiscountBar ly={info.row.original.lyAvgDiscount} cm={info.row.original.cmAvgDiscount} />,
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
    { name: "LY", value: lyOverall ?? 0, hasData: lyOverall != null, color: GOLD_SERIES.target },
    { name: "CM", value: cmOverall ?? 0, hasData: cmOverall != null, color: GOLD_SERIES.actual },
  ];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        {showLabel ? (
          <h4 className="text-sm font-semibold text-charcoal">{subRegion.regionName}</h4>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 text-xs text-muted">
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
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.hasData ? entry.color : CHART_CHROME.gridline} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="text-muted-2 uppercase tracking-wide">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="pb-2 pr-3 font-semibold">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-hairline">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-2 pr-3 font-mono tabular-nums text-ink-soft first:font-sans first:font-semibold first:text-charcoal"
                    >
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
      <Card title="3 · Price Control / Discount" subtitle="Channel breakdown and LY vs. CM overall discount">
        <div className="flex flex-col gap-6">
          {regions.map((sr) => (
            <PriceControlSubBlock key={sr.regionName} subRegion={sr} showLabel={territory.subRegions.length > 1} />
          ))}
          {regions.length === 0 && (
            <p className="text-sm text-muted">No price control data for this period.</p>
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
    <Card title="3 · Price Control / Discount" subtitle="Overall LY vs. CM discount, grouped by month">
      <div className="flex flex-col gap-6">
        {regionNames.map((regionName) => {
          const perMonth = territories.map((t) =>
            overallDiscountOf(t.subRegions.find((sr) => sr.regionName === regionName)),
          );

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
                <h4 className="mb-2 text-sm font-semibold text-charcoal">{regionName}</h4>
              )}
              <div className="mb-4 flex flex-col gap-2">
                {perMonth.map((d, i) => (
                  <div key={months[i]} className="flex items-center gap-3">
                    <span className="w-16 flex-none text-xs font-semibold text-ink-soft">{monthLabels[i]}</span>
                    <MiniDiscountBar ly={d.ly} cm={d.cm} />
                  </div>
                ))}
                <div className="flex gap-4 pl-[76px]">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: GOLD_SERIES.target }}
                    />
                    LY
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: GOLD_SERIES.actual }}
                    />
                    CM
                  </span>
                </div>
              </div>
              <MonthComparisonTable months={months} rows={rows} />
            </div>
          );
        })}
        {regionNames.length === 0 && (
          <p className="text-sm text-muted">No price control data for the selected months.</p>
        )}
      </div>
    </Card>
  );
}
