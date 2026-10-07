/**
 * Appgineering Live Timing — the frame format, read.
 *
 * ATVO (Appgineering's TV overlay for iRacing) streams a session's timing to
 * timing-api.appgineering.com; their web app subscribes to a room over SignalR
 * (`/data`, `SubscribeAsync(roomId)`) and receives `SendFrame` messages. Each
 * frame is `{ type, time, segments: [{ number, offset }], length, value }`,
 * `value` being base64 of a little-endian binary block, and each segment number
 * a field of that frame type. This file reproduces the reader and the fields
 * our board shows; everything else (images, track outlines, sector colours) is
 * skipped.
 *
 * Undocumented — read from their client bundle on 2026-10-07, and used with
 * Jürgen's decision to build on it rather than wait for an agreement. If
 * Appgineering changes the format, decoding throws or yields nothing, the
 * relay marks the room broken, and the site falls back to their own page
 * (components/live/TimingPanel.tsx). Nothing here may crash the server.
 */

// ─── Frame types (their enum Ae) ────────────────────────────

export const FRAME = {
  CAR_DATA: 2,
  CLASS_DATA: 3,
  ENTRY_DATA: 4,
  ENTRY_TIMING: 5,
  TRACK: 6,
  SESSION: 7,
  WEATHER: 8,
  IMAGE: 9,
  SESSION_EVENT: 10,
  REMOVE_ENTRY: 11,
  RESET: 12,
  LAP: 13,
  PIT_STOP: 14,
  RACE_CONTROL_INCIDENT: 15,
  RACE_CONTROL_MESSAGE: 16,
  END_UPDATE_CYCLE: 1024,
  INITIALIZATION_COMPLETE: 1025,
  END_FRAME: 2147483647,
} as const

export interface RawFrame {
  type: number
  time?: unknown
  segments: { number: number; offset: number }[]
  length: number
  value: string
}

// ─── Reader (their class ji) ────────────────────────────────

class Reader {
  private buf: Uint8Array
  private view: DataView
  private i = 0
  constructor(buf: Uint8Array) {
    this.buf = buf
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  }
  seek(at: number) { this.i = at }
  private need(n: number) {
    if (this.i + n > this.buf.byteLength) throw new Error(`frame too short: need ${n} at ${this.i}`)
  }
  byte() { this.need(1); return this.view.getUint8(this.i++) }
  bool() { return this.byte() === 1 }
  int32() { this.need(4); const v = this.view.getInt32(this.i, true); this.i += 4; return v }
  uint32() { this.need(4); const v = this.view.getUint32(this.i, true); this.i += 4; return v }
  float() { this.need(4); const v = this.view.getFloat32(this.i, true); this.i += 4; return v }
  double() { this.need(8); const v = this.view.getFloat64(this.i, true); this.i += 8; return v }
  /** .NET BinaryWriter string: 7-bit length prefix, then UTF-8 */
  string() {
    let len = 0
    let shift = 0
    let b: number
    do {
      b = this.byte()
      len |= (b & 0x7f) << shift
      shift += 7
    } while (b & 0x80)
    this.need(len)
    const s = new TextDecoder().decode(this.buf.subarray(this.i, this.i + len))
    this.i += len
    return s
  }
}

/** Calls `read` with the reader positioned at segment `n`, if the frame has it */
type With = (n: number, read: (r: Reader) => void) => void

function open(frame: RawFrame): With {
  const bytes = Uint8Array.from(Buffer.from(frame.value, 'base64'))
  if (bytes.byteLength !== frame.length) throw new Error('frame length mismatch')
  const r = new Reader(bytes)
  return (n, read) => {
    const seg = frame.segments.find((s) => s.number === n)
    if (!seg) return
    r.seek(seg.offset)
    read(r)
  }
}

// ─── State ──────────────────────────────────────────────────

export interface Entry {
  entryId: number
  driverName?: string
  teamName?: string
  isTeam?: boolean
  carNumber?: string
  classId?: number
}

export interface EntryTiming {
  position?: number
  classPosition?: number
  lap?: number
  pitStopCount?: number
  lastLap?: number
  bestLap?: number
  gap?: number
  gapLaps?: number
  interval?: number
  intervalLaps?: number
  inPitLane?: boolean
  inPitBox?: boolean
  notInWorld?: boolean
  disqualified?: boolean
}

export interface Session {
  sessionType?: number
  sessionState?: number
  sessionName?: string
  lapsRemaining?: number
  lapsCompleted?: number
  lapsTotal?: number
  sessionTimeRemaining?: number
  sessionLengthDecidedByLaps?: boolean
  flags?: number
  fastestLapTime?: number
  fastestLapEntryId?: number
  fastestLapDriverName?: string
}

