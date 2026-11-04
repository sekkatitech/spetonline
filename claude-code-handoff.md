# SPET Online — storefront design-system handoff

Last updated: 3 November 2026

Rollout plan: `plan-design-system-rollout-20261103_193309.md`. It is not in this repo; it
lives in the Kombai plans folder on the development machine (`~/.kombai/plans/`). Section
references below (§) point to that file.

Design reference: the chosen canvas design (`Homepage — Department storefront`,
`.kombai/canvas/spet-homepage.canvas#var_2224ec2c407e`).

Scope delivered: every public storefront route now runs on the shared design system
(Phases 0–5 of the rollout plan). The enterprise portal and admin are excluded apart from
a Back to shop link on enterprise routes. Nothing here has been deployed or committed.

---

## 1. Verification

Run on 3 November 2026 against the local dev server and the live Supabase data, in Edge
through Playwright, with every non-read Supabase request blocked:

- `npm run lint` — passes (tsc --noEmit).
- `npm run build` — passes. The build script regenerates `public/sitemap.xml`
  (6 506 URLs), so that file shows as modified after every build.
- Route sweep: 26 routes at 375, 768 and 1440px in light and dark, checking horizontal
  overflow, console errors, one `h1`, no supplier names in `main` or the page title, and
  no `R0` price. 0 failures on the public routes. The enterprise routes are checked for
  console errors only, and overflow there is listed in section 6.
- Flows: filter sheet typing, focus and Escape; filter and pagination URL state with
  reload; older `brand=a,b` links; tab keyboard control; tile to detail to cart with
  quantity for all four ranges; cart links resolving to the right product; theme
  persistence; legal dialog focus trap; password toggle; carousel paused under reduced
  motion; Back to shop on `/enterprise`, `/enterprise/apple` and `/enterprise/login`.

Not verified, and needs a person or test credentials:

- **Checkout end to end.** The Netlify functions do not run under this dev server, and no
  order was placed. The promo code hand-off from cart to checkout is checked by reading
  the code only.
- **Signed-in pages.** `/account` tabs, the order field fix, saved addresses, the wishlist
  by ID, the email verification gate and the logged-in enterprise pages were type-checked
  but not opened with an account.
- **Password reset** with a real emailed link, and contact form delivery.
- Screen reader testing, and the 390 and 1024px widths in §7 of the plan.

---

## 2. Files

### Shared foundation

| File | Purpose |
|---|---|
| `src/components/ui/*` | `Button`/`ButtonLink`/`IconButton`, `TextField`/`PasswordField`/`SelectField`/`TextareaField`/`CheckboxField`, `Panel`/`SectionHeader`, `PageShell`, `Skeleton`/`EmptyState`, `StockPill`/`PriceTag`, `QtyStepper`, `Tabs`, `FilterSheet`, `useDialog`, barrel `index.ts`. |
| `src/components/product/ProductTile.tsx` | The only product card. `grid` and `row` variants, skeleton. Moved from `home/`. |
| `src/components/product/ProductDetailTemplate.tsx` | The only product detail layout: gallery, price, stock, quantity, wishlist, trust rows, description/spec tabs, related products, JSON-LD. |
| `src/components/catalogue/CatalogueParts.tsx` | Filter panel, active filter chips, pagination and the grid body shared by `ShopPage` and `SupplierShopPage`. |
| `src/components/WishlistProvider.tsx` | One wishlist query per page. |
| `src/lib/productDisplay.ts` | Price, stock, `supplier`, `href`, `note`, cart payload, `formatRand`, `formatMoney`. |
| `src/lib/productAdapters.ts` | Normalises each table into `ProductDetail`; related products; wishlist products by ID. |
| `src/lib/supplierCatalog.ts` | `SupplierConfig` per range: customer labels, table, route, brand tiles, spec source. `fetchActiveRows` reads past the 1 000-row response cap. |
| `src/lib/cartStore.ts` | `addItem(item, qty?)` honours quantity. |
| `src/lib/api.ts` | `onSaleOnly` filter, `escapeLike`, supplier fields on `Product`. |
| `src/index.css` | `spet-*` tokens, base styles on tokens, `.product-description`, Tailwind default radii restored. |
| `src/App.tsx` | Skip link, `/reset-password`, `NotFoundPage`, `React.lazy` for admin, enterprise and chat, Back to shop on enterprise routes. Route paths unchanged. |
| `index.html` | Restores the saved theme before first paint. |
| `src/components/Layout.tsx` | Header, department mega-menu, footer. |
| `src/components/LegalModal.tsx`, `DealBanner.tsx`, `AIChatWidget.tsx`, `ThemeToggle.tsx`, `SafeImage.tsx` | Moved to tokens; legal dialog has dialog semantics and a focus trap. |

