import Card from "../../components/Card";
import GradeBadge from "../../components/GradeBadge";
import MonthComparisonTable from "../../components/MonthComparisonTable";
import { fmtCr } from "../../lib/format";
import { SALES_QUALITY_KEYS, type SalesQualityEntry, type Territory } from "../../types";

function hasAnyValue(entry: SalesQualityEntry | null | undefined): entry is SalesQualityEntry {
  if (!entry) return false;
  return entry.ly != null || entry.lm != null || entry.cm != null || entry.ranking != null;
}

function regionNamesOf(territories: Territory[]): string[] {
  return Array.from(new Set(territories.flatMap((t) => t.subRegions.map((sr) => sr.regionName))));
}

interface SalesQualitySectionProps {
  territories: Territory[];
}

export default function SalesQualitySection({ territories }: SalesQualitySectionProps) {
  if (territories.length === 0) return null;

  if (territories.length === 1) {
    const territory = territories[0];
    const anyData = territory.subRegions.some((sr) =>
      SALES_QUALITY_KEYS.some((k) => hasAnyValue(sr.salesQuality?.[k])),
    );

    return (
      <Card title="Sales Quality" subtitle="LY / LM / CM by initiative">
        {!anyData ? (
          <p className="text-sm text-slate-400">No sales quality data for this period.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {territory.subRegions.map((sr) => {
              const entries = SALES_QUALITY_KEYS.filter((k) => hasAnyValue(sr.salesQuality?.[k]));
              if (entries.length === 0) return null;
              return (
                <div key={sr.regionName}>
                  {territory.subRegions.length > 1 && (
                    <h4 className="mb-2 text-sm font-semibold text-slate-800">{sr.regionName}</h4>
                  )}
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
                    {entries.map((key) => {
                      const entry = sr.salesQuality![key]!;
                      return (
                        <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-medium leading-tight text-slate-500">{key}</span>
                            <GradeBadge grade={entry.ranking} />
                          </div>
                          <div className="mt-2 text-base font-semibold tabular-nums text-slate-900">
                            {fmtCr(entry.cm)}
                          </div>
                          <div className="mt-1 flex gap-2 text-[11px] text-slate-400">
                            <span>LY {fmtCr(entry.ly, 1)}</span>
                            <span>LM {fmtCr(entry.lm, 1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  }

  const months = territories.map((t) => t.month);
  const regionNames = regionNamesOf(territories);

  const sectionsWithData = regionNames
    .map((regionName) => {
      const keysWithData = SALES_QUALITY_KEYS.filter((k) =>
        territories.some((t) => hasAnyValue(t.subRegions.find((sr) => sr.regionName === regionName)?.salesQuality?.[k])),
      );
      return { regionName, keysWithData };
    })
    .filter((r) => r.keysWithData.length > 0);

  return (
    <Card title="Sales Quality" subtitle="CM value by initiative, by month">
      {sectionsWithData.length === 0 ? (
        <p className="text-sm text-slate-400">No sales quality data for the selected months.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {sectionsWithData.map(({ regionName, keysWithData }) => (
            <div key={regionName}>
              {sectionsWithData.length > 1 && (
                <h4 className="mb-2 text-sm font-semibold text-slate-800">{regionName}</h4>
              )}
              <MonthComparisonTable
                months={months}
                metricHeader="Initiative"
                rows={keysWithData.map((key) => ({
                  label: key,
                  values: territories.map((t, i) => {
                    const entry = t.subRegions.find((sr) => sr.regionName === regionName)?.salesQuality?.[key];
                    return (
                      <span key={i} className="flex items-center gap-1.5">
                        {fmtCr(entry?.cm)}
                        <GradeBadge grade={entry?.ranking} />
                      </span>
                    );
                  }),
                }))}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
