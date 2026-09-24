'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Own click heatmap and page journeys, sent to Racespot Analytics
 * (analytics.racespot.tv/api/collect — contract in
 * ~/Racespot Analytics/docs/HEATMAP.md). Umami counts pages; it cannot say
 * where people click, how far they scroll or which path they take.
 *
 * Privacy, deliberately (and named in legal/privacy.ts, section 5):
 *   - no cookie, no localStorage, no sessionStorage — nothing is written to
 *     the device. The journey id lives in this module's memory only: it spans
 *     in-site navigation and is gone on reload or a new tab, so visits cannot
 *     be linked.
 *   - no IP stored (the endpoint never writes it), no user agent beyond
 *     "mobile / tablet / desktop", no form values ever — for inputs only the
 *     element, never what was typed.
 *   - honours Global Privacy Control and Do Not Track.
 *
 * Frugal: one beacon per page view (on leaving the page or switching tabs),
 * clicks are buffered, not sent one by one. Only production on racespot.tv.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_HEATMAP_URL || 'https://analytics.racespot.tv/api/collect'
// NEXT_PUBLIC_HEATMAP_HOSTS only for a local end-to-end test.
const HOSTS = new Set((process.env.NEXT_PUBLIC_HEATMAP_HOSTS || 'racespot.tv,www.racespot.tv').split(',').map((h) => h.trim()))
const MAX_CLICKS = 100
const IDLE_MS = 30_000
const CLICKABLE = 'a,button,[role="button"],input,select,textarea,summary,label,[data-track]'

type Click = { x: number; y: number; dh: number; s: string | null; l: string | null; h: string | null; rx: number | null; ry: number | null; t: number }
type View = { id: string; seq: number; path: string; prev: string | null; ref: string | null; t0: number; ms: number; sc: number; clicks: Click[] }

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16))

// Module memory only — see above.
const journey = uid()
let seq = 0
let view: View | null = null
let lastActive = Date.now()

const device = () => (window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop')
const docHeight = () => Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0)

/** Standard CSS path, so the dashboard can find the element again with querySelector. */
function cssPath(el: Element): string {
  const parts: string[] = []
  let node: Element | null = el
  while (node && node !== document.body && parts.length < 16) {
    const id = node.getAttribute('id')
    // React's useId values (":r1:") change between renders; skip them.
    if (id && !id.includes(':') && /^[A-Za-z][\w-]*$/.test(id)) {
      parts.unshift(`#${id}`)
      return parts.join('>')
    }
    const tag = node.tagName.toLowerCase()
    const parent: Element | null = node.parentElement
    const same = parent ? Array.from(parent.children).filter((c) => c.tagName === node!.tagName) : []
    parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag)
    node = parent
  }
  return ['body', ...parts].join('>')
}

function labelOf(el: Element): string | null {
  const tag = el.tagName.toLowerCase()
  const explicit = el.getAttribute('data-track') || el.getAttribute('aria-label') || el.getAttribute('title')
  // Never what someone typed: for form fields only the field's name or type.
  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    return (explicit || el.getAttribute('name') || el.getAttribute('type') || tag).slice(0, 60)
  }
  const text = (explicit || (el as HTMLElement).innerText || el.textContent || '').replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, 60) : null
}

function hrefOf(el: Element): string | null {
  const a = el.closest('a')
  const raw = a?.getAttribute('href')
  if (!raw) return null
  try {
    const u = new URL(raw, location.href)
    return HOSTS.has(u.hostname) ? u.pathname : u.hostname
  } catch {
    return null
  }
}

function send(final: boolean) {
  if (!view) return
  const v = view
  const body = JSON.stringify({
    v: 1,
    j: journey,
    pv: { id: v.id, seq: v.seq, path: v.path, prev: v.prev, ref: v.ref, dev: device(), vw: window.innerWidth, dh: docHeight(), ms: Math.round(v.ms), sc: Math.round(v.sc) },
    c: v.clicks,
  })
  v.clicks = []
  try {
    if (!navigator.sendBeacon?.(ENDPOINT, body)) {
      void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, mode: 'no-cors' })
    }
  } catch {
    /* measuring must never break the page */
  }
  if (final) view = null
}

function start(path: string, prev: string | null) {
  let ref: string | null = null
  if (!prev && document.referrer) {
    try {
      const r = new URL(document.referrer)
      ref = HOSTS.has(r.hostname) ? null : r.hostname
    } catch {
      /* ignore */
    }
  }
  view = { id: uid(), seq: seq++, path, prev, ref, t0: Date.now(), ms: 0, sc: 0, clicks: [] }
  lastActive = Date.now()
  measureScroll()
}

function measureScroll() {
  if (!view) return
  const h = docHeight()
  if (h > 0) view.sc = Math.max(view.sc, Math.min(100, ((window.scrollY + window.innerHeight) / h) * 100))
}

function onClick(e: MouseEvent) {
  if (!view || view.clicks.length >= MAX_CLICKS) return
  const target = e.target instanceof Element ? e.target : null
  const hit = target?.closest(CLICKABLE) ?? null
  const width = document.documentElement.scrollWidth || window.innerWidth
  let rx: number | null = null
  let ry: number | null = null
  if (hit) {
    const r = hit.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      rx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
      ry = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    }
  }
  view.clicks.push({
    x: Math.min(1, Math.max(0, e.pageX / width)),
    y: Math.round(e.pageY),
    dh: docHeight(),
    s: hit ? cssPath(hit) : null,
    l: hit ? labelOf(hit) : null,
    h: hit ? hrefOf(hit) : null,
    rx,
    ry,
    t: Date.now() - view.t0,
  })
  lastActive = Date.now()
  if (view.clicks.length >= 30) send(false)
}

function enabled(): boolean {
  if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_HEATMAP_DISABLED === '1') return false
  if (typeof window === 'undefined' || !HOSTS.has(location.hostname)) return false
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string }
  if (nav.globalPrivacyControl || nav.doNotTrack === '1' || nav.msDoNotTrack === '1') return false
  return true
}

export function Heatmap() {
  const pathname = usePathname()

  // One listener set for the lifetime of the tab.
  useEffect(() => {
    if (!enabled()) return
    let raf = 0
    const active = () => {
      lastActive = Date.now()
    }
    const onScroll = () => {
      active()
      if (!raf) raf = requestAnimationFrame(() => ((raf = 0), measureScroll()))
    }
    // Active time: visible and touched within the last 30 s, counted per second.
    const tick = window.setInterval(() => {
      if (view && document.visibilityState === 'visible' && Date.now() - lastActive < IDLE_MS) view.ms += 1000
    }, 1000)
    const onHide = () => {
      if (document.visibilityState === 'hidden') send(false)
    }
    const onPageHide = () => send(true)
    // Back/forward cache: the page returns without a new render, so reopen the view.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !view) start(location.pathname, null)
    }
    document.addEventListener('click', onClick, { capture: true, passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', active, { passive: true })
    window.addEventListener('keydown', active, { passive: true })
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      window.clearInterval(tick)
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', active)
      window.removeEventListener('keydown', active)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  // Every in-site navigation closes the previous page view and opens a new one.
  useEffect(() => {
    if (!enabled()) return
    const prev = view?.path ?? null
    if (view && view.path === pathname) return
    send(true)
    start(pathname, prev)
  }, [pathname])

  return null
}
