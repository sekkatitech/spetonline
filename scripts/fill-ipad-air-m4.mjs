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

// SKUs already populated previously — never touch these
const SKIP_SKUS = new Set(['MH314QA/A', 'MH334QA/A', 'MH9D4QA/A'])

const SHORT_DESCRIPTION = 'iPad Air. Take your office anywhere.'

const FULL_DESCRIPTION = [
  "iPad Air. Built for Apple Intelligence. M4 powers incredible performance and multitasking is a breeze with flexible windowing in iPadOS. iPad Air features a stunning Liquid Retina display, an advanced front camera for professional quality video calls, blazing-fast Wi-Fi 7 and 5G capability to stay connected on the go, and compatibility with essential apps like Microsoft 365 Copilot, Shopify, Procreate, Zoho Solo and Intuit Quickbooks. And paired with Apple Pencil Pro and Magic Keyboard, you can get work done while you're on the move.",
  "iPad Air with the Apple M4 chip comes in two portable sizes and packs incredible performance, blazing-fast connectivity and advanced cameras into a beautiful design. It features Apple Intelligence, along with a stunning Liquid Retina display, Wi-Fi 7, and the security of Touch ID.",
  "iPad Air delivers an unmatched mix of performance, portability and versatility for any business. With advanced capabilities and built-in features for privacy and security, iPad Air fits seamlessly into demanding workflows across all types of industries.",
  "Run multiple apps at once and get more done with the game-changing capabilities and intuitive design of iPadOS. The flexible windowing system makes multitasking a breeze, letting you control, organise and manage your workflows with ease.",
  "Wi-Fi 7 with Apple N1 enables fast wireless connections for transfers of photos, documents and large video files. And superfast 5G with Apple C1X gives you the flexibility to stay connected in more places — whether you're out in the field or working remotely.",
  "Apple Pencil Pro and Apple Pencil (USB-C) enable intuitive and precise control for drawing, note-taking and creativity. Magic Keyboard provides an amazing typing experience, a large glass trackpad and durable protection. Customise your experience even further with a wide array of compatible cases, docking stations and wireless accessories designed to fit your business needs.",
  "M4 chip delivers advanced graphics and incredible performance for smooth multitasking and complex AI tasks. And with all-day battery life, you can keep working and playing wherever you go. Choose up to 1TB of storage for apps, music, movies and more.",
  "iPad Air features a 12MP Center Stage front camera that's perfect for video calls that include presentations and a 12MP Wide back camera for document scanning and capturing photos and 4K videos.",
  "Touch ID lets you use your fingerprint to unlock your iPad Air, sign in to apps and make payments securely with Apple Pay.",
  "Apple Intelligence is the personal intelligence system that helps you create, communicate and get things done effortlessly with groundbreaking privacy protections at every step.",
  "The gorgeous Liquid Retina display features advanced technologies like P3 wide colour, True Tone, and ultra-low reflectivity, which make everything look stunning.",
].join('\n\n')

const SPACE_GREY_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_13-in_M4_Wifi_Space_Gray_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772628719',
  'https://core.co.za/cdn/shop/files/iPad_Air_13-in_M4_Wifi_Space_Gray_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772628719',
  'https://core.co.za/cdn/shop/files/iPad_Air_13-in_M4_Wifi_Space_Gray_PDP_Image_Position_10__en-WW_5000x.jpg?v=1772628719',
]

const STARLIGHT_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Starlight_PDP_Image_Position_3__en-WW_5000x.jpg?v=1772627760',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Starlight_PDP_Image_Position_4__en-WW_5000x.jpg?v=1772627760',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Starlight_PDP_Image_Position_5__en-WW_5000x.jpg?v=1772627760',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Starlight_PDP_Image_Position_6__en-WW_5000x.jpg?v=1772627760',
  'https://core.co.za/cdn/shop/files/iPad_Air_11-in_M4_Wifi_Starlight_PDP_Image_Position_7__en-WW_5000x.jpg?v=1772627760',
]

function galleryFor(colour) {
  if (colour === 'Space grey') return SPACE_GREY_IMAGES
  if (colour === 'Starlight') return STARLIGHT_IMAGES
  return null
}

async function main() {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, name, specs')
    .eq('category_main', 'iPad')
    .eq('category_sub', 'Ipad air m4')
    .order('sku', { ascending: true })

  if (error) {
    console.error('Failed to fetch rows:', error.message)
    process.exit(1)
  }

  const targets = rows.filter(r => !SKIP_SKUS.has(r.sku))
  console.log(`Found ${rows.length} 'Ipad air m4' rows, ${rows.length - targets.length} already done (skipped), ${targets.length} to update.\n`)

  let updated = 0
  let failed = 0
  let noGallery = 0

  for (let i = 0; i < targets.length; i++) {
    const row = targets[i]
    const progress = `[${i + 1}/${targets.length}]`
    const gallery = galleryFor(row.specs?.colour)

    const payload = {
      short_description: SHORT_DESCRIPTION,
      full_description: FULL_DESCRIPTION,
    }
    if (gallery) payload.image_urls = gallery
    else noGallery++

    const { error: updateError } = await supabase
      .from('core_products')
      .update(payload)
      .eq('id', row.id)

    if (updateError) {
      failed++
      console.log(`${progress} SKU ${row.sku} (${row.specs?.colour}) ✗ ${updateError.message}`)
    } else {
      updated++
      console.log(`${progress} SKU ${row.sku} (${row.specs?.colour}) ✓${gallery ? ' [+gallery]' : ' [text only]'}`)
    }
  }

  console.log('\n── Summary ──────────────────────────')
  console.log(`Updated: ${updated} (${noGallery} of those got text only, no colour-matched gallery)`)
  console.log(`Skipped (already done): ${rows.length - targets.length}`)
  console.log(`Failed:  ${failed}`)
}

main()
