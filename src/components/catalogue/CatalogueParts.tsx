import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '../../lib/api';
import type { ProductSupplier } from '../../lib/productDisplay';
import { ProductTile, ProductTileSkeleton } from '../product/ProductTile';
import { Button, CheckboxField, EmptyState, FilterSheet, Skeleton, TextField } from '../ui';

export interface FilterGroupConfig {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

interface FilterPanelProps {
  idPrefix: string;
  search: string;
  onSearch: (value: string) => void;
  inStockOnly: boolean;
  onInStockOnly: (value: boolean) => void;
  groups: FilterGroupConfig[];
  hasFilters: boolean;
  onClear: () => void;
  onDone: () => void;
  resultLabel: string;
}

export function FilterPanel({
  idPrefix,
  search,
  onSearch,
  inStockOnly,
  onInStockOnly,
  groups,
  hasFilters,
  onClear,
  onDone,
  resultLabel,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <TextField
        id={`${idPrefix}-filter-search`}
        label="Search"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Product name"
      />

      <CheckboxField
        id={`${idPrefix}-filter-stock`}
        label="In stock only"
        checked={inStockOnly}
        onChange={(event) => onInStockOnly(event.target.checked)}
      />

      {groups.map((group) => (
        <fieldset key={group.title}>
          <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-spet-muted">{group.title}</legend>
          <div className="max-h-52 overflow-y-auto pr-1">
            {group.options.length === 0 ? (
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-4 w-2/3" />
                ))}
              </div>
            ) : (
              group.options.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[13px] text-spet-ink-2 transition-colors hover:text-spet-ink lg:min-h-8"
                >
                  <input
                    type="checkbox"
                    checked={group.selected.includes(option.value)}
                    onChange={() => group.onToggle(option.value)}
                    className="h-4 w-4 shrink-0 rounded border-spet-line accent-spet-blue"
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                </label>
              ))
            )}
          </div>
        </fieldset>
      ))}

      {hasFilters && (
        <Button variant="secondary" className="w-full" onClick={onClear}>
          Clear all filters
        </Button>
      )}

      <Button className="w-full lg:hidden" onClick={onDone}>
        {resultLabel}
      </Button>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-11 items-center rounded-full bg-spet-tint pl-4 text-[13px] font-medium text-spet-link">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-spet-surface"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ActiveFilters({ filters, onClear }: { filters: ActiveFilter[]; onClear: () => void }) {
  if (filters.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <FilterChip key={filter.key} label={filter.label} onRemove={filter.onRemove} />
      ))}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 min-h-11 px-1 text-[13px] font-semibold text-spet-muted underline underline-offset-2 hover:text-spet-blue"
      >
        Clear all
      </button>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  window?: number;
}

export function Pagination({ page, totalPages, onPage, window = 1 }: PaginationProps) {
  if (totalPages <= 1) return null;

  const numbers: number[] = [];
  for (let number = 1; number <= totalPages; number++) {
    if (number === 1 || number === totalPages || Math.abs(number - page) <= window) numbers.push(number);
  }

  const arrow =
    'flex h-11 w-11 items-center justify-center rounded-lg border border-spet-line text-spet-ink-2 transition-colors hover:border-spet-blue disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page" className={arrow}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {numbers.map((number, index) => (
        <span key={number} className="flex items-center gap-2">
          {index > 0 && numbers[index - 1] !== number - 1 && (
            <span className="px-1 text-spet-muted" aria-hidden="true">
              …
            </span>
          )}
          <button
            type="button"
            onClick={() => onPage(number)}
            aria-current={number === page ? 'page' : undefined}
            className={`h-11 w-11 rounded-lg text-[13px] font-semibold tabular-nums transition-colors ${
              number === page ? 'bg-spet-blue text-white' : 'border border-spet-line text-spet-ink-2 hover:border-spet-blue'
            }`}
          >
            {number}
          </button>
        </span>
      ))}

      <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page" className={arrow}>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4';

interface CatalogueBodyProps {
  renderFilters: (idPrefix: string) => ReactNode;
  filtersOpen: boolean;
  onCloseFilters: () => void;
  loading: boolean;
  products: Product[];
  supplier: ProductSupplier;
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  paginationWindow?: number;
  emptyAction: ReactNode;
}

/** Filter rail (sheet below `lg`), product grid, empty state and pagination. */
export function CatalogueBody({
  renderFilters,
  filtersOpen,
  onCloseFilters,
  loading,
  products,
  supplier,
  page,
  totalPages,
  onPage,
  paginationWindow,
  emptyAction,
}: CatalogueBodyProps) {
  return (
    <div className="flex items-start gap-6">
      <aside className="hidden w-64 shrink-0 lg:block" aria-label="Filters">
        <div className="sticky top-[160px] max-h-[calc(100vh-180px)] overflow-y-auto rounded-2xl border border-spet-line bg-spet-surface p-5">
          {renderFilters('desktop')}
        </div>
      </aside>

      <FilterSheet open={filtersOpen} onClose={onCloseFilters} title="Filters">
        {renderFilters('mobile')}
      </FilterSheet>

      <div className="min-w-0 flex-1">
        {loading ? (
          <div className={GRID}>
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductTileSkeleton key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No products found"
            description="Try a different search term, remove a filter, or browse all categories."
            action={emptyAction}
          />
        ) : (
          <>
            <div className={GRID}>
              {products.map((product) => (
                <ProductTile key={product.id} product={product} supplier={supplier} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPage={onPage} window={paginationWindow} />
          </>
        )}
      </div>
    </div>
  );
}

export function FiltersButton({ count, expanded, onClick }: { count: number; expanded: boolean; onClick: () => void }) {
  return (
    <Button variant="secondary" className="lg:hidden" onClick={onClick} aria-expanded={expanded}>
      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
      Filters
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-spet-blue px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Button>
  );
}
