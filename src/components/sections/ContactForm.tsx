'use client'

// Contact form — two forms behind a tab switcher:
//   1. Broadcast Request (default) — structured quote request for a series/event
//   2. General Inquiry — the classic name / email / subject / message form
// Both share the honeypot, Cloudflare Turnstile and the /api/contact endpoint,
// which branches on `type`.
//
// Validation runs here first (noValidate + our own rules) so every message is
// translated and shown under the field it belongs to; the server re-validates
// and answers with an error *code* that is mapped back to a translated string.
import { useState, useRef, type FormEvent, type ReactNode } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { getT, type Lang } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

type FormType = 'broadcast' | 'general'
type T = (key: TranslationKey) => string
type Errors = Record<string, TranslationKey>

const INPUT =
  'w-full bg-rs-dark border rounded-rs px-4 py-3 text-sm text-white ' +
  'placeholder:text-rs-muted/50 focus:border-rs-yellow focus:outline-none transition-colors ' +
  '[color-scheme:dark]'

const LABEL = 'text-[11px] font-display font-bold uppercase tracking-[0.1em] text-rs-muted mb-1.5 block'

// Dropdown ranges — the API enforces the same bounds.
export const RACE_COUNT_MAX = 30
export const WINDOW_HOURS_MAX = 12
export const WINDOW_MINUTE_STEPS = [0, 15, 30, 45] as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Server error codes → translated messages (see src/app/api/contact/route.ts)
const SERVER_ERRORS: Record<string, TranslationKey> = {
  turnstile_missing: 'contact.err.turnstile',
  turnstile_failed: 'contact.err.turnstileFailed',
  rate_limited: 'contact.err.rateLimit',
  validation: 'contact.err.summary',
  send_failed: 'contact.err.server',
}

