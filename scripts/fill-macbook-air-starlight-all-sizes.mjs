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

// All 9 URLs verified live under the "13-in" filename (the "15-in" variants the user
// pasted 404 — Core's CDN only hosts these under one filename, reused for both sizes,
// confirmed by the identical asset hash on position 1). Per user instruction, apply this
// single complete gallery to both 13" and 15" Starlight rows.
const STARLIGHT_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_1__en-WW_fd04ddc4-2fbb-4491-9a79-edef61f01245_5000x.jpg?v=1772715508',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_2__en-WW_6c6d7f67-c2bf-4441-b57e-d2f314453f82_5000x.jpg?v=1772715507',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_3__en-WW_641826a8-964b-4e5e-8712-50da0cee3b28_5000x.jpg?v=1772715508',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_4__en-WW_3dbdd197-5f07-4116-b61d-85846b9d0a80_5000x.jpg?v=1772715508',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_5__en-WW_c49eadf5-179f-43f0-80d3-841d112c2df3_5000x.jpg?v=1772715508',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_6__en-WW_65f0a83f-b8fd-4a8c-b051-f8cd4e4355ab_5000x.jpg?v=1772715508',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_7__en-WW_66b7fd1c-e563-464d-879f-de993191960c_5000x.jpg?v=1772715508',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_8__en-WW_291320ae-eaf4-4916-8242-ac6ad8410bf6_5000x.jpg?v=1772715508',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Starlight_PDP_Image_Position_9__en-WW_cae43fb5-2e2a-4a32-a2a7-ca7c2c32d1e7_800x.jpg?v=1772715508',
]

const SKUS = ['MDHA4ZE/A', 'MDHC4ZE/A', 'MDHD4ZE/A', 'MDVD4ZE/A', 'MDVE4ZE/A', 'MDVF4ZE/A']

async function main() {
  for (const sku of SKUS) {
    const { data: row, error } = await supabase.from('core_products').select('id, image_urls').eq('sku', sku).single()
    if (error) {
      console.log(`${sku} ✗ fetch failed: ${error.message}`)
      continue
    }
    const { error: updateError } = await supabase
      .from('core_products')
      .update({ image_urls: STARLIGHT_IMAGES })
      .eq('id', row.id)
    console.log(`${sku} ${updateError ? '✗ ' + updateError.message : `✓ ${row.image_urls.length} → ${STARLIGHT_IMAGES.length} images`}`)
  }
}

main()
