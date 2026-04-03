import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CorrectionAPIResponse {
  original: string
  corrected: string
  mistakes: { original: string; corrected: string; explanation: string }[]
  suggestions: string[]
  improved: string
}

// ─── OpenAI client (lazy — only initialised on first request) ─────────────────

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.')
  }
  return new OpenAI({ apiKey })
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a friendly English teacher for Arabic-speaking students.

When given a sentence, respond ONLY with a valid JSON object (no markdown, no explanation outside the JSON) in this exact shape:

{
  "corrected": "the fully corrected sentence",
  "mistakes": [
    {
      "original": "the wrong word or phrase",
      "corrected": "the correct word or phrase",
      "explanation": "شرح بسيط باللغة العربية لماذا هذا خطأ وكيف يُصحَّح"
    }
  ],
  "suggestions": [
    "one short English tip to improve",
    "another tip if relevant"
  ],
  "improved": "an enhanced, more natural version of the sentence (optional upgrade)"
}

Rules:
- "mistakes" must list every grammar, spelling, or word-order error found.
- "explanation" for each mistake must be written in simple, clear Arabic (Modern Standard Arabic).
- "suggestions" are short English tips (1–3 items).
- "improved" is a polished, more native-sounding rewrite of the corrected sentence.
- If the sentence is already correct, set "mistakes" to [] and write a brief Arabic praise in "suggestions[0]".
- Never add text outside the JSON object.`

// ─── POST /api/correct ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse body
  let sentence: string
  try {
    const body = await req.json()
    sentence = (body.sentence ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!sentence) {
    return NextResponse.json({ error: 'Sentence is required.' }, { status: 400 })
  }

  if (sentence.length > 1000) {
    return NextResponse.json({ error: 'Sentence is too long (max 1000 characters).' }, { status: 400 })
  }

  // 2. Call OpenAI
  let raw: string
  try {
    const openai = getOpenAIClient()
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',        // fast & cheap; swap to 'gpt-4o' for higher quality
      temperature: 0.2,            // low temp for consistent, deterministic corrections
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Sentence: ${sentence}` },
      ],
    })
    raw = chat.choices[0]?.message?.content ?? ''
  } catch (err) {
    console.error('[/api/correct] OpenAI error:', err)
    return NextResponse.json(
      { error: 'AI service unavailable. Please try again.' },
      { status: 502 },
    )
  }

  // 3. Parse the JSON the model returned
  let parsed: Omit<CorrectionAPIResponse, 'original'>
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.error('[/api/correct] Failed to parse model JSON:', raw)
    return NextResponse.json(
      { error: 'Unexpected AI response format.' },
      { status: 500 },
    )
  }

  // 4. Build final response (add original back, ensure arrays exist)
  const response: CorrectionAPIResponse = {
    original:    sentence,
    corrected:   parsed.corrected   ?? sentence,
    mistakes:    Array.isArray(parsed.mistakes)    ? parsed.mistakes    : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    improved:    parsed.improved    ?? '',
  }

  return NextResponse.json(response)
}
