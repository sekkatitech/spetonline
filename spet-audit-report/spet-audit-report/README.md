# SPET Online — Audit Package

**For:** Antigravity Development Team  
**Date:** May 2026

---

## Contents

```
spet-audit-report/
│
├── AUDIT-REPORT.md              ← Full written audit (start here)
│
├── configs/
│   ├── netlify.toml             ← Drop-in replacement (adds security headers)
│   ├── index.html               ← Drop-in replacement (adds all meta tags)
│   ├── robots.txt               ← Copy to /public/robots.txt
│   └── ci.yml                   ← Copy to .github/workflows/ci.yml
│
└── netlify-function/
    ├── SETUP-GUIDE.md           ← Step-by-step Gemini function setup
    ├── gemini.ts                ← Copy to netlify/functions/gemini.ts
    └── gemini-client.ts         ← Copy to src/lib/gemini-client.ts
```

---

## Where to Start

1. Read `AUDIT-REPORT.md` for the full findings
2. For the most urgent fix (API key exposure), follow `netlify-function/SETUP-GUIDE.md`
3. Drop-in config files in `configs/` can be applied directly — no code changes needed

## Top 3 Fixes (Do Today)

| # | File | Action |
|---|---|---|
| 1 | `vite.config.ts` | Remove the `define` block that exposes `GEMINI_API_KEY` |
| 2 | `netlify.toml` | Replace with `configs/netlify.toml` (adds security headers) |
| 3 | `index.html` | Replace with `configs/index.html` (adds meta/OG tags) |
