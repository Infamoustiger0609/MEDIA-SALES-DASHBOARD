interface GradeBadgeProps {
  grade: string | null | undefined;
  label?: string;
}

const GRADE_STYLES: Record<string, string> = {
  "A+": "bg-grade-a-bg text-grade-a ring-grade-a/20",
  A: "bg-grade-a-bg text-grade-a ring-grade-a/20",
  B: "bg-grade-b-bg text-grade-b ring-grade-b/20",
  C: "bg-grade-c-bg text-grade-c ring-grade-c/20",
};

// Neutral fallback for a missing grade -- distinct from the colorblind-safe
// A+/A/B/C system above, which must never change.
const FALLBACK_STYLE = "bg-grade-n-bg text-grade-n ring-grade-n/20";

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
