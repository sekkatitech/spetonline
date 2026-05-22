# SPET Online — Deployment Guide

## Step 1: Get your Supabase API keys

1. Go to → https://supabase.com/dashboard/project/hxxaxyruliquidvkocei/settings/api
2. Copy **Project URL** and **anon / public** key
3. Open `.env` in the project root and fill in:

```
VITE_SUPABASE_URL=https://hxxaxyruliquidvkocei.supabase.co
VITE_SUPABASE_ANON_KEY=paste-your-anon-key-here
```

---

## Step 2: Install dependencies locally

```bash
npm install
```

---

## Step 3: Test locally

```bash
npm run dev
```

Open http://localhost:5173 — the site will be fully live with your Supabase database.

---

## Step 4: Deploy to Netlify

### Option A — Drag & Drop (quickest)
1. Run `npm run build` — this creates the `dist/` folder
2. Go to https://app.netlify.com/drop
3. Drag the `dist/` folder into the browser
4. Done — you get a live URL instantly

### Option B — GitHub + Auto-deploy (recommended)
1. Push this project to a GitHub repo
2. Go to https://app.netlify.com → New site from Git
3. Connect your GitHub repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add Environment Variables in Netlify dashboard:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. Deploy — every push to main auto-deploys

---

## Step 5: Add your Netlify URL to Supabase Auth

1. Go to → https://supabase.com/dashboard/project/hxxaxyruliquidvkocei/auth/url-configuration
2. Add your Netlify URL as **Site URL**: `https://spetshop.netlify.app`
3. Add to **Redirect URLs**: `https://spetshop.netlify.app/**`

---

## Step 6: Add your first products

Since the site is wired to your Supabase database, you need to add products.

**Option A — Supabase SQL Editor** (quick test):
Go to → https://supabase.com/dashboard/project/hxxaxyruliquidvkocei/sql

```sql
-- Add a brand
INSERT INTO brands (name, slug, is_active)
VALUES ('Samsung', 'samsung', true);

-- Add a category
INSERT INTO categories (name, slug, is_active, sort_order)
VALUES ('Televisions', 'tvs', true, 1);

-- Add a product
INSERT INTO products (sku, name, slug, retail_price, is_featured, is_active)
VALUES ('SAM-TV-001', 'Samsung 65" 4K QLED Smart TV', 'samsung-65-qled', 24999.00, true, true);
```

**Option B — Esquire JSON Feed** (main source):
Run the Edge Function sync to pull all products automatically from the Esquire feed.

---

## Payment Gateway (Bob Pay)

The checkout page already shows all Bob Pay logos and is ready for integration.
To wire up live payments, contact Bob Pay for your merchant credentials and add the Bob Pay SDK.

---

## Environment Variables Summary

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://hxxaxyruliquidvkocei.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | From Supabase dashboard → Settings → API |
