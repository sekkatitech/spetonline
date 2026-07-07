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

// ── Galleries (content-verified, colour-only granularity — no chip-tier-specific photos supplied) ──
const SPACE_BLACK_14_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_1__WWEN_5000x.jpg?v=1760682083',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_2__WWEN_5000x.jpg?v=1760682083',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_3__WWEN_800x.jpg?v=1760682083',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_4__WWEN_800x.jpg?v=1760682083',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_5__WWEN_800x.jpg?v=1760682083',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_6__WWEN_800x.jpg?v=1760682083',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_7__WWEN_800x.jpg?v=1760682083',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_8__WWEN_800x.jpg?v=1760682083',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_9B__WWEN_800x.jpg?v=1760682083',
]

const SILVER_14_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Silver_PDP_Image_Position_1__WWEN_5000x.jpg?v=1760682042',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Silver_PDP_Image_Position_2__WWEN_5000x.jpg?v=1760682042',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Silver_PDP_Image_Position_8__WWEN_5000x.jpg?v=1760682042',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Silver_PDP_Image_Position_5__WWEN_5000x.jpg?v=1760682042',
]

const SILVER_16_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772713376',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_2__en-WW_800x.jpg?v=1772713376',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_3A__en-WW_800x.jpg?v=1772713376',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_4__en-WW_800x.jpg?v=1772713376',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_5A__en-WW_800x.jpg?v=1772713376',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_6__en-WW_800x.jpg?v=1772713377',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_7__en-WW_800x.jpg?v=1772713376',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_8A__en-WW_800x.jpg?v=1772713376',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Silver_PDP_Image_Position_9__en-WW_800x.jpg?v=1772713376',
]

const SPACE_BLACK_16_IMAGES = [
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772713426',
  'https://core.co.za/cdn/shop/files/MacBook_Pro_16-in_M5_Pro_Space_Black_PDP_Image_Position_2__en-WW_800x.jpg?v=1772713426',
]

// ── Descriptions ──
// Base M5 14-inch text already exists in DB (MDE14ZE/A) in cleaned form — leave as-is, only add images.

const PRO_MAX_14_SHORT = `MacBook Pro 14″. Fast runs in the family.

The 14-inch MacBook Pro with the M5 Pro or M5 Max chip brings next-generation speed and powerful on-device AI to personal, professional and creative tasks. With all-day battery life and a breathtaking Liquid Retina XDR display, it's pro in every way.`

