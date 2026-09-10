import { NextResponse } from 'next/server'

/**
 * POST /api/contact
 *
 * Two form types share this endpoint, selected by `body.type`:
 *   - 'general'   — name, email, subject?, message
 *   - 'broadcast' — structured quote request for a series/event broadcast
 *
 * Both pass through the same honeypot, Turnstile check and rate limit.
 * Delivery: SMTP when configured, otherwise a mailto fallback for the client.
 */

// Rate limiting: simple in-memory store (one container → fine)
const submissions = new Map<string, number[]>()
const RATE_LIMIT = 5 // max submissions per IP
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = submissions.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW)
  submissions.set(ip, recent)
  return recent.length >= RATE_LIMIT
}

function recordSubmission(ip: string) {
  const timestamps = submissions.get(ip) || []
  timestamps.push(Date.now())
  submissions.set(ip, timestamps)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Keep user input as a single trimmed string, bounded so a bot can't send megabytes. */
function str(v: unknown, max = 5000): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Form definitions ────────────────────────────────────────

type FormType = 'general' | 'broadcast'

interface Row { label: string; value: string; multiline?: boolean }

/** Field name → error code; the client maps codes to translated messages. */
type FieldErrors = Record<string, 'required' | 'email' | 'url' | 'select' | 'window' | 'date'>
interface Invalid { error: string; fields: FieldErrors }

interface Prepared {
  /** Subject line for the internal notification */
  subject: string
  /** Title shown in the internal notification header */
  heading: string
  /** Ordered rows for both the text and HTML rendering */
  rows: Row[]
  /** Free text block shown after the rows (message / additional info) */
  freeText?: { label: string; value: string }
  /** Plain-text body for the mailto fallback and the confirmation copy */
  summary: string
}

function prepareGeneral(body: Record<string, unknown>): Prepared | Invalid {
  const name = str(body.name, 200)
  const email = str(body.email, 200)
  const subject = str(body.subject, 300)
  const message = str(body.message)

  const fields: FieldErrors = {}
  if (!name) fields.name = 'required'
  if (!email) fields.email = 'required'
  else if (!EMAIL_RE.test(email)) fields.email = 'email'
  if (!message) fields.message = 'required'
  if (Object.keys(fields).length) return { error: 'Please check the highlighted fields.', fields }

  return {
    subject: `Website Form: ${subject || 'New Inquiry'}`,
    heading: 'New Contact Form Submission',
    rows: [
      { label: 'Name', value: name },
      { label: 'Email', value: email },
      { label: 'Subject', value: subject || 'N/A' },
    ],
    freeText: { label: 'Message', value: message },
    summary: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\n\n${message}`,
  }
}

// Must match the dropdowns in src/components/sections/ContactForm.tsx
const RACE_COUNT_MAX = 30
const WINDOW_HOURS_MAX = 12
const WINDOW_MINUTE_STEPS = new Set([0, 15, 30, 45])

/** Accepts "example.com" or "https://example.com"; returns a normalised https URL or null. */
function normaliseUrl(v: string): string | null {
  if (!v) return null
  try {
    const u = new URL(/^[a-z]+:\/\//i.test(v) ? v : `https://${v}`)
    if (!/^https?:$/.test(u.protocol) || !/\.[a-z]{2,}$/i.test(u.hostname)) return null
    return u.toString()
  } catch {
    return null
  }
}

function prepareBroadcast(body: Record<string, unknown>): Prepared | Invalid {
  const name = str(body.name, 200)
  const email = str(body.email, 200)
  const businessAddress = str(body.businessAddress, 1000)   // optional
  const seriesName = str(body.seriesName, 300)
  const websiteRaw = str(body.seriesWebsite, 500)           // optional
  const game = str(body.game, 300)
  const startDate = str(body.startDate, 50)
  const startTime = str(body.startTime, 50)
  const raceCount = Number(str(body.raceCount, 10))
  const windowHours = Number(str(body.windowHours, 5))
  const windowMinutes = Number(str(body.windowMinutes, 5) || '0')
  const additionalInfo = str(body.additionalInfo)

  const fields: FieldErrors = {}
  if (!name) fields.name = 'required'
  if (!email) fields.email = 'required'
  else if (!EMAIL_RE.test(email)) fields.email = 'email'
  if (!seriesName) fields.seriesName = 'required'
  if (!game) fields.game = 'required'
  const website = normaliseUrl(websiteRaw)
  if (websiteRaw && !website) fields.seriesWebsite = 'url'
  if (!startDate) fields.startDate = 'required'
  else if (Number.isNaN(new Date(startDate).getTime())) fields.startDate = 'date'
  if (!startTime) fields.startTime = 'required'
  if (!Number.isInteger(raceCount) || raceCount < 1 || raceCount > RACE_COUNT_MAX) fields.raceCount = 'select'
  const hoursOk = Number.isInteger(windowHours) && windowHours >= 0 && windowHours <= WINDOW_HOURS_MAX
  const minutesOk = WINDOW_MINUTE_STEPS.has(windowMinutes)
  if (!hoursOk || !minutesOk) fields.windowHours = 'select'
  else if (windowHours * 60 + windowMinutes < 15) fields.windowHours = 'window'
  if (Object.keys(fields).length) return { error: 'Please check the highlighted fields.', fields }

  const duration = `${windowHours} h ${String(windowMinutes).padStart(2, '0')} min`

  const rows: Row[] = [
    { label: 'Contact', value: name },
    { label: 'Email', value: email },
    ...(businessAddress ? [{ label: 'Business Address', value: businessAddress, multiline: true }] : []),
    { label: 'Series', value: seriesName },
    ...(website ? [{ label: 'Website', value: website }] : []),
    { label: 'Game', value: game },
    { label: 'Est. Start', value: `${startDate} · ${startTime} (sender local time)` },
    { label: 'Races', value: String(raceCount) },
    { label: 'Broadcast Window', value: `${duration} per race` },
  ]

  const summary =
    rows.map((r) => `${r.label}: ${r.value}`).join('\n') +
    (additionalInfo ? `\n\nAdditional information:\n${additionalInfo}` : '')

  return {
    subject: `Broadcast Request: ${seriesName}`,
    heading: 'New Broadcast Request',
    rows,
    freeText: additionalInfo ? { label: 'Additional Information', value: additionalInfo } : undefined,
    summary,
  }
}

// ─── Rendering ───────────────────────────────────────────────

const HTML_HEAD = `<div style="background: #0A0A0A; padding: 20px 24px; border-bottom: 3px solid #F5C000;">`
const HTML_FOOT = `<div style="background: #0A0A0A; padding: 12px 24px; text-align: center;">`

function renderInternalHtml(p: Prepared): string {
  const rows = p.rows.map((r) => {
    const value = r.label === 'Email'
      ? `<a href="mailto:${escapeHtml(r.value)}" style="color: #F5C000;">${escapeHtml(r.value)}</a>`
      : r.label === 'Website' && /^https?:\/\//i.test(r.value)
        ? `<a href="${escapeHtml(r.value)}" style="color: #F5C000;">${escapeHtml(r.value)}</a>`
        : `<span style="color: #fff; ${r.multiline ? 'white-space: pre-wrap;' : ''}">${escapeHtml(r.value)}</span>`
    return `<tr><td style="padding: 8px 12px 8px 0; color: #999; width: 150px; vertical-align: top;">${escapeHtml(r.label)}:</td><td style="padding: 8px 0;">${value}</td></tr>`
  }).join('')

  const free = p.freeText
    ? `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #333;">
         <p style="color: #999; margin: 0 0 8px;">${escapeHtml(p.freeText.label)}:</p>
         <p style="color: #fff; white-space: pre-wrap; margin: 0;">${escapeHtml(p.freeText.value)}</p>
       </div>`
    : ''

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      ${HTML_HEAD}<h2 style="color: #F5C000; margin: 0; font-size: 18px;">${escapeHtml(p.heading)}</h2></div>
      <div style="background: #1A1A1A; padding: 24px; color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse;">${rows}</table>
        ${free}
      </div>
      ${HTML_FOOT}<p style="color: #666; font-size: 12px; margin: 0;">Sent via racespot.tv contact form</p></div>
    </div>`
}

function renderConfirmationHtml(name: string, p: Prepared): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      ${HTML_HEAD}<h2 style="color: #F5C000; margin: 0; font-size: 18px;">Thank you for your message!</h2></div>
      <div style="background: #1A1A1A; padding: 24px; color: #ffffff;">
        <p style="color: #ccc; margin: 0 0 16px;">Hi ${escapeHtml(name)},</p>
        <p style="color: #ccc; margin: 0 0 16px;">Thank you for reaching out to Racespot.tv! Here is a copy of what you sent us:</p>
        <div style="background: #111; border-left: 3px solid #F5C000; padding: 16px; margin: 16px 0;">
          <p style="color: #fff; white-space: pre-wrap; margin: 0;">${escapeHtml(p.summary)}</p>
        </div>
        <p style="color: #ccc; margin: 16px 0 0;">We'll get back to you as soon as possible.</p>
        <p style="color: #999; margin: 16px 0 0;">Best regards,<br>The Racespot Team</p>
      </div>
      ${HTML_FOOT}<p style="color: #666; font-size: 12px; margin: 0;"><a href="https://racespot.tv" style="color: #F5C000;">racespot.tv</a> &middot; <a href="mailto:contact@racespot.tv" style="color: #F5C000;">contact@racespot.tv</a></p></div>
    </div>`
}

// ─── Handler ─────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.', code: 'rate_limited' }, { status: 429 })
    }

    const body = (await request.json()) as Record<string, unknown>

    // Honeypot check — bots fill this hidden field, real users don't.
    // Return success so the bot doesn't know it was caught.
    if (body.company) {
      return NextResponse.json({ success: true, method: 'smtp' })
    }

    // Turnstile verification
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      const turnstileToken = body['cf-turnstile-response']
      if (typeof turnstileToken !== 'string' || !turnstileToken) {
        return NextResponse.json({ error: 'Please complete the security check.', code: 'turnstile_missing' }, { status: 400 })
      }

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: turnstileSecret, response: turnstileToken, remoteip: ip }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return NextResponse.json({ error: 'Security verification failed. Please try again.', code: 'turnstile_failed' }, { status: 403 })
      }
    }

    const type: FormType = body.type === 'broadcast' ? 'broadcast' : 'general'
    const prepared = type === 'broadcast' ? prepareBroadcast(body) : prepareGeneral(body)
    if ('error' in prepared) {
      return NextResponse.json({ error: prepared.error, code: 'validation', fields: prepared.fields }, { status: 400 })
    }

    const name = str(body.name, 200)
    const email = str(body.email, 200)

    // Try SMTP if configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = await import('nodemailer')

      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.office365.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // STARTTLS on 587
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })

      // Internal notification
      await transporter.sendMail({
        from: `"Racespot.tv Website" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || 'contact@racespot.tv',
        replyTo: `"${name.replace(/["\r\n]/g, '')}" <${email}>`,
        subject: prepared.subject.replace(/[\r\n]/g, ' '),
        text: `${prepared.heading}\n\n${prepared.summary}`,
        html: renderInternalHtml(prepared),
      })

      // Confirmation copy to the sender
      await transporter.sendMail({
        from: `"Racespot.tv" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Copy of your ${type === 'broadcast' ? 'broadcast request' : 'message'} to Racespot.tv`,
        text: `Hi ${name},\n\nThank you for reaching out to Racespot.tv! This is a copy of what you sent us:\n\n${prepared.summary}\n\n---\nWe'll get back to you as soon as possible.\n\nBest regards,\nThe Racespot Team\ncontact@racespot.tv\nhttps://racespot.tv`,
        html: renderConfirmationHtml(name, prepared),
      })

      recordSubmission(ip)
      return NextResponse.json({ success: true, method: 'smtp' })
    }

    // No SMTP configured — return mailto fallback info
    recordSubmission(ip)
    return NextResponse.json({
      success: true,
      method: 'mailto',
      mailto: {
        to: 'contact@racespot.tv',
        subject: prepared.subject,
        body: prepared.summary,
      },
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email us directly at contact@racespot.tv', code: 'send_failed' },
      { status: 500 }
    )
  }
}
