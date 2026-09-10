'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { translations, type TranslationKey } from '@/lib/i18n/translations'
import { DEFAULT_LANG, type Lang } from '@/lib/i18n/langs'

/**
 * TRANSITIONAL. The language now comes from the URL and is rendered on the
 * server; this context only hands it to client components that have not yet
 * been converted to take `lang` as a prop. It disappears with them.
 */
export type LangCode = Lang

const LanguageContext = createContext<Lang>(DEFAULT_LANG)

export function useLanguage() {
  return { lang: useContext(LanguageContext) }
}

export function useTranslation() {
  const lang = useContext(LanguageContext)
  return function t(key: TranslationKey): string {
    const entry = translations[key] as Record<string, string> | undefined
    if (!entry) return key
    return entry[lang] || entry.en || key
  }
}

export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>
}
