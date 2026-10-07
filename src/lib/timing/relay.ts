import 'server-only'
import * as signalR from '@microsoft/signalr'
import { applyFrame, emptyState, toBoard, type Board, type RawFrame, type TimingState } from './decode'

/**
 * One connection to Appgineering per room for the whole site, not one per
 * viewer.
 *
 * A viewer's board asks /api/timing/<room> every couple of seconds; the first
 * ask for a room connects this process and subscribes to it, every later ask
 * is answered from memory. A room nobody has asked about for two minutes is
 * unsubscribed and its connection closed. (One connection per room because a
 * frame does not name its room; Appgineering's own page shows one room.) Visitors never
 * talk to Appgineering themselves — their address stays with us (privacy
 * policy, live timing).
 *
 * Format and failure handling: lib/timing/decode.ts. A room whose frames
 * cannot be read is marked broken and the board falls back to Appgineering's
 * own page; the next subscribe tries again.
 */
const API = 'https://timing-api.appgineering.com'
const IDLE_MS = 2 * 60_000
const ROOM_INFO_MS = 5 * 60_000

interface Feed {
  roomId: string
  /** One connection per room: a frame does not say which room it is for */
  conn: signalR.HubConnection | null
  state: TimingState
  board: Board | null
  boardCycle: number
  lastAsked: number
  lastFrame: number
  broken: string | null
  eventName: string | null
}

const feeds = new Map<string, Feed>()
const roomIds = new Map<string, { id: string; eventName: string | null; at: number }>()
let sweeper: ReturnType<typeof setInterval> | null = null

async function roomInfo(name: string): Promise<{ id: string; eventName: string | null } | null> {
  const hit = roomIds.get(name)
  if (hit && Date.now() - hit.at < ROOM_INFO_MS) return hit
  const res = await fetch(`${API}/frontend/rooms/${encodeURIComponent(name)}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null
  const body = await res.json()
  if (typeof body?.roomId !== 'string') return null
  const info = { id: body.roomId as string, eventName: typeof body.raceEventName === 'string' ? body.raceEventName : null, at: Date.now() }
  roomIds.set(name, info)
  return info
}

async function subscribe(feed: Feed): Promise<void> {
  const c = new signalR.HubConnectionBuilder()
    .withUrl(`${API}/data`, { withCredentials: false })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build()
  c.on('SendFrame', (frame: RawFrame) => {
    if (feed.broken) return
    try {
      applyFrame(feed.state, frame)
      feed.lastFrame = Date.now()
    } catch (error) {
      feed.broken = error instanceof Error ? error.message : String(error)
      console.warn(`[timing] ${feed.roomId}: frame type ${frame.type} unreadable — ${feed.broken}`)
    }
  })
  // A subscription does not survive a reconnect: ask again, from scratch.
  c.onreconnected(() => {
    feed.state = emptyState()
    feed.board = null
    feed.boardCycle = -1
    void c.send('SubscribeAsync', feed.roomId).catch(() => {})
  })
  feed.conn = c
  await c.start()
  await c.send('SubscribeAsync', feed.roomId)
}

function close(feed: Feed) {
  const c = feed.conn
  feed.conn = null
  if (!c) return
  void c.send('UnsubscribeAsync', feed.roomId).catch(() => {}).finally(() => c.stop().catch(() => {}))
}

function sweep() {
  const now = Date.now()
  for (const [name, f] of feeds) {
    if (now - f.lastAsked < IDLE_MS) continue
    feeds.delete(name)
    close(f)
  }
  if (feeds.size === 0 && sweeper) {
    clearInterval(sweeper)
    sweeper = null
  }
}

export interface TimingAnswer {
  room: string
  /** Event name as ATVO set it for the room */
  event: string | null
  /** False while connecting, when nothing has arrived, or when the format broke */
  ok: boolean
  /** Why not ok — for the log and the fallback, never shown verbatim */
  reason?: 'connecting' | 'no-data' | 'broken' | 'unknown-room' | 'unreachable'
  board: Board | null
  /** Seconds since the last frame */
  age: number | null
}

/** The current board for a room, subscribing to it on first ask. */
export async function timingFor(room: string): Promise<TimingAnswer> {
  const now = Date.now()
  let feed = feeds.get(room)
  if (!feed) {
    const info = await roomInfo(room).catch(() => null)
    if (!info) return { room, event: null, ok: false, reason: 'unknown-room', board: null, age: null }
    feed = { roomId: info.id, conn: null, state: emptyState(), board: null, boardCycle: -1, lastAsked: now, lastFrame: 0, broken: null, eventName: info.eventName }
    feeds.set(room, feed)
    sweeper ??= setInterval(sweep, 30_000)
    try {
      await subscribe(feed)
    } catch (error) {
      feeds.delete(room)
      close(feed)
      console.warn(`[timing] ${room}: cannot connect — ${error instanceof Error ? error.message : error}`)
      return { room, event: null, ok: false, reason: 'unreachable', board: null, age: null }
    }
  }

  feed.lastAsked = now
  if (feed.broken) {
    // Try again from a clean slate on the next ask after this one.
    feeds.delete(room)
    close(feed)
    return { room, event: feed.eventName, ok: false, reason: 'broken', board: null, age: null }
  }
  // Rebuild the board only when a full update cycle has arrived since.
  if (feed.state.cycle !== feed.boardCycle) {
    feed.board = toBoard(feed.state)
    feed.boardCycle = feed.state.cycle
  }
  const age = feed.lastFrame ? Math.round((now - feed.lastFrame) / 1000) : null
  const hasRows = Boolean(feed.board && feed.board.rows.length)
  return {
    room,
    event: feed.eventName,
    ok: hasRows,
    reason: hasRows ? undefined : feed.lastFrame ? 'no-data' : 'connecting',
    board: feed.board,
    age,
  }
}

/**
 * Rooms ATVO is broadcasting to right now, by name — Appgineering lists them
 * on its home page. Null when the list could not be read.
 */
let liveMemo: { at: number; names: Set<string> | null } | null = null
const LIVE_LIST_MS = 60_000

export async function liveRoomNames(): Promise<Set<string> | null> {
  if (liveMemo && Date.now() - liveMemo.at < LIVE_LIST_MS) return liveMemo.names
  let names: Set<string> | null = null
  try {
    const res = await fetch(`${API}/frontend/home/live`, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    if (res.ok) {
      const list: unknown = await res.json()
      if (Array.isArray(list)) {
        names = new Set(
          list.flatMap((r) => {
            const o = r as Record<string, unknown>
            const name = o.roomName ?? (o.room as Record<string, unknown> | undefined)?.roomName ?? o.name
            return typeof name === 'string' ? [name.toLowerCase()] : []
          }),
        )
      }
    }
  } catch {
    names = null
  }
  liveMemo = { at: Date.now(), names }
  return names
}
