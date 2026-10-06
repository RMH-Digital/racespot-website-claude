/**
 * The partner packages, by slug — the same six as the media kit in Racespot
 * Analytics (packages/db/migrations 0025–0031 there, v3 since 2026-10-07),
 * in the same order.
 * The PDFs link to /{lang}/contact?type=media&package=<slug>, so a slug here
 * is a public address: rename one and old PDFs preselect nothing.
 *
 * Names and one-line taglines only, in translations.ts (pkg.<slug>.*).
 * Prices stay in the media kit, which is sent on request — not published on
 * the site (Jürgen, 2026-10-03: to be agreed with Philip and Hugo first).
 */
export const PACKAGES = ['feature', 'social', 'stream', 'combo', 'series', 'custom'] as const
export type PackageSlug = (typeof PACKAGES)[number]

/**
 * Slugs that existed once and may still sit in a PDF out there. 2026-10-07
 * (packages v3 in Analytics): "presenting" merged into "series", now
 * "Series & Presenting".
 */
const RETIRED: Record<string, PackageSlug> = { presenting: 'series' }

export function isPackage(v: unknown): v is PackageSlug {
  return typeof v === 'string' && (PACKAGES as readonly string[]).includes(v)
}

/** A slug from an address or a form, retired ones mapped to their successor */
export function toPackage(v: unknown): PackageSlug | null {
  if (isPackage(v)) return v
  return typeof v === 'string' ? RETIRED[v] ?? null : null
}

/** Budget ranges per month on the media form; the API accepts exactly these */
export const BUDGETS = ['lt1000', '1000-2500', '2500-5000', 'gt5000'] as const
export type BudgetSlug = (typeof BUDGETS)[number]

/** For the inquiry mail, which is in English */
export const PACKAGE_NAMES_EN: Record<PackageSlug, string> = {
  feature: 'Product Feature',
  social: 'Social',
  stream: 'Stream',
  combo: 'Stream + Social',
  series: 'Series & Presenting',
  custom: 'Your own series',
}
export const BUDGET_NAMES_EN: Record<BudgetSlug, string> = {
  lt1000: 'Under €1,000 / month',
  '1000-2500': '€1,000–2,500 / month',
  '2500-5000': '€2,500–5,000 / month',
  gt5000: 'Over €5,000 / month',
}
