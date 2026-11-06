#!/usr/bin/env node
/**
 * SPET Enterprise · Mirror supplier product images into our own storage
 * ----------------------------------------------------------------------
 * Every catalogue points at someone else's CDN: Core/Shopify for the Apple range,
 * syntech.co.za, the Axiz blob store and pinnacle.co.za for the departments. Those hosts
 * are slow from some networks, block referrers, and serve 5000px originals into 64px
 * tiles. This script copies images into a public Supabase Storage bucket as WebP and
 * points the catalogue at the copies.
 *
 * How much is copied depends on the range. Apple keeps a pair — 1400px for galleries and
 * 640px for tiles — because the storefront reads it through the function. The supplier
 * ranges hold 19 606 images and roughly 7 GB of originals, so by default only each row's
 * thumbnail is mirrored, as one 960px file that serves both the tile and the detail hero
 * (their thumbnail_url is the hero). --gallery=N adds the first N gallery images per row.
 *
 * Two delivery models, because the storefront reads the two catalogues differently:
 *
 *   apple      core_products is read through netlify/functions/apple-catalogue.js, so the
 *              supplier URLs stay in the database and the function swaps them for cached
 *              ones using netlify/functions/apple-images.json. Deleting that file reverts.
 *
 *   suppliers  syntech_products, axiz_products and pinnacle_products are read straight from
 *              Supabase by the browser, so there is no read-time chokepoint: the row's
 *              thumbnail_url and images are rewritten to the cached URLs. scripts/
 *              supplier-images.json is the record of what each row used to point at, so
 *              --revert restores them.
 *
 * USAGE
 *   npm run images:apple                     preview the Apple range (writes nothing)
 *   npm run images:suppliers                 preview Syntech, Axiz and Pinnacle
 *   npm run images:appl  -- --apply          mirror the Apple range
 *   npm run images:suppliers -- --apply      mirror the three supplier tables
 *   npm run images:all -- --apply            everything
 *
 *   --source=apple|suppliers|syntech|axiz|pinnacle|all   (default: apple)
 *   --apply              download, resize, upload and point the catalogue at the copies
 *   --force              re-encode images that are already cached
 *   --prune              drop manifest entries no longer used by that source
 *   --revert             put the supplier URLs back (suppliers only; Apple reverts by
 *                        deleting netlify/functions/apple-images.json)
 *   --limit=N            small batch, for a first run
 *   --concurrency=N      parallel downloads/uploads (default 8)
 *
 * Re-run the suppliers mirror after each Axiz/Pinnacle sync (they rewrite image columns
 * nightly). Cached files are reused, so that run only rewrites the rows.
 *
 * Env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY); missing values
 * are read from .env. Keep the service key server-side — it bypasses RLS.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const WEBP_QUALITY = 82
const DB_PAGE = 1000
const FETCH_TIMEOUT_MS = 30000

/**
 * Sizes to encode, by what the image is used for:
 *   pair   the Apple range keeps a large gallery file and a small tile file;
 *   single one 960px file for both, because a supplier row's thumbnail_url is also the
 *          hero of its detail page and both places must collapse to one URL.
 * Supplier gallery images beyond the first only appear on detail pages, so they get a
 * pair when --gallery is used.
 */
const SIZES = {
  appleWeb: 1400,
  appleThumb: 640,
  single: 960,
  galleryWeb: 1200,
  galleryThumb: 640,
}

/** Path prefix by source host, so one image always lands on one object. */
const HOST_PREFIXES = [
  [/syntech\.co\.za/i, 'syntech'],
  [/blob\.core\.windows\.net/i, 'axiz'],
  [/pinnacle\.co\.za/i, 'pinnacle'],
]

