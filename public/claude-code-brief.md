# SPET Online — Claude Code Work Brief
# Project: MAIN SITE (spet-online). Work through tasks IN ORDER, one at a time.
# After EACH task: run `npm run build`, fix any errors you introduced, then STOP and
# tell the user to test in the browser before you continue to the next task.
# Never combine tasks into one giant change.

## GROUND RULES (apply to every task)
- React/TypeScript/Vite/Supabase storefront with a B2B Enterprise section.
- NEVER select the column `wholesale_ex_vat` from `core_products` in any storefront query.
- NEVER put supplier names (e.g. "syntech", "esquire") in URLs, UI text, or new code.
  Suppliers must stay invisible to customers and enterprise dealers.
- Preserve existing URL-state behaviour on the Apple portal:
  ?cat=<category> & sub=<category_sub> & view=shop, and browser-back from grid → landing.
- Do not add new npm dependencies without asking.
- Windows machine: PowerShell has no `&&` — run commands separately.
- Tailwind is already configured in this project (the public storefront uses it).

---

## TASK 1 — Hero videos for the landing pages
File: src/components/AppleCategoryLanding.tsx

The user has 4 Core Group CDN video links. BEFORE editing, ask the user which video
belongs to which category (Mac / iPhone / iPad / Apple Watch / other):

(MacBook) https://core.co.za/cdn/shop/videos/c/vp/33a44b35849141c38de94be93e36c024/33a44b35849141c38de94be93e36c024.HD-1080p-7.2Mbps-81748093.mp4?v=0     (iPhone) https://core.co.za/cdn/shop/videos/c/vp/a74a607aba354fb39d92c279df00a8c7/a74a607aba354fb39d92c279df00a8c7.HD-1080p-7.2Mbps-81749787.mp4?v=0   (AirPods) https://core.co.za/cdn/shop/videos/c/vp/4e917baa54024dd5a8e7c8dcd14cab59/4e917baa54024dd5a8e7c8dcd14cab59.HD-1080p-7.2Mbps-81750794.mp4?v=0

Then paste each URL into the matching config's `heroVideo` field in LANDING_CONFIGS.
The iPad config already has its own video — only change it if the user says one of the
four replaces it. If the user names a category that has no landing config yet (e.g.
'Apple Watch'), create a new config for it following the existing pattern and add it to
LANDING_CONFIGS under the exact key used by that category's tab (check the CATEGORIES
list in src/pages/EnterpriseApplePage.tsx for exact keys), with tiles built from the
distinct category_sub values used by that category — ask the user for the list if it
is not visible in the code.

## TASK 2 — Make the Apple portal fully mobile-responsive (keep its Apple look)
Files: src/pages/EnterpriseApplePage.tsx, src/pages/EnterpriseAppleDetailPage.tsx,
src/components/AppleCategoryLanding.tsx

