import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { GOLD_SERIES } from "../../lib/chartColors";
import { fmtLakh } from "../../lib/format";
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

/** Bar length = actual vs. national benchmark; green when actual >= target,
 * gold otherwise; a dark tick marks where target sits on the benchmark scale. */
function ProductivityBar({
  actual,
  target,
  benchmark,
}: {
  actual: number | null | undefined;
  target: number | null | undefined;
  benchmark: number | null | undefined;
}) {
  if (actual == null || benchmark == null || benchmark <= 0) {
    return <span className="text-xs text-muted-2">—</span>;
  }
  const pct = Math.max(0, Math.min(100, (actual / benchmark) * 100));
  const targetPct = target != null ? Math.max(0, Math.min(100, (target / benchmark) * 100)) : null;
  const barColor = target != null && actual >= target ? "var(--color-grade-a)" : GOLD_SERIES.actual;
  return (
    <div className="relative h-2.5 w-28 rounded-full bg-app-bg">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      {targetPct !== null && (
        <div className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-charcoal" style={{ left: `${targetPct}%` }} />
      )}
    </div>
  );
}

export default function ProductivitySection({ territories }: ProductivitySectionProps) {
  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
    const regions = territory.subRegions.filter((sr) => sr.productivity);

    return (
      <Card title="5 · Productivity per Head" subtitle="Actual vs. target vs. national benchmark">
        {regions.length === 0 ? (
          <p className="text-sm text-muted">No productivity data for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="text-muted-2 uppercase tracking-wide">
                  <th className="pb-2 pr-3 font-semibold">Sub-region</th>
                  <th className="pb-2 pr-3 font-semibold">Actual</th>
                  <th className="pb-2 pr-3 font-semibold">Target</th>
                  <th className="pb-2 pr-3 font-semibold">Nat'l Bmk</th>
                  <th className="pb-2 pr-3 font-semibold">Ranking</th>
                  <th className="pb-2 font-semibold">vs. Target / Bmk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {regions.map((sr) => (
                  <tr key={sr.regionName}>
                    <td className="py-2 pr-3 font-semibold text-charcoal">{sr.regionName}</td>
                    <td className="py-2 pr-3 font-mono font-semibold tabular-nums text-charcoal">
                      {fmtLakh(sr.productivity?.actual)}
                    </td>
                    <td className="py-2 pr-3 font-mono tabular-nums text-ink-soft">
                      {fmtLakh(sr.productivity?.targetPerHead)}
                    </td>
                    <td className="py-2 pr-3 font-mono tabular-nums text-ink-soft">
                      {fmtLakh(sr.productivity?.nationalActual)}
                    </td>
                    <td className="py-2 pr-3">
                      <GradeBadge grade={sr.productivity?.ranking} />
                    </td>
                    <td className="py-2">
                      <ProductivityBar
                        actual={sr.productivity?.actual}
                        target={sr.productivity?.targetPerHead}
                        benchmark={sr.productivity?.nationalActual}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  }

  const months = territories.map((t) => t.month);
  const regionNames = regionNamesOf(territories).filter((regionName) =>
    territories.some((t) => productivityOf(t, regionName)),
  );

  return (
    <Card title="5 · Productivity per Head" subtitle="Actual vs. target vs. national benchmark, by month">
      <div className="flex flex-col gap-6">
        {regionNames.map((regionName) => {
          const rows = [
            { label: "Target / Head", values: territories.map((t) => fmtLakh(productivityOf(t, regionName)?.targetPerHead)) },
            {
              label: "National Target / Head",
              values: territories.map((t) => fmtLakh(productivityOf(t, regionName)?.targetPerHeadNational)),
            },
            { label: "Actual", values: territories.map((t) => fmtLakh(productivityOf(t, regionName)?.actual)) },
            {
              label: "National Actual",
              values: territories.map((t) => fmtLakh(productivityOf(t, regionName)?.nationalActual)),
            },
            {
              label: "vs. Target / Bmk",
              values: territories.map((t, i) => {
                const p = productivityOf(t, regionName);
                return <ProductivityBar key={i} actual={p?.actual} target={p?.targetPerHead} benchmark={p?.nationalActual} />;
              }),
            },
            {
              label: "Ranking",
              values: territories.map((t, i) => <GradeBadge key={i} grade={productivityOf(t, regionName)?.ranking} />),
            },
          ];

          return (
            <div key={regionName}>
              {regionNames.length > 1 && (
                <h4 className="mb-2 text-sm font-semibold text-charcoal">{regionName}</h4>
              )}
              <MonthComparisonTable months={months} rows={rows} />
            </div>
          );
        })}

        {regionNames.length === 0 && (
          <p className="text-sm text-muted">No productivity data for the selected months.</p>
        )}
      </div>
    </Card>
  );
}
