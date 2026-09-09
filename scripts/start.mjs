#!/usr/bin/env node
/**
 * Production entry point (`npm start`, which is what Nixpacks/Coolify runs).
 *
 * Starts `next start` exactly as before and, once it answers, warms the
 * next/image cache in the background (see warm-image-cache.mjs). The server's
 * lifecycle is untouched: signals are forwarded, and the process exits with
 * whatever `next start` exits with. The warm-up can never take the site down —
 * it is a plain HTTP client that logs and moves on.
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const nextBin = join(here, '..', 'node_modules', 'next', 'dist', 'bin', 'next')

const server = spawn(process.execPath, [nextBin, 'start', ...process.argv.slice(2)], { stdio: 'inherit' })

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.kill(sig))
server.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)))

if (process.env.SKIP_IMAGE_WARMUP !== '1') {
  const warm = spawn(process.execPath, [join(here, 'warm-image-cache.mjs')], { stdio: 'inherit' })
  warm.on('error', (e) => console.log('[warm] could not start:', e.message))
}
