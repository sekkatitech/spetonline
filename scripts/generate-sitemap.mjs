import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

const SITE_URL = 'https://spetonline.co.za'
const OUT_PATH = join(__dirname, '..', 'public', 'sitemap.xml')

// Static, always-present routes
const STATIC_ROUTES = ['/', '/shop', '/shop/home', '/shop/tech', '/deals', '/categories', '/b2b']

function xmlEscape(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function urlEntry(loc, lastmod) {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}\n  </url>`
}

// Supabase/PostgREST caps each request at 1000 rows by default — page through with .range()
async function fetchAllRows(supabase, table, columns) {
  const pageSize = 1000
  let from = 0
  const rows = []
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('is_active', true)
      .range(from, from + pageSize - 1)
    if (error) return { error }
    rows.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return { data: rows }
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠ SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set — writing sitemap with static routes only')
  }

  const entries = STATIC_ROUTES.map((path) => urlEntry(`${SITE_URL}${path}`))

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Esquire catalogue — slug-based URLs, fall back to id if slug is missing
    const { data: products, error: productsError } = await fetchAllRows(supabase, 'products', 'id, slug, updated_at')
    if (productsError) {
      console.error('✗ Failed to fetch products:', productsError.message)
    } else {
      for (const p of products) {
        entries.push(urlEntry(`${SITE_URL}/product/${p.slug || p.id}`, p.updated_at))
      }
      console.log(`✓ ${products.length} Esquire product URLs`)
    }

    // Syntech catalogue — id-based URLs, no slug concept for this table
    const { data: syntechProducts, error: syntechError } = await fetchAllRows(supabase, 'syntech_products', 'id, updated_at')
    if (syntechError) {
      console.error('✗ Failed to fetch syntech_products:', syntechError.message)
    } else {
      for (const p of syntechProducts) {
        entries.push(urlEntry(`${SITE_URL}/shop/tech/product/${p.id}`, p.updated_at))
      }
      console.log(`✓ ${syntechProducts.length} Syntech product URLs`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
  writeFileSync(OUT_PATH, xml, 'utf8')
  console.log(`✓ Wrote ${entries.length} URLs to ${OUT_PATH}`)
}

main()
