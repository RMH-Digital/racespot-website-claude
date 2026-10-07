'use client'

import { useEffect, useRef, useState } from 'react'
import type { Board, BoardRow, Flag } from '@/lib/timing/decode'
import type { TimingAnswer } from '@/lib/timing/relay'
import type { TranslationKey } from '@/lib/i18n/translations'
import { getT, type Lang } from '@/lib/i18n'

/**
 * Our own Live Timing board — the data of an Appgineering room, relayed by
 * our server (/api/timing/<room>, lib/timing/relay.ts), in the site's look.
 *
 * Two sizes: `compact` sits in the column beside the player (position,
 * number, driver, gap, last lap); `full` spreads under the player with
 * classes, laps, best lap and stops. Polls every two seconds while it is on
 * screen and the tab is visible — the server answers from memory, so a
 * hundred open boards cost one connection to Appgineering.
 *
 * When the relay has nothing to show after a while (format changed, room
 * unreachable), `onUnavailable` hands over to Appgineering's own page.
 */
const POLL_MS = 2000
/** Give up on our board when nothing usable arrived within this */
const GIVE_UP_MS = 25_000

type T = (k: TranslationKey) => string

export function TimingBoard({
  room,
  lang,
  size,
  onUnavailable,
}: {
  room: string
  lang: Lang
  size: 'compact' | 'full'
  onUnavailable: () => void
}) {
  const t = getT(lang)
  const [answer, setAnswer] = useState<TimingAnswer | null>(null)
  const [mode, setMode] = useState<'gap' | 'interval'>('gap')
  const since = useRef(0)
  const gaveUp = useRef(false)

  useEffect(() => {
    since.current = Date.now()
    gaveUp.current = false
    let stop = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = async () => {
      if (stop) return
      if (document.visibilityState === 'visible') {
        try {
          const res = await fetch(`/api/timing/${encodeURIComponent(room)}`, { cache: 'no-store' })
          const body: TimingAnswer = await res.json()
          if (stop) return
          setAnswer(body)
          const hopeless = body.reason === 'broken' || body.reason === 'unknown-room' || body.reason === 'unreachable'
          if (!body.ok && (hopeless || Date.now() - since.current > GIVE_UP_MS) && !gaveUp.current) {
            gaveUp.current = true
            onUnavailable()
            return
          }
          if (body.ok) since.current = Date.now()
        } catch {
          /* next tick */
        }
      }
      timer = setTimeout(tick, POLL_MS)
    }
    void tick()
    return () => {
      stop = true
      if (timer) clearTimeout(timer)
    }
  }, [room, onUnavailable])

  const board = answer?.ok ? answer.board : null
  if (!board) {
    return (
      <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-rs-muted" role="status">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-rs-border border-t-rs-yellow motion-reduce:animate-none" aria-hidden="true" />
        {answer?.reason === 'no-data' ? t('timing.noData') : t('timing.connecting')}
      </div>
    )
  }

  const multiClass = board.classes.length > 1
  const classOf = new Map(board.classes.map((c) => [c.id, c]))
  const fastestId = board.session.fastest?.entryId ?? null
  const full = size === 'full'

  return (
    <div className="flex h-full flex-col">
      <Header board={board} t={t} event={answer?.event ?? null} />

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        <table className="w-full border-collapse text-[13px] tabular-nums">
          <thead className="sticky top-0 z-10 bg-rs-dark text-[10px] font-display font-bold uppercase tracking-wider text-rs-muted">
            <tr className="border-b border-rs-border">
              <th scope="col" className="w-11 py-2 pl-3 pr-1 text-left">{t('timing.pos')}</th>
              {full && multiClass && <th scope="col" className="w-10 py-2 pr-1 text-left">{t('timing.classPos')}</th>}
              <th scope="col" className="w-12 py-2 text-left">#</th>
              <th scope="col" className="py-2 text-left">{t('timing.driver')}</th>
              {full && <th scope="col" className="w-14 py-2 pr-3 text-right">{t('timing.laps')}</th>}
              {full ? (
                <>
                  <th scope="col" className="w-20 py-2 pr-3 text-right">{t('timing.gap')}</th>
                  <th scope="col" className="w-20 py-2 pr-3 text-right">{t('timing.interval')}</th>
                </>
              ) : (
                <th scope="col" className="w-20 py-2 pr-3 text-right">
                  {/* One column for both in the narrow board; the header switches it. */}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'gap' ? 'interval' : 'gap')}
                    className="-my-1 py-1 uppercase tracking-wider text-rs-muted underline decoration-dotted underline-offset-2 hover:text-rs-yellow"
                    title={t('timing.switchGap')}
                  >
                    {mode === 'gap' ? t('timing.gap') : t('timing.interval')}
                  </button>
                </th>
              )}
              <th scope="col" className="w-20 py-2 pr-3 text-right">{t('timing.last')}</th>
              {full && <th scope="col" className="w-20 py-2 pr-3 text-right">{t('timing.best')}</th>}
              {full && <th scope="col" className="w-12 py-2 pr-3 text-right">{t('timing.pits')}</th>}
            </tr>
          </thead>
          <tbody>
            {board.rows.map((r) => {
              const c = r.classId !== null ? classOf.get(r.classId) : undefined
              return (
                <tr key={r.id} className={`border-b border-rs-border/60 ${r.out ? 'opacity-40' : ''}`}>
                  <td className="py-1.5 pl-3 pr-1 font-display font-bold text-white">{r.pos}</td>
                  {full && multiClass && <td className="py-1.5 pr-1 text-rs-muted">{r.classPos ?? ''}</td>}
                  <td className="py-1.5">
                    <span
                      className="inline-block min-w-8 rounded-sm px-1 text-center font-display text-[11px] font-bold leading-5 text-rs-black"
                      style={{ backgroundColor: (multiClass && c?.color) || 'var(--color-rs-yellow)' }}
                    >
                      {r.num}
                    </span>
                  </td>
                  <td className="max-w-0 py-1.5 pr-2">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-white">{r.name}</span>
                      {r.inPit && <span className="shrink-0 rounded-sm bg-rs-gray px-1 text-[10px] font-bold uppercase text-rs-yellow">{t('timing.pit')}</span>}
                    </span>
                    {full && r.team && <span className="block truncate text-[11px] text-rs-muted">{r.team}</span>}
                  </td>
                  {full && <td className="py-1.5 pr-3 text-right text-rs-muted">{r.lap ?? ''}</td>}
                  {full ? (
                    <>
                      <td className="py-1.5 pr-3 text-right text-white/90">{gapText(r, 'gap', t)}</td>
                      <td className="py-1.5 pr-3 text-right text-white/90">{gapText(r, 'interval', t)}</td>
                    </>
                  ) : (
                    <td className="py-1.5 pr-3 text-right text-white/90">{gapText(r, mode, t)}</td>
                  )}
                  <td className="py-1.5 pr-3 text-right text-white/80">{lapText(r.last)}</td>
                  {full && (
                    <td className={`py-1.5 pr-3 text-right ${r.id === fastestId ? 'font-bold text-rs-fastest' : 'text-white/80'}`}>
                      {lapText(r.best)}
                    </td>
                  )}
                  {full && <td className="py-1.5 pr-3 text-right text-rs-muted">{r.pits || ''}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {board.session.fastest && (
        <p className="border-t border-rs-border bg-rs-dark px-3 py-2 text-[11px] text-rs-muted">
          {t('timing.fastest')}: <span className="font-bold text-rs-fastest tabular-nums">{lapText(board.session.fastest.time)}</span>
          {board.session.fastest.name && <span> · {board.session.fastest.name}</span>}
        </p>
      )}
    </div>
  )
}

const FLAG_CLASS: Record<Flag, string> = {
  green: 'bg-rs-flag-green',
  yellow: 'bg-rs-yellow',
  white: 'bg-white',
  red: 'bg-rs-live',
  checkered: 'bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] bg-[length:8px_8px]',
  none: 'bg-rs-border',
}

function Header({ board, t, event }: { board: Board; t: T; event: string | null }) {
  const s = board.session
  const sessionLabel = s.isRace ? t('timing.session.race') : s.name
  const clock = s.timeRemaining !== null && !(s.byLaps && s.lapsTotal) ? duration(s.timeRemaining) : null
  return (
    <div className="border-b border-rs-border bg-rs-dark">
      <div className={`h-1 ${FLAG_CLASS[s.flag]}`} aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-display text-xs font-bold uppercase tracking-wider text-white">
            {sessionLabel ?? event ?? ''}
          </p>
          {(board.track || event) && <p className="truncate text-[11px] text-rs-muted">{[event, board.track].filter(Boolean).join(' · ')}</p>}
        </div>
        <div className="shrink-0 text-right tabular-nums">
          {s.lap !== null && s.isRace && (
            <p className="font-display text-sm font-bold text-rs-yellow">
              {t('timing.lap')} {s.lap}{s.lapsTotal ? ` / ${s.lapsTotal}` : ''}
            </p>
          )}
          {clock && <p className={s.isRace && s.lap !== null ? 'text-[11px] text-rs-muted' : 'font-display text-sm font-bold text-rs-yellow'}>{clock}</p>}
          {(board.airC !== null || board.trackC !== null) && (
            <p className="text-[10px] text-rs-muted">
              {board.airC !== null && `${t('timing.air')} ${Math.round(board.airC)}°`}
              {board.airC !== null && board.trackC !== null && ' · '}
              {board.trackC !== null && `${t('timing.track')} ${Math.round(board.trackC)}°`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/** 83.456 → "1:23.456" */
function lapText(v: number | null): string {
  if (v === null) return ''
  const m = Math.floor(v / 60)
  const s = v - m * 60
  return m > 0 ? `${m}:${s.toFixed(3).padStart(6, '0')}` : s.toFixed(3)
}

function gapText(r: BoardRow, which: 'gap' | 'interval', t: T): string {
  if (r.pos === 1) return t('timing.leader')
  const laps = which === 'gap' ? r.gapLaps : r.intervalLaps
  if (laps > 0) return `+${laps} ${t('timing.lapsShort')}`
  const v = which === 'gap' ? r.gap : r.interval
  if (v === null) return ''
  return v < 60 ? `+${v.toFixed(3)}` : `+${lapText(v)}`
}

/** 2533 → "42:13", 7533 → "2:05:33" */
function duration(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`
}
