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

const SHORT_DESCRIPTION = 'iPad Air. Take your office anywhere.'

const FULL_DESCRIPTION = [
  "The redesigned iPad Air is supercharged by the incredibly fast Apple M2 chip. It features a stunning Liquid Retina display, a new landscape camera perfect for FaceTime and video calls, superfast Wi-Fi 6E and 5G, and compatibility with essential apps like Microsoft 365 and Google Workspace. And paired with Apple Pencil Pro and Magic Keyboard, you can get your work done from anywhere.",
  "The gorgeous Liquid Retina display features advanced technologies like P3 wide colour, True Tone and ultra-low reflectivity, which make everything look stunning.",
  "The M2 chip lets you multitask smoothly between powerful apps and play graphics-intensive games. And with all-day battery life, you can keep working and playing wherever you go. Choose up to 1TB of storage depending on the room you need for apps, music, movies and more.",
  "iPadOS makes iPad more productive, intuitive and versatile. With iPadOS, run multiple apps at once, use Apple Pencil to write in any text field with Scribble, and edit and share photos. Stage Manager makes multitasking easy with resizable, overlapping apps and external display support. iPad Air comes with essential apps like Safari, Messages and Keynote, with over a million more apps available on the App Store.",
  "Apple Pencil Pro transforms iPad Air into an immersive drawing canvas and the world's best note-taking device. Apple Pencil (USB-C) is also compatible with iPad Air. Magic Keyboard features a great typing experience and a built-in trackpad, while doubling as a protective cover for iPad. Accessories sold separately.",
  "iPad Air features a landscape 12MP Ultra Wide front camera that supports Centre Stage for videoconferencing or epic Portrait mode selfies. The 12MP Wide back camera with True Tone flash is perfect for capturing photos and 4K videos. And get great sound with dual studio-quality mics and landscape stereo speakers.",
  "Wi-Fi 6E gives you fast wireless connections for quick transfers of photos, documents and large video files. And when you're away from Wi-Fi, superfast 5G gives you the flexibility to stay connected in more places. Connect to external displays and more with the USB-C connector.",
  "Touch ID is built into the top button, so you can use your fingerprint to unlock your iPad Air, sign in to apps and make payments securely with Apple Pay.",
].join('\n\n')

const BLUE_IMAGES = [
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Blue_PDP_Image_Position_1b__WWEN_9789bb0b-ecc5-48b6-af41-5eaaae36fa75_5000x.png?v=1715255176',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Blue_PDP_Image_Position_2__WWEN_60850154-aef2-4daf-8d37-775377b5e2f4_5000x.png?v=1715255176',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Blue_PDP_Image_Position_3__WWEN_b0f320c8-023b-4747-adac-3d7f0b54285c_5000x.png?v=1715255177',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Blue_PDP_Image_Position_5__WWEN_b25a95ca-a936-45a3-8615-e3892fc3e1e5_5000x.png?v=1715255177',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Blue_PDP_Image_Position_8__WWEN_e6f8db26-2378-4fef-a889-73264b201427_5000x.png?v=1715255176',
  'https://core.co.za/cdn/shop/files/iPad_Air_11_M2_WiFi_Blue_PDP_Image_Position_9__WWEN_1a8d0c23-8fe4-4315-87ba-bda4e0e8aea0_5000x.png?v=1715255176',
]

// Starlight / Space grey: only a 200px swatch thumbnail was supplied (too low-res
// for a full gallery) — left text-only per instruction, no image_urls entry here.
function galleryFor(colour) {
  if (colour === 'Blue') return BLUE_IMAGES
  return null
}

async function main() {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, name, specs')
    .eq('category_main', 'iPad')
    .eq('category_sub', 'Ipad air m2')
    .order('sku', { ascending: true })

  if (error) {
    console.error('Failed to fetch rows:', error.message)
    process.exit(1)
  }

  console.log(`Found ${rows.length} 'Ipad air m2' rows to update.\n`)

  let updated = 0
  let failed = 0
  let noGallery = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const progress = `[${i + 1}/${rows.length}]`
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
  console.log(`Updated: ${updated} (${noGallery} of those got text only, no gallery)`)
  console.log(`Failed:  ${failed}`)
}

main()