const SOURCES = {
  apple: {
    label: 'Apple',
    table: 'core_products',
    filter: { is_enterprise_only: true, is_active: true },
    columns: ['thumbnail_url', 'image_urls'],
    bucket: 'apple-images',
    strategy: 'manifest',
    manifestPath: join(ROOT, 'netlify', 'functions', 'apple-images.json'),
    pathPrefix: () => 'apple',
  },
  syntech: {
    label: 'Syntech',
    table: 'syntech_products',
    filter: { is_active: true },
    columns: ['thumbnail_url', 'images'],
    bucket: 'supplier-images',
    strategy: 'rows',
    manifestPath: join(ROOT, 'scripts', 'supplier-images.json'),
    pathPrefix: sourcePrefix,
  },
  axiz: {
    label: 'Axiz',
    table: 'axiz_products',
    filter: { is_active: true },
    columns: ['thumbnail_url', 'images'],
    bucket: 'supplier-images',
    strategy: 'rows',
    manifestPath: join(ROOT, 'scripts', 'supplier-images.json'),
    pathPrefix: sourcePrefix,
  },
  pinnacle: {
    label: 'Pinnacle',
    table: 'pinnacle_products',
    filter: { is_active: true },
    columns: ['thumbnail_url', 'images'],
    bucket: 'supplier-images',
    strategy: 'rows',
    manifestPath: join(ROOT, 'scripts', 'supplier-images.json'),
    pathPrefix: sourcePrefix,
  },
}

function sourcePrefix(url) {
  const match = HOST_PREFIXES.find(([test]) => test.test(url))
  return match ? match[1] : 'other'
}

const has = (flag) => process.argv.includes(flag)
const valueArg = (name, fallback) => {
  const match = process.argv.find((arg) => arg.startsWith(`${name}=`))
  return match ? match.split('=').slice(1).join('=') : fallback
}
const numberArg = (name, fallback) => {
  const value = Number(valueArg(name, ''))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const APPLY = has('--apply')
const FORCE = has('--force')
const PRUNE = has('--prune')
const REVERT = has('--revert')
const LIMIT = numberArg('--limit', 0)
const CONCURRENCY = numberArg('--concurrency', 8)
const REQUESTED = valueArg('--source', 'apple')
/** Extra gallery images per supplier row; 0 keeps the run to row thumbnails. */
const GALLERY_LIMIT = numberArg('--gallery', 0)

/** Vite reads .env for the app; a plain node script has to do it itself. */
function loadDotEnv() {
  const path = join(ROOT, '.env')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/)
    if (!match) continue
    const [, key, raw] = match
    if (process.env[key]) continue
    process.env[key] = raw.trim().replace(/^["']|["']$/g, '')
  }
}

loadDotEnv()

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in the shell or in .env.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const isRemote = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)
const hashFor = (url) => createHash('sha1').update(url).digest('hex').slice(0, 16)

/** A single-size image stores one object and points both keys at it. */
const pathsFor = (url, prefix, kind) => {
  const hash = hashFor(url)
  if (kind === 'pair') {
    const web = SIZES.appleWeb
    const thumb = SIZES.appleThumb
    return { web: `${prefix}/${hash}-${web}.webp`, thumb: `${prefix}/${hash}-${thumb}.webp` }
  }
  const path = `${prefix}/${hash}-${SIZES.single}.webp`
  return { web: path, thumb: path }
}

/** Widths to encode for a kind: a single-size image needs one file, a pair needs two. */
const widthsFor = (kind) =>
  kind === 'pair' ? [SIZES.appleWeb, SIZES.appleThumb] : [SIZES.single]
const publicUrl = (bucket, path) => `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`

function resolveSources(requested) {
  if (requested === 'all') return Object.keys(SOURCES)
  if (requested === 'suppliers') return ['syntech', 'axiz', 'pinnacle']
  if (!SOURCES[requested]) {
    console.error(`Unknown --source=${requested}. Use apple, suppliers, syntech, axiz, pinnacle or all.`)
    process.exit(1)
  }
  return [requested]
}

function readManifest(source) {
  if (!existsSync(source.manifestPath)) return {}
  try {
    return JSON.parse(readFileSync(source.manifestPath, 'utf8'))
  } catch {
    console.warn(`${source.manifestPath} is not valid JSON; starting fresh.`)
    return {}
  }
}

