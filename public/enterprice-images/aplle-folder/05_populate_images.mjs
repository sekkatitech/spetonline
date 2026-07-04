#!/usr/bin/env node
/**
 * SPET Enterprise · Bulk-populate Apple product images
 * ----------------------------------------------------
 * For every product in `core_products`, this script:
 *   1. Looks in Storage bucket `product-images` for a folder named after the
 *      product's SKU (with "/" replaced by "-").
 *   2. Lists the images in that folder (sorted alphabetically → 1,2,3…).
 *   3. Writes the FIRST image to `thumbnail_url` (the main image) and the
 *      full ordered list to `image_urls`.
 *
 * It NEVER touches products that have no folder, so it's safe to re-run
 * as you add photos over time.
 *
 * USAGE (run on YOUR machine — it uses your service-role key):
 *   1. npm install @supabase/supabase-js
 *   2. Set env vars (do NOT hard-code the key in the file):
 *        Git Bash / macOS / Linux:
 *          export SUPABASE_URL="https://hxxaxyruliquidvkocei.supabase.co"
 *          export SUPABASE_SERVICE_KEY="your-service-role-key"
 *        PowerShell:
 *          $env:SUPABASE_URL="https://hxxaxyruliquidvkocei.supabase.co"
 *          $env:SUPABASE_SERVICE_KEY="your-service-role-key"
 *   3. node 05_populate_images.mjs            (preview only, changes nothing)
 *      node 05_populate_images.mjs --apply    (writes to the database)
 *
 * Get the service-role key from: Supabase → Project Settings → API → service_role.
 * Keep it secret. It bypasses RLS, so only run this locally, never in the browser.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET = 'product-images'
const APPLY = process.argv.includes('--apply')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars. See the header of this file.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// SKU "MHFA4ZE/A" → folder "MHFA4ZE-A"
const skuToFolder = (sku) => sku.replace(/\//g, '-').trim()

// Only treat these as images
const IMG_RE = /\.(jpe?g|png|webp|avif|gif)$/i

const publicUrl = (path) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

async function main() {
  console.log(APPLY ? '=== APPLY MODE (writing to DB) ===' : '=== PREVIEW MODE (no changes) — add --apply to write ===')

  // Pull all products (id + sku). Paginate to be safe.
  let products = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('core_products')
      .select('id, sku, name')
      .range(from, from + PAGE - 1)
    if (error) { console.error('Fetch error:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    products.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  console.log(`Loaded ${products.length} products.\n`)

  let updated = 0, skipped = 0, empty = 0

  for (const p of products) {
    if (!p.sku) { skipped++; continue }
    const folder = skuToFolder(p.sku)

    const { data: files, error } = await supabase.storage.from(BUCKET).list(folder, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) { console.warn(`  ! list failed for ${folder}: ${error.message}`); skipped++; continue }

    const images = (files || [])
      .filter(f => IMG_RE.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map(f => publicUrl(`${folder}/${f.name}`))

    if (images.length === 0) { empty++; continue }  // no folder / no photos yet — leave untouched

    const thumbnail_url = images[0]
    console.log(`✓ ${p.sku}  (${images.length} image${images.length > 1 ? 's' : ''})`)

    if (APPLY) {
      const { error: upErr } = await supabase
        .from('core_products')
        .update({ thumbnail_url, image_urls: images })
        .eq('id', p.id)
      if (upErr) { console.warn(`  ! update failed for ${p.sku}: ${upErr.message}`); continue }
    }
    updated++
  }

  console.log(`\nDone. ${updated} product(s) ${APPLY ? 'updated' : 'would be updated'}, ${empty} with no photos yet, ${skipped} skipped.`)
  if (!APPLY) console.log('Re-run with --apply to write these changes.')
}

main().catch(e => { console.error(e); process.exit(1) })
