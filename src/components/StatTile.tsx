import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  delta?: ReactNode;
}

export default function StatTile({ label, value, sublabel, delta }: StatTileProps) {
  return (
    <div className="rounded-lg border border-hairline bg-gold-soft/25 px-3.5 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-lg font-semibold tabular-nums text-charcoal">{value}</span>
        {delta}
      </div>
      {sublabel && <div className="mt-0.5 text-xs text-muted-2">{sublabel}</div>}
    </div>
  );
}
