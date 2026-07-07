import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

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

// SKUs done by an earlier pipeline — never touch
const SKIP_SKUS = new Set(['MH314QA/A', 'MH334QA/A', 'MH9D4QA/A'])

// Generic (colour-agnostic) M2 assets, content-verified: lifestyle, feature
// composite, "what's in the box" x2. NOT position 2 — verified inconsistent
// (generic family shot for Space Grey, but a genuine 2nd hero angle for
// Blue/Starlight), so it's deliberately excluded from this generic set.
const M2_GENERIC = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_3__WWEN_4f55ae58-2376-4d8e-a821-bc71d131924c_5000x.png?v=1715254309',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_5__WWEN_2ed97161-d3d1-402c-975d-9a461af15003_800x.png?v=1715254309',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_8__WWEN_dbf9e72e-5748-4008-9749-ef15080f7e71_5000x.png?v=1715254309',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_9__WWEN_2dd45673-71f3-4e43-af59-4194710415d1_5000x.png?v=1715254309',
]

// Generic (colour- and size-agnostic) M4 assets, content-verified: colour
// lineup, M4/iPadOS graphic, Apple Intelligence graphic, Pencil Pro graphic,
// Magic Keyboard graphic, What's in the Box graphic.
const M4_GENERIC = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_3__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_4__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_5__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_6__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_7__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_10__en-WW_5000x.jpg?v=1772627686',
]

function mergeDedupe(existing, toAdd) {
  const seen = new Set(existing)
  const merged = [...existing]
  for (const url of toAdd) {
    if (!seen.has(url)) {
      merged.push(url)
      seen.add(url)
    }
  }
  return merged
}

async function enrich(categorySub, genericSet) {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, image_urls')
    .eq('category_main', 'iPad')
    .eq('category_sub', categorySub)
    .order('sku', { ascending: true })

  if (error) {
    console.error(`Failed to fetch ${categorySub} rows:`, error.message)
    return { updated: 0, failed: 0, unchanged: 0 }
  }

  const targets = rows.filter(r => !SKIP_SKUS.has(r.sku))
  console.log(`\n${categorySub}: ${targets.length} rows to check.`)

  let updated = 0
  let failed = 0
  let unchanged = 0

  for (let i = 0; i < targets.length; i++) {
    const row = targets[i]
    const progress = `[${i + 1}/${targets.length}]`
    const existing = row.image_urls || []
    const merged = mergeDedupe(existing, genericSet)

    if (merged.length === existing.length) {
      unchanged++
      console.log(`${progress} SKU ${row.sku} — already complete (${existing.length} images)`)
      continue
    }

    const { error: updateError } = await supabase
      .from('core_products')
      .update({ image_urls: merged })
      .eq('id', row.id)

    if (updateError) {
      failed++
      console.log(`${progress} SKU ${row.sku} ✗ ${updateError.message}`)
    } else {
      updated++
      console.log(`${progress} SKU ${row.sku} ✓ ${existing.length} → ${merged.length} images`)
    }
  }

  return { updated, failed, unchanged }
}

async function main() {
  const m2 = await enrich('Ipad air m2', M2_GENERIC)
  const m4 = await enrich('Ipad air m4', M4_GENERIC)

  console.log('\n── Summary ──────────────────────────')
  console.log(`M2 — updated: ${m2.updated}, unchanged: ${m2.unchanged}, failed: ${m2.failed}`)
  console.log(`M4 — updated: ${m4.updated}, unchanged: ${m4.unchanged}, failed: ${m4.failed}`)
}

main()
