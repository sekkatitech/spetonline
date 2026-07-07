import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// ── Load .env into process.env (does not override already-set env vars) ────
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

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}
if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in .env')
  process.exit(1)
}

// ── --limit N flag ──────────────────────────────────────────────────────────
const limitArg = process.argv.find(a => a.startsWith('--limit'))
let limit = null
if (limitArg) {
  const eq = limitArg.indexOf('=')
  limit = eq !== -1 ? Number(limitArg.slice(eq + 1)) : Number(process.argv[process.argv.indexOf(limitArg) + 1])
  if (!Number.isFinite(limit) || limit <= 0) {
    console.error('Invalid --limit value')
    process.exit(1)
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function buildPrompt(product) {
  const specsText = product.specs && Object.keys(product.specs).length > 0
    ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\n')
    : '(no specs provided)'

  return `You are writing retail product copy for an Apple reseller's B2B catalog.

Product:
Name: ${product.name}
SKU: ${product.sku}
Category: ${product.category_main}${product.category_sub ? ` / ${product.category_sub}` : ''}
Specs:
${specsText}

Write copy using ONLY the details above plus universally known, factual information about this specific Apple model (e.g. its chip family, general design). Do not invent specs that were not provided. Do not mention price, availability, stock, suppliers, or warranties. Do not copy Apple marketing slogans verbatim.

Return STRICT JSON only, with no markdown formatting and no code fences, in exactly this shape:
{"short_description": "one punchy retail sentence, max ~160 characters", "full_description": "two short paragraphs in professional South African English, separated by a blank line"}`
}

function parseResponse(text) {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/, '').trim()
  }
  const parsed = JSON.parse(cleaned)
  if (typeof parsed.short_description !== 'string' || typeof parsed.full_description !== 'string') {
    throw new Error('missing short_description/full_description in response')
  }
  return parsed
}

async function generateOne(product) {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 700,
    messages: [{ role: 'user', content: buildPrompt(product) }],
  })

  if (message.stop_reason === 'refusal') {
    throw new Error('model refused the request')
  }

  const textBlock = message.content.find(b => b.type === 'text')
  if (!textBlock) throw new Error('no text content in response')

  return parseResponse(textBlock.text)
}

async function main() {
  console.log('Fetching products missing full_description...')
  let query = supabase
    .from('core_products')
    .select('id, name, sku, category_main, category_sub, specs')
    .or('full_description.is.null,full_description.eq.')
    .order('id', { ascending: true })

  if (limit) query = query.limit(limit)

  const { data: products, error } = await query
  if (error) {
    console.error('Failed to fetch products:', error.message)
    process.exit(1)
  }

  const total = products.length
  console.log(`Found ${total} product(s) to process.${limit ? ` (--limit ${limit})` : ''}\n`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < total; i++) {
    const product = products[i]
    const progress = `[${i + 1}/${total}]`

    let result = null
    let lastError = null

    for (let attempt = 0; attempt < 2 && !result; attempt++) {
      try {
        result = await generateOne(product)
      } catch (err) {
        lastError = err
        if (attempt === 0) await sleep(500)
      }
    }

    if (!result) {
      skipped++
      console.log(`${progress} SKU ${product.sku} ✗ ${lastError?.message ?? 'unknown error'} (skipped)`)
      await sleep(500)
      continue
    }

    const { error: updateError } = await supabase
      .from('core_products')
      .update({
        short_description: result.short_description,
        full_description: result.full_description,
      })
      .eq('id', product.id)

    if (updateError) {
      failed++
      console.log(`${progress} SKU ${product.sku} ✗ update failed: ${updateError.message}`)
    } else {
      updated++
      console.log(`${progress} SKU ${product.sku} ✓`)
    }

    await sleep(500)
  }

  console.log('\n── Summary ──────────────────────────')
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Failed:  ${failed}`)
}

main()
