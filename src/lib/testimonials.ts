/**
 * What people say about Racespot — shown on the home page (Testimonials.tsx).
 *
 * The source is the recommendations on Racespot's Facebook page (19 of them,
 * all positive, as of 2026-09-24). Jürgen wants them presented as voices of
 * the people we work for and broadcast to, not as a Facebook widget, so the
 * page names no platform. What that does NOT license, and why:
 *
 * - **Word for word.** A quote is copied, never shortened inside a sentence,
 *   never "improved", never translated in place — it keeps its own language
 *   (`lang`) and the page marks it up that way. Leaving out whole sentences is
 *   fine and is marked with "…".
 * - **Real people only.** Nothing invented, nothing written by the team. An
 *   invented or edited testimonial is misleading advertising (§ 5 UWG), and
 *   the whole value of these is that they are someone else's words.
 * - **First name and initial, no photo.** The reviewers posted on Facebook,
 *   not on racespot.tv. Their full name and picture stay there.
 * - **`role` says who they are to us** — viewer, series organiser, partner —
 *   and only what the review itself makes clear. Most recommendations come
 *   from viewers; calling every one a "client" would claim more than we know.
 *
 * The section appears once there are at least three entries (MIN_SHOWN).
 */

export interface Testimonial {
  /** Verbatim text of the recommendation */
  quote: string
  /** First name and initial of the last name, e.g. "Chris L." */
  name: string
  /** Who they are to us, from the review itself; omitted = not shown */
  role?: 'viewer' | 'organiser' | 'partner' | 'driver'
  /** Language the quote was written in */
  lang: 'en' | 'de' | 'es' | 'pt' | 'fr' | 'it'
  /** When it was written, YYYY-MM-DD — kept as a record, not rendered */
  date: string
}

export const MIN_SHOWN = 3

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Racespot, like everything, started out small and humble. Over the several years I’ve been watching it’s been getting better and better! It’s to the point now that I’d say most of their broadcasts are better than what you see in real racing.',
    name: 'Chris L.',
    role: 'viewer',
    lang: 'en',
    date: '2019-03-14',
  },
]
