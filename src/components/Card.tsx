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
      className={`rounded-2xl border border-hairline bg-cream p-6 shadow-[0_2px_10px_rgba(36,31,24,0.05)] ${className}`}
    >
      {title && (
        <header className="mb-4 border-l-2 border-gold pl-3">
          <h3 className="font-serif text-[15px] font-semibold text-charcoal">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
