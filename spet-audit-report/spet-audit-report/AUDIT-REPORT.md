# SPET Online — Full Codebase Audit Report

**Site:** https://spetonline.netlify.app  
**Repo:** https://github.com/sekkatitech/spetonline  
**Audited:** May 2026  
**Prepared by:** Claude (Anthropic)  
**For:** Antigravity Development Team

---

## Overall Score: 52 / 100

| Category | Grade | Notes |
|---|---|---|
| Security Headers | F | Confirmed — zero headers in netlify.toml |
| API Key Exposure | 🔴 CRITICAL | Gemini key exposed in browser bundle |
| Database Security (Firestore) | B+ | Well-written rules, minor gaps |
| Supabase RLS | ⚠️ Unknown | Anon key is public — RLS must be verified ON |
| Build Config | A- | Code splitting, TypeScript, correct SPA setup |
| SEO / Meta | D | No description, no OG tags, no sitemap |
| Performance | C+ | Good code splitting, images unknown |
| Accessibility | B | Needs alt text audit and keyboard testing |

---

## Stack Confirmed (from codebase)

- **Frontend:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4
- **Routing:** React Router v7
- **State:** Zustand
- **Animation:** Framer Motion (motion) 12
- **Icons:** Lucide React
- **Primary DB:** Supabase (`@supabase/supabase-js`)
- **Secondary DB:** Firebase Firestore (firestore.rules present)
- **AI:** Google Gemini (`@google/genai`)
- **Hosting:** Netlify (free tier)
- **Dead code:** Express, dotenv, functions.php, index.php

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. Gemini API Key Exposed in Browser Bundle
**File:** `vite.config.ts` line 11  
**Severity:** Critical  
**Confirmed:** Yes

```ts
// THIS IS THE PROBLEM — REMOVE THIS
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
},
```

The Gemini API key is injected directly into the compiled JavaScript bundle that is sent to every visitor's browser. Anyone can open DevTools → Sources and find the real API key. They can then use your Gemini quota freely, incurring billing charges or using it for abuse.

**Fix:** Remove the `define` block. Move all Gemini API calls to a Netlify Function (see `netlify-function/` folder in this package). The frontend calls your function endpoint; the function calls Gemini server-side with the key stored as a secret environment variable.

---

### 2. No HTTP Security Headers
**File:** `netlify.toml`  
**Severity:** Critical  
**Confirmed:** Yes

The current `netlify.toml` is only 8 lines — build config and SPA redirect. No `[[headers]]` block exists at all. This means every HTTP response from the site is missing:

- `Content-Security-Policy` — protects against XSS attacks
- `X-Frame-Options` — prevents clickjacking
- `X-Content-Type-Options` — prevents MIME sniffing
- `Referrer-Policy` — controls referrer information leakage
- `Permissions-Policy` — restricts browser features (camera, mic, etc.)
- `Cache-Control` for assets

**Fix:** Replace `netlify.toml` with the version in `configs/netlify.toml` in this package.

---

### 3. index.html Has No Meta Tags
**File:** `index.html`  
**Severity:** Critical (SEO + Marketing)  
**Confirmed:** Yes

The entire `<head>` is: charset, viewport, favicon, title. Nothing else. When shared on WhatsApp, Twitter, LinkedIn — no preview image, no description. Google has nothing to index.

**Fix:** Replace `index.html` with the version in `configs/index.html` in this package.

---

## 🟠 HIGH SEVERITY ISSUES

### 4. Two Databases Running Simultaneously (Supabase + Firestore)
**Files:** `package.json`, `firestore.rules`, `.env.example`  
**Severity:** High

`@supabase/supabase-js` is in dependencies AND a full `firestore.rules` file exists. Either the project is mid-migration from Firebase to Supabase, or both are actively used. This creates:
- Duplicate authentication logic
- Double the attack surface
- Inconsistent data
- Doubled cloud costs

**Action required:** Decide on ONE database. If Supabase is primary (as .env.example suggests), remove all Firebase code and the Firestore rules file.

---

### 5. Supabase RLS Status Unknown
**File:** Supabase dashboard (not in codebase)  
**Severity:** High

The `VITE_SUPABASE_ANON_KEY` is correctly public (expected by design), but this is only safe if Row Level Security (RLS) is **enabled** on **every** Supabase table. If RLS is off on any table, anyone with the anon key can read or write all data in that table.

**Action required:** In Supabase Dashboard → Table Editor → each table → RLS → confirm it is ENABLED and has policies defined.

---

### 6. Express Dependency Is Dead Code
**File:** `package.json`  
**Severity:** High

`express ^4.21.2` and `@types/express` are in dependencies but Express does not run on Netlify static hosting. This is either legacy code or a confusion between the frontend app and a planned backend. It adds unnecessary bloat and dependency vulnerability surface.

