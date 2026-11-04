import { Home, ShoppingBag } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { ButtonLink } from '../components/ui/Button';
import { useSEO } from '../lib/useSEO';

export function NotFoundPage() {
  useSEO({
    title: 'Page not found',
    description: 'The page you are looking for does not exist or has moved.',
    noindex: true,
  });

  return (
    <PageShell contentClassName="pb-16">
      <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
        <p className="font-display text-[72px] font-semibold leading-none tracking-tight text-spet-blue/20 md:text-[96px]">
          404
        </p>
        <h1 className="mt-3 font-display text-[26px] font-semibold text-spet-ink md:text-[32px]">Page not found</h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-spet-ink-2">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to="/">
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
          </ButtonLink>
          <ButtonLink to="/shop" variant="secondary">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Browse shop
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
