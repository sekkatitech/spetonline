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

// Full Space Black gallery, matching the structure of the existing Silver 9-image set
// (positions 1,2,3A,4,5A,6,7,8A,9). Replaces the old 2-image (positions 1,2) set —
// position 1 is identical, position 2 is the same shot at higher resolution.
const SPACE_BLACK_16_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_3A__en-WW_5000x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_4__en-WW_5000x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_5A__en-WW_5000x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_6__en-WW_5000x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_7__en-WW_800x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_8A__en-WW_800x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_9__en-WW_800x.jpg?v=1772713426',
]

const SKUS = ['MGEA4ZE/A', 'MGEC4ZE/A', 'MGED4ZE/A', 'MGEE4ZE/A']

async function main() {
  for (const sku of SKUS) {
    const { data: row, error } = await supabase.from('core_products').select('id, image_urls').eq('sku', sku).single()
    if (error) {
      console.log(`${sku} ✗ fetch failed: ${error.message}`)
      continue
    }
    const { error: updateError } = await supabase
      .from('core_products')
      .update({ image_urls: SPACE_BLACK_16_IMAGES })
      .eq('id', row.id)
    console.log(`${sku} ${updateError ? '✗ ' + updateError.message : `✓ ${row.image_urls.length} → ${SPACE_BLACK_16_IMAGES.length} images`}`)
  }
}

main()
