import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

/**
 * The served HTML already carries the right title from `not-found.tsx`, but a
 * client-side navigation to a dead link resolves *this* route's metadata — and
 * with none here it fell back to the layout default, so the tab ended up
 * reading like the home page. Same title, stated twice.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

/**
 * Catch-all so that an unknown path under /{lang}/ renders the translated
 * not-found page inside the language layout. Without it Next falls back to
 * its bare default 404 outside any layout.
 */
export const dynamic = 'force-dynamic'

export default function CatchAll() {
  notFound()
}
