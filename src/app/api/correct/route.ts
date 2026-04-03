import { NextResponse } from 'next/server'

// ─── Rate limiter (in-memory, resets every 24 h) ──────────────────────────────

const DAILY_LIMIT = 10
const ONE_DAY_MS  = 24 * 60 * 60 * 1000

interface RateEntry { count: number; resetAt: number }
const rateLimitMap = new Map<string, RateEntry>()

function getClientIP(req: Request): string {
  // Standard proxy headers (Vercel, Cloudflare, Nginx)
  const forwarded = (req.headers as unknown as Record<string, string | undefined>)['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

/** Returns { allowed, remaining }.  Mutates rateLimitMap. */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now  = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now >= entry.resetAt) {
    // First request today (or window expired) — start fresh
    rateLimitMap.set(ip, { count: 1, resetAt: now + ONE_DAY_MS })
    return { allowed: true, remaining: DAILY_LIMIT - 1 }
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: DAILY_LIMIT - entry.count }
}

// ─── Shared type (imported by the frontend) ───────────────────────────────────

export interface CorrectionAPIResponse {
  original:    string
  corrected:   string
  mistakes:    { original: string; corrected: string; explanation: string }[]
  suggestions: string[]
  improved:    string
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a professional English teacher for Arabic-speaking students.

Respond ONLY with a valid JSON object. No markdown. No code fences. No extra text.

Required JSON shape:
{
  "corrected": "the fully corrected sentence",
  "mistakes": [
    {
      "original": "wrong word or phrase from the input",
      "corrected": "the correct replacement",
      "explanation": "شرح قصير وبسيط بالعربية لسبب الخطأ"
    }
  ],
  "suggestions": ["tip 1 in English", "tip 2 in English"],
  "improved": "a fluent, natural-sounding rewrite of the corrected sentence"
}

Rules:
- Detect every grammar, tense, word-order, vocabulary, and spelling mistake.
- Each "explanation" must be written in simple Arabic (Modern Standard Arabic), 1–2 sentences max.
- "suggestions" must be 1–3 concise English learning tips relevant to the mistakes found.
- "improved" must be a polished, native-sounding version (not just a copy of "corrected").
- If the sentence is already correct, set "mistakes" to [] and praise the student in "suggestions[0]" in Arabic.
- Output ONLY the JSON object. Absolutely nothing outside it.`

// ─── Safe fallback — always matches CorrectionAPIResponse ────────────────────

function makeFallback(sentence: string): CorrectionAPIResponse {
  return {
    original:    sentence,
    corrected:   sentence,
    mistakes:    [],
    suggestions: [],
    improved:    sentence,
  }
}

// ─── POST /api/correct ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // 1 ── Validate input
  let sentence: string
  try {
    const body = await req.json()
    sentence = (typeof body.sentence === 'string' ? body.sentence : '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!sentence) {
    return NextResponse.json({ error: 'Sentence is required.' }, { status: 400 })
  }

  if (sentence.length > 1000) {
    return NextResponse.json(
      { error: 'Sentence is too long (max 1000 characters).' },
      { status: 400 },
    )
  }

  // 2 ── Rate limit
  const ip = getClientIP(req)
  const { allowed, remaining } = checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json(
      {
        error:     'لقد وصلت إلى الحد اليومي (10 محاولات). حاول غداً.',
        remaining: 0,
      },
      { status: 429 },
    )
  }

  // 3 ── OpenAI
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[/api/correct] OPENAI_API_KEY is not set.')
    // Return fallback so the frontend never crashes
    return NextResponse.json(makeFallback(sentence))
  }

  // 2 ── Call OpenAI
  let rawContent = ''
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: 'json_object' }, // guarantees valid JSON output
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: `Sentence: ${sentence}` },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[/api/correct] OpenAI API error:', data)
      return NextResponse.json(makeFallback(sentence))
    }

    rawContent = data.choices?.[0]?.message?.content ?? ''
  } catch (err) {
    console.error('[/api/correct] Network error calling OpenAI:', err)
    return NextResponse.json(makeFallback(sentence))
  }

  // 3 ── Safely parse the model's JSON output
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(rawContent)
  } catch {
    console.error('[/api/correct] Could not parse model output:', rawContent)
    return NextResponse.json(makeFallback(sentence))
  }

  // 4 ── Normalise every field — no field can ever be undefined or wrong type
  const mistakes = Array.isArray(parsed.mistakes)
    ? (parsed.mistakes as unknown[]).filter(
        (m): m is { original: string; corrected: string; explanation: string } =>
          m !== null &&
          typeof m === 'object' &&
          typeof (m as Record<string, unknown>).original    === 'string' &&
          typeof (m as Record<string, unknown>).corrected   === 'string' &&
          typeof (m as Record<string, unknown>).explanation === 'string',
      )
    : []

  const suggestions = Array.isArray(parsed.suggestions)
    ? (parsed.suggestions as unknown[]).filter((s): s is string => typeof s === 'string')
    : []

  const result: CorrectionAPIResponse = {
    original:    sentence,
    corrected:   typeof parsed.corrected === 'string' && parsed.corrected.trim()
                   ? parsed.corrected.trim()
                   : sentence,
    mistakes,
    suggestions,
    improved:    typeof parsed.improved === 'string' && parsed.improved.trim()
                   ? parsed.improved.trim()
                   : sentence,
  }

  return NextResponse.json({ ...result, remaining })
}
