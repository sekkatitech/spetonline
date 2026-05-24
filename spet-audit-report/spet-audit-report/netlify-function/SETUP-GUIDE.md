# Gemini Netlify Function — Setup Guide

## What This Solves

Your `vite.config.ts` currently exposes `GEMINI_API_KEY` to the browser:

```ts
// ❌ REMOVE THIS — the API key ships to every visitor
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
},
```

This package replaces that with a secure server-side function. The key never leaves the server.

---

## Files in This Package

| File | Destination in your project |
|---|---|
| `gemini.ts` | `netlify/functions/gemini.ts` |
| `gemini-client.ts` | `src/lib/gemini-client.ts` |

---

## Step-by-Step Setup

### Step 1 — Create the functions folder

```bash
mkdir -p netlify/functions
```

### Step 2 — Copy the function file

Copy `gemini.ts` from this package into `netlify/functions/gemini.ts` in your project.

### Step 3 — Copy the client helper

Copy `gemini-client.ts` into `src/lib/gemini-client.ts` in your project.

### Step 4 — Remove the API key from vite.config.ts

Open `vite.config.ts` and **delete** these lines:

```ts
// DELETE THESE 3 LINES:
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
},
```

Also remove the `loadEnv` import if it's no longer used:
```ts
// Change this:
import { defineConfig, loadEnv } from 'vite';
// To this (if loadEnv is no longer used elsewhere):
import { defineConfig } from 'vite';
```

And simplify the config export if `env` is no longer needed:
```ts
// Change this:
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return { ... };
});

// To this (if no other env vars are needed):
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  server: { hmr: process.env.DISABLE_HMR !== 'true' },
  build: { ... },
});
```

### Step 5 — Set the API key in Netlify (NOT with VITE_ prefix)

1. Go to Netlify Dashboard → Your Site → Site Configuration → Environment Variables
2. Click "Add a variable"
3. Key: `GEMINI_API_KEY` (no VITE_ prefix — this keeps it server-only)
4. Value: your real Gemini API key
5. Click Save

⚠️ If you already have `VITE_GEMINI_API_KEY` set in Netlify, delete that one. The `VITE_` prefix makes it public.

### Step 6 — Install Netlify CLI for local development (optional but recommended)

```bash
npm install -g netlify-cli
netlify login
netlify link   # link to your site
```

Create a `.env` file at your project root (already in .gitignore):
```
GEMINI_API_KEY=your-real-key-here
```

Run locally with functions support:
```bash
netlify dev
```

This starts your Vite app AND the Netlify Function at `http://localhost:8888`.

### Step 7 — Update your React code

#### Before (using the key directly — insecure):
```tsx
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateContent({...});
```

#### After (using the secure client helper):
```tsx
import { askGemini, useGemini } from '@/lib/gemini-client';

// Option A: Direct call
const result = await askGemini('What laptops do you recommend?');
console.log(result.text);

// Option B: React hook (handles loading/error state)
const { ask, loading, result, error } = useGemini();

// Option C: Multi-turn chat hook
const { send, history, loading } = useGeminiChat();
```

### Step 8 — Deploy

```bash
git add netlify/functions/gemini.ts src/lib/gemini-client.ts vite.config.ts
git commit -m "security: move Gemini API key to server-side Netlify Function"
git push
```

Netlify will automatically detect and deploy the function.

---

## Testing the Function

After deployment, you can test the function directly:

```bash
curl -X POST https://spetonline.netlify.app/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is SPET Online?"}'
```

Expected response:
```json
{
  "text": "SPET Online is a premium electronics store...",
  "model": "gemini-2.0-flash",
  "tokenCount": 45
}
```

---

## How the Function Works

```
Browser (React)
    │
    │  POST /api/gemini
    │  { "prompt": "..." }
    │  ← No API key in the request
    │
    ▼
Netlify Function (netlify/functions/gemini.ts)
    │
    │  Reads GEMINI_API_KEY from server environment (never sent to browser)
    │  Validates the request
    │  Calls Gemini API with the key
    │
    ▼
Google Gemini API
    │
    │  Returns generated text
    │
    ▼
Netlify Function
    │
    │  Returns { text, model, tokenCount }
    │
    ▼
Browser (React)
    │  Displays the response
```

---

## Security Features Built Into the Function

- **CORS origin check** — only accepts requests from your Netlify domain and localhost
- **Method validation** — only POST accepted
- **Prompt length limit** — max 4,000 characters (prevents runaway billing)
- **Error sanitisation** — internal errors are never exposed to the client
- **Environment check** — returns 503 if the key isn't configured, rather than crashing
- **No key in responses** — the API key is never included in any response

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Function returns 503 | GEMINI_API_KEY not set in Netlify environment variables |
| CORS error in browser | Your domain isn't in the ALLOWED_ORIGINS list in gemini.ts |
| 404 on /api/gemini | Function not deployed — check Netlify Functions tab in dashboard |
| Works locally but not in production | Key set in .env locally but not in Netlify dashboard |
| `netlify dev` not finding function | Run `netlify link` first to connect to your site |
