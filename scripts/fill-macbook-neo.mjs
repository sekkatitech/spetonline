import { readFileSync, existsSync } from 'node:fs'
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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const SILVER_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_1__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_2__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_3__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_4__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_5__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_6__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_7__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_8__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_9__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_10__en-WW_600x.jpg?v=1772717687',
]

// Position 1 already exists in DB for Blush (MHFH4ZE/A); Position 2 is new.
const BLUSH_POSITION_2 = 'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Blush_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772717609'

async function main() {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, specs, image_urls, short_description, full_description')
    .eq('category_main', 'Mac')
    .eq('category_sub', 'Macbook neo')
    .order('sku', { ascending: true })

  if (error) {
    console.error('Failed to fetch rows:', error.message)
    process.exit(1)
  }

  const refDesc = rows.find(r => r.sku === 'MHFD4ZE/A')
  const NEO_SHORT = refDesc.short_description
  const NEO_FULL = refDesc.full_description

  const citrusGallery = rows.find(r => r.sku === 'MHFD4ZE/A').image_urls
  const indigoGallery = rows.find(r => r.sku === 'MHFF4ZE/A').image_urls
  const blush256 = rows.find(r => r.sku === 'MHFH4ZE/A')

  for (const row of rows) {
    const colour = row.specs?.colour
    const update = {}

    if (!row.short_description) {
      update.short_description = NEO_SHORT
      update.full_description = NEO_FULL
    }

    if (row.sku === 'MHFA4ZE/A' || row.sku === 'MHFC4ZE/A') {
      // Silver, 0 images
      update.image_urls = SILVER_IMAGES
    } else if (row.sku === 'MHFH4ZE/A') {
      // Blush 256, enrich with position 2 (position 1 already present)
      if (!row.image_urls.includes(BLUSH_POSITION_2)) {
        update.image_urls = [...row.image_urls, BLUSH_POSITION_2]
      }
    } else if (row.sku === 'MHFE4ZE/A') {
      // Citrus 512 TouchID, empty — replicate Citrus 256 gallery
      update.image_urls = citrusGallery
    } else if (row.sku === 'MHFG4ZE/A') {
      // Indigo 512 TouchID, empty — replicate Indigo 256 gallery
      update.image_urls = indigoGallery
    } else if (row.sku === 'MHFJ4ZE/A') {
      // Blush 512 TouchID, empty — replicate Blush 256's final (enriched) gallery
      update.image_urls = [...blush256.image_urls, BLUSH_POSITION_2]
    }

    if (Object.keys(update).length === 0) {
      console.log(`SKU ${row.sku} (${colour}) — nothing to do`)
      continue
    }

    const { error: updateError } = await supabase
      .from('core_products')
      .update(update)
      .eq('id', row.id)

    console.log(`SKU ${row.sku} (${colour}) ${updateError ? '✗ ' + updateError.message : '✓ ' + Object.keys(update).join('+')}`)
  }
}

main()