const PRO_MAX_14_FULL = `Features:

BUCKLE UP — Along with a next-generation CPU, faster unified memory and up to 2x faster SSD storage, M5 Pro and M5 Max feature a more powerful GPU with a Neural Accelerator built into each core, delivering faster AI performance and on-device training capabilities. So you can blaze through demanding workloads at mind-bending speeds.
BUILT FOR AI — Apple silicon, and every major component that powers it, is designed to run demanding on-device AI workloads like LLM inference and training. And Apple Intelligence helps you write, express yourself and get things done effortlessly with groundbreaking privacy protections at every step.
ALL-DAY BATTERY LIFE — MacBook Pro delivers the same exceptional performance whether it's running on battery or plugged in.
MACOS RUNS APPS FAST — All your go-to apps run lightning fast in macOS, including built-in apps like FaceTime and Messages. Plus, built-in virus protection and free software updates help keep your Mac running smoothly and securely.
IF YOU LOVE IPHONE, YOU'LL LOVE MAC — Mac works like magic with your other Apple devices. View and control what's on your iPhone from your Mac with iPhone Mirroring. Copy something on iPhone and paste it on Mac. Send texts with Messages or use your Mac to answer FaceTime calls.
BRILLIANT PRO DISPLAY — The 14.2-inch Liquid Retina XDR display features 1,600 nits peak brightness, up to 1,000 nits sustained brightness and 1,000,000:1 contrast.
ADVANCED CAMERA AND AUDIO — Stay perfectly framed and sound great with a 12MP Center Stage camera, three studio-quality mics, and six speakers with Spatial Audio and support for Dolby Atmos.
CONNECT IT ALL — Features three Thunderbolt 5 ports, a MagSafe 3 charging port, SDXC card slot, HDMI port, headphone jack and the Apple-designed N1 wireless chip for Wi-Fi 7 and Bluetooth 6. And supports up to three external displays with M5 Pro, or up to four with M5 Max.
POWER ADAPTERS — Please be aware: MacBook Pro (14-inch) with M5 Pro and M5 Max comes with a USB-C to MagSafe 3 charging cable, but does not include a power adapter. A USB-C power adapter or other USB PD power source that can provide 70W or higher is required to charge this device. For optimal charging, Apple recommends pairing this Mac with the Apple 70W USB-C Power Adapter, or the 96W USB-C Power Adapter to take advantage of fast charge (charging up to 50% in just 30 minutes).
Legal

Configurable options are available.

Apple Intelligence is available in beta. Some features may not be available in all regions or languages. For feature and language availability and system requirements, see support.apple.com/en-za/121115.
FaceTime calling requires a FaceTime-enabled device for the caller and recipient and a Wi-Fi connection.
Available on Mac computers with Apple silicon and Intel-based Mac computers with a T2 Security Chip. Requires that your iPhone and Mac are signed in with the same Apple Account using two-factor authentication, your iPhone and Mac are near each other and have Bluetooth and Wi-Fi turned on, and your Mac is not using AirPlay or Sidecar. Some iPhone features (e.g. camera and microphone) are not compatible with iPhone Mirroring.
Screen size is measured diagonally. The display on the 14-inch MacBook Pro has rounded corners at the top. When measured as a standard rectangular shape, the screen is 14.2 inches diagonally (actual viewable area is less).
In temperatures less than 25° C.
Wi-Fi 7 available in countries and regions where supported.
FAST CHARGE: Fast-charge testing conducted with drained MacBook Pro units. Times measured from the beginning of wake from hibernate, or from the appearance of the Apple logo as the unit started up. Charge time varies with settings and environmental factors; actual results will vary.`

const PRO_MAX_16_SHORT = `MacBook Pro 16″. Fast runs in the family.

The 16-inch MacBook Pro with the M5 Pro or M5 Max chip brings next-generation speed and powerful on-device AI to personal, professional and creative tasks. With all-day battery life and a breathtaking Liquid Retina XDR display, it's pro in every way.`

