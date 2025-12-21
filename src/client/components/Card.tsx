import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Card({ children, title, className = "" }: CardProps) {
  return (
    <div
      className={`bg-bg-secondary p-6 rounded-xl border border-border ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
