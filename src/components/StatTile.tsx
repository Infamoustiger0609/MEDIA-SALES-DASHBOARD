import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  delta?: ReactNode;
}

export default function StatTile({ label, value, sublabel, delta }: StatTileProps) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-lg font-semibold tabular-nums text-slate-900">{value}</span>
        {delta}
      </div>
      {sublabel && <div className="mt-0.5 text-xs text-slate-400">{sublabel}</div>}
    </div>
  );
}