The Apple-style design (white/#f5f5f7, black pills, SF-style type) must stay. Make it
respond properly from 375px to desktop:
- Category tab bar: horizontally scrollable on small screens (overflow-x auto, no wrap,
  hidden scrollbar) so all tabs remain reachable.
- Landing tiles: 1 column at <480px, 2 at <900px, then auto-fill as now.
- Product grid: 2 columns minimum at phone widths (never 1), scaling up as now.
- Detail page: the two-column layout (gallery | info) stacks vertically below ~820px;
  the quote sidebar becomes a full-width bottom sheet on small screens.
- Filter bar: wraps cleanly; touch targets at least 44px tall.
- The zoom overlay keeps working on touch (tap image opens, tap anywhere closes).
Test at 375 / 768 / 1024 widths using the responsive checks you can perform, and list
what the user should verify by hand in Chrome DevTools device mode.

## TASK 3 — Remove supplier names from catalog URLs
Files: src/App.tsx, src/pages/EnterpriseProductsPage.tsx,
src/pages/EnterpriseProductDetailPage.tsx (or wherever /enterprise/products/:source/:id
is routed/consumed).

Currently product detail URLs look like /enterprise/products/syntech/<id> — the supplier
name is exposed in the address bar. Fix:
- Introduce neutral public aliases and use them in all URLs:
  esquire → "home", syntech → "tech", enterprise → "b2b", apple → "apple".
- Map alias → internal source inside the code (a small lookup object used by the detail
  page/query). Keep old supplier-named URLs working via redirect or dual-accept so any
  saved links don't break, but never GENERATE supplier-named URLs anywhere.
- Also convert this page's tab + pagination + search state to URL params
  (?tab=<alias>&q=&page=) following the same pattern as ShopPage, using ONLY the neutral
  aliases in the URL. Browser back/refresh must preserve the dealer's place.

## TASK 4 — Shared EnterpriseLayout with mobile navigation
Files: new src/components/EnterpriseLayout.tsx, src/App.tsx, and the enterprise pages.

Every enterprise page currently defines its own header/nav (duplicated ~12 times).
- Create EnterpriseLayout.tsx: one top bar (SPET Enterprise branding, links: Dashboard,
  Catalog, Apple, Quotes, Orders, Procurement Lists, Account, Sign out), orange #F97316
  accent, active-link state, and a hamburger menu with slide-in drawer below 820px.
  Use Tailwind classes for this new component (the project's public pages use Tailwind).
- Wrap all /enterprise/* routes in it EXCEPT: /enterprise (public marketing page),
  /enterprise/login, /enterprise/register, and the Apple portal pages /enterprise/apple
  and /enterprise/apple/:id (the Apple portal keeps its own Apple-style chrome; add a
  small "← Enterprise" link in the Apple portal header that goes to /enterprise/dashboard).
- Move the session + enterprise_status 'approved' gate into the layout (unknown/missing
  profile = NOT approved). Remove the per-page duplicated nav and gates.
- Delete the duplicated nav code from each page after wiring. Keep each page's content
  intact.

## TASK 5 — Convert remaining enterprise pages to Tailwind + responsive
Files: EnterpriseDashboard.tsx, EnterpriseProductsPage.tsx, EnterpriseQuotesPage.tsx,
EnterpriseOrdersPage.tsx, EnterpriseAccountPage.tsx, EnterpriseProcurementListsPage.tsx,
EnterpriseProductDetailPage.tsx, EnterpriseLoginPage.tsx, EnterpriseRegisterPage.tsx.

One page per sub-step, building after each:
- Replace inline style={{}} objects with Tailwind utility classes, preserving the visual
  design (orange #F97316 accents, card layouts) but normalising spacing/typography to
  match the public storefront's feel.
- Add responsive behaviour: grids collapse (grid-cols-1 md:grid-cols-2 xl:grid-cols-4),
  containers px-4 md:px-6, page titles text-2xl md:text-3xl, touch targets min-h-11.
- Data tables (orders, quotes, lists) become stacked label/value cards below md.
- No horizontal scrolling at 375px anywhere.

## TASK 6 — Webhook security rewrite
Files: netlify/functions/import-core-products.* (find the exact file), and the admin
project is separate — DO NOT edit admin code here; only the function in THIS repo.

Current problem: the function authenticates with a shared header 'x-spet-secret' whose
value is exposed in the admin's public JS bundle (VITE_ env var) with a hardcoded
fallback 'spet-zoho-2026'. Rewrite the function to:
- Require an Authorization: Bearer <supabase access token> header.
- Verify the token by calling supabase.auth.getUser(token) using a server-side client
  created with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from Netlify env (never VITE_).
- Load the caller's row from profiles and require role IN ('admin','super_admin');
  otherwise return 401/403 JSON.
- Remove all reading of x-spet-secret and the hardcoded fallback string entirely.
- Keep the import logic itself unchanged.
- Apply the same pattern to any other function in netlify/functions that trusts
  x-spet-secret. List every function you changed.
After this task, tell the user: (1) the admin project's CoreProductsPage fetch header
must change to Authorization: Bearer <session token> — provide the exact snippet for
them; (2) rotate the old secret in Zoho and delete VITE_SPET_WEBHOOK_SECRET from the
admin's Netlify env.

## TASK 7 — Final sweep
- Run npm run build; ensure zero TypeScript errors.
- Search the src folder for: 'stringa', 'wholesale_ex_vat', 'syntech', 'esquire' —
  report every remaining occurrence with file + line (do not auto-delete; report first;
  data-layer internals may legitimately keep source values, but UI/URLs must not).
- Produce a summary of every file changed across all tasks, grouped by task.
