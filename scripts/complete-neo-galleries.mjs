import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

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

function fullGallery(colourSlug, version) {
  return Array.from({ length: 10 }, (_, i) => i + 1).map(
    p => `https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_${colourSlug}_PDP_Image_Position_${p}__en-WW_5000x.jpg?v=${version}`
  )
}

const CITRUS_FULL = fullGallery('Citrus', '1772717654')
const INDIGO_FULL = fullGallery('Indigo', '1772717669')
const BLUSH_FULL = fullGallery('Blush', '1772717608')

const COLOUR_SETS = {
  Citrus: CITRUS_FULL,
  Indigo: INDIGO_FULL,
  Blush: BLUSH_FULL,
}

const hashCache = new Map()
async function hashUrl(url) {
  if (hashCache.has(url)) return hashCache.get(url)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed (${res.status}) for ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const hash = createHash('md5').update(buf).digest('hex')
  hashCache.set(url, hash)
  return hash
}

async function mergeDedupe(existingUrls, newUrls) {
  const existingHashes = new Set()
  for (const url of existingUrls) {
    existingHashes.add(await hashUrl(url))
  }
  const merged = [...existingUrls]
  for (const url of newUrls) {
    const hash = await hashUrl(url)
    if (!existingHashes.has(hash)) {
      existingHashes.add(hash)
      merged.push(url)
    }
  }
  return merged
}

const SKUS_BY_COLOUR = {
  Citrus: ['MHFD4ZE/A', 'MHFE4ZE/A'],
  Indigo: ['MHFF4ZE/A', 'MHFG4ZE/A'],
  Blush: ['MHFH4ZE/A', 'MHFJ4ZE/A'],
}

async function main() {
  for (const [colour, skus] of Object.entries(SKUS_BY_COLOUR)) {
    const fullSet = COLOUR_SETS[colour]
    for (const sku of skus) {
      const { data: row, error } = await supabase.from('core_products').select('id, image_urls').eq('sku', sku).single()
      if (error) {
        console.log(`${sku} ✗ fetch failed: ${error.message}`)
        continue
      }
      const merged = await mergeDedupe(row.image_urls || [], fullSet)
      const { error: updateError } = await supabase.from('core_products').update({ image_urls: merged }).eq('id', row.id)
      console.log(`${sku} (${colour}) ${updateError ? '✗ ' + updateError.message : `✓ ${row.image_urls.length} → ${merged.length} images`}`)
    }
  }
}

main()
