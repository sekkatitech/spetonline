import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NavSpacer } from '../Layout';

export interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Standard public page frame: fixed-header spacer, 1400px container,
 * breadcrumb/title block. Replaces the per-page pt-32 / pt-40 / pt-44 offsets.
 */
export function PageShell({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  className = '',
  contentClassName = '',
}: PageShellProps) {
  return (
    <div className={`min-h-screen bg-spet-canvas text-spet-ink transition-colors duration-300 ${className}`}>
      <NavSpacer />
      <div className={`mx-auto w-full max-w-[1400px] px-4 pb-10 md:px-6 ${contentClassName}`}>
        {(breadcrumbs?.length || title) && (
          <header className="pb-5 pt-2 md:pb-6">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-3">
                <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-spet-muted">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                      <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                        {index > 0 && <ChevronRight className="h-3 w-3 text-spet-was" aria-hidden="true" />}
                        {crumb.to && !isLast ? (
                          <Link to={crumb.to} className="transition-colors hover:text-spet-blue">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-spet-ink-2' : ''}>
                            {crumb.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            )}

            {title && (
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-spet-ink md:text-[36px]">
                  {title}
                </h1>
                {actions}
              </div>
            )}

            {description && <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-spet-ink-2">{description}</p>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