export interface TimingState {
  classes: Map<number, { name?: string; color?: string }>
  entries: Map<number, Entry>
  timing: Map<number, EntryTiming>
  session: Session
  track: { name?: string; city?: string; country?: string }
  weather: { airC?: number; trackC?: number }
  /** Bumped at every END_UPDATE_CYCLE: a consistent picture exists */
  cycle: number
}

export function emptyState(): TimingState {
  return { classes: new Map(), entries: new Map(), timing: new Map(), session: {}, track: {}, weather: {}, cycle: 0 }
}

/** ARGB int → #rrggbb */
function colour(v: number): string {
  return `#${((v >>> 0) & 0xffffff).toString(16).padStart(6, '0')}`
}

/** Applies one frame to the state. Throws on a frame it cannot read. */
export function applyFrame(state: TimingState, frame: RawFrame): void {
  switch (frame.type) {
    case FRAME.CLASS_DATA: {
      const w = open(frame)
      let id: number | undefined
      const c: { name?: string; color?: string } = {}
      w(0, (r) => (id = r.int32()))
      w(1, (r) => (c.name = r.string()))
      w(2, (r) => (c.color = colour(r.int32())))
      if (id !== undefined) state.classes.set(id, { ...state.classes.get(id), ...c })
      return
    }
    case FRAME.ENTRY_DATA: {
      const w = open(frame)
      const e: Partial<Entry> = {}
      w(0, (r) => (e.entryId = r.int32()))
      w(2, (r) => (e.driverName = r.string()))
      w(3, (r) => (e.teamName = r.string()))
      w(4, (r) => (e.isTeam = r.bool()))
      w(6, (r) => (e.carNumber = r.string()))
      w(7, (r) => (e.classId = r.int32()))
      if (e.entryId !== undefined) state.entries.set(e.entryId, { ...state.entries.get(e.entryId), ...e } as Entry)
      return
    }
    case FRAME.ENTRY_TIMING: {
      const w = open(frame)
      let id: number | undefined
      const t: EntryTiming = {}
      w(0, (r) => (id = r.int32()))
      w(1, (r) => (t.position = r.int32()))
      w(2, (r) => (t.classPosition = r.int32()))
      w(3, (r) => (t.lap = r.int32()))
      w(4, (r) => (t.pitStopCount = r.int32()))
      w(15, (r) => (t.lastLap = r.float()))
      w(16, (r) => (t.bestLap = r.float()))
      w(27, (r) => (t.gap = r.float()))
      w(28, (r) => (t.gapLaps = r.int32()))
      w(29, (r) => (t.interval = r.float()))
      w(30, (r) => (t.intervalLaps = r.int32()))
      w(31, (r) => (t.inPitBox = r.bool()))
      w(32, (r) => (t.inPitLane = r.bool()))
      w(33, (r) => (t.notInWorld = r.bool()))
      w(36, (r) => (t.disqualified = r.bool()))
      if (id !== undefined) state.timing.set(id, { ...state.timing.get(id), ...t })
      return
    }
    case FRAME.TRACK: {
      const w = open(frame)
      w(1, (r) => (state.track.name = r.string()))
      w(2, (r) => (state.track.city = r.string()))
      w(3, (r) => (state.track.country = r.string()))
      return
    }
    case FRAME.SESSION: {
      const w = open(frame)
      const s = state.session
      w(1, (r) => (s.sessionType = r.int32()))
      w(3, (r) => (s.sessionState = r.int32()))
      w(4, (r) => (s.lapsRemaining = r.int32()))
      w(5, (r) => (s.lapsCompleted = r.int32()))
      w(6, (r) => (s.lapsTotal = r.int32()))
      w(8, (r) => (s.sessionTimeRemaining = r.float()))
      w(9, (r) => (s.flags = r.uint32()))
      w(11, (r) => (s.sessionName = r.string()))
      w(12, (r) => (s.sessionLengthDecidedByLaps = r.bool()))
      w(13, (r) => (s.fastestLapTime = r.float()))
      w(14, (r) => (s.fastestLapEntryId = r.int32()))
      w(15, (r) => (s.fastestLapDriverName = r.string()))
      return
    }
    case FRAME.WEATHER: {
      const w = open(frame)
      w(2, (r) => (state.weather.trackC = r.float()))
      w(3, (r) => (state.weather.airC = r.float()))
      return
    }
    case FRAME.REMOVE_ENTRY: {
      const w = open(frame)
      w(0, (r) => {
        const id = r.int32()
        state.entries.delete(id)
        state.timing.delete(id)
      })
      return
    }
    case FRAME.RESET: {
      const w = open(frame)
      w(0, (r) => {
        if (r.bool()) {
          state.entries.clear()
          state.timing.clear()
        }
      })
      w(2, (r) => {
        if (r.bool()) state.classes.clear()
      })
      return
    }
    case FRAME.END_UPDATE_CYCLE:
    case FRAME.INITIALIZATION_COMPLETE:
      state.cycle++
      return
    default:
      // Cars, images, laps, pit stops, events, race control: not on our board.
      return
  }
}

