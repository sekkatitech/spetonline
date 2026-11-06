import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Search, ShoppingCart, ZoomIn } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { FeedbackForm } from '../components/engagement/FeedbackForm';
import { useSEO } from '../lib/useSEO';

const STORAGE_KEY = 'spet-tester-tasks';

const TASKS = [
  {
    id: 'find',
    icon: Search,
    title: 'Find a product',
    body: 'Search or browse for something you might buy, such as a laptop, a monitor or a router.',
    link: { to: '/shop', label: 'Go to the shop' },
  },
  {
    id: 'explore',
    icon: ZoomIn,
    title: 'Explore its details',
    body: 'Open the product page. Look at the pictures, price, stock and delivery information.',
    link: null,
  },
  {
    id: 'cart',
    icon: ShoppingCart,
    title: 'Try the cart',
    body: 'Add the product to your cart, change the quantity and open your cart. Stop before checkout: you don’t need to pay.',
    link: { to: '/cart', label: 'Open your cart' },
  },
] as const;

type TaskId = (typeof TASKS)[number]['id'];

function readDone(): TaskId[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

/** /test-our-website: a short task list for website testers, then the feedback form. Not linked in the menus. */
export function TesterPage() {
  useSEO({
    title: 'Test our website',
    description: 'Help us test SPET Online: find a product, explore its details and try the cart. No purchase needed.',
    noindex: true,
  });

  const [done, setDone] = useState<TaskId[]>(readDone);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      /* private browsing: progress just isn't remembered */
    }
  }, [done]);

  const toggle = (id: TaskId) => setDone((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  return (
    <PageShell
      title="Test our website"
      description="Thank you for helping us test SPET Online before launch. Work through the three tasks below, then tell us how it went. You don’t need an account, and you don’t need to buy anything."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Test our website' }]}
      contentClassName="pb-16"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-start">
        <section aria-labelledby="tester-tasks">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="tester-tasks" className="font-display text-[22px] font-semibold text-spet-ink">
              Tasks
            </h2>
            <p className="text-[13px] text-spet-muted" aria-live="polite">
              {done.length} of {TASKS.length} done
            </p>
          </div>

          <ol className="mt-4 space-y-3">
            {TASKS.map((task, index) => {
              const Icon = task.icon;
              const isDone = done.includes(task.id);
              return (
                <li
                  key={task.id}
                  className={`flex gap-4 rounded-2xl border p-5 transition-colors ${
                    isDone ? 'border-spet-tint-line bg-spet-tint' : 'border-spet-line bg-spet-surface'
                  }`}
                >
                  <span className="grid h-10 w-10 flex-none place-content-center rounded-xl bg-spet-canvas text-spet-blue">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold text-spet-ink">
                      <span className="text-spet-muted">{index + 1}.</span> {task.title}
                    </h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-spet-ink-2">{task.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggle(task.id)}
                        aria-pressed={isDone}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-colors ${
                          isDone
                            ? 'border-spet-blue bg-spet-blue text-white'
                            : 'border-spet-line text-spet-ink hover:border-spet-ink'
                        }`}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {isDone ? 'Done' : 'Mark as done'}
                      </button>
                      {task.link && (
                        <Link
                          to={task.link.to}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-spet-link hover:underline"
                        >
                          {task.link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-5 text-[13px] leading-relaxed text-spet-muted">
            While you test, the orange feedback button on the left edge of every page sends us a note about the page you’re on.
          </p>
        </section>

        <section
          aria-labelledby="tester-feedback"
          className="relative rounded-2xl bg-spet-surface p-6 shadow-[0_0_0_1px_rgba(16,24,32,0.14)] lg:sticky lg:top-[160px]"
        >
          <h2 id="tester-feedback" className="font-display text-[22px] font-semibold text-spet-ink">
            How did it go?
          </h2>
          <p className="mb-5 mt-1.5 text-[13.5px] leading-relaxed text-spet-muted">
            Your feedback stays private and goes straight to the SPET Online team.
          </p>
          <FeedbackForm idPrefix="tester-feedback" source="tester_page" defaultReason="testing" />
        </section>
      </div>
    </PageShell>
  );
}
