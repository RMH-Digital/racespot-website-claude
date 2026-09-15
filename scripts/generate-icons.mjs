#!/usr/bin/env node
/**
 * Rebuild the favicon set from one master file.
 *
 * Why this exists: the icons committed in March 2026 were all the wrong size.
 * favicon-32.png was a single pixel, favicon-48.png was 2×2, icon-192.png was
 * 37×37 and apple-touch-icon.png was 32px while the markup promised 180.
 * Browsers scale whatever they get, so nobody noticed — the tab just showed a
 * blurred smudge. Only favicon-16.png was honest.
 *
 * The shape is unchanged — the same R — but it is now rendered at the sizes
 * the markup and the manifest claim, and in the brand colours rather than the
 * generator defaults the master was drawn in (see YELLOW/BLACK below).
 *
 *   node scripts/generate-icons.mjs
 *
 * The master is `assets/icon-master.png`, the largest clean copy we have
 * (262px, recovered from the old icon-512.png). It is two flat colours, so it
 * is upscaled once to 2048 and thresholded back to a hard edge before any
 * target size is rendered — that way every icon has identical geometry and
 * gets its anti-aliasing from a single clean downscale.
 */
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const MASTER = join(root, 'assets/icon-master.png')
const OUT = join(root, 'public')

/**
 * The brand colours, not the master's.
 *
 * The 2026 master was drawn in CSS "goldenrod" on pure black, which is not
 * what the site uses anywhere else — a generator default that nobody caught.
 * The shape comes from the master, the colours come from the design tokens in
 * globals.css, so the tab icon matches the page it opens.
 */
const YELLOW = { r: 0xf5, g: 0xc0, b: 0x00 }
const BLACK = { r: 0x0a, g: 0x0a, b: 0x0a }

/** What the master was drawn in — used only to read its shape. */
const MASTER_YELLOW = { r: 0xda, g: 0xa5, b: 0x20 }
const MASTER_BLACK = { r: 0x00, g: 0x00, b: 0x00 }

/** Working resolution for the thresholded master. */
const WORK = 2048

const TARGETS = [
  { file: 'favicon-16.png', size: 16 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon-48.png', size: 48 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  // Apple renders this at 180 on modern devices and never composites
  // transparency, which is why the background stays opaque black.
  { file: 'apple-touch-icon.png', size: 180 },
]

/**
 * Android crops an adaptive icon to a circle or squircle. A mark that fills
 * the frame loses its corners, so the maskable variant keeps the R inside the
 * inner ~62% that every mask shape is guaranteed to show.
 */
const MASKABLE = { file: 'icon-maskable-512.png', size: 512, scale: 0.62 }

/**
 * Upscale, then decide every pixel is either yellow or black.
 *
 * The master's edges are anti-aliased at 262px. Scaling that up directly keeps
 * the blur and makes the large icons look soft; re-thresholding at 2048 pins
 * the outline to roughly an eighth of an original pixel, and the downscale to
 * each target size puts clean anti-aliasing back.
 */
async function buildMask() {
  // Flatten first, resize second. The master carries an alpha channel whose
  // black areas are nearly transparent; resizing that and *then* dropping
  // alpha un-premultiplies near-zero values and the whole square comes out
  // yellow. Compositing onto black up front is also simply what the file
  // looks like when a browser renders it.
  const { data, info } = await sharp(MASTER)
    .flatten({ background: MASTER_BLACK })
    .resize(WORK, WORK, { kernel: 'lanczos3', fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const mask = Buffer.alloc(info.width * info.height)
  for (let i = 0, p = 0; i < data.length; i += info.channels, p++) {
    const dy =
      (data[i] - MASTER_YELLOW.r) ** 2 +
      (data[i + 1] - MASTER_YELLOW.g) ** 2 +
      (data[i + 2] - MASTER_YELLOW.b) ** 2
    const db =
      (data[i] - MASTER_BLACK.r) ** 2 +
      (data[i + 1] - MASTER_BLACK.g) ** 2 +
      (data[i + 2] - MASTER_BLACK.b) ** 2
    mask[p] = dy < db ? 255 : 0
  }

  return { mask, width: info.width, height: info.height }
}

/** Composite the mask as yellow over a black square at `size`. */
async function render({ mask, width, height }, size, scale = 1) {
  const inner = Math.round(size * scale)

  // Downscale the hard-edged mask; lanczos turns it back into a smooth
  // coverage value per pixel, which is exactly the alpha we want.
  // Ask for the stride back rather than assuming it: sharp promotes a
  // one-channel raw input to sRGB on the way out, so the resized buffer is
  // three bytes per pixel, and reading it as one striped the icon.
  const { data: shape, info } = await sharp(mask, { raw: { width, height, channels: 1 } })
    .resize(inner, inner, { kernel: 'lanczos3', fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Build the layer as RGBA by hand rather than compositing with a blend
  // mode: a one-channel buffer is greyscale, not alpha, so `dest-in` treats
  // it as fully opaque and hands back a solid yellow square.
  const rgba = Buffer.alloc(inner * inner * 4)
  for (let p = 0; p < inner * inner; p++) {
    rgba[p * 4] = YELLOW.r
    rgba[p * 4 + 1] = YELLOW.g
    rgba[p * 4 + 2] = YELLOW.b
    rgba[p * 4 + 3] = shape[p * info.channels]
  }

  const yellowLayer = await sharp(rgba, { raw: { width: inner, height: inner, channels: 4 } })
    .png()
    .toBuffer()

  const pad = Math.round((size - inner) / 2)
  return sharp({
    create: { width: size, height: size, channels: 4, background: { ...BLACK, alpha: 1 } },
  })
    .composite([{ input: yellowLayer, left: pad, top: pad }])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const mask = await buildMask()

  for (const { file, size } of TARGETS) {
    const png = await render(mask, size)
    await writeFile(join(OUT, file), png)
    console.log(`${file.padEnd(24)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} KB`)
  }

  const maskable = await render(mask, MASKABLE.size, MASKABLE.scale)
  await writeFile(join(OUT, MASKABLE.file), maskable)
  console.log(`${MASKABLE.file.padEnd(24)} ${MASKABLE.size}×${MASKABLE.size}  ${(maskable.length / 1024).toFixed(1)} KB  (safe-zone padded)`)

  // /favicon.ico is still requested by browsers that ignore the markup, and it
  // 404'd. Three sizes in one file, which is what an .ico is for.
  const ico = await buildIco(mask, [16, 32, 48])
  await writeFile(join(OUT, 'favicon.ico'), ico)
  console.log(`${'favicon.ico'.padEnd(24)} 16+32+48  ${(ico.length / 1024).toFixed(1)} KB`)
}

/** Minimal ICO container holding PNG-encoded entries (supported since IE11). */
async function buildIco(mask, sizes) {
  const images = []
  for (const size of sizes) images.push({ size, png: await render(mask, size) })

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  const entries = []
  let offset = 6 + images.length * 16
  for (const { size, png } of images) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette size
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(png.length, 8)
    e.writeUInt32LE(offset, 12)
    entries.push(e)
    offset += png.length
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)])
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