**Fix:** `npm uninstall express @types/express`

---

### 7. Order Creation Allows Client-Submitted Prices (Firestore)
**File:** `firestore.rules` line ~67  
**Severity:** High

Orders can be created directly by signed-in users with no server-side price validation. A user can submit an order with a price of R1 for any product. The comment in the rules says "Usually written by server functions" but the rule still permits direct client writes.

**Fix:** Either change the rule to `allow create: if false` (forcing all orders through a Cloud Function that validates pricing) or add Firestore field validation rules that check submitted prices against the products collection.

---

## 🟡 MEDIUM SEVERITY ISSUES

### 8. Newsletter & Activity Logs Allow Anonymous Writes Without Rate Limiting
**File:** `firestore.rules`

Both `newsletter_subscribers` and `user_activity` allow `create: if true` — anyone including bots can write to these collections infinitely, potentially exhausting Firestore quota.

**Fix:** Add email validation to newsletter rule. Restrict activity logs to `isSignedIn()`. Consider moving both to Cloud Functions with reCAPTCHA.

---

### 9. No Content Security Policy
**File:** `netlify.toml` (missing)

Without a CSP, any XSS vulnerability (in your code or a dependency) gives attackers full access to the page — they can read Supabase tokens, user data, or payment info.

**Fix:** Covered by the updated `netlify.toml` in this package.

---

### 10. No GitHub Actions CI Pipeline
**File:** `.github/workflows/` (empty)

The workflows directory exists but appears to contain nothing. TypeScript errors and broken builds are only caught when Netlify tries to deploy — too late.

**Fix:** See `configs/ci.yml` in this package.

---

### 11. dotenv Dependency Is Unnecessary
**File:** `package.json`

Vite handles `.env` files natively via its own env loading system. The `dotenv` package is redundant and may cause confusion.

**Fix:** `npm uninstall dotenv`

---

## 🟢 WHAT IS GOOD (Don't Change These)

### ✅ Code Splitting Already Implemented
`vite.config.ts` has proper `manualChunks` — React, Supabase, Motion, Zustand, and Lucide icons split into separate vendor chunks. This is solid performance work.

### ✅ TypeScript Throughout
94.6% TypeScript. tsconfig and lint script (`tsc --noEmit`) in place. This massively reduces runtime bugs.

### ✅ Firestore Rules Are Well-Written
- Deny-all default (`allow read, write: if false` catch-all)
- Role-based admin access pattern
- Owner-only user data access
- Limited field updates (users cannot change their own role)
- Payments locked to admin only
- This is better than most projects at this stage

### ✅ SPA Redirect in netlify.toml Is Correct
The `[[redirects]]` block correctly routes all paths to `index.html` — this is the right config for a React SPA.

### ✅ .gitignore Correctly Excludes .env Files
No real API keys were committed to the public repo. `.env.example` only has placeholder values.

### ✅ Modern, Well-Chosen Stack
React 19, Vite 6, Tailwind 4, React Router v7, Zustand — all current, well-maintained. Supabase is an excellent choice for an e-commerce backend.

---

## Files to Delete

```
functions.php     — PHP file, unrelated to Vite/React/Netlify stack
index.php         — PHP file, unrelated to Vite/React/Netlify stack
```

Run: `git rm functions.php index.php && git commit -m "chore: remove orphaned PHP files"`

---

## Priority Order for Fixes

| # | Fix | Effort | Impact |
|---|---|---|---|
| 1 | Remove Gemini key from vite.config.ts + deploy Netlify Function | Medium | 🔴 Critical |
| 2 | Replace netlify.toml with secure version | 5 min | 🔴 Critical |
| 3 | Update index.html with meta tags | 15 min | 🟠 High |
| 4 | Enable/verify Supabase RLS on all tables | Medium | 🟠 High |
| 5 | Decide on Supabase vs Firestore — remove one | High | 🟠 High |
| 6 | Fix Firestore order creation (add price validation) | Medium | 🟠 High |
| 7 | Remove express, dotenv, PHP files | 5 min | 🟡 Medium |
| 8 | Fix newsletter/activity log Firestore rules | 15 min | 🟡 Medium |
| 9 | Add CI pipeline (.github/workflows/ci.yml) | 30 min | 🟡 Medium |
| 10 | Add robots.txt and sitemap.xml to /public | 30 min | 🟡 Medium |
| 11 | Run npm audit and fix high/critical vulnerabilities | Medium | 🟡 Medium |
| 12 | Add Product JSON-LD schema to product pages | Medium | 🟢 Low |
| 13 | Add Netlify prerendering for SEO | Low | 🟢 Low |

---

*Report generated May 2026. Based on direct inspection of: package.json, netlify.toml, .env.example, vite.config.ts, index.html, firestore.rules, firebase-blueprint.json, and repository structure.*