/** Loose URL check for the optional website field: accepts "example.com" and "https://example.com". */
export function looksLikeUrl(v: string): boolean {
  try {
    const u = new URL(/^[a-z]+:\/\//i.test(v) ? v : `https://${v}`)
    return /^https?:$/.test(u.protocol) && /\.[a-z]{2,}$/i.test(u.hostname)
  } catch {
    return false
  }
}

function validate(type: FormType, data: FormData): Errors {
  const get = (k: string) => (data.get(k) as string | null)?.trim() ?? ''
  const errors: Errors = {}
  const required = (k: string) => { if (!get(k)) errors[k] = 'contact.err.required' }

  required('name')
  if (!get('email')) errors.email = 'contact.err.required'
  else if (!EMAIL_RE.test(get('email'))) errors.email = 'contact.err.email'

  if (type === 'general') {
    required('message')
    return errors
  }

  required('seriesName')
  required('game')
  if (get('seriesWebsite') && !looksLikeUrl(get('seriesWebsite'))) errors.seriesWebsite = 'contact.err.url'
  if (!get('startDate')) errors.startDate = 'contact.err.required'
  else if (Number.isNaN(new Date(get('startDate')).getTime())) errors.startDate = 'contact.err.date'
  required('startTime')
  if (!get('raceCount')) errors.raceCount = 'contact.err.select'
  const h = Number(get('windowHours') || 0), m = Number(get('windowMinutes') || 0)
  if (get('windowHours') === '' && get('windowMinutes') === '') errors.windowHours = 'contact.err.select'
  else if (h * 60 + m < 15) errors.windowHours = 'contact.err.window'
  return errors
}

export function ContactForm({ lang }: { lang: Lang }) {
  const [formType, setFormType] = useState<FormType>('broadcast')
  const [submitted, setSubmitted] = useState<FormType | null>(null)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const t = getT(lang)

  function switchForm(next: FormType) {
    if (next === formType) return
    setFormType(next)
    setErrors({})
    setFormError(null)
  }

  /** Clear a field's error as soon as the user edits it. */
  function clearError(id: string) {
    if (!errors[id]) return
    setErrors((prev) => { const n = { ...prev }; delete n[id]; return n })
  }

  function focusFirstError(errs: Errors) {
    const first = Object.keys(errs)[0]
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)
    el?.focus()
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    const clientErrors = validate(formType, data)
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      setFormError(t('contact.err.summary'))
      focusFirstError(clientErrors)
      return
    }
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setFormError(t('contact.err.turnstile'))
      return
    }

    setSending(true)
    const payload: Record<string, unknown> = { type: formType, lang, 'cf-turnstile-response': turnstileToken }
    data.forEach((value, key) => { payload[key] = typeof value === 'string' ? value : '' })

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json().catch(() => ({}))

      if (!res.ok) {
        // Field-level errors from the server (should not happen after client validation, but be honest if it does)
        if (result.fields && typeof result.fields === 'object') {
          const errs: Errors = {}
          for (const [k, v] of Object.entries(result.fields as Record<string, string>)) {
            errs[k] = (v in SERVER_ERRORS ? SERVER_ERRORS[v] : 'contact.err.required')
          }
          setErrors(errs)
          focusFirstError(errs)
        }
        const key = SERVER_ERRORS[result.code as string] ?? 'contact.err.server'
        setFormError(t(key))
        if (result.code?.startsWith('turnstile')) { turnstileRef.current?.reset(); setTurnstileToken(null) }
        return
      }

      // If SMTP is not configured, open mailto as fallback
      if (result.method === 'mailto' && result.mailto) {
        const { to, subject, body } = result.mailto
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      }

      setSubmitted(formType)
      setErrors({})
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } catch {
      setFormError(t('contact.err.server'))
    } finally {
      setSending(false)
    }
  }

  const TABS: { id: FormType; labelKey: TranslationKey }[] = [
    { id: 'broadcast', labelKey: 'contact.tab.broadcast' },
    { id: 'general',   labelKey: 'contact.tab.general' },
  ]

  const fieldProps = { t, errors, clearError }

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
                <a href="mailto:contact@racespot.tv" className="text-rs-yellow hover:text-white transition-colors text-sm">
                  contact@racespot.tv
                </a>
              </div>
              <div>
                <p className={LABEL}>{t('contact.location')}</p>
                <p className="text-white/80 text-sm">{t('contact.locationValue')}</p>
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
                          ${active ? 'bg-rs-yellow text-rs-black' : 'text-rs-muted hover:text-white hover:bg-rs-gray'}`}
                      >
                        {t(tab.labelKey)}
                      </button>
                    )
                  })}
                </div>

                <form
                  key={formType}
                  ref={formRef}
                  id={`panel-${formType}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${formType}`}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
                  {formType === 'broadcast' ? <BroadcastFields {...fieldProps} /> : <GeneralFields {...fieldProps} />}

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
                      onSuccess={(token) => { setTurnstileToken(token); if (formError === t('contact.err.turnstile')) setFormError(null) }}
                      onError={() => setTurnstileToken(null)}
                      onExpire={() => setTurnstileToken(null)}
                      options={{ theme: 'dark', language: lang }}
                    />
                  )}

                  {formError && (
                    <div role="alert" aria-live="assertive" className="rounded-rs border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {formError}
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

interface FieldCtx { t: T; errors: Errors; clearError: (id: string) => void }

function Field({
  id, label, required, hint, ctx, children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  ctx: FieldCtx
  children: (a: { invalid: boolean; describedBy?: string; className: string; onChange: () => void }) => ReactNode
}) {
  const { t, errors, clearError } = ctx
  const errKey = errors[id]
  const invalid = Boolean(errKey)
  const errId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [invalid ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
  const className = `${INPUT} ${invalid ? 'border-red-500/70 focus:border-red-400' : 'border-rs-border'}`

  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
        <span className={`ml-1.5 normal-case tracking-normal font-sans font-normal ${required ? 'text-rs-yellow/80' : 'text-rs-muted/60'}`}>
          {required ? '*' : `(${t('contact.optional').toLowerCase()})`}
        </span>
      </label>
      {children({ invalid, describedBy, className, onChange: () => clearError(id) })}
      {invalid && (
        <p id={errId} role="alert" className="text-[12px] text-red-400 mt-1.5 flex items-start gap-1.5">
          <svg className="h-3.5 w-3.5 mt-[1px] shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5h1.5v4.5h-1.5V4.5Zm.75 7.25a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
          </svg>
          {t(errKey)}
        </p>
      )}
      {hint && !invalid && <p id={hintId} className="text-[11px] text-rs-muted/70 mt-1.5">{hint}</p>}
    </div>
  )
}

/** Native <select> styled like the inputs, with our own chevron. */
function Select({
  id, name, className, invalid, describedBy, onChange, children, ariaLabel,
}: {
  id?: string
  name: string
  className: string
  invalid: boolean
  describedBy?: string
  onChange: () => void
  children: ReactNode
  ariaLabel?: string
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        defaultValue=""
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={ariaLabel}
        onChange={onChange}
        className={`${className} appearance-none pr-10 cursor-pointer`}
      >
        {children}
      </select>
      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-rs-muted" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M6 8.5 1.5 4h9L6 8.5Z" />
      </svg>
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

function BroadcastFields(ctx: FieldCtx) {
  const { t } = ctx
  const hours = Array.from({ length: WINDOW_HOURS_MAX + 1 }, (_, i) => i)
  const races = Array.from({ length: RACE_COUNT_MAX }, (_, i) => i + 1)

  return (
    <>
      <SectionLabel>{t('contact.bc.contactSection')}</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="name" label={t('contact.name')} required ctx={ctx}>
          {(a) => <input id="name" name="name" type="text" autoComplete="name" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} placeholder={t('contact.namePlaceholder')} />}
        </Field>
        <Field id="email" label={t('contact.email')} required ctx={ctx}>
          {(a) => <input id="email" name="email" type="email" autoComplete="email" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} placeholder={t('contact.emailPlaceholder')} />}
        </Field>
      </div>
      <Field id="businessAddress" label={t('contact.bc.businessAddress')} ctx={ctx}>
        {(a) => <textarea id="businessAddress" name="businessAddress" rows={3} autoComplete="street-address" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={`${a.className} resize-none`} placeholder={t('contact.bc.businessAddressPlaceholder')} />}
      </Field>

      <SectionLabel>{t('contact.bc.seriesSection')}</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="seriesName" label={t('contact.bc.seriesName')} required ctx={ctx}>
          {(a) => <input id="seriesName" name="seriesName" type="text" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} placeholder={t('contact.bc.seriesNamePlaceholder')} />}
        </Field>
        <Field id="seriesWebsite" label={t('contact.bc.seriesWebsite')} ctx={ctx}>
          {(a) => <input id="seriesWebsite" name="seriesWebsite" type="text" inputMode="url" autoComplete="url" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} placeholder="https://" />}
        </Field>
      </div>
      <Field id="game" label={t('contact.bc.game')} required ctx={ctx}>
        {(a) => <input id="game" name="game" type="text" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} placeholder={t('contact.bc.gamePlaceholder')} />}
      </Field>

      <SectionLabel>{t('contact.bc.scheduleSection')}</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="startDate" label={t('contact.bc.startDate')} required ctx={ctx}>
          {(a) => <input id="startDate" name="startDate" type="date" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} />}
        </Field>
        <Field id="startTime" label={t('contact.bc.startTime')} required hint={t('contact.bc.startTimeHint')} ctx={ctx}>
          {(a) => <input id="startTime" name="startTime" type="time" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} />}
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="raceCount" label={t('contact.bc.raceCount')} required ctx={ctx}>
          {(a) => (
            <Select id="raceCount" name="raceCount" {...a}>
              <option value="" disabled>{t('contact.selectPlaceholder')}</option>
              {races.map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          )}
        </Field>
        <Field id="windowHours" label={t('contact.bc.broadcastWindow')} required hint={t('contact.bc.windowHint')} ctx={ctx}>
          {(a) => (
            <div className="grid grid-cols-2 gap-3">
              <Select id="windowHours" name="windowHours" ariaLabel={t('contact.bc.hours')} {...a}>
                <option value="" disabled>{t('contact.bc.hours')}</option>
                {hours.map((h) => <option key={h} value={h}>{h} {t('contact.bc.hoursShort')}</option>)}
              </Select>
              <Select name="windowMinutes" ariaLabel={t('contact.bc.minutes')} {...a}>
                <option value="" disabled>{t('contact.bc.minutes')}</option>
                {WINDOW_MINUTE_STEPS.map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')} {t('contact.bc.minutesShort')}</option>)}
              </Select>
            </div>
          )}
        </Field>
      </div>
      <Field id="additionalInfo" label={t('contact.bc.additionalInfo')} ctx={ctx}>
        {(a) => <textarea id="additionalInfo" name="additionalInfo" rows={5} onChange={a.onChange} className={`${a.className} resize-none`} placeholder={t('contact.bc.additionalInfoPlaceholder')} />}
      </Field>
    </>
  )
}

// ─── General inquiry (the original form) ─────────────────────

function GeneralFields(ctx: FieldCtx) {
  const { t } = ctx
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="name" label={t('contact.name')} required ctx={ctx}>
          {(a) => <input id="name" name="name" type="text" autoComplete="name" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} placeholder={t('contact.namePlaceholder')} />}
        </Field>
        <Field id="email" label={t('contact.email')} required ctx={ctx}>
          {(a) => <input id="email" name="email" type="email" autoComplete="email" aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={a.className} placeholder={t('contact.emailPlaceholder')} />}
        </Field>
      </div>
      <Field id="subject" label={t('contact.subject')} ctx={ctx}>
        {(a) => <input id="subject" name="subject" type="text" onChange={a.onChange} className={a.className} placeholder={t('contact.subjectPlaceholder')} />}
      </Field>
      <Field id="message" label={t('contact.message')} required ctx={ctx}>
        {(a) => <textarea id="message" name="message" rows={6} aria-invalid={a.invalid || undefined} aria-describedby={a.describedBy} onChange={a.onChange} className={`${a.className} resize-none`} placeholder={t('contact.messagePlaceholder')} />}
      </Field>
    </>
  )
}
