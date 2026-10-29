// Live Timing: which room a broadcast runs in, and how unclassified drivers
// are shown. `npm test` (Node ≥ 22.6 strips the TypeScript types itself).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchLiveRooms } from '../src/lib/timing/liveMatch.ts'
import { overlap } from '../src/lib/titleMatch.ts'
import { classified, emptyState, toBoard } from '../src/lib/timing/decode.ts'

// The night of 2026-10-29, as Appgineering listed it: the schedule's room for
// the Short Course row was Racespot1, the race ran in Racespot2.
const live = new Map([
  ['enascarcollegeiracingseries', null],
  ['race the world', 'Some other event'],
  ['racespot2', 'iRacing Short Course | 2026 Pro 2 National Series | Round 5 at Lucas Oil'],
  ['racespot3', 'PCA Sport Class'],
])
const shortCourse = {
  id: 'sc',
  series: 'iRacing Short Course Pro 4 National Series',
  streamTitle: 'iRacing Short Course | Pro 2 National Series | Round 5 at Lucas Oil',
}
const pca = {
  id: 'pca',
  series: 'Porsche Club of America S16 - Sport',
  streamTitle: 'PCA Sim Racing Series 16 | Event 5 | Sport Class at Brands Hatch',
}

test('the Short Course row finds Racespot2 by its event name', () => {
  const { rooms, ambiguous } = matchLiveRooms([shortCourse], live, overlap)
  assert.equal(rooms.get('sc'), 'Racespot2')
  assert.deepEqual(ambiguous, [])
})

test('two rows on air at once each get their own room', () => {
  const { rooms } = matchLiveRooms([shortCourse, pca], live, overlap)
  assert.equal(rooms.get('sc'), 'Racespot2')
  assert.equal(rooms.get('pca'), 'Racespot3')
})

test('other people\'s rooms are never taken', () => {
  const { rooms } = matchLiveRooms([{ id: 'x', series: 'Some other event' }], live, overlap)
  assert.equal(rooms.size, 0)
})

test('a row two rooms fit equally well gets none and is reported', () => {
  const twins = new Map([
    ['racespot1', 'PCA Sport Class'],
    ['racespot3', 'PCA Sport Class'],
  ])
  const { rooms, ambiguous } = matchLiveRooms([pca], twins, overlap)
  assert.equal(rooms.size, 0)
  assert.deepEqual(ambiguous, ['pca'])
})

test('nothing that only shares a word', () => {
  const { rooms } = matchLiveRooms([{ id: 'f4', series: 'British F4 Esports Championship' }], live, overlap)
  assert.equal(rooms.size, 0)
})

test('int max is no position', () => {
  assert.equal(classified(2147483647), null)
  assert.equal(classified(0), null)
  assert.equal(classified(undefined), null)
  assert.equal(classified(3), 3)
})

test('an unclassified driver sorts last and has no position', () => {
  const s = emptyState()
  const add = (id, position) => {
    s.entries.set(id, { driverName: `D${id}`, carNumber: String(id) })
    s.timing.set(id, { position })
  }
  add(1, 2147483647)
  add(2, 2)
  add(3, 1)
  const rows = toBoard(s).rows
  assert.deepEqual(rows.map((r) => r.id), [3, 2, 1])
  assert.equal(rows[2].pos, null)
  assert.equal(rows[2].classPos, null)
})
