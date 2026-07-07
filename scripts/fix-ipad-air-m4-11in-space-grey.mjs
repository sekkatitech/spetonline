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

// Correct, size-matched gallery for the 11-inch M4 Space Grey rows.
// (Previously these rows were mistakenly given the 13-in Space Gray gallery,
// applied by colour only since no 11-in-specific set existed yet.)
const SPACE_GREY_11IN_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_3__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_4__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_5__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_6__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_7__en-WW_5000x.jpg?v=1772627686',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Space_Gray_PDP_Image_Position_10__en-WW_5000x.jpg?v=1772627686',
]

async function main() {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, name')
    .eq('category_main', 'iPad')
    .eq('category_sub', 'Ipad air m4')
    .ilike('name', '11-INCH%SPACE GREY')
    .order('sku', { ascending: true })

  if (error) {
    console.error('Failed to fetch rows:', error.message)
    process.exit(1)
  }

  console.log(`Found ${rows.length} 11-inch M4 Space Grey rows to fix.\n`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const progress = `[${i + 1}/${rows.length}]`

    const { error: updateError } = await supabase
      .from('core_products')
      .update({ image_urls: SPACE_GREY_11IN_IMAGES })
      .eq('id', row.id)

    if (updateError) {
      failed++
      console.log(`${progress} SKU ${row.sku} ✗ ${updateError.message}`)
    } else {
      updated++
      console.log(`${progress} SKU ${row.sku} ✓ [8 images]`)
    }
  }

  console.log('\n── Summary ──────────────────────────')
  console.log(`Updated: ${updated}`)
  console.log(`Failed:  ${failed}`)
}

main()
