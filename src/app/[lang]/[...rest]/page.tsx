import { notFound } from 'next/navigation'

/**
 * Catch-all so that an unknown path under /{lang}/ renders the translated
 * not-found page inside the language layout. Without it Next falls back to
 * its bare default 404 outside any layout.
 */
export const dynamic = 'force-dynamic'

export default function CatchAll() {
  notFound()
}
