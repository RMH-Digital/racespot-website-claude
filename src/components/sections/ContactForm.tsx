'use client'

// Contact form — two forms behind a tab switcher:
//   1. Broadcast Request (default) — structured quote request for a series/event
//   2. General Inquiry — the classic name / email / subject / message form
// Both share the honeypot, Cloudflare Turnstile and the /api/contact endpoint,
// which branches on `type`.
import { useState, useRef, type FormEvent, type ReactNode } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { getT, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

type FormType = 'broadcast' | 'general'

const INPUT =
  'w-full bg-rs-dark border border-rs-border rounded-rs px-4 py-3 text-sm text-white ' +
  'placeholder:text-rs-muted/50 focus:border-rs-yellow focus:outline-none transition-colors ' +
  '[color-scheme:dark]'

const LABEL = 'text-[11px] font-display font-bold uppercase tracking-[0.1em] text-rs-muted mb-1.5 block'

export function ContactForm({ lang }: { lang: Lang }) {
  const [formType, setFormType] = useState<FormType>('broadcast')
  const [submitted, setSubmitted] = useState<FormType | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const t = getT(lang)

  function switchForm(next: FormType) {
    if (next === formType) return
    setFormType(next)
    setError(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)
    const payload: Record<string, unknown> = { type: formType, 'cf-turnstile-response': turnstileToken }
    data.forEach((value, key) => {
      payload[key] = typeof value === 'string' ? value : ''
    })

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      // If SMTP is not configured, open mailto as fallback
      if (result.method === 'mailto' && result.mailto) {
        const { to, subject, body } = result.mailto
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      }

      setSubmitted(formType)
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please email us directly at contact@racespot.tv'
      )
    } finally {
      setSending(false)
    }
  }

  const TABS: { id: FormType; labelKey: TranslationKey }[] = [
    { id: 'broadcast', labelKey: 'contact.tab.broadcast' },
    { id: 'general',   labelKey: 'contact.tab.general' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] md:h-[260px] overflow-hidden bg-gradient-to-b from-rs-dark to-rs-black">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rs-yellow via-rs-yellow/50 to-transparent" />
        <div className="container-rs relative h-full flex items-end pb-10">
          <div>
            <p className="section-label mb-3">{t('contact.label')}</p>
            <h1 className="display-title">{t('contact.title')}</h1>
          </div>
        </div>
      </div>

      <div className="container-rs py-16">
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-16">
          {/* Left: Info */}
          <div>
            <h2 className="font-display font-bold text-xl uppercase text-white mb-4">
              {t('contact.letsTalk')}
            </h2>
            <p className="text-rs-muted text-sm leading-relaxed mb-8">
              {t('contact.intro')}
            </p>

            <div className="space-y-6">
              <div>
                <p className={LABEL}>{t('contact.email')}</p>
                <a
                  href="mailto:contact@racespot.tv"
                  className="text-rs-yellow hover:text-white transition-colors text-sm"
                >
                  contact@racespot.tv
                </a>
              </div>

              <div>
                <p className={LABEL}>{t('contact.location')}</p>
                <p className="text-white/80 text-sm">Cologne / Hürth, Germany</p>
              </div>

              <div>
                <p className={LABEL}>{t('contact.company')}</p>
                <p className="text-white/80 text-sm">Racespot Media House GmbH</p>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {submitted ? (
              <div className="rounded-rs border border-rs-yellow/30 bg-rs-dark p-8 text-center">
                <p className="text-rs-yellow font-display font-bold text-lg uppercase mb-2">
                  {t('contact.thanks')}
                </p>
                <p className="text-rs-muted text-sm mb-6">
                  {t(submitted === 'broadcast' ? 'contact.bc.thanksDesc' : 'contact.thanksDesc')}{' '}
                  <a href="mailto:contact@racespot.tv" className="text-rs-yellow hover:underline">
                    contact@racespot.tv
                  </a>
                </p>
                <button onClick={() => setSubmitted(null)} className="btn-outline btn-sm">
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <>
                {/* Tab switcher */}
                <div
                  role="tablist"
                  aria-label={t('contact.title')}
                  className="grid grid-cols-2 gap-1 mb-8 p-1 bg-rs-dark border border-rs-border rounded-rs"
                >
                  {TABS.map((tab) => {
                    const active = tab.id === formType
                    return (
                      <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        role="tab"
                        type="button"
                        aria-selected={active}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => switchForm(tab.id)}
                        className={`px-4 py-2.5 rounded-[4px] font-display font-bold text-[12px] uppercase tracking-[0.08em] transition-colors
                          ${active
                            ? 'bg-rs-yellow text-rs-black'
                            : 'text-rs-muted hover:text-white hover:bg-rs-gray'}`}
                      >
                        {t(tab.labelKey)}
                      </button>
                    )
                  })}
                </div>

                <form
                  key={formType}
                  id={`panel-${formType}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${formType}`}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {formType === 'broadcast' ? (
                    <BroadcastFields t={t} />
                  ) : (
                    <GeneralFields t={t} />
                  )}

                  {/* Honeypot — hidden from real users, bots fill it out */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <label htmlFor="company">Company</label>
                    <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
                  </div>

                  {/* Cloudflare Turnstile */}
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      onSuccess={setTurnstileToken}
                      onError={() => setTurnstileToken(null)}
                      onExpire={() => setTurnstileToken(null)}
                      options={{ theme: 'dark' }}
                    />
                  )}

                  {error && (
                    <div role="alert" className="rounded-rs border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t('contact.sending')}
                      </span>
                    ) : (
                      t(formType === 'broadcast' ? 'contact.bc.send' : 'contact.send')
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Field helpers ───────────────────────────────────────────

type T = (key: TranslationKey) => string

function Field({
  id,
  label,
  required,
  hint,
  t,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  t: T
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
        <span className={`ml-1.5 normal-case tracking-normal font-sans font-normal ${required ? 'text-rs-yellow/80' : 'text-rs-muted/60'}`}>
          {required ? '*' : `(${t('contact.optional').toLowerCase()})`}
        </span>
      </label>
      {children}
      {hint && <p className="text-[11px] text-rs-muted/70 mt-1.5">{hint}</p>}
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="section-label pt-2 border-t border-rs-border/60 first:border-0 first:pt-0">
      {children}
    </p>
  )
}

// ─── Broadcast request ───────────────────────────────────────

function BroadcastFields({ t }: { t: T }) {
  return (
    <>
      <SectionLabel>{t('contact.bc.contactSection')}</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="name" label={t('contact.name')} required t={t}>
          <input id="name" name="name" type="text" required autoComplete="name" className={INPUT} placeholder={t('contact.namePlaceholder')} />
        </Field>
        <Field id="email" label={t('contact.email')} required t={t}>
          <input id="email" name="email" type="email" required autoComplete="email" className={INPUT} placeholder={t('contact.emailPlaceholder')} />
        </Field>
      </div>
      <Field id="businessAddress" label={t('contact.bc.businessAddress')} required t={t}>
        <textarea id="businessAddress" name="businessAddress" rows={3} required autoComplete="street-address" className={`${INPUT} resize-none`} placeholder={t('contact.bc.businessAddressPlaceholder')} />
      </Field>

      <SectionLabel>{t('contact.bc.seriesSection')}</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="seriesName" label={t('contact.bc.seriesName')} required t={t}>
          <input id="seriesName" name="seriesName" type="text" required className={INPUT} placeholder={t('contact.bc.seriesNamePlaceholder')} />
        </Field>
        <Field id="seriesWebsite" label={t('contact.bc.seriesWebsite')} required t={t}>
          <input id="seriesWebsite" name="seriesWebsite" type="url" required inputMode="url" autoComplete="url" className={INPUT} placeholder="https://" />
        </Field>
      </div>
      <Field id="game" label={t('contact.bc.game')} required t={t}>
        <input id="game" name="game" type="text" required className={INPUT} placeholder={t('contact.bc.gamePlaceholder')} />
      </Field>

      <SectionLabel>{t('contact.bc.scheduleSection')}</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="startDate" label={t('contact.bc.startDate')} required t={t}>
          <input id="startDate" name="startDate" type="date" required className={INPUT} />
        </Field>
        <Field id="startTime" label={t('contact.bc.startTime')} required hint={t('contact.bc.startTimeHint')} t={t}>
          <input id="startTime" name="startTime" type="time" required className={INPUT} />
        </Field>
      </div>
      <div className="grid sm:grid-cols-[1fr_2fr] gap-5">
        <Field id="raceCount" label={t('contact.bc.raceCount')} required t={t}>
          <input id="raceCount" name="raceCount" type="number" min={1} max={999} step={1} required inputMode="numeric" className={INPUT} placeholder={t('contact.bc.raceCountPlaceholder')} />
        </Field>
        <Field id="broadcastWindow" label={t('contact.bc.broadcastWindow')} required t={t}>
          <input id="broadcastWindow" name="broadcastWindow" type="text" required className={INPUT} placeholder={t('contact.bc.broadcastWindowPlaceholder')} />
        </Field>
      </div>
      <Field id="additionalInfo" label={t('contact.bc.additionalInfo')} t={t}>
        <textarea id="additionalInfo" name="additionalInfo" rows={5} className={`${INPUT} resize-none`} placeholder={t('contact.bc.additionalInfoPlaceholder')} />
      </Field>
    </>
  )
}

// ─── General inquiry (the original form) ─────────────────────

function GeneralFields({ t }: { t: T }) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="name" label={t('contact.name')} required t={t}>
          <input id="name" name="name" type="text" required autoComplete="name" className={INPUT} placeholder={t('contact.namePlaceholder')} />
        </Field>
        <Field id="email" label={t('contact.email')} required t={t}>
          <input id="email" name="email" type="email" required autoComplete="email" className={INPUT} placeholder={t('contact.emailPlaceholder')} />
        </Field>
      </div>
      <Field id="subject" label={t('contact.subject')} t={t}>
        <input id="subject" name="subject" type="text" className={INPUT} placeholder={t('contact.subjectPlaceholder')} />
      </Field>
      <Field id="message" label={t('contact.message')} required t={t}>
        <textarea id="message" name="message" rows={6} required className={`${INPUT} resize-none`} placeholder={t('contact.messagePlaceholder')} />
      </Field>
    </>
  )
}
