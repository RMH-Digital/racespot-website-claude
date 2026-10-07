import { timingFor } from '@/lib/timing/relay'

export const dynamic = 'force-dynamic'

/**
 * GET /api/timing/<room> — the Live Timing board of one of our rooms
 * (Racespot1, Racespot2 …), relayed from Appgineering (lib/timing/relay.ts).
 * The live page's board asks every two seconds while it is open and visible.
 *
 * Only our own rooms: this is not an open relay for anybody's timing.
 */
const OUR_ROOM = /^Racespot\d{1,2}$/

export async function GET(_req: Request, { params }: { params: Promise<{ room: string }> }) {
  const { room } = await params
  if (!OUR_ROOM.test(room)) return Response.json({ error: 'unknown room' }, { status: 404 })
  const answer = await timingFor(room)
  return Response.json(answer, { headers: { 'Cache-Control': 'no-store' } })
}