### Pages

| Page | State |
|---|---|
| `HomePage` + `src/components/home/*` | Reference implementation. |
| `ShopPage` | `CatalogueParts`, `SelectField`, `TextField`, 44px chips. |
| `SupplierShopPage` (new) | Template for `TechShopPage`, `AxizShopPage`, `PinnacleShopPage`, now thin wrappers. |
| `ProductPage`, `TechProductPage`, `AxizProductPage`, `PinnacleProductPage` | Thin wrappers over `ProductDetailTemplate`. |
| `ShopLandingPage`, `SearchPage`, `CategoriesPage`, `DealsPage` | Rebuilt on `ProductTile` and `PageShell`. |
| `CartPage`, `CheckoutPage`, `AccountPage`, `AuthPage`, `ResetPasswordPage`, `PaymentSuccess`, `PaymentCancel` | Rebuilt on the primitives. Payment, order and email logic kept as it was. |
| `ContactPage`, `B2BPage`, `NotFoundPage` | Rebuilt on the primitives. |

### Deleted

`src/components/HomeSections.tsx`, `src/components/ProductSections.tsx` (`ProductCard`,
`ProductSkeleton`, `Featured*`), `src/components/home/HomeWishlistProvider.tsx`,
`PlaceholderBannerCard` in `DealBanner.tsx`.

### Build-generated

`public/sitemap.xml`, regenerated by `npm run build`.

### Design references (not shipped)

- `.kombai/canvas/spet-homepage.canvas`
- `.kombai/canvas/assets/spet-homepage-brief.md`
- `.kombai/tmp/department-storefront.html` (exported node markup)

---

## 3. Design tokens

Defined in `src/index.css` under `@theme`, with `.dark` overrides. Use the utilities
(`bg-spet-surface`, `text-spet-ink`, `border-spet-line`, …). `lago-*` stays defined only
for admin.

| Token | Light | Dark | Use |
|---|---|---|---|
| `spet-canvas` | `#f6f5f1` | `#0a141d` | page ground |
| `spet-surface` | `#ffffff` | `#112332` | panels, cards, header |
| `spet-surface-2` | `#fafaf8` | `#0f1e29` | skeletons, subtle fills |
| `spet-ink` | `#101820` | `#ffffff` | primary text |
| `spet-ink-2` | `#33424e` | `#c7d6e1` | secondary text |
| `spet-muted` | `#6b7783` | `#8fa3b2` | tertiary text |
| `spet-was` | `#8a949c` | `#8fa3b2` | was-prices, input placeholders |
| `spet-line` | `#e4e2dc` | `#1e3d58` | borders |
| `spet-line-2` | `#efeee9` | `#17303f` | internal dividers |
| `spet-blue` | `#057dcd` | same | primary action / active |
| `spet-blue-dark` | `#0a5c99` | same | hover |
| `spet-link` | `#0a5c99` | `#7cc6f5` | text links on tinted panels |
| `spet-orange` | `#f5820b` | same | genuine savings only |
| `spet-navy` | `#0e1c26` | same | utility bar, footer, dark bands, chat panel |
| `spet-tint` | `#eaf2f8` | `#11283a` | department intro, newsletter, chips |
| `spet-tint-line` | `#d8e6f1` | `#1e4a68` | borders on tinted panels |
| `spet-stock` | `#2f7a4f` | `#6fd39b` | in-stock state |