/** Sorted keys keep the committed diff readable. */
function writeManifest(source, manifest) {
  const sorted = {}
  for (const url of Object.keys(manifest).sort()) sorted[url] = manifest[url]
  writeFileSync(source.manifestPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
  console.log(`Manifest: ${source.manifestPath} (${Object.keys(sorted).length} entries)`)
}

async function loadRows(source) {
  const rows = []
  const select = ['id', 'sku', ...source.columns].join(', ')
  for (let from = 0; ; from += DB_PAGE) {
    let query = supabase.from(source.table).select(select).order('id').range(from, from + DB_PAGE - 1)
    for (const [column, value] of Object.entries(source.filter)) query = query.eq(column, value)
    const { data, error } = await query
    if (error) throw new Error(`${source.table}: ${error.message}`)
    rows.push(...data)
    if (data.length < DB_PAGE) return rows
  }
}

/**
 * Apple mirrors every gallery image; the supplier ranges mirror row thumbnails by default,
 * because their galleries hold 20 000 files and ~7 GB of originals. --gallery=N adds the
 * first N gallery images per row for anyone who wants the detail pages covered too.
 */
function sourceRules(name) {
  return name === 'apple'
    ? { thumbnailKind: 'pair', galleryLimit: Number.POSITIVE_INFINITY }
    : { thumbnailKind: 'single', galleryLimit: GALLERY_LIMIT }
}

/** url -> 'single' | 'pair'. A URL used for both a tile and a gallery needs the pair. */
function collectTargets(source, rows, rules) {
  const targets = new Map()
  const add = (url, kind) => {
    if (!isRemote(url)) return
    if (targets.get(url) === 'pair') return
    targets.set(url, kind)
  }

  for (const row of rows) {
    add(row.thumbnail_url, rules.thumbnailKind)
    const gallery = (row.images ?? []).filter(isRemote).slice(0, rules.galleryLimit)
    for (const url of gallery) add(url, 'pair')
  }

  return targets
}

/** A stale entry from an earlier single-size run doesn't satisfy a pair request. */
function isCached(manifest, url, kind) {
  const entry = manifest[url]
  if (!entry) return false
  if (kind === 'single') return Boolean(entry.web || entry.thumb)
  return Boolean(entry.web && entry.thumb && entry.web !== entry.thumb)
}

async function ensureBucket(bucket) {
  const { error } = await supabase.storage.getBucket(bucket)
  if (!error) return
  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: '8MB',
  })
  if (createError) throw new Error(`Could not create the ${bucket} bucket: ${createError.message}`)
  console.log(`Created the public ${bucket} bucket.`)
}

async function download(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SPET-ImageMirror/1.0 (+https://spetonline.co.za)' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

// Loaded on demand so a preview run works before `sharp` is installed.
let sharpModule = null
async function getSharp() {
  if (!sharpModule) sharpModule = (await import('sharp')).default
  return sharpModule
}

async function encode(input, widths) {
  const sharp = await getSharp()
  const base = sharp(input, { failOn: 'none' }).rotate()
  const buffers = await Promise.all(
    widths.map((width) =>
      base.clone().resize({ width, withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer()
    )
  )
  const meta = await sharp(input, { failOn: 'none' }).metadata()
  return { buffers, sourceWidth: meta.width ?? null }
}

async function upload(bucket, path, buffer) {
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  })
  if (error) throw new Error(error.message)
}

/** Small promise pool: enough parallelism to finish in minutes, not enough to get throttled. */
async function mapPool(items, size, worker) {
  const results = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    for (;;) {
      const index = cursor++
      if (index >= items.length) return
      results[index] = await worker(items[index], index)
    }
  })
  await Promise.all(runners)
  return results
}