// ─── What the board gets ────────────────────────────────────

export type Flag = 'green' | 'yellow' | 'white' | 'checkered' | 'red' | 'none'

/** Session state (their enum Ee) */
const STATE = { PARADE_LAPS: 3, RACING: 4, CHECKERED: 5, COOL_DOWN: 6 }
/** iRacing session flags, as their client reads them */
const F = { CHECKERED: 0x1, WHITE: 0x2, RED: 0x10, ONE_TO_GREEN: 0x200, CAUTION: 0x4000, CAUTION_WAVING: 0x8000 }

/** The flag their header shows, by the same rules (their pipe Ei), plus red */
export function flagOf(flags: number | undefined, state: number | undefined): Flag {
  if (!flags || state == null) return 'none'
  if (state === STATE.PARADE_LAPS) return 'yellow'
  if (flags & F.CHECKERED || state === STATE.CHECKERED || state === STATE.COOL_DOWN) return 'checkered'
  if (flags & F.RED) return 'red'
  if (flags & F.WHITE) return 'white'
  if (state === STATE.RACING && flags & (F.CAUTION | F.CAUTION_WAVING | F.ONE_TO_GREEN)) return 'yellow'
  return 'green'
}

export interface BoardRow {
  id: number
  pos: number
  classPos: number | null
  num: string
  name: string
  team: string | null
  classId: number | null
  lap: number | null
  gap: number | null
  gapLaps: number
  interval: number | null
  intervalLaps: number
  last: number | null
  best: number | null
  pits: number
  inPit: boolean
  out: boolean
}

export interface Board {
  session: {
    name: string | null
    isRace: boolean
    flag: Flag
    timeRemaining: number | null
    lap: number | null
    lapsTotal: number | null
    byLaps: boolean
    fastest: { time: number; name: string | null; entryId: number | null } | null
  }
  track: string | null
  airC: number | null
  trackC: number | null
  classes: { id: number; name: string; color: string | null }[]
  rows: BoardRow[]
}

const lapTime = (v: number | undefined) => (v !== undefined && v > 0 && v < 3600 ? v : null)

/** iRacing reports "unlimited" as a week of seconds or more */
const UNLIMITED_S = 86_400 * 2

export function toBoard(state: TimingState): Board {
  const s = state.session
  const rows: BoardRow[] = []
  for (const [id, e] of state.entries) {
    const t = state.timing.get(id) ?? {}
    if (!t.position || t.position < 1) continue // not classified yet (spectators, pace car)
    rows.push({
      id,
      pos: t.position,
      classPos: t.classPosition && t.classPosition > 0 ? t.classPosition : null,
      num: e.carNumber ?? '',
      name: (e.isTeam && e.teamName ? e.teamName : e.driverName) ?? '',
      team: e.isTeam ? (e.driverName ?? null) : (e.teamName || null),
      classId: e.classId ?? null,
      lap: t.lap ?? null,
      gap: t.gap !== undefined && t.gap >= 0 ? t.gap : null,
      gapLaps: t.gapLaps ?? 0,
      interval: t.interval !== undefined && t.interval >= 0 ? t.interval : null,
      intervalLaps: t.intervalLaps ?? 0,
      last: lapTime(t.lastLap),
      best: lapTime(t.bestLap),
      pits: t.pitStopCount ?? 0,
      inPit: Boolean(t.inPitLane || t.inPitBox),
      out: Boolean(t.notInWorld || t.disqualified),
    })
  }
  rows.sort((a, b) => a.pos - b.pos)

  const total = s.lapsTotal !== undefined && s.lapsTotal > 0 && s.lapsTotal < 100_000 ? s.lapsTotal : null
  const remaining = s.sessionTimeRemaining !== undefined && s.sessionTimeRemaining >= 0 && s.sessionTimeRemaining < UNLIMITED_S
    ? s.sessionTimeRemaining
    : null
  const fastest = lapTime(s.fastestLapTime)

  return {
    session: {
      name: s.sessionName || null,
      isRace: s.sessionType === 4,
      flag: flagOf(s.flags, s.sessionState),
      timeRemaining: remaining,
      lap: s.lapsCompleted !== undefined ? (total ? Math.min(s.lapsCompleted + 1, total) : s.lapsCompleted + 1) : null,
      lapsTotal: total,
      byLaps: Boolean(s.sessionLengthDecidedByLaps),
      fastest: fastest ? { time: fastest, name: s.fastestLapDriverName || null, entryId: s.fastestLapEntryId ?? null } : null,
    },
    track: state.track.name || null,
    airC: state.weather.airC ?? null,
    trackC: state.weather.trackC ?? null,
    classes: [...state.classes].map(([id, c]) => ({ id, name: c.name ?? '', color: c.color ?? null })),
    rows,
  }
}
