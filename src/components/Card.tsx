import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, subtitle, children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-900/10 bg-cream p-5 shadow-md shadow-slate-300/30 ${className}`}
    >
      {title && (
        <header className="mb-4 border-l-2 border-gold pl-3">
          <h3 className="text-sm font-semibold tracking-wide text-charcoal">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
