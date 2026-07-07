import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

// ── Load .env into process.env ──────────────────────────────────────────────
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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const SKIP_SKUS = new Set(['MH314QA/A', 'MH334QA/A', 'MH9D4QA/A'])

const hashCache = new Map()

async function hashUrl(url) {
  if (hashCache.has(url)) return hashCache.get(url)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed (${res.status}) for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const hash = createHash('md5').update(buf).digest('hex')
  hashCache.set(url, hash)
  return hash
}

async function dedupeRow(row) {
  const urls = row.image_urls || []
  if (urls.length < 2) return null

  const seenHashes = new Set()
  const deduped = []
  for (const url of urls) {
    const hash = await hashUrl(url)
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash)
      deduped.push(url)
    }
  }

  if (deduped.length === urls.length) return null // no change needed
  return deduped
}

async function processCategory(categorySub) {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, image_urls')
    .eq('category_main', 'iPad')
    .eq('category_sub', categorySub)
    .order('sku', { ascending: true })

  if (error) {
    console.error(`Failed to fetch ${categorySub}:`, error.message)
    return { updated: 0, failed: 0, clean: 0 }
  }

  const targets = rows.filter(r => !SKIP_SKUS.has(r.sku))
  console.log(`\n${categorySub}: checking ${targets.length} rows for content duplicates...`)

  let updated = 0
  let failed = 0
  let clean = 0

  for (let i = 0; i < targets.length; i++) {
    const row = targets[i]
    const progress = `[${i + 1}/${targets.length}]`
    try {
      const deduped = await dedupeRow(row)
      if (!deduped) {
        clean++
        continue
      }
      const { error: updateError } = await supabase
        .from('core_products')
        .update({ image_urls: deduped })
        .eq('id', row.id)
      if (updateError) {
        failed++
        console.log(`${progress} SKU ${row.sku} ✗ update failed: ${updateError.message}`)
      } else {
        updated++
        console.log(`${progress} SKU ${row.sku} ✓ ${row.image_urls.length} → ${deduped.length} images (removed ${row.image_urls.length - deduped.length} content-duplicate${row.image_urls.length - deduped.length === 1 ? '' : 's'})`)
      }
    } catch (err) {
      failed++
      console.log(`${progress} SKU ${row.sku} ✗ ${err.message}`)
    }
  }

  return { updated, failed, clean }
}

async function main() {
  const m2 = await processCategory('Ipad air m2')
  const m4 = await processCategory('Ipad air m4')

  console.log('\n── Summary ──────────────────────────')
  console.log(`M2 — deduplicated: ${m2.updated}, already clean: ${m2.clean}, failed: ${m2.failed}`)
  console.log(`M4 — deduplicated: ${m4.updated}, already clean: ${m4.clean}, failed: ${m4.failed}`)
}

main()