Type: Outfit for display (`font-display`), Inter for UI/product facts. Radii use Tailwind's
defaults: `rounded-2xl` 16px panels, `rounded-xl` 12px image wells, `rounded-lg` 8px
controls. Prices are `tabular-nums` in the form `R3 699`; cart and order totals use
`formatMoney`, which keeps cents when a discount or fee produces them.

Header heights: **100px mobile** (56 main + 44 search), **144px desktop**
(36 utility + 64 main + 44 department nav). `NavSpacer` and `.page-top` follow this.

---

## 4. Data behaviour (important)

- **Departments** are derived at runtime from `useCategoryHeads()` (live DB values),
  grouped by `src/components/home/departments.ts`. No hardcoded product lists and no
  supplier names. If a department has no matching heads it is not rendered.
- **Assortment** = 8 newest products across the selected department's heads; 4 are
  shown, the first two are used in the intro panel.
- **Deals shelf** = only rows where `is_on_sale = true` (`onSaleOnly` filter). If there are
  fewer than four, the shelf adapts its columns; with zero the shelf is hidden. It
  never relabels a non-discounted product as a deal.
- **New arrivals** = 12 newest products with the assortment IDs removed, first four.
- **Prices** come from `src/lib/productDisplay.ts`: current = `price_display`, then
  `sale_price` only when `is_on_sale` is true and the value is above zero, then `Price`.
  The feed holds `sale_price` values of 0 and stale values on rows that are not on sale,
  so `sale_price` must never be read without that flag. Was-price only when a higher
  `price_rrp` exists, or when the row is on sale/clearance and `Price` is higher. Savings
  are exact differences.
- **Product view**: `ProductView` carries `supplier` and a supplier-correct `href`
  (`/product/:slug` for the main range, `/shop/{tech|axiz|pinnacle}/product/:id` otherwise).
  The rollout plan calls this field `detailHref`; the code uses `href`.
- **Product tile**: `ProductTile` accepts a `supplier` prop, defaulting to `esquire`. Always
  pass the correct supplier. A tile outside `WishlistProvider` renders no heart.
- **Cart**: `cartStore.addItem(item, qty?)` honours quantity and merges by adding it to the
  existing line. Cart links use `productHref(item.supplier, item.product_id)`.
- **Promo codes**: the cart passes `promoCode`, `promoId` and `promoDiscount` to checkout.
  `create-order` reads `promoCode`, which was previously never sent.
- **Wishlist**: guest toggles are no-ops. `AccountPage` loads saved products by ID from all
  four tables.
- **Orders**: account order rows read `name` and `line_total`, the columns `create-order`
  writes.
- **Supplier labels**: customers see Home & entertainment, Gaming & computing, Business
  computing (`axiz`) and Computing accessories (`pinnacle`). The last two names were chosen
  during this rollout and are set in `supplierCatalog.ts`.
- **Rows without a price**: 639 Axiz and Pinnacle rows have `price_display` 0 or null, all out
  of stock. They show Price unavailable and cannot be added to the cart.
- **Deals page** shows real promotions, banners and on-sale products. Hard-coded fallback
  promo codes and SKUs are gone; with nothing active it shows an empty state.

---

## 5. Implementation status

| Phase | State | Notes | Rollout plan |
|---|---|---|---|
| 0 Foundation | Done | `Featured*` exports removed with `ProductSections.tsx`. | §4 Phase 0 |
| 1 Catalogue | Done | No `search` tile variant: the `grid` tile suits search results. | §4 Phase 1 |
| 2 Product detail | Done | Pinnacle specs come from `specifications`, as the old page did, not `raw_data` as the plan says. Stock counts and shipping class are no longer shown to customers. | §4 Phase 2 |
| 3 Transactional | Done, not exercised end to end | See section 1. | §4 Phase 3 |
| 4 Static + exits | Done | Back to shop is one fixed link in `App.tsx` rather than an edit to 13 enterprise headers. B2B solution cards use icons, because no suitable local photos exist. | §4 Phase 4 |
| 5 Quality | Mostly done | `@ts-nocheck` removed from all public files. Global `.container` stays because `AdminPage` uses it. Remaining items in section 6. | §4 Phase 5 |

