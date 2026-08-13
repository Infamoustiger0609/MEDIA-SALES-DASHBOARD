interface GradeBadgeProps {
  grade: string | null | undefined;
  label?: string;
}

const GRADE_STYLES: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  A: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  B: "bg-amber-100 text-amber-800 ring-amber-600/20",
  C: "bg-rose-100 text-rose-700 ring-rose-600/20",
};

const FALLBACK_STYLE = "bg-slate-100 text-slate-500 ring-slate-500/20";

export default function GradeBadge({ grade, label }: GradeBadgeProps) {
  const style = grade ? (GRADE_STYLES[grade] ?? FALLBACK_STYLE) : FALLBACK_STYLE;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {label && <span className="font-normal opacity-70">{label}</span>}
      {grade ?? "—"}
    </span>
  );
}
