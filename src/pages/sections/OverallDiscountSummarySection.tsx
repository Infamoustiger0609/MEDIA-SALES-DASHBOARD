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
    <Card title="Discount by Territory" subtitle="LY vs. CM discount, weighted by client count">
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No price control data for this period.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead>
              <tr className="text-muted-2 uppercase tracking-wide">
                <th className="pb-2 pr-3 font-semibold">Territory</th>
                <th className="pb-2 pr-3 font-semibold">LY Avg. Disc.</th>
                <th className="pb-2 pr-3 font-semibold">CM Avg. Disc.</th>
                <th className="pb-2 font-semibold">Ranking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map((r) => (
                <tr key={r.manager}>
                  <td className="py-2 pr-3 font-semibold text-charcoal">
                    {r.manager} <span className="font-normal text-muted">— {r.territoryLabel}</span>
                  </td>
                  <td className="py-2 pr-3 font-mono tabular-nums text-ink-soft">{fmtPct(r.ly)}</td>
                  <td className="py-2 pr-3 font-mono font-semibold tabular-nums text-charcoal">{fmtPct(r.cm)}</td>
                  <td className="py-2">
                    <GradeBadge grade={r.ranking} />
                  </td>
                </tr>
              ))}
              <tr className="bg-gold-soft/25 font-semibold text-charcoal">
                <td className="py-2 pr-3">Combined</td>
                <td className="py-2 pr-3 font-mono tabular-nums">{fmtPct(combined.ly)}</td>
                <td className="py-2 pr-3 font-mono tabular-nums">{fmtPct(combined.cm)}</td>
                <td className="py-2 text-muted-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
