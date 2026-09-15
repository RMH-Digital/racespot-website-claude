/**
 * iCalendar (RFC 5545) output for the broadcast schedule.
 *
 * Two shapes come out of here, from the same events:
 *
 *   - a single `VEVENT` a reader downloads for one broadcast, and
 *   - the whole schedule as a feed a reader subscribes to once, after which
 *     their calendar keeps itself current.
 *
 * Both carry a `VALARM`, which is the actual reminder: the notification is
 * raised by the reader's own calendar, so nothing has to be stored here and
 * no address is ever collected. See docs/TODO.md for the email variant and
 * what it would cost.
 *
 * The format is fussier than it looks. Lines end CRLF, run no longer than 75
 * octets before folding, and four characters have to be escaped inside text
 * values — get any of it wrong and Apple Calendar silently imports nothing.
 */

export interface IcsEvent {
  /** Stable across regenerations: it is the identity of the event to a calendar. */
  id: string
  title: string
  description?: string
  /** ISO 8601 */
  start: string
  /** ISO 8601 */
  end: string
  url: string
}

/** Minutes before the start that the reader's calendar should speak up. */
const REMINDER_MINUTES = 15

/** `20260915T170000Z` — UTC, which every calendar understands without a VTIMEZONE. */
function stamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) throw new Error(`ics: unusable date ${iso}`)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** RFC 5545 §3.3.11: backslash, semicolon, comma and newlines carry meaning. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * Fold to 75 octets per line (§3.1). Counted in bytes, not characters — a
 * series name with an umlaut in it is longer than it looks — and never split
 * inside a multi-byte character, which would corrupt it.
 */
function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line

  const out: string[] = []
  let start = 0
  let limit = 75
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length)
    // Walk back off a continuation byte so a character stays whole.
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--
    out.push(bytes.subarray(start, end).toString('utf8'))
    start = end
    limit = 74 // continuation lines start with a space, which counts
  }
  return out.join('\r\n ')
}

function vevent(event: IcsEvent, now: string): string[] {
  const description = [event.description, event.url].filter(Boolean).join('\n\n')

  return [
    'BEGIN:VEVENT',
    `UID:${event.id}@racespot.tv`,
    `DTSTAMP:${now}`,
    `DTSTART:${stamp(event.start)}`,
    `DTEND:${stamp(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    ...(description ? [`DESCRIPTION:${escapeText(description)}`] : []),
    `URL:${event.url}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    `TRIGGER:-PT${REMINDER_MINUTES}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(event.title)}`,
    'END:VALARM',
    'END:VEVENT',
  ]
}

export interface IcsOptions {
  /** Shown as the calendar's name when the feed is subscribed to. */
  name?: string
  /** How often a subscribing client should come back. Feeds only. */
  refreshHours?: number
}

export function buildIcs(events: IcsEvent[], options: IcsOptions = {}): string {
  const now = stamp(new Date().toISOString())

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Racespot Media House GmbH//Broadcast Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  if (options.name) {
    lines.push(`X-WR-CALNAME:${escapeText(options.name)}`)
    lines.push(`NAME:${escapeText(options.name)}`)
  }

  if (options.refreshHours) {
    // Two spellings of the same wish: REFRESH-INTERVAL is the standard one,
    // X-PUBLISHED-TTL is what Outlook reads. Both are hints — Apple and Google
    // refresh on their own schedule regardless, usually within a few hours.
    lines.push(`REFRESH-INTERVAL;VALUE=DURATION:PT${options.refreshHours}H`)
    lines.push(`X-PUBLISHED-TTL:PT${options.refreshHours}H`)
  }

  for (const event of events) lines.push(...vevent(event, now))
  lines.push('END:VCALENDAR')

  return lines.map(fold).join('\r\n') + '\r\n'
}

/** A filename a reader will recognise in their downloads folder. */
export function icsFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `racespot-${slug || 'broadcast'}.ics`
}
