// netlify/functions/claude-chat.mjs
// Storefront AI shopping assistant (src/components/AIChatWidget.tsx).
//
// The browser sends the visible conversation; this function adds the
// knowledge base (knowledge-base.md, bundled via netlify.toml included_files)
// as a cached system prompt and gives Claude a `search_products` tool that
// queries all four supplier tables live, so answers about stock and prices
// come from the database rather than the model's memory.
//
// ANTHROPIC_API_KEY stays server-side. Switched on/off from /admin → AI Features
// (ai_features.key = 'chat_assistant').

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Netlify.env.get('SUPABASE_URL'),
  Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);
const anthropic = new Anthropic({ apiKey: Netlify.env.get('ANTHROPIC_API_KEY') });

// Override with CLAUDE_CHAT_MODEL=claude-haiku-5-5 in Netlify for a much cheaper assistant.
const MODEL = Netlify.env.get('CLAUDE_CHAT_MODEL') || 'claude-opus-5-5';
const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY = 20;       // turns kept from the browser
const MAX_TOOL_ROUNDS = 4;    // search calls per reply

function loadKnowledgeBase() {
  const roots = [process.cwd(), process.env.LAMBDA_TASK_ROOT].filter(Boolean);
  for (const root of roots) {
    const p = join(root, 'knowledge-base.md');
    // Section 14 (technical architecture) is internal and must not reach customers.
    if (existsSync(p)) return readFileSync(p, 'utf8').replace(/## 14\. TECHNICAL ARCHITECTURE[\s\S]*?(?=## 15\.)/, '');
  }
  console.warn('[claude-chat] knowledge-base.md not found — answering without it');
  return '';
}

const SYSTEM_PROMPT = `You are the SPET Online shopping assistant, chatting with customers on spetonline.co.za, a South African online electronics retailer.

How to help:
- Use the search_products tool whenever the customer asks about products, prices, stock or recommendations. Only quote prices and stock from tool results, never from memory. Prices are in South African Rand (R).
- Search with short keywords (a brand, model or product type, e.g. "macbook air", "lenovo thinkpad", "27 monitor"). If a search finds nothing, try one or two simpler keywords before saying you couldn't find it.
- Recommend at most 3 products at a time and say briefly why each fits.
- For orders, delivery, returns, payment and company questions, answer from the knowledge base below. If the answer isn't there, give the customer the contact details rather than guessing.
- Keep replies short and friendly: a few sentences, plain text, no markdown, no tables. Refer to products by their exact name; the chat window shows links to them for you.
- You cannot see the customer's account, orders or cart, and you cannot place orders.

<knowledge_base>
${loadKnowledgeBase()}
</knowledge_base>`;

const TOOLS = [
  {
    name: 'search_products',
    description: 'Search the SPET Online catalogue (all suppliers) for active products whose name contains every keyword. Returns name, brand, price in Rand, stock and a product page URL.',
    input_schema: {
      type: 'object',
      properties: {
        keywords: { type: 'string', description: '1-4 short keywords, e.g. "macbook air m4" or "hp laserjet"' },
        max_price: { type: 'number', description: 'Optional upper price limit in Rand' },
        in_stock_only: { type: 'boolean', description: 'Only return products with stock available' },
      },
      required: ['keywords'],
      additionalProperties: false,
    },
    strict: true,
  },
];

// Column names differ per supplier table (see src/pages/SearchPage.tsx).
const SOURCES = [
  { table: 'products',          name: 'ProductName', cols: 'id, ProductName, Brand, Price, AvailableQty, slug', price: 'Price', stock: 'AvailableQty',
    map: p => ({ name: p.ProductName, brand: p.Brand, price: p.Price, stock: p.AvailableQty, url: `/product/${p.slug || p.id}` }) },
  { table: 'syntech_products',  name: 'name', cols: 'id, name, brand, price_display, stock_qty', price: 'price_display', stock: 'stock_qty',
    map: p => ({ name: p.name, brand: p.brand, price: p.price_display, stock: p.stock_qty, url: `/shop/tech/product/${p.id}` }) },
  { table: 'axiz_products',     name: 'name', cols: 'id, name, brand, price_display, stock_qty', price: 'price_display', stock: 'stock_qty',
    map: p => ({ name: p.name, brand: p.brand, price: p.price_display, stock: p.stock_qty, url: `/shop/axiz/product/${p.id}` }) },
  { table: 'pinnacle_products', name: 'name', cols: 'id, name, brand, price_display, stock_qty', price: 'price_display', stock: 'stock_qty',
    map: p => ({ name: p.name, brand: p.brand, price: p.price_display, stock: p.stock_qty, url: `/shop/pinnacle/product/${p.id}` }) },
];

async function searchProducts({ keywords, max_price, in_stock_only }) {
  const terms = String(keywords || '')
    .split(/\s+/)
    .map(t => t.replace(/[%_,()]/g, '').trim())
    .filter(Boolean)
    .slice(0, 4);
  if (terms.length === 0) return [];

  const results = await Promise.all(SOURCES.map(async (src) => {
    let q = supabase.from(src.table).select(src.cols).eq('is_active', true);
    for (const t of terms) q = q.ilike(src.name, `%${t}%`);
    if (typeof max_price === 'number') q = q.lte(src.price, max_price);
    if (in_stock_only) q = q.gt(src.stock, 0);
    const { data, error } = await q.order(src.price, { ascending: true }).limit(6);
    if (error) {
      console.error(`[claude-chat] search ${src.table} failed:`, error.message);
      return [];
    }
    return (data ?? []).map(src.map);
  }));
  return results.flat().slice(0, 15);
}

async function isEnabled() {
  const { data } = await supabase.from('ai_features').select('enabled').eq('key', 'chat_assistant').maybeSingle();
  return data?.enabled !== false; // missing row/table → on
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });
  if (!Netlify.env.get('ANTHROPIC_API_KEY')) return json(503, { error: 'The assistant is not configured yet.' });
  if (!(await isEnabled())) return json(503, { error: 'The assistant is currently switched off.' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  // Only plain text turns are accepted from the browser; it alternates user/assistant and ends on user.
  const history = Array.isArray(body?.messages) ? body.messages.slice(-MAX_HISTORY) : [];
  const messages = history
    .filter(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .map(m => ({ role: m.role, content: m.text.slice(0, MAX_MESSAGE_CHARS) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return json(400, { error: 'The last message must be from the customer.' });
  }

  const found = new Map(); // url → product, everything the searches surfaced

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const response = await anthropic.beta.messages.create({
        model: MODEL,
        max_tokens: 4000,
        output_config: { effort: 'low' },
        // On a safety decline, let the API retry on another model (not available for Haiku).
        ...(MODEL.includes('haiku') ? {} : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }),
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        tools: TOOLS,
        // Out of searches: let Claude answer with what it has.
        tool_choice: round === MAX_TOOL_ROUNDS ? { type: 'none' } : { type: 'auto' },
        messages,
      });

      if (response.stop_reason === 'refusal') {
        return json(200, { reply: "Sorry, I can't help with that one. For anything else about our products, just ask!", products: [] });
      }

      if (response.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: response.content });
        const toolResults = [];
        for (const block of response.content) {
          if (block.type !== 'tool_use') continue;
          try {
            const products = await searchProducts(block.input);
            for (const p of products) found.set(p.url, p);
            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(products) });
          } catch (err) {
            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: `Search failed: ${err.message}`, is_error: true });
          }
        }
        messages.push({ role: 'user', content: toolResults });
        continue;
      }

      const reply = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
      // Show links only for products the reply actually names.
      const lowerReply = reply.toLowerCase();
      const products = [...found.values()]
        .filter(p => p.name && lowerReply.includes(p.name.toLowerCase()))
        .slice(0, 3);
      return json(200, { reply: reply || "Sorry, I didn't catch that. Could you rephrase?", products });
    }
    return json(200, { reply: 'Sorry, that took me too long. Could you ask in a simpler way?', products: [] });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return json(429, { error: "I'm getting a lot of questions right now. Please try again in a minute." });
    }
    console.error('[claude-chat] failed:', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
    return json(502, { error: 'The assistant is unavailable right now. Please try again shortly.' });
  }
};

export const config = {
  path: '/api/chat',
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