const PRO_MAX_16_FULL = `Features:

BUCKLE UP — Along with a next-generation CPU, faster unified memory and up to 2x faster SSD storage, M5 Pro and M5 Max feature a more powerful GPU with a Neural Accelerator built into each core, delivering faster AI performance and on-device training capabilities. So you can blaze through demanding workloads at mind-bending speeds.
BUILT FOR AI — Apple silicon, and every major component that powers it, is designed to run demanding on-device AI workloads like LLM inference and training. And Apple Intelligence helps you write, express yourself and get things done effortlessly with groundbreaking privacy protections at every step.
ALL-DAY BATTERY LIFE — MacBook Pro delivers the same exceptional performance whether it's running on battery or plugged in.
MACOS RUNS APPS FAST — All your go-to apps run lightning fast in macOS, including built-in apps like FaceTime and Messages. Plus, built-in virus protection and free software updates help keep your Mac running smoothly and securely.
IF YOU LOVE IPHONE, YOU'LL LOVE MAC — Mac works like magic with your other Apple devices. View and control what's on your iPhone from your Mac with iPhone Mirroring. Copy something on iPhone and paste it on Mac. Send texts with Messages or use your Mac to answer FaceTime calls.
BRILLIANT PRO DISPLAY — The 16.2-inch Liquid Retina XDR display features 1,600 nits peak brightness, up to 1,000 nits sustained brightness and 1,000,000:1 contrast.
ADVANCED CAMERA AND AUDIO — Stay perfectly framed and sound great with a 12MP Center Stage camera, three studio-quality mics, and six speakers with Spatial Audio and support for Dolby Atmos.
CONNECT IT ALL — Features three Thunderbolt 5 ports, a MagSafe 3 charging port, SDXC card slot, HDMI port, headphone jack and the Apple-designed N1 wireless chip for Wi-Fi 7 and Bluetooth 6. And supports up to three external displays with M5 Pro, or up to four with M5 Max.
POWER ADAPTERS — Please be aware: MacBook Pro (16-inch) with M5 Pro and M5 Max comes with a USB-C to MagSafe 3 charging cable, but does not include a power adapter. A USB-C power adapter or other USB PD power source that can provide 94W or higher is required to charge this device. For optimal charging, Apple recommends pairing this Mac with the Apple 96W USB-C Power Adapter, or the 140W USB-C Power Adapter if running demanding workflows and to take advantage of fast charge (charging up to 50% in just 30 minutes).
Legal

Configurable options are available.

Apple Intelligence is available in beta. Some features may not be available in all regions or languages. For feature and language availability and system requirements, see support.apple.com/en-za/121115.
FaceTime calling requires a FaceTime-enabled device for the caller and recipient and a Wi-Fi connection.
Available on Mac computers with Apple silicon and Intel-based Mac computers with a T2 Security Chip. Requires that your iPhone and Mac are signed in with the same Apple Account using two-factor authentication, your iPhone and Mac are near each other and have Bluetooth and Wi-Fi turned on, and your Mac is not using AirPlay or Sidecar. Some iPhone features (e.g. camera and microphone) are not compatible with iPhone Mirroring.
Screen size is measured diagonally. The display on the 16-inch MacBook Pro has rounded corners at the top. When measured as a standard rectangular shape, the screen is 16.2 inches diagonally (actual viewable area is less).
In temperatures less than 25° C.
Wi-Fi 7 available in countries and regions where supported.
FAST CHARGE: Fast-charge testing conducted with drained MacBook Pro units. Times measured from the beginning of wake from hibernate, or from the appearance of the Apple logo as the unit started up. Charge time varies with settings and environmental factors; actual results will vary.`

function galleryFor14(colour) {
  if (colour === 'Space black') return SPACE_BLACK_14_IMAGES
  if (colour === 'Silver') return SILVER_14_IMAGES
  return null
}

function galleryFor16(colour) {
  if (colour === 'Space black') return SPACE_BLACK_16_IMAGES
  if (colour === 'Silver') return SILVER_16_IMAGES
  return null
}

async function processFamily(categorySub, galleryFn, proMaxShort, proMaxFull) {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, specs, image_urls, short_description, full_description')
    .eq('category_main', 'Mac')
    .eq('category_sub', categorySub)
    .order('sku', { ascending: true })

  if (error) {
    console.error(`Failed to fetch ${categorySub}:`, error.message)
    return
  }

  console.log(`\n${categorySub}: ${rows.length} rows.`)

  for (const row of rows) {
    const colour = row.specs?.colour
    const chip = row.specs?.chip || ''
    const isProMax = /pro|max/i.test(chip) && chip.toLowerCase() !== 'apple m5'
    const gallery = galleryFn(colour)

    const update = {}
    if (gallery && (!row.image_urls || row.image_urls.length === 0)) {
      update.image_urls = gallery
    }
    if (isProMax && !row.short_description) {
      update.short_description = proMaxShort
      update.full_description = proMaxFull
    }

    if (Object.keys(update).length === 0) {
      console.log(`  SKU ${row.sku} — nothing to do (already populated or no matching data)`)
      continue
    }

    const { error: updateError } = await supabase
      .from('core_products')
      .update(update)
      .eq('id', row.id)

    if (updateError) {
      console.log(`  SKU ${row.sku} ✗ ${updateError.message}`)
    } else {
      console.log(`  SKU ${row.sku} (${colour}, ${chip}) ✓ ${Object.keys(update).join('+')}`)
    }
  }
}

async function main() {
  await processFamily('Macbook pro 14"', galleryFor14, PRO_MAX_14_SHORT, PRO_MAX_14_FULL)
  await processFamily('Macbook pro 16"', galleryFor16, PRO_MAX_16_SHORT, PRO_MAX_16_FULL)
}

main()
