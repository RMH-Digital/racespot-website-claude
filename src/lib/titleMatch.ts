/**
 * Does a YouTube title name this schedule row? Shared by the recordings
 * (replays.ts, withReplays) and the live streams (liveRows) — both pair the
 * Master Schedule's series names with the channel's titles, and both need the
 * same aliases and the same idea of a meaningful word. No server-only
 * imports: plain string work.
 */

/**
 * The same series under two names.
 *
 * The schedule and the channel do not always call a series the same thing, and
 * where they differ they differ every single time. Measured over the past year
 * of matches, these are all of them: the schedule writes "Porsche Club of
 * America S16 - Pro", the stream is titled "PCA Sim Racing Series 16 | Event 3
 * | Pro Class at Sonoma", and the only word the two share is "Pro" — which the
 * iRacing Short Course *Pro* 2 National Series, starting twenty minutes
 * earlier, shares just as well. That is how it took the Porsche recording on
 * 2026-09-24.
 *
 * Each entry maps every spelling to one token, applied to both strings before
 * they are cut into words — so it runs before the stop list and a phrase like
 * "sim gaming expo" survives, although "sim" alone would have been dropped.
 * Longest form first inside a pattern, since the first alternative wins.
 *
 * Only put a name in here when the schedule and the channel genuinely mean the
 * same series. Anything else would make two different broadcasts look alike.
 */
const ALIASES: [RegExp, string][] = [
  // "PCA Sim Racing Series 16" ←→ "Porsche Club of America S16"
  [/\bporsche club of america\b|\bpca\b/g, 'pca'],
  // "The 2026 Esports Racing League Final4" ←→ "VCO ERL"
  [/\besports racing league\b|\berl\b/g, 'erl'],
  // The sponsor in front of the iRX Championship changes between seasons
  [/\bnext level racing\b|\bnlr\b/g, 'nlr'],
  [/\bchannel ?199\b/g, 'channel199'],
  // "Racecraft Rallycross" ←→ "… iRX Championship"
  [/\brallycross\b|\birx\b/g, 'irx'],
  // "Sim Gaming Expo Challenge Series" ←→ "SimGamingExpo Qualifiers"
  [/\bsim gaming expo\b|\bsimgamingexpo\b/g, 'simgamingexpo'],
  // "Bohlin's Svenska Eracingligan" ←→ "Svensk eRacingLigan"
  [/\bsvenska\b/g, 'svensk'],
]

const STOP = new Set(['the', 'of', 'and', 'at', 'in', 'on', 'de', 'la', 'le', 'a', 'series', 'season', 'round', 'event', 'class', 'sim', 'racing', 'esports', 'championship', 'cup', 'league'])

/**
 * Cut once, reused. The calendar scores eight hundred rows against eight
 * hundred streams, and the same series name and the same title come up in
 * every pairing they are part of. A few thousand distinct strings at most;
 * the map is cleared rather than trimmed when it grows past that.
 */
const tokenMemo = new Map<string, Set<string>>()

function tokens(s: string): Set<string> {
  const hit = tokenMemo.get(s)
  if (hit) return hit
  let t = s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')
  for (const [pattern, canonical] of ALIASES) t = t.replace(pattern, canonical)
  const set = new Set(t.split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)))
  if (tokenMemo.size >= 5000) tokenMemo.clear()
  tokenMemo.set(s, set)
  return set
}

/** Do these two share a word that is not a bare number? */
export function sharesAWord(a: string, b: string): boolean {
  const tb = tokens(b)
  for (const w of tokens(a)) if (!/^\d+$/.test(w) && tb.has(w)) return true
  return false
}

export function overlap(a: string, b: string): number {
  const ta = tokens(a)
  const tb = tokens(b)
  if (ta.size === 0) return 0
  let hits = 0
  for (const w of ta) if (tb.has(w)) hits++
  return hits / ta.size
}
