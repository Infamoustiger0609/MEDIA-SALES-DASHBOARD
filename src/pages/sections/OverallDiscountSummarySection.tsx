import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import { combinedOverallDiscount, discountRankingAcross } from "../../lib/aggregate";
import { fmtPct } from "../../lib/format";
import type { Territory } from "../../types";

interface OverallDiscountSummarySectionProps {
  /** May span multiple selected months -- grouped by manager below, so a
   * manager with 2 selected months still renders as a single weighted row. */
  territories: Territory[];
}

export default function OverallDiscountSummarySection({ territories }: OverallDiscountSummarySectionProps) {
  const managers = Array.from(new Set(territories.map((t) => t.manager)));

  const rows = managers.map((manager) => {
    const group = territories.filter((t) => t.manager === manager);
    return {
      manager,
      territoryLabel: group[0]?.territoryLabel ?? "",
      ...combinedOverallDiscount(group),
      ranking: discountRankingAcross(group),
    };
  });

  const combined = combinedOverallDiscount(territories);

  return (
    <Card title="Overall Discount Summary" subtitle="LY vs. CM discount by territory, weighted by client count">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">No price control data for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-2 pr-3 font-medium">Territory</th>
                <th className="pb-2 pr-3 font-medium">LY Avg. Disc.</th>
                <th className="pb-2 pr-3 font-medium">CM Avg. Disc.</th>
                <th className="pb-2 font-medium">Ranking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.manager}>
                  <td className="py-2 pr-3 font-medium text-slate-700">
                    {r.manager} <span className="font-normal text-slate-400">— {r.territoryLabel}</span>
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-slate-600">{fmtPct(r.ly)}</td>
                  <td className="py-2 pr-3 tabular-nums text-slate-600">{fmtPct(r.cm)}</td>
                  <td className="py-2">
                    <GradeBadge grade={r.ranking} />
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold text-slate-800">
                <td className="py-2 pr-3">Combined</td>
                <td className="py-2 pr-3 tabular-nums">{fmtPct(combined.ly)}</td>
                <td className="py-2 pr-3 tabular-nums">{fmtPct(combined.cm)}</td>
                <td className="py-2 text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
