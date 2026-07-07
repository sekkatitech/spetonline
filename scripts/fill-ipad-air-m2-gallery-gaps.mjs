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

const SPACE_GREY_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_1b__WWEN_c8a1bbb2-52e9-4960-bb90-6f8e6b6b645a_5000x.png?v=1715254310',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_2__WWEN_ce13ded3-ff46-489d-9ecb-d631ac193b48_5000x.png?v=1715254309',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_3__WWEN_4f55ae58-2376-4d8e-a821-bc71d131924c_5000x.png?v=1715254309',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_5__WWEN_2ed97161-d3d1-402c-975d-9a461af15003_800x.png?v=1715254309',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_8__WWEN_dbf9e72e-5748-4008-9749-ef15080f7e71_5000x.png?v=1715254309',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Space_Gray_PDP_Image_Position_9__WWEN_2dd45673-71f3-4e43-af59-4194710415d1_5000x.png?v=1715254309',
]

const STARLIGHT_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Starlight_PDP_Image_Position_1b__WWEN_66005bea-a6d4-41a6-991b-75c9d419e422_800x.png?v=1715255214',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Starlight_PDP_Image_Position_2__WWEN_043a3c05-ae2e-41e4-b656-466cca66440d_5000x.png?v=1715255214',
]

function galleryFor(colour) {
  if (colour === 'Space grey') return SPACE_GREY_IMAGES
  if (colour === 'Starlight') return STARLIGHT_IMAGES
  return null
}

async function main() {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, specs')
    .eq('category_main', 'iPad')
    .eq('category_sub', 'Ipad air m2')
    .in('specs->>colour', ['Space grey', 'Starlight'])
    .order('sku', { ascending: true })

  if (error) {
    console.error('Failed to fetch rows:', error.message)
    process.exit(1)
  }

  console.log(`Found ${rows.length} M2 Space Grey/Starlight rows to update.\n`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const progress = `[${i + 1}/${rows.length}]`
    const colour = row.specs?.colour
    const gallery = galleryFor(colour)

    const { error: updateError } = await supabase
      .from('core_products')
      .update({ image_urls: gallery })
      .eq('id', row.id)

    if (updateError) {
      failed++
      console.log(`${progress} SKU ${row.sku} (${colour}) ✗ ${updateError.message}`)
    } else {
      updated++
      console.log(`${progress} SKU ${row.sku} (${colour}) ✓ [${gallery.length} images]`)
    }
  }

  console.log('\n── Summary ──────────────────────────')
  console.log(`Updated: ${updated}`)
  console.log(`Failed:  ${failed}`)
}

main()
