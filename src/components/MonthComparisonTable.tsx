import type { ReactNode } from "react";
import { formatMonthLabel } from "../lib/periods";

export interface MonthComparisonRow {
  label: string;
  values: ReactNode[]; // values[i] corresponds to months[i]
}

interface MonthComparisonTableProps {
  months: string[]; // YYYY-MM, ascending
  rows: MonthComparisonRow[];
  metricHeader?: string;
}

/** Reusable "one row per metric, one column per month" table for the multi-month view of a section. */
export default function MonthComparisonTable({
  months,
  rows,
  metricHeader = "Metric",
}: MonthComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-xs">
        <thead>
          <tr className="text-slate-400">
            <th className="pb-2 pr-3 font-medium">{metricHeader}</th>
            {months.map((m) => (
              <th key={m} className="pb-2 pr-3 font-medium">
                {formatMonthLabel(m)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="py-2 pr-3 font-medium text-slate-700">{row.label}</td>
              {row.values.map((v, i) => (
                <td key={months[i]} className="py-2 pr-3 tabular-nums text-slate-600">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
