import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

// Visually content-verified generic (colour-agnostic) assets, downloaded and inspected
// before merging — position numbers under one colour's folder are not reliable indicators
// of exclusivity to that colour (established from the iPad Air dedupe fix).

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

// Verified: colour lineup (all 4 colours shown together) + two device-free feature
// graphics (macOS apps grid, Apple Intelligence mail mockup). Positions 8/9/10 from the
// Silver folder were checked too but show actual device photography (Citrus lifestyle
// shot, Silver-lid WITB) — excluded, not safe to reuse across colours.
const NEO_GENERIC = [
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_3__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_6__en-WW_600x.jpg?v=1772717687',
  'https://core.co.za/cdn/shop/files/MacBook_13-in_A18_Pro_Silver_PDP_Image_Position_7__en-WW_600x.jpg?v=1772717687',
]
const NEO_TARGET_SKUS = ['MHFD4ZE/A', 'MHFE4ZE/A', 'MHFF4ZE/A', 'MHFG4ZE/A', 'MHFH4ZE/A', 'MHFJ4ZE/A']

// Verified: "Supercharged by M5" chip badge graphic — no device shown, safe for base M5
// Silver rows. (Positions 4/6/7/9B from the Space Black folder were checked too but all
// show actual Space Black device photography — excluded.)
const PRO14_M5_BADGE = 'https://core.co.za/cdn/shop/files/MacBook_Pro_14-in_M5_Space_Black_PDP_Image_Position_3__WWEN_800x.jpg?v=1760682083'
const PRO14_BASE_M5_SILVER_SKUS = ['MDE54ZE/A', 'MDE64ZE/A', 'MJ3E4ZE/A']

async function mergeInto(table, skus, urlsToAdd) {
  for (const sku of skus) {
    const { data: row, error } = await supabase.from(table).select('id, image_urls').eq('sku', sku).single()
    if (error) {
      console.log(`${sku} ✗ fetch failed: ${error.message}`)
      continue
    }
    const existing = row.image_urls || []
    const seen = new Set(existing)
    const merged = [...existing]
    for (const url of Array.isArray(urlsToAdd) ? urlsToAdd : [urlsToAdd]) {
      if (!seen.has(url)) {
        merged.push(url)
        seen.add(url)
      }
    }
    if (merged.length === existing.length) {
      console.log(`${sku} — already up to date (${existing.length} images)`)
      continue
    }
    const { error: updateError } = await supabase.from(table).update({ image_urls: merged }).eq('id', row.id)
    console.log(`${sku} ${updateError ? '✗ ' + updateError.message : `✓ ${existing.length} → ${merged.length} images`}`)
  }
}

async function main() {
  console.log('\n-- MacBook Neo: adding verified generic images --')
  await mergeInto('core_products', NEO_TARGET_SKUS, NEO_GENERIC)

  console.log('\n-- MacBook Pro 14" base M5 Silver: adding chip badge --')
  await mergeInto('core_products', PRO14_BASE_M5_SILVER_SKUS, PRO14_M5_BADGE)
}

main()
