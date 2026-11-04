import type { ReactNode } from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-spet-surface-2 ${className}`} />;
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-spet-line bg-spet-surface px-6 py-12 text-center ${className}`}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-spet-tint text-spet-blue" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="font-display text-[20px] font-semibold text-spet-ink">{title}</h2>
      {description && <p className="mt-2 max-w-md text-[13px] leading-relaxed text-spet-ink-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