async function mirrorImages(source, manifest, candidates) {
  await ensureBucket(source.bucket)

  let downloaded = 0
  let stored = 0
  let failed = 0
  const failures = []

  await mapPool(candidates, CONCURRENCY, async ({ url, kind }, index) => {
    const label = `[${index + 1}/${candidates.length}]`
    try {
      const original = await download(url)
      downloaded += original.length
      const widths = widthsFor(kind)
      const { buffers, sourceWidth } = await encode(original, widths)
      const paths = pathsFor(url, source.pathPrefix(url), kind)

      if (kind === 'pair') {
        await upload(source.bucket, paths.web, buffers[0])
        await upload(source.bucket, paths.thumb, buffers[1])
      } else {
        await upload(source.bucket, paths.web, buffers[0])
      }

      const written = buffers.reduce((sum, buffer) => sum + buffer.length, 0)
      stored += written
      manifest[url] = paths
      console.log(`${label} ok ${sourceWidth ? `${sourceWidth}px` : ''} ${mb(original.length)} -> ${mb(written)}  ${url.slice(-50)}`)
    } catch (error) {
      failed += 1
      const reason = error instanceof Error ? error.message : String(error)
      failures.push({ url, reason })
      console.warn(`${label} FAILED ${reason}  ${url}`)
    }
  })

  return { downloaded, stored, failed, failures }
}

/**
 * Rewrites a row's image columns to the cached URLs. Anything that failed to mirror keeps
 * its supplier URL, so a partial run never leaves a row worse off than it started.
 */
function cachedColumns(source, row, manifest) {
  const next = {}
  let changed = false

  for (const column of source.columns) {
    const value = row[column]
    if (Array.isArray(value)) {
      const mapped = value.map((url) => {
        const entry = isRemote(url) ? manifest[url] : null
        return entry ? publicUrl(source.bucket, entry.web) : url
      })
      if (mapped.some((url, index) => url !== value[index])) {
        next[column] = mapped
        changed = true
      }
    } else if (isRemote(value)) {
      const entry = manifest[value]
      if (entry) {
        next[column] = publicUrl(source.bucket, entry.thumb)
        changed = true
      }
    }
  }

  // A row with no thumbnail falls back to its first image downstream, which would put the
  // 1400px file in a grid tile; give it the small copy explicitly.
  const gallery = Object.values(row).find((value) => Array.isArray(value)) ?? []
  if (!row.thumbnail_url && gallery.length > 0) {
    const entry = manifest[gallery[0]]
    if (entry) {
      next.thumbnail_url = publicUrl(source.bucket, entry.thumb)
      changed = true
    }
  }

  return changed ? next : null
}

async function applyToRows(source, rows, manifest) {
  const updates = []
  for (const row of rows) {
    const patch = cachedColumns(source, row, manifest)
    if (patch) updates.push({ id: row.id, patch })
  }

  if (updates.length === 0) {
    console.log('Every row already points at the cache.')
    return { updated: 0, failed: 0 }
  }

  let updated = 0
  let failed = 0
  await mapPool(updates, CONCURRENCY, async ({ id, patch }) => {
    const { error } = await supabase.from(source.table).update(patch).eq('id', id)
    if (error) {
      failed += 1
      if (failed <= 5) console.warn(`update failed ${id}: ${error.message}`)
      return
    }
    updated += 1
  })

  return { updated, failed }
}

async function revertRows(source, rows, manifest) {
  const inverse = new Map()
  for (const [url, paths] of Object.entries(manifest)) {
    inverse.set(publicUrl(source.bucket, paths.web), url)
    inverse.set(publicUrl(source.bucket, paths.thumb), url)
  }

  const updates = []
  for (const row of rows) {
    const patch = {}
    for (const column of source.columns) {
      const value = row[column]
      if (Array.isArray(value)) {
        const restored = value.map((url) => inverse.get(url) ?? url)
        if (restored.some((url, index) => url !== value[index])) patch[column] = restored
      } else if (typeof value === 'string' && inverse.has(value)) {
        patch[column] = inverse.get(value)
      }
    }
    if (Object.keys(patch).length > 0) updates.push({ id: row.id, patch })
  }

  let updated = 0
  let failed = 0
  await mapPool(updates, CONCURRENCY, async ({ id, patch }) => {
    const { error } = await supabase.from(source.table).update(patch).eq('id', id)
    if (error) {
      failed += 1
      return
    }
    updated += 1
  })

  return { updated, failed }
}