Main bundle: 2.70 MB before, 383 kB after route-level lazy loading. `AdminPage` is now a
1.9 MB chunk loaded only on `/admin`; that is what the remaining Vite size warning refers to.

---

## 6. Follow-ups

Decided by the owner (2026-11-04):

1. **Sale price is charged.** `create-order.js` now uses `sale_price` when `is_on_sale` is set
   and the value is above zero, matching `toProductView`. Keep the two in step. Needs a deploy
   and one real or sandbox payment to confirm.
2. **Cart stays full until payment succeeds.** `CheckoutPage` no longer clears it. It stores a
   `pendingOrder` in the cart store. `PaymentSuccess` clears the cart, and `Navbar` clears it on
   a later visit if that order reads as `paid`. `PaymentCancel` passes the promo back to checkout.
3. **Customer labels kept:** Business computing and Computing accessories. Tiles for Zone,
   PinnPOS and PinnSec no longer load a logo from the supplier's domain.
4. **Routes `/shop/axiz` and `/shop/pinnacle` stay** because URLs must not change. This is the
   accepted exception to the supplier-name rule in section 7.
5. **B2B copy.** "Authorised partner" confirmed. "Hundreds of schools" was wrong and is removed.

6. **Supplier-linked brand values stay.** `Esquire` (26 active products), `PinnPOS` (20) and
   `PinnSec` (9) still show as brands and inside product names. Accepted exception to section 7.
7. **Named partner brands are correct.** B2B names Dell, HP, Hikvision and Ubiquiti as
   authorised partners.
8. **Abandoned orders are cancelled.** The new `cancel-order` function runs from `PaymentCancel`,
   and `create-order` cancels the attempt it replaces (`previousOrderId`). Both only touch the
   shopper's own `pending`/`unpaid` order. `payfast-itn.js` still overwrites the status if a
   payment arrives late.

   The scheduled `cancel-stale-orders` function also cancels storefront (`source = consumer`)
   orders left unpaid for 48 hours, for orders created from 2026-11-04. Enterprise orders are
   excluded because they stay unpaid on credit terms.

   The 11 older unpaid storefront orders (R41 182.60, June to October 2026) were cancelled
   once, with the owner's approval, on 2026-11-04.

Deployment notes (2026-11-04):

- **Live since 2026-11-04.** Every production build from 2026-10-28 failed, so the site had stayed
  on the 2026-08-13 deploy. This release also published the Claude chat, contact form and daily
  visitor report for the first time.
- **Secret scan.** Netlify treats the `SUPABASE_URL` value as a secret. Any tracked file holding
  that literal URL fails the build with a generic "exit code 2", even though the build itself
  passes. Keep it out of tracked files.
- **Check the live site after deploying.** The security headers in `netlify.toml` do not apply
  on the local dev server, so anything they block only shows up in production.

Still open:

- **Real payment test.** Run a PayFast payment and a cancelled payment on the live setup.
- **Apple page video.** The security headers block the `core.co.za` video on `/enterprise/apple`
  because there is no `media-src`. Fix it with the Apple redesign.

Technical:

6. **HTML sanitising** and **auth redirect allow-listing** (out of scope per §1). Feed HTML
   is still rendered with `dangerouslySetInnerHTML`, and `?redirect=` is not validated.
7. **Bundle**: `AdminPage` carries about 1.9 MB; split mapbox and charts out of it.
8. **Images**: supplier image hosts (`api.esquire.co.za`, `www.xyz.co.za`) can fail or be
   slow. `SafeImage` falls back to `img.logo.dev`; a cached proxy/CDN would be more reliable.
9. **Enterprise**: pages are unchanged, by design. At 375px `/enterprise` overflows by 108px and
   `/enterprise/apple` by 7px, from their own layouts.

---

## 7. Do not change

- Routes in `src/App.tsx`.
- Supabase queries, auth, payments, admin or Netlify functions, except the owner-approved
  sale price, cart and order-cancelling changes in section 6.
- Product data shape or supplier source mapping.
- Never render supplier names in customer-facing UI or URLs.
- Never show a "was" price or saving without a real reference price.
