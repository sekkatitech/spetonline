import type { ReactNode } from 'react';

export const panelStyles = 'rounded-2xl border border-spet-line bg-spet-surface';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${panelStyles} ${className}`}>{children}</div>;
}

interface SectionHeaderProps {
  id?: string;
  title: string;
  action?: ReactNode;
  description?: string;
  className?: string;
}

export function SectionHeader({ id, title, action, description, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-4 flex items-end justify-between gap-4 ${className}`}>
      <div>
        <h2 id={id} className="font-display text-[24px] font-semibold tracking-tight text-spet-ink md:text-[26px]">
          {title}
        </h2>
        {description && <p className="mt-1 text-[13px] text-spet-ink-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}
