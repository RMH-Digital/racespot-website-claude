import type { Metadata } from 'next'
import { NotFoundBody } from '@/components/layout/NotFoundBody'

/**
 * The translated 404.
 *
 * `not-found.tsx` receives no route params, so the language used to come from
 * a header the proxy sets — and that one `headers()` call was expensive out of
 * all proportion. Next treats a dynamic API anywhere in a segment's render
 * tree as a property of the whole segment, and this file belongs to `[lang]`,
 * so **every page on the site** was being server-rendered on demand because of
 * the 404. Measured: remove the call and twelve routes stop being dynamic.
 *
 * The language now comes from the URL, read in the browser — see
 * `NotFoundBody`. The page stays static, the status code stays 404, and the
 * reader still gets their own language.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundBody />
}
