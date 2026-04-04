import { NextResponse } from 'next/server'

// ─── Shared types ────────────────────────────────────────────────────────────

export interface TranslateResponse {
  translation: string
  similarSentences: string[]
  explanation: string
  tips: string[]
}

export interface ChatResponse {
  aiMessage: string
  correction: string | null
  isCorrect: boolean
  correctedVersion: string | null
  encouragement: string
  points: number
}

// ─── System prompts ──────────────────────────────────────────────────────────

const LEVEL_GUIDE = {
  A1: 'very simple words, present simple only, basic daily vocabulary (greetings, family, numbers, colors)',
  A2: 'simple past & future, comparatives, common phrases, shopping, hobbies, weather',
  B1: 'varied tenses, modal verbs, phrasal verbs, light idioms, work, travel, opinions',
}

function translateSystem(level: string): string {
  return `You are an expert English learning assistant for Arabic-speaking students.
Student level: ${level} — ${LEVEL_GUIDE[level as keyof typeof LEVEL_GUIDE] ?? ''}

Given Arabic text from the student, produce English learning content appropriate for their level.

Respond ONLY with valid JSON — no markdown, no code fences:
{
  "translation": "English translation at the student's level",
  "similarSentences": [
    "example sentence 1 at ${level} level",
    "example sentence 2",
    "example sentence 3"
  ],
  "explanation": "شرح مبسط وواضح بالعربية للقواعد والمفردات المستخدمة (2-3 جمل فقط)",
  "tips": ["short English tip 1", "short English tip 2"]
}

Rules:
- Keep translation natural and appropriate for the level.
- Similar sentences must introduce the same grammar pattern.
- Explanation must be in clear Modern Standard Arabic.
- Tips are in English, practical and actionable.`
}

function chatSystem(level: string): string {
  return `You are a warm, engaging English conversation coach for Arabic-speaking students.
Student level: ${level} — ${LEVEL_GUIDE[level as keyof typeof LEVEL_GUIDE] ?? ''}

Your personality: encouraging, patient, fun. You make students want to keep talking.

When the student replies:
1. Acknowledge their effort with a quick Arabic praise word.
2. If there are mistakes, correct gently (show the right version).
3. Give a short natural explanation if needed.
4. Ask the next engaging question to keep the conversation flowing.

Respond ONLY with valid JSON — no markdown, no code fences:
{
  "aiMessage": "Your full response in English — correction if needed + the next question",
  "correction": "Short note about the mistake in English (or null if no mistakes)",
  "isCorrect": true or false,
  "correctedVersion": "The corrected sentence (or null if no mistake)",
  "encouragement": "One Arabic word/phrase (أحسنت / ممتاز / رائع / واصل)",
  "points": integer 6-10 reflecting how well they did
}

Topic ideas by level:
- A1: name, age, family, pets, colors, food, daily routine
- A2: hobbies, weekend plans, favourite places, shopping, sports
- B1: travel dreams, job/study, opinions on tech/social media, hypotheticals

Keep responses concise. One correction + one question max.
Never make the student feel bad — always end on encouragement.`
}

// ─── POST /api/practice ───────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: {
    type: 'translate' | 'chat'
    text?: string
    level?: string
    messages?: { role: string; content: string }[]
    userReply?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[/api/practice] OPENAI_API_KEY not set')
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const level = body.level ?? 'A1'

  // ── TRANSLATE ─────────────────────────────────────────────────────────────
  if (body.type === 'translate') {
    const text = (body.text ?? '').trim()
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })
    if (text.length > 500) return NextResponse.json({ error: 'Text too long (max 500 chars)' }, { status: 400 })

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.35,
          max_tokens: 500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: translateSystem(level) },
            { role: 'user', content: `Arabic text: ${text}` },
          ],
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message ?? 'OpenAI error')

      const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')

      return NextResponse.json({
        translation: typeof parsed.translation === 'string' ? parsed.translation : '',
        similarSentences: Array.isArray(parsed.similarSentences)
          ? (parsed.similarSentences as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 3)
          : [],
        explanation: typeof parsed.explanation === 'string' ? parsed.explanation : '',
        tips: Array.isArray(parsed.tips)
          ? (parsed.tips as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 2)
          : [],
      } satisfies TranslateResponse)
    } catch (err) {
      console.error('[/api/practice] translate error:', err)
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
    }
  }

  // ── CHAT ──────────────────────────────────────────────────────────────────
  if (body.type === 'chat') {
    const history = Array.isArray(body.messages) ? body.messages.slice(-12) : []
    const userReply = (body.userReply ?? '').trim()

    const apiMessages: { role: string; content: string }[] = [
      { role: 'system', content: chatSystem(level) },
      ...history,
    ]

    if (userReply) {
      apiMessages.push({ role: 'user', content: userReply })
    } else {
      // Starting the conversation — ask AI to open
      apiMessages.push({
        role: 'user',
        content: `[START] Please greet the student warmly and ask your first question at ${level} level. Keep it short and friendly.`,
      })
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 350,
          response_format: { type: 'json_object' },
          messages: apiMessages,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message ?? 'OpenAI error')

      const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')

      return NextResponse.json({
        aiMessage: typeof parsed.aiMessage === 'string' ? parsed.aiMessage : 'Let\'s practice English! Tell me about yourself.',
        correction: typeof parsed.correction === 'string' ? parsed.correction : null,
        isCorrect: typeof parsed.isCorrect === 'boolean' ? parsed.isCorrect : true,
        correctedVersion: typeof parsed.correctedVersion === 'string' ? parsed.correctedVersion : null,
        encouragement: typeof parsed.encouragement === 'string' ? parsed.encouragement : 'أحسنت!',
        points: typeof parsed.points === 'number' ? Math.min(10, Math.max(1, parsed.points)) : 7,
      } satisfies ChatResponse)
    } catch (err) {
      console.error('[/api/practice] chat error:', err)
      return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
