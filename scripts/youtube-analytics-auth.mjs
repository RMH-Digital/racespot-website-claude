#!/usr/bin/env node
/**
 * One-time consent for the YouTube Analytics API.
 *
 * Watch time — the hours people actually watched — is not in the public
 * YouTube Data API. It lives in the Analytics API, which only answers to the
 * channel owner, so the website needs a refresh token issued by the
 * RaceSpotTV brand account once. This script obtains it and prints it; the
 * value goes into Coolify as YOUTUBE_OAUTH_REFRESH_TOKEN and never into the
 * repo. Full walkthrough: docs/YOUTUBE-ANALYTICS.md.
 *
 *   YOUTUBE_OAUTH_CLIENT_ID=… YOUTUBE_OAUTH_CLIENT_SECRET=… node scripts/youtube-analytics-auth.mjs
 *
 * With --test and a YOUTUBE_OAUTH_REFRESH_TOKEN in the environment it skips
 * the consent and only runs the checks, so a stored token can be verified
 * any time.
 */

import http from 'node:http'
import { randomBytes } from 'node:crypto'

const CLIENT_ID = process.env.YOUTUBE_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.YOUTUBE_OAUTH_CLIENT_SECRET
const PORT = 8765
const REDIRECT = `http://127.0.0.1:${PORT}/callback`
// yt-analytics.readonly for the report, youtube.readonly so the check below
// can name the channel that was authorised — the brand channel and the empty
// personal one look identical in Google's account chooser otherwise.
const SCOPES = ['https://www.googleapis.com/auth/yt-analytics.readonly', 'https://www.googleapis.com/auth/youtube.readonly']

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set YOUTUBE_OAUTH_CLIENT_ID and YOUTUBE_OAUTH_CLIENT_SECRET first (docs/YOUTUBE-ANALYTICS.md, step 3).')
  process.exit(1)
}

const testOnly = process.argv.includes('--test')
const refreshToken = testOnly ? process.env.YOUTUBE_OAUTH_REFRESH_TOKEN : await consent()
if (!refreshToken) {
  console.error(testOnly ? 'Set YOUTUBE_OAUTH_REFRESH_TOKEN to test it.' : 'Google returned no refresh token — see "Kein Refresh-Token" in the docs.')
  process.exit(1)
}

await verify(refreshToken)

if (!testOnly) {
  console.log('\n──────────────────────────────────────────────────────────────')
  console.log('YOUTUBE_OAUTH_REFRESH_TOKEN=' + refreshToken)
  console.log('──────────────────────────────────────────────────────────────')
  console.log('Put this into Coolify → Environment Variables (never into the repo), then redeploy.')
}

// ─────────────────────────────────────────────────────────────────────────────

async function consent() {
  const state = randomBytes(16).toString('hex')
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline', // = refresh token
    prompt: 'consent',      // = a refresh token even if one was issued before
    include_granted_scopes: 'true',
    state,
  }).toString()

  console.log('\n1. Open this address in a browser where you can sign in as contact@racespot.tv:\n')
  console.log('   ' + url.toString())
  console.log('\n2. In the account chooser pick the channel  RaceSpotTV  (the brand account),')
  console.log('   NOT the empty personal channel "Racespot". Then allow both permissions.\n')
  console.log(`Waiting for Google to call back on ${REDIRECT} …`)

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, `http://127.0.0.1:${PORT}`)
      if (u.pathname !== '/callback') { res.writeHead(404).end(); return }
      const err = u.searchParams.get('error')
      if (err || u.searchParams.get('state') !== state) {
        res.writeHead(400, { 'Content-Type': 'text/plain' }).end(`Failed: ${err || 'state mismatch'}`)
        server.close(); reject(new Error(err || 'state mismatch')); return
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        .end('<p style="font:16px system-ui;padding:2rem">Done — you can close this tab and go back to the terminal.</p>')
      server.close()
      resolve(u.searchParams.get('code'))
    })
    server.listen(PORT, '127.0.0.1')
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
  })
  const tokens = await res.json()
  if (!res.ok) { console.error('Token exchange failed:', tokens); process.exit(1) }
  return tokens.refresh_token
}

async function accessToken(refresh) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refresh, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'refresh_token' }),
  })
  const json = await res.json()
  if (!res.ok) { console.error('Refresh failed:', json); process.exit(1) }
  return json.access_token
}

async function verify(refresh) {
  const token = await accessToken(refresh)
  const auth = { Authorization: `Bearer ${token}` }

  const ch = await (await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', { headers: auth })).json()
  const channel = ch.items?.[0]
  if (!channel) { console.error('No channel behind this token:', ch); process.exit(1) }
  console.log(`\nAuthorised channel: ${channel.snippet.title}  (${channel.id}, ${Number(channel.statistics.subscriberCount).toLocaleString('de-DE')} subscribers)`)
  if (Number(channel.statistics.subscriberCount) < 1000) {
    console.error('\n⚠  That looks like the empty personal channel, not RaceSpotTV. Run again and pick the brand account in the chooser.')
    process.exit(1)
  }

  const end = new Date(Date.now() - 2 * 86_400_000) // Analytics lags ~2 days
  const start = new Date(end.getTime() - 365 * 86_400_000)
  const day = (d) => d.toISOString().slice(0, 10)
  const q = new URLSearchParams({ ids: 'channel==MINE', startDate: day(start), endDate: day(end), metrics: 'estimatedMinutesWatched,views' })
  const rep = await (await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${q}`, { headers: auth })).json()
  if (rep.error) { console.error('Analytics query failed:', rep.error); process.exit(1) }
  const [minutes, views] = rep.rows?.[0] ?? [0, 0]
  console.log(`Last 365 days (${day(start)} → ${day(end)}): ${Math.round(minutes / 60).toLocaleString('de-DE')} hours watched, ${Number(views).toLocaleString('de-DE')} views`)
}