async function runSource(name) {
  const source = SOURCES[name]
  console.log(`\n=== ${source.label} · ${source.table} · ${source.bucket} ===`)

  const rows = await loadRows(source)
  const rules = sourceRules(name)
  const targets = collectTargets(source, rows, rules)
  const all = [...targets.keys()].sort()
  const withoutThumbnail = rows.filter((row) => !isRemote(row.thumbnail_url)).length

  console.log(`Rows: ${rows.length} (${withoutThumbnail} without a thumbnail), ${all.length} distinct images to cache.`)

  const manifest = readManifest(source)
  const alreadyCached = all.filter((url) => isCached(manifest, url, targets.get(url)))
  let candidates = FORCE ? all : all.filter((url) => !isCached(manifest, url, targets.get(url)))
  if (LIMIT) candidates = candidates.slice(0, LIMIT)

  console.log(`Already cached: ${alreadyCached.length}. To mirror now: ${candidates.length}.`)

  if (PRUNE) {
    // Sources that share a manifest share a bucket, so pruning must consider all of them.
    const inUse = new Set(all)
    for (const [siblingName, sibling] of Object.entries(SOURCES)) {
      if (sibling === source || sibling.manifestPath !== source.manifestPath) continue
      const siblingRows = await loadRows(sibling)
      for (const url of collectTargets(sibling, siblingRows, sourceRules(siblingName)).keys()) inUse.add(url)
    }
    const stale = Object.keys(manifest).filter((url) => !inUse.has(url))
    for (const url of stale) delete manifest[url]
    console.log(`Pruned ${stale.length} entries that no source points at.`)
  }

  if (candidates.length === 0) {
    console.log('Nothing to download.')
    if (APPLY && source.strategy === 'rows') {
      const { updated, failed } = await applyToRows(source, rows, manifest)
      console.log(`Rows pointing at the cache: ${updated} updated, ${failed} failed.`)
    }
    if (APPLY && PRUNE) writeManifest(source, manifest)
    return
  }

  if (!APPLY) {
    console.log('Sample of what would be mirrored:')
    for (const url of candidates.slice(0, 5)) {
      const kind = targets.get(url)
      console.log(`  ${url}\n    -> ${pathsFor(url, source.pathPrefix(url), kind).web} (${kind})`)
    }
    return
  }

  const jobs = candidates.map((url) => ({ url, kind: targets.get(url) }))
  const { downloaded, stored, failed, failures } = await mirrorImages(source, manifest, jobs)
  writeManifest(source, manifest)
  console.log(`Mirrored ${jobs.length - failed}, failed ${failed}.`)
  console.log(`Downloaded ${mb(downloaded)}; the stored WebP pair is ${mb(stored)}.`)

  if (source.strategy === 'rows') {
    const { updated, failed: updateFailures } = await applyToRows(source, rows, manifest)
    console.log(`Rows pointing at the cache: ${updated} updated, ${updateFailures} failed.`)
  }

  if (failures.length > 0) {
    console.log('Failures (re-run to retry only these):')
    for (const failure of failures) console.log(`  ${failure.reason}  ${failure.url}`)
    process.exitCode = 1
  }
}

async function main() {
  const keys = resolveSources(REQUESTED)
  if (REVERT) {
    return revertAll(keys)
  }

  console.log(APPLY ? '=== APPLY (uploading to storage) ===' : '=== PREVIEW (nothing is uploaded; add --apply) ===')
  for (const name of keys) await runSource(name)
}

async function revertAll(keys) {
  for (const name of keys) {
    const source = SOURCES[name]
    if (source.strategy !== 'rows') {
      console.log(`\n${source.label}: read-time mapping, so delete ${source.manifestPath} to revert.`)
      continue
    }
    const manifest = readManifest(source)
    const rows = await loadRows(source)
    const { updated, failed } = await revertRows(source, rows, manifest)
    console.log(`\n${source.label}: restored ${updated} rows, ${failed} failed.`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
