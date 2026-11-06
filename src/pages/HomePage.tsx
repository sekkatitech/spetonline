import { useEffect, useMemo, useState } from 'react';
import { useCategoryHeads, useProducts } from '../lib/api';
import { useSEO } from '../lib/useSEO';
import { PageShell } from '../components/ui/PageShell';
import { WishlistProvider } from '../components/WishlistProvider';
import { buildDepartments } from '../components/home/departments';
import { DepartmentIndex } from '../components/home/DepartmentIndex';
import { DepartmentAssortment } from '../components/home/DepartmentAssortment';
import { DealShelf } from '../components/home/DealShelf';
import { NewArrivals } from '../components/home/NewArrivals';
import { PortalLinks } from '../components/home/PortalLinks';
import { ContactStrip } from '../components/home/ContactStrip';

const NO_DEPARTMENT_FILTER = '__no_department__';

export function HomePage() {
  useSEO({
    title: 'SPET Online | Electronics Store in South Africa',
    description:
      'Shop TVs, laptops, monitors, gaming, audio, networking, printing and power backup from SPET Online. Delivered across South Africa, free over R2 500.',
    bare: true,
  });

  const { categoryHeads, loading: headsLoading } = useCategoryHeads();
  const departments = useMemo(() => buildDepartments(categoryHeads), [categoryHeads]);

  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    if (departments.length === 0) return;
    if (!departments.some((department) => department.key === activeKey)) {
      setActiveKey(departments[0].key);
    }
  }, [departments, activeKey]);

  const activeDepartment = departments.find((department) => department.key === activeKey) ?? departments[0];

  // Keep the hook order stable while departments are still loading.
  const { products, loading: productsLoading } = useProducts({
    categoryHeads: activeDepartment?.heads.length ? activeDepartment.heads : [NO_DEPARTMENT_FILTER],
    sortBy: 'newest',
    perPage: 8,
  });

  const excludeIds = products.map((product) => product.id);

  return (
    <WishlistProvider>
      <PageShell contentClassName="pb-2 pt-5 md:pt-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[216px_1fr]">
          <DepartmentIndex
            departments={departments}
            activeKey={activeDepartment?.key ?? ''}
            loading={headsLoading}
            onSelect={setActiveKey}
          />

          <div className="min-w-0">
            {activeDepartment ? (
              <DepartmentAssortment
                department={activeDepartment}
                products={products}
                loading={productsLoading}
              />
            ) : (
              <AssortmentSkeleton />
            )}

            <DealShelf />
            <NewArrivals excludeIds={excludeIds} />
          </div>
        </div>

        <PortalLinks />
        <ContactStrip />
      </PageShell>
    </WishlistProvider>
  );
}

function AssortmentSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="mb-4 h-10 w-64 rounded bg-spet-surface-2" />
      <div className="grid gap-6 rounded-2xl border border-spet-tint-line bg-spet-tint px-6 py-5 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-white/60" />
          <div className="h-4 w-5/6 rounded bg-white/60" />
          <div className="h-10 w-32 rounded bg-white/60" />
        </div>
        <div className="flex justify-center gap-8">
          <div className="h-[148px] w-[250px] rounded-xl bg-white/70" />
          <div className="h-[132px] w-[232px] rounded-xl bg-white/70" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-spet-line bg-spet-surface sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="p-5">
            <div className="h-[156px] rounded-xl bg-spet-surface-2" />
            <div className="mt-4 h-3 w-1/3 rounded bg-spet-surface-2" />
            <div className="mt-3 h-4 w-full rounded bg-spet-surface-2" />
            <div className="mt-4 h-5 w-1/3 rounded bg-spet-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
