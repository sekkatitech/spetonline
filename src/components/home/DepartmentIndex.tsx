import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import type { ShopperDepartment } from './departments';

interface DepartmentIndexProps {
  departments: ShopperDepartment[];
  activeKey: string;
  loading: boolean;
  onSelect: (key: string) => void;
}

const SUPPORT_LINKS = [
  { label: 'Track an order', to: '/account' },
  { label: 'Delivery and returns', to: '/contact' },
  { label: 'Warranty claims', to: '/contact' },
];

export function DepartmentIndex({ departments, activeKey, loading, onSelect }: DepartmentIndexProps) {
  return (
    <>
      {/* Mobile: the same list as a compact selector */}
      <div className="lg:hidden">
        <label htmlFor="department-select" className="sr-only">
          Choose a department
        </label>
        <div className="relative">
          <select
            id="department-select"
            value={activeKey}
            disabled={loading || departments.length === 0}
            onChange={(event) => onSelect(event.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-spet-line bg-spet-surface px-4 pr-10 text-sm font-medium text-spet-ink focus:border-spet-blue focus:outline-hidden disabled:opacity-60"
          >
            {departments.length === 0 && <option value="">Loading departments…</option>}
            {departments.map((department) => (
              <option key={department.key} value={department.key}>
                {department.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-spet-muted"
            aria-hidden="true"
          />
        </div>
      </div>

      <aside className="hidden lg:block">
        <h2 className="mb-3 text-[15px] font-semibold text-spet-ink">Departments</h2>

        <nav aria-label="Departments" className="overflow-hidden rounded-2xl border border-spet-line bg-spet-surface text-[14px]">
          {loading && departments.length === 0
            ? Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="flex h-10 items-center px-4">
                  <span className="h-3 w-2/3 animate-pulse rounded bg-spet-surface-2" />
                </div>
              ))
            : departments.map((department, index) => {
                const isActive = department.key === activeKey;
                return (
                  <button
                    key={department.key}
                    type="button"
                    onClick={() => onSelect(department.key)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex h-10 w-full items-center justify-between px-4 text-left transition-colors ${
                      index > 0 ? 'border-t border-spet-line-2' : ''
                    } ${
                      isActive
                        ? 'bg-spet-tint font-semibold text-spet-blue'
                        : 'text-spet-ink-2 hover:bg-spet-canvas'
                    }`}
                  >
                    <span className="truncate">{department.label}</span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-spet-blue' : 'text-spet-was'}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}

          <Link
            to="/categories"
            className="flex h-11 items-center justify-between border-t border-spet-line px-4 text-[13px] font-semibold text-spet-blue transition-colors hover:bg-spet-canvas"
          >
            All categories
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </nav>

        <div className="mt-3 rounded-2xl border border-spet-line bg-spet-surface p-4">
          <h3 className="mb-2.5 text-[13px] font-semibold text-spet-ink">Support</h3>
          <ul className="space-y-2 text-[13px] text-spet-ink-2">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition-colors hover:text-spet-blue">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
