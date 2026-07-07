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

const STUDIO_DISPLAY_IMAGES = [
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772782964',
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_2__en-WW_800x.jpg?v=1772782964',
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_3__en-WW_800x.jpg?v=1772782964',
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_4__en-WW_800x.jpg?v=1772782964',
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_5__en-WW_5000x.jpg?v=1772782964',
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_6__en-WW_800x.jpg?v=1772782963',
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_7__en-WW_800x.jpg?v=1772782964',
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_8__en-WW_800x.jpg?v=1772782964',
  'https://core.co.za/cdn/shop/files/Studio_Display_PDP_Image_Position_9__en-WW_800x.jpg?v=1772782964',
]

const STUDIO_DISPLAY_XDR_IMAGES = [
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_1__en-WW_5000x.jpg?v=1772783093',
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_2__en-WW_5000x.jpg?v=1772783092',
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_3__en-WW_5000x.jpg?v=1772783093',
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_4__en-WW_5000x.jpg?v=1772783092',
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_5__en-WW_5000x.jpg?v=1772783092',
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_6__en-WW_5000x.jpg?v=1772783093',
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_7__en-WW_5000x.jpg?v=1772783092',
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_8__en-WW_5000x.jpg?v=1772783093',
  'https://core.co.za/cdn/shop/files/Studio_Display_XDR_PDP_Image_Position_9__en-WW_5000x.jpg?v=1772783092',
]

const STUDIO_DISPLAY_SHORT = `Studio Display. Superpower your studio.

An immersive 27-inch 5K Retina display, 12MP Center Stage camera with Desk View, advanced mics and speakers, and Thunderbolt 5 ports. Studio Display is the perfect partner for Mac.`

const STUDIO_DISPLAY_FULL = `Features:

WITH FLYING COLOURS — 14.7 million pixels, 600 nits of brightness, support for 1 billion colours and P3 wide colour make everything spring to life with spectacular detail.
ADVANCED CAMERA AND AUDIO — The 12MP Center Stage camera helps you look sharp in any light and keeps you in frame during video calls. Desk View lets you share your workspace. And a studio-quality three-mic array ensures you come through clearly.
SIX-SPEAKER SOUND WITH SPATIAL AUDIO — Four force-cancelling woofers produce bold bass, and two high-performance tweeters deliver accurate mids and crisp highs. And Spatial Audio creates a sophisticated, cinematic soundstage in supported music, video and games.
SUPERPOWER YOUR STUDIO — Two Thunderbolt 5 ports let you connect high-speed accessories, daisy-chain up to four displays and even fast-charge Mac laptops. And two USB-C ports are perfect for USB peripherals or charging your iPhone.
EVEN LESS GLARE, ANYWHERE — An anti-reflective coating comes standard to reduce glare. For challenging lighting conditions, a nano-texture glass option scatters light to further minimise reflectivity.
STANDS AND DELIVERS — Studio Display includes a tilt-adjustable stand. A tilt- and height-adjustable stand or a VESA mount adapter is also available, so you can find the perfect way to view your work.
Legal

Screen size is measured diagonally.
Tilt- and height-adjustable stand and VESA mount adapter sold separately.
Technical specifications: go to apple.com/za/studio-display/specs for a complete set.`

const STUDIO_DISPLAY_XDR_SHORT = `Studio Display XDR. Precision for your vision.

A 27-inch 5K Retina XDR display takes brightness, colour and responsiveness to the next level. Combined with an advanced camera, three-mic array, six-speaker sound and powerful Thunderbolt 5 capabilities, it's the ultimate display for pros.`

const STUDIO_DISPLAY_XDR_FULL = `Features:

NOTHING SHORT OF BRILLIANT — Mini-LED backlighting with 2,304 dimming zones reduces halo and blooming. Up to 1,000 nits SDR brightness means you can work more easily in bright light. And 2,000 nits peak HDR brightness brings greater contrast to highlights and shadows.
EVEN WIDER COLOUR GAMUT — With access to both P3 and Adobe RGB colour spaces, Studio Display XDR delivers precision from screen to print. And there are a wide range of reference modes for filmmakers, photographers and graphic designers.
ULTRA-SMOOTH MOTION — 120Hz refresh rate makes motion smoother. Adaptive Sync allows for varying frame rates with precision control, ensuring motion remains as responsive as possible.
PACKED WITH POWER AND PORTS — Two Thunderbolt 5 ports for high-speed accessories, fast-charging Mac laptops, or daisy-chaining a second Studio Display XDR for 29 million pixels of total screen space. And two USB-C ports are perfect for USB peripherals or charging your iPhone.
PUT YOUR BEST FRAME FORWARD — The 12MP Center Stage camera helps you look sharp in any light during video calls. Desk View lets you share a top-down view of your workspace. And a studio-quality three-mic array ensures you come through clearly.
SIX SPEAKERS, SOUNDSATIONAL — Four force-cancelling woofers produce bold bass, and two high-performance tweeters deliver accurate mids and crisp highs. And Spatial Audio creates a sophisticated, cinematic soundstage in supported music, video and games.
TWO WAYS TO MAKE GLARE GONE — An anti-reflective coating comes standard to reduce glare. For challenging lighting conditions, a nano-texture glass option scatters light to further minimise reflectivity.
INCLUDED STAND — Studio Display XDR includes a tilt- and height-adjustable stand with 30 degrees of tilt and 105mm of height adjustability. An optional VESA mount adapter is also available.
Legal

Screen size is measured diagonally.
In temperatures less than 25° C.
VESA mount adapter sold separately.`

async function main() {
  const { data: rows, error } = await supabase
    .from('core_products')
    .select('id, sku, name, image_urls, short_description, full_description')
    .eq('category_main', 'Mac')
    .eq('category_sub', 'Displays')
    .order('sku', { ascending: true })

  if (error) {
    console.error('Failed to fetch rows:', error.message)
    process.exit(1)
  }

  for (const row of rows) {
    const isXDR = /STUDIO DISPLAY XDR/i.test(row.name)
    const update = {}

    if (!row.short_description) {
      update.short_description = isXDR ? STUDIO_DISPLAY_XDR_SHORT : STUDIO_DISPLAY_SHORT
      update.full_description = isXDR ? STUDIO_DISPLAY_XDR_FULL : STUDIO_DISPLAY_FULL
    }
    if (!row.image_urls || row.image_urls.length === 0) {
      update.image_urls = isXDR ? STUDIO_DISPLAY_XDR_IMAGES : STUDIO_DISPLAY_IMAGES
    }

    if (Object.keys(update).length === 0) {
      console.log(`SKU ${row.sku} — nothing to do`)
      continue
    }

    const { error: updateError } = await supabase
      .from('core_products')
      .update(update)
      .eq('id', row.id)

    console.log(`SKU ${row.sku} (${isXDR ? 'XDR' : 'Standard'}) ${updateError ? '✗ ' + updateError.message : '✓ ' + Object.keys(update).join('+')}`)
  }
}

main()
