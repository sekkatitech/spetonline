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

// SKUs already fully populated by an earlier pipeline — never touch
const SKIP_SKUS = new Set(['MH314QA/A', 'MH334QA/A', 'MH9D4QA/A'])

// Note: 2 "iPad_Pro_11_M4_WiFi_Space_Black" images from the supplied batch were
// excluded here — they are iPad Pro product photos, not iPad Air, and don't belong
// on these rows.
const BLUE_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Blue_PDP_Image_Position_1__en-WW_6f8aedf4-f8bd-48ac-8115-b9d219ad2b3f_5000x.jpg?v=1772627811',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Blue_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772627811',
]

const STARLIGHT_EXTRA_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Starlight_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772627760',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Starlight_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772627760',
]

const PURPLE_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Purple_PDP_Image_Position_1__en-WW_800x.jpg?v=1772627577',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Purple_PDP_Image_Position_2__en-WW_800x.jpg?v=1772627577',
]

async function main() {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, specs, image_urls')
    .eq('category_main', 'iPad')
    .eq('category_sub', 'Ipad air m4')
    .order('sku', { ascending: true })

  if (error) {
    console.error('Failed to fetch rows:', error.message)
    process.exit(1)
  }

  const targets = rows.filter(r => !SKIP_SKUS.has(r.sku) && ['Blue', 'Purple', 'Starlight'].includes(r.specs?.colour))
  console.log(`Found ${targets.length} Blue/Purple/Starlight M4 rows to update with new gallery images.\n`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < targets.length; i++) {
    const row = targets[i]
    const progress = `[${i + 1}/${targets.length}]`
    const colour = row.specs?.colour

    let newImageUrls
    if (colour === 'Blue') newImageUrls = BLUE_IMAGES
    else if (colour === 'Purple') newImageUrls = PURPLE_IMAGES
    else if (colour === 'Starlight') {
      // Prepend positions 1-2 to the existing positions 3-7 for a complete set
      const existing = row.image_urls || []
      newImageUrls = [...STARLIGHT_EXTRA_IMAGES, ...existing]
    }

    const { error: updateError } = await supabase
      .from('core_products')
      .update({ image_urls: newImageUrls })
      .eq('id', row.id)

    if (updateError) {
      failed++
      console.log(`${progress} SKU ${row.sku} (${colour}) ✗ ${updateError.message}`)
    } else {
      updated++
      console.log(`${progress} SKU ${row.sku} (${colour}) ✓ [${newImageUrls.length} images]`)
    }
  }

  console.log('\n── Summary ──────────────────────────')
  console.log(`Updated: ${updated}`)
  console.log(`Failed:  ${failed}`)
}

main()
