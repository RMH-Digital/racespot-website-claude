#!/usr/bin/env node
/**
 * One-off source-image normaliser: re-encodes every JPEG under public/images
 * in place to ≤ 1920 px on the longest side, quality 82 (mozjpeg), metadata
 * stripped, EXIF orientation baked in. Keeps the file name, so nothing in
 * src/ has to change. Writes only when the result is smaller.
 *
 * Why: next/image has to *decode* the source before it can resize it. A
 * 2.4 MB, 6000-px photo takes noticeably longer than a 300 KB, 1920-px one,
 * and no page ever renders wider than 1920 px anyway.
 *
 *   node scripts/optimize-images.mjs            # do it
 *   node scripts/optimize-images.mjs --dry-run  # only report
 */
import { readdir, stat, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('../public/images/', import.meta.url))
const MAX = 1920
const QUALITY = 82
const dry = process.argv.includes('--dry-run')

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (/^\.(jpe?g)$/i.test(extname(e.name))) yield p
  }
}

let before = 0, after = 0, changed = 0, n = 0
for await (const file of walk(ROOT)) {
  n++
  const size = (await stat(file)).size
  before += size
  const img = sharp(file, { failOn: 'none' }).rotate()
  const meta = await img.metadata()
  const out = await img
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer()
  if (out.length < size * 0.97) {
    changed++
    after += out.length
    if (!dry) await writeFile(file, out)
    console.log(`${(size / 1024).toFixed(0).padStart(5)} → ${(out.length / 1024).toFixed(0).padStart(5)} KB  ${meta.width}x${meta.height}  ${file.replace(ROOT, '')}`)
  } else {
    after += size
  }
}
console.log(`\n${n} JPEGs, ${changed} rewritten${dry ? ' (dry run)' : ''}: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`)
