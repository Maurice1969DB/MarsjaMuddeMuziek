// scripts/fetchLaposta.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const apiKey = process.env.LAPOSTA_API_KEY
if (!apiKey) {
  console.error('LAPOSTA_API_KEY ontbreekt')
  process.exit(1)
}

const endpoint = 'https://api.laposta.nl/v2/campaign'

// Helper: parseer Laposta datumstring "YYYY-MM-DD HH:MM:SS" naar Date (of null)
function d (s) {
  if (!s) return null
  // Vervang spatie door 'T' en voeg 'Z' toe zodat het als UTC wordt gelezen
  const iso = s.replace(' ', 'T') + 'Z'
  const t = Date.parse(iso)
  return Number.isNaN(t) ? null : new Date(t)
}

// Kies de “beste” datum voor sorteren
function bestDate (c) {
  return d(c.delivery_requested) || d(c.delivery_started) || d(c.delivery_ended) || d(c.modified) || d(c.created)
}

function byNewest (a, b) {
  const da = bestDate(a) ? bestDate(a).getTime() : 0
  const db = bestDate(b) ? bestDate(b).getTime() : 0
  return db - da
}

function isSentish (c) {
  // markeer als verzonden zodra er een delivery_* of in elk geval created is
  return !!(c.delivery_requested || c.delivery_started || c.delivery_ended)
}

const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64')

const res = await fetch(endpoint, {
  headers: {
    Authorization: authHeader,
    Accept: 'application/json'
  }
})

if (!res.ok) {
  const text = await res.text()
  console.error('Laposta API error', res.status, text)
  process.exit(1)
}

const json = await res.json()

// Verwacht: { data: [ { campaign: {...} }, ... ] }
const campaigns = Array.isArray(json?.data)
  ? json.data.map(x => x?.campaign).filter(Boolean)
  : []

if (campaigns.length === 0) {
  console.warn('Geen campagnes gevonden')
  process.exit(0)
}

// Filter op “verzonden” en sorteer nieuw → oud
const candidates = campaigns.filter(isSentish).sort(byNewest)

// Val terug op alle campagnes als filter niets oplevert
const latest = (candidates.length ? candidates : campaigns.sort(byNewest))[0]
if (!latest) {
  console.warn('Geen bruikbare campagne gevonden')
  process.exit(0)
}

// Normaliseer voor Hugo (platte velden + raw ter debug)
const sent = bestDate(latest)
const normalized = {
  subject: latest.subject || '',
  title: latest.name || '',
  web: latest.web || latest.webversion_url || latest.web_url || '',
  sent_datetime: sent ? sent.toISOString() : null,
  raw: latest
}

if (!normalized.web) {
  console.warn('Geen webversie-URL gevonden voor nieuwste campagne')
  process.exit(0)
}

// Schrijf alleen als het echt nieuw is
mkdirSync(resolve(__dirname, '..', 'data'), { recursive: true })
const outPath = resolve(__dirname, '..', 'data', 'nieuwsbrief.json')

let existing = ''
try { existing = readFileSync(outPath, 'utf8') } catch {}

const next = JSON.stringify(normalized, null, 2)
if (existing.trim() === next.trim()) {
  console.log('Geen wijzigingen in data/nieuwsbrief.json')
  process.exit(0)
}

writeFileSync(outPath, next)
console.log('Opgeslagen: data/nieuwsbrief.json →', normalized.web)