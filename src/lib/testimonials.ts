import 'server-only'

/**
 * What people say about Racespot — shown on the home page (Testimonials.tsx).
 *
 * Source: the reviews archive in Racespot Analytics, which collects the
 * public reviews of every platform it is connected to — Facebook first,
 * Google next, more later — and hands them over at /api/public/reviews
 * (contract: docs/ANALYTICS-REVIEWS.md). This file picks the best of them.
 * Until that endpoint answers, the hand-kept list below stands in.
 *
 * Jürgen wants them presented as voices of the people we work for and
 * broadcast to, not as a platform widget, so the page names no platform.
 * What that does NOT license, and why:
 *
 * - **Word for word.** A quote is shown as written, never shortened inside
 *   a sentence, never "improved", never translated. An edited testimonial is
 *   misleading advertising (§ 5 UWG); the value is that they are someone
 *   else's words.
 * - **Real reviews only.** Nothing invented, nothing written by the team.
 * - **A name on every quote, no date, no photo** (Jürgen, 2026-09-24,
 *   after a day of showing the month instead). First name and initial, as
 *   the archive shortens it before it leaves the tool. Facebook's API gives
 *   no names to any app, so they are added once in the Analytics dashboard;
 *   a review still without one is not shown. Never an invented name.
 * - **Only good ones are shown, and the page says it is a selection**
 *   ("Ausgewählte öffentliche Empfehlungen"), so nobody is led to believe
 *   this is every review there is.
 */

export interface Testimonial {
  /** Stable id: `<platform>:<platform id>` from the archive, `manual:<n>` here */
  id: string
  /** Verbatim text */
  quote: string
  /** First name and initial, e.g. "Chris L." */
  name: string
  /** Who they are to us — only set by hand in ROLES, never guessed */
  role?: 'viewer' | 'organiser' | 'partner' | 'driver'
  /** Language the quote is written in, when known */
  lang?: string
  /** YYYY-MM-DD */
  date: string
}

/** Fewer than this and the section stays hidden — a lone card looks like an accident. */
export const MIN_SHOWN = 3
/** Two rows of three on a desktop */
export const MAX_SHOWN = 6

/**
 * Editorial overrides, keyed by id. `EXCLUDE` keeps a review off the site
 * (off-topic, names a person, outdated), `PIN` puts it first, `ROLES` says
 * who wrote it when the text makes it clear.
 */
const EXCLUDE = new Set<string>([])
const PIN: string[] = []
const ROLES: Record<string, Testimonial['role']> = {}

/** Stands in while the archive does not answer. */
const MANUAL: Testimonial[] = [
  {
    id: 'manual:1',
    quote:
      'Racespot, like everything, started out small and humble. Over the several years I’ve been watching it’s been getting better and better! It’s to the point now that I’d say most of their broadcasts are better than what you see in real racing.',
    name: 'Chris L.',
    role: 'viewer',
    lang: 'en',
    date: '2019-03-14',
  },
]

// ─── The archive ────────────────────────────────────────────

/**
 * Where the archive serves its reviews. Defaults to the sibling of the stats
 * endpoint, so the one Coolify variable already set covers both.
 */
const REVIEWS_URL =
  process.env.ANALYTICS_REVIEWS_URL ??
  process.env.ANALYTICS_STATS_URL?.replace(/\/site-stats\/?$/, '/reviews')

interface ArchiveReview {
  id: string
  platform: string
  rating: number | null
  recommended: boolean | null
  text: string
  author: string | null
  date: string
  lang: string | null
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)

async function archiveReviews(): Promise<ArchiveReview[] | null> {
  if (!REVIEWS_URL) return null
  try {
    // Six hours, like the stats — reviews arrive a few a month.
    const res = await fetch(REVIEWS_URL, { next: { revalidate: 6 * 3600 }, signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      // 404 until the archive has the endpoint; the hand list covers it.
      if (res.status !== 404) console.warn('[voices] archive answered', res.status)
      return null
    }
    const body = await res.json()
    if (!Array.isArray(body?.reviews)) return null
    const out: ArchiveReview[] = []
    for (const r of body.reviews) {
      const id = str(r?.id), platform = str(r?.platform), text = str(r?.text), author = str(r?.author), date = str(r?.date)
      if (!id || !platform || !text || !date) continue
      out.push({
        id: `${platform}:${id}`,
        platform,
        rating: typeof r.rating === 'number' ? r.rating : null,
        recommended: typeof r.recommended === 'boolean' ? r.recommended : null,
        text,
        author,
        date: date.slice(0, 10),
        lang: str(r.lang),
      })
    }
    return out
  } catch (error) {
    console.warn('[voices] archive unreachable:', error instanceof Error ? error.message : error)
    return null
  }
}

// ─── Choosing ───────────────────────────────────────────────

/** Positive, by whatever the platform measures: five stars, or "recommends". */
function isPositive(r: ArchiveReview): boolean {
  if (r.rating !== null) return r.rating >= 5
  return r.recommended === true
}

/**
 * Long enough to say something, short enough for a card. Below this it is
 * "Great!"; above it the card towers over its neighbours.
 */
const MIN_CHARS = 60
const MAX_CHARS = 600

/**
 * The best reviews, in a stable order.
 *
 * Only positive ones of a readable length. Among those, pinned first, then
 * by substance (length, capped) and freshness, and the platforms take turns
 * so one of them cannot fill the whole section. Deterministic — the same
 * input gives the same order, so a page rendered twice looks the same.
 */
export async function getVoices(): Promise<Testimonial[]> {
  const archive = await archiveReviews()
  if (!archive || archive.length === 0) return MANUAL.filter((m) => !EXCLUDE.has(m.id))

  const now = Date.now()
  const candidates = archive
    .filter((r) => r.author !== null && !EXCLUDE.has(r.id) && isPositive(r) && r.text.length >= MIN_CHARS && r.text.length <= MAX_CHARS)
    .map((r) => {
      const ageYears = Math.max(0, (now - Date.parse(r.date)) / (365 * 86_400_000))
      const score = Math.min(r.text.length, 400) / 400 + Math.max(0, 1 - ageYears / 6)
      return { r, score }
    })

  // Pinned first, in the order given.
  const pinned = PIN.map((id) => candidates.find((c) => c.r.id === id)).filter((c) => c !== undefined)
  const rest = candidates
    .filter((c) => !PIN.includes(c.r.id))
    .sort((a, b) => b.score - a.score || a.r.id.localeCompare(b.r.id))

  // Per platform, best first; then one from each in turn.
  const byPlatform = new Map<string, typeof rest>()
  for (const c of rest) {
    const list = byPlatform.get(c.r.platform) ?? []
    list.push(c)
    byPlatform.set(c.r.platform, list)
  }
  const queues = [...byPlatform.values()].sort((a, b) => b[0].score - a[0].score)
  const picked = [...pinned]
  while (picked.length < MAX_SHOWN && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift()
      if (next && picked.length < MAX_SHOWN) picked.push(next)
    }
  }

  return picked.map(({ r }) => ({
    id: r.id,
    quote: r.text,
    name: r.author!,
    role: ROLES[r.id],
    lang: r.lang ?? undefined,
    date: r.date,
  }))
}
