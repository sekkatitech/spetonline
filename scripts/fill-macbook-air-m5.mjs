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

const SILVER_13_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772714843',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772714844',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_3__en-WW_5000x.jpg?v=1772714844',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_4__en-WW_5000x.jpg?v=1772714843',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_5__en-WW_800x.jpg?v=1772714843',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_6__en-WW_800x.jpg?v=1772714843',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_7__en-WW_800x.jpg?v=1772714844',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_8__en-WW_800x.jpg?v=1772714844',
  'https://core.co.za/cdn/shop/files/MacBook_Air_13-in_M5_Silver_PDP_Image_Position_9__en-WW_800x.jpg?v=1772714844',
]

const MIDNIGHT_15_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Air_15-in_M5_Midnight_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772715473',
  'https://core.co.za/cdn/shop/files/MacBook_Air_15-in_M5_Midnight_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772715474',
]

const SKY_BLUE_15_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Air_15-in_M5_Sky_Blue_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772715422',
]

const AIR_15_SHORT = `MacBook Air 15″. Might takes flight.

MacBook Air with the M5 chip brings blazing speed and powerful AI capabilities into an incredibly portable design. With Apple Intelligence, up to 18 hours of battery life and fast SSD storage starting with 512GB, you can work, create and play anywhere life takes you.`

const AIR_15_FULL = `Features:

SUPERCHARGED BY M5 — With its faster CPU and unified memory, M5 delivers even more performance and fluidity across apps, making multitasking and creative workflows smooth and responsive. A powerful Neural Engine and next-generation GPU with Neural Accelerators give you a powerful platform for AI.
APPLE INTELLIGENCE — Apple Intelligence is the personal intelligence system that helps you write, express yourself and get things done effortlessly. With groundbreaking privacy protections, it gives you peace of mind that no one else can access your data — not even Apple.
UP TO 18 HOURS OF BATTERY LIFE — MacBook Air delivers incredible battery life with amazing performance, so you can power through a full day of work or class without worrying about plugging in.
A BRILLIANT 15.3-INCH DISPLAY — The Liquid Retina display supports 1 billion colours. Photos and videos pop with rich contrast and sharp detail, and text appears super crisp.
12MP CENTER STAGE CAMERA — Automatically stay in frame during video calls with Centre Stage, or share a top-down view of your workspace with Desk View. And with a three-mic array and six-speaker sound system with Spatial Audio and Dolby Atmos, everything sounds great.
CONNECT IT ALL — MacBook Air features two Thunderbolt 4 ports, a MagSafe charging port, a headphone jack — as well as the Apple N1 wireless chip for Wi-Fi 7 and Bluetooth 6. And it supports up to two external displays.
MACOS RUNS APPS FAST — All your go-to apps run lightning fast in macOS, including built-in apps like FaceTime and Messages. Plus, built-in virus protection and free software updates help keep your Mac running smoothly and securely.
IF YOU LOVE IPHONE, YOU'LL LOVE MAC — Mac works like magic with your other Apple devices. View and control what's on your iPhone from your Mac with iPhone Mirroring. Copy something on iPhone and paste it on Mac. Send texts with Messages from your Mac, or use your Mac to answer FaceTime calls.
POWER ADAPTERS — Please be aware: MacBook Air (15-inch) comes with a USB-C to MagSafe 3 charging cable, but does not include a power adapter. A USB-C power adapter or other USB PD power source that can provide 35W or higher is required to charge this device. For optimal charging, Apple recommends pairing this Mac with the Apple 35W Dual USB-C Port Power Adapter, or the 70W USB-C Power Adapter to take advantage of fast charge (charging up to 50% in 35 minutes).
Legal

Configurable options are available.

Apple Intelligence is available in beta. Some features may not be available in all regions or languages. For feature and language availability and system requirements, see support.apple.com/en-za/121115.
Screen size is measured diagonally. The display on the 15-inch MacBook Air has rounded corners at the top. When measured as a standard rectangular shape, the screen is 15.3 inches diagonally (actual viewable area is less).
Wi-Fi 7 available in countries and regions where supported.
FaceTime calling requires a FaceTime-enabled device for the caller and recipient and a Wi-Fi connection.
Available on Mac computers with Apple silicon and Intel-based Mac computers with a T2 Security Chip. Requires that your iPhone and Mac are signed in with the same Apple Account using two-factor authentication, your iPhone and Mac are near each other and have Bluetooth and Wi-Fi turned on, and your Mac is not using AirPlay or Sidecar. Some iPhone features (e.g. camera and microphone) are not compatible with iPhone Mirroring.
FAST CHARGE: Fast-charge testing conducted with drained MacBook Air units. Times measured from the beginning of wake from hibernate, or from the appearance of the Apple logo as the unit started up. Charge time varies with settings and environmental factors; actual results will vary.`

async function main() {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, specs, image_urls, short_description, full_description')
    .eq('category_main', 'Mac')
    .eq('category_sub', 'Macbook air m5')
    .order('sku', { ascending: true })

  if (error) {
    console.error('Failed to fetch rows:', error.message)
    process.exit(1)
  }

  // Reference clean 13-inch copy from an already-populated sibling
  const air13Ref = rows.find(r => r.sku === 'MDHC4ZE/A')
  const AIR_13_SHORT = air13Ref.short_description
  const AIR_13_FULL = air13Ref.full_description

  // Reference galleries from already-populated siblings (real earlier-pipeline assets,
  // different CDN version stamps than the newly supplied file — trust the DB's existing
  // richer/authentic set over the new file for these two colours).
  const starlightRef = rows.find(r => r.sku === 'MDHC4ZE/A').image_urls
  const midnightRef = rows.find(r => r.sku === 'MDHF4ZE/A').image_urls

  for (const row of rows) {
    const is15 = row.specs?.screen_size === '15"' || /15-INCH/i.test(row.sku) || row.name?.includes('15-INCH')
    const size = row.specs?.screen_size
    const colour = row.specs?.colour
    const update = {}

    // Description
    if (!row.short_description) {
      if (size === '13"' || (!size && !is15)) {
        update.short_description = AIR_13_SHORT
        update.full_description = AIR_13_FULL
      } else if (size === '15"') {
        update.short_description = AIR_15_SHORT
        update.full_description = AIR_15_FULL
      }
    }

    // Images
    if (!row.image_urls || row.image_urls.length === 0) {
      if (size === '13"') {
        if (colour === 'Silver') update.image_urls = SILVER_13_IMAGES
        else if (colour === 'Starlight') update.image_urls = starlightRef
        else if (colour === 'Midnight') update.image_urls = midnightRef
        // Sky blue 13": no source images available — text only
      } else if (size === '15"') {
        if (colour === 'Midnight') update.image_urls = MIDNIGHT_15_IMAGES
        else if (colour === 'Sky blue') update.image_urls = SKY_BLUE_15_IMAGES
        // Silver / Starlight 15": no source images available — text only
      }
    }

    if (Object.keys(update).length === 0) {
      console.log(`SKU ${row.sku} (${size} ${colour}) — nothing to do`)
      continue
    }

    const { error: updateError } = await supabase
      .from('core_products')
      .update(update)
      .eq('id', row.id)

    console.log(`SKU ${row.sku} (${size} ${colour}) ${updateError ? '✗ ' + updateError.message : '✓ ' + Object.keys(update).join('+')}`)
  }
}

main()
