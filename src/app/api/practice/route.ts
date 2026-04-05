import { NextResponse } from 'next/server'

// ─── Exported types (used by frontend) ───────────────────────────────────────

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
  isLastMessage?: boolean
}

export interface EvaluateResponse {
  score: number          // 0–100
  isGood: boolean        // score >= 60
  feedback: string       // Arabic encouragement/comment
  corrections: string[]  // specific mistakes
  betterVersion: string  // improved version (or original if correct)
  xpAwarded: number      // 2 | 5 | 8 | 10
}

// ─── Level guide ─────────────────────────────────────────────────────────────

const LEVEL_GUIDE: Record<string, string> = {
  A1: 'very simple present-tense sentences, basic daily vocabulary',
  A2: 'past tense, future plans, preferences, medium complexity',
  B1: 'varied tenses, modal verbs, idioms, professional and abstract topics',
}

// ─── System prompts ───────────────────────────────────────────────────────────

function translateSystem(level: string): string {
  return `You are an expert English learning assistant for Arabic-speaking students.
Student level: ${level} — ${LEVEL_GUIDE[level] ?? ''}

Given Arabic text from the student, produce English learning content.

Respond ONLY with valid JSON — no markdown, no code fences:
{
  "translation": "English translation appropriate for the level",
  "similarSentences": ["example 1 at ${level}", "example 2", "example 3"],
  "explanation": "شرح مبسط بالعربية للقواعد والمفردات (2-3 جمل)",
  "tips": ["practical English tip 1", "practical tip 2"]
}

Rules:
- Keep translation natural and level-appropriate.
- Each similar sentence must introduce the same grammar pattern.
- Explanation in clear Modern Standard Arabic.
- Tips in English, short and actionable.`
}

function chatSystem(level: string): string {
  return `You are a warm, engaging English conversation coach for Arabic-speaking students.
Student level: ${level} — ${LEVEL_GUIDE[level] ?? ''}

Your personality: encouraging, patient, fun. You make students want to keep talking.

When the student replies:
1. Gently correct any grammar or vocabulary mistakes.
2. Give quick encouragement in Arabic (one word/phrase).
3. Ask the next natural question to keep the conversation going.

Respond ONLY with valid JSON — no markdown, no code fences:
{
  "aiMessage": "Your full response in English — correction if needed + next question",
  "correction": "Short note about the mistake (or null if no mistakes)",
  "isCorrect": true or false,
  "correctedVersion": "The corrected sentence (or null if no mistake)",
  "encouragement": "One Arabic word/phrase (أحسنت / ممتاز / رائع / واصل / بالضبط)",
  "points": integer 5-10,
  "isLastMessage": false
}

Keep responses concise. One correction + one question max. Always end on encouragement.`
}

function chatPracticeSystem(level: string, sentences: { english: string }[]): string {
  const sentenceList = sentences.map((s, i) => `${i + 1}. "${s.english}"`).join('\n')
  return `You are an English conversation coach running a short practice session.
Student level: ${level} — ${LEVEL_GUIDE[level] ?? ''}

Today the student practiced these sentences:
${sentenceList}

Your mission: Have a natural 3-question conversation that reinforces these sentences.
- Ask questions that connect to the themes of the sentences above.
- Correct mistakes gently, show the corrected version.
- After EXACTLY 3 student replies, set "isLastMessage": true in your response.
- Keep a count internally: reply 1 → false, reply 2 → false, reply 3 → true.

Respond ONLY with valid JSON — no markdown, no code fences:
{
  "aiMessage": "Your message or question in English",
  "correction": "correction note (or null)",
  "isCorrect": true or false,
  "correctedVersion": "corrected sentence (or null)",
  "encouragement": "Arabic word (أحسنت / ممتاز / رائع / واصل)",
  "points": integer 5-10,
  "isLastMessage": false or true
}

Start with a warm greeting + your first question. Be fun and encouraging!`
}

function evaluateSystem(level: string, mode: 'recall' | 'translate'): string {
  const recallNote = mode === 'recall'
    ? 'The student tried to recall the exact sentence from memory. Reward accuracy of recall AND correct meaning.'
    : 'The student translated the Arabic meaning into English. Accept any correct English expression of the same meaning, even if different words are used.'

  return `You are an English teacher evaluating a student's answer.
Student level: ${level} — ${LEVEL_GUIDE[level] ?? ''}
Mode: ${mode}. ${recallNote}

Scoring guide:
- 90-100: Excellent — perfect or near-perfect
- 75-89: Good — correct meaning, minor issues
- 55-74: Acceptable — main idea correct, noticeable errors
- 0-54: Needs work — significant errors or wrong meaning

Return ONLY valid JSON — no markdown, no code fences:
{
  "score": 0-100,
  "isGood": true if score >= 60,
  "feedback": "One encouraging sentence in Arabic explaining the result",
  "corrections": ["specific mistake 1 (or empty array if none)"],
  "betterVersion": "improved/correct version of their answer (use the reference if they were mostly right)"
}

Be encouraging. Reward effort even when mistakes exist.`
}

// ─── Safe OpenAI caller ───────────────────────────────────────────────────────

async function callOpenAI(
  apiKey: string,
  messages: { role: string; content: string }[],
  maxTokens = 500,
  temperature = 0.35,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `OpenAI ${res.status}`)
  return data.choices?.[0]?.message?.content ?? '{}'
}

function safeParse(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw) } catch { return {} }
}

// ─── POST /api/practice ───────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[/api/practice] OPENAI_API_KEY not set')
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
  }

  const level  = typeof body.level === 'string' ? body.level : 'A1'
  const type   = typeof body.type  === 'string' ? body.type  : ''

  // ── TRANSLATE ─────────────────────────────────────────────────────────────
  if (type === 'translate') {
    const text = typeof body.text === 'string' ? body.text.trim() : ''
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

    try {
      const raw    = await callOpenAI(apiKey, [
        { role: 'system', content: translateSystem(level) },
        { role: 'user',   content: `Arabic text: ${text}` },
      ])
      const parsed = safeParse(raw)

      return NextResponse.json({
        translation:      typeof parsed.translation === 'string' ? parsed.translation : text,
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
      return NextResponse.json({
        translation: text, similarSentences: [], explanation: '', tips: [],
      } satisfies TranslateResponse)
    }
  }

  // ── EVALUATE (recall + translation steps) ─────────────────────────────────
  if (type === 'evaluate') {
    const userAnswer = typeof body.userAnswer  === 'string' ? body.userAnswer.trim()  : ''
    const reference  = typeof body.reference   === 'string' ? body.reference.trim()   : ''
    const mode       = body.mode === 'translate' ? 'translate' : 'recall'

    if (!userAnswer) {
      return NextResponse.json({
        score: 0, isGood: false,
        feedback: 'لم تكتب إجابة.',
        corrections: [], betterVersion: reference, xpAwarded: 0,
      } satisfies EvaluateResponse)
    }

    try {
      const raw    = await callOpenAI(apiKey, [
        { role: 'system', content: evaluateSystem(level, mode) },
        {
          role: 'user',
          content: `Reference: "${reference}"\nStudent answer: "${userAnswer}"`,
        },
      ], 400, 0.2)
      const parsed = safeParse(raw)

      const score  = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 60
      const isGood = score >= 60
      const xp     = score >= 90 ? 10 : score >= 75 ? 8 : score >= 55 ? 5 : 2

      return NextResponse.json({
        score,
        isGood,
        feedback:      typeof parsed.feedback      === 'string' ? parsed.feedback      : (isGood ? 'أحسنت!' : 'حاول مرة أخرى'),
        corrections:   Array.isArray(parsed.corrections)
          ? (parsed.corrections as unknown[]).filter((s): s is string => typeof s === 'string')
          : [],
        betterVersion: typeof parsed.betterVersion === 'string' ? parsed.betterVersion : reference,
        xpAwarded: xp,
      } satisfies EvaluateResponse)
    } catch (err) {
      console.error('[/api/practice] evaluate error:', err)
      // Graceful fallback — session can still proceed
      return NextResponse.json({
        score: 70, isGood: true,
        feedback: 'أحسنت! واصل التدريب.',
        corrections: [], betterVersion: reference, xpAwarded: 7,
      } satisfies EvaluateResponse)
    }
  }

  // ── CHAT (free chat mode) ─────────────────────────────────────────────────
  if (type === 'chat') {
    const history   = Array.isArray(body.messages) ? (body.messages as { role: string; content: string }[]).slice(-12) : []
    const userReply = typeof body.userReply === 'string' ? body.userReply.trim() : ''

    const apiMessages: { role: string; content: string }[] = [
      { role: 'system', content: chatSystem(level) },
      ...history,
    ]
    apiMessages.push({
      role: 'user',
      content: userReply || `[START] Greet the student and ask your first question at ${level} level.`,
    })

    try {
      const raw    = await callOpenAI(apiKey, apiMessages, 350, 0.7)
      const parsed = safeParse(raw)

      return NextResponse.json({
        aiMessage:        typeof parsed.aiMessage        === 'string'  ? parsed.aiMessage        : 'Tell me about yourself!',
        correction:       typeof parsed.correction       === 'string'  ? parsed.correction       : null,
        isCorrect:        typeof parsed.isCorrect        === 'boolean' ? parsed.isCorrect        : true,
        correctedVersion: typeof parsed.correctedVersion === 'string'  ? parsed.correctedVersion : null,
        encouragement:    typeof parsed.encouragement    === 'string'  ? parsed.encouragement    : 'أحسنت!',
        points:           typeof parsed.points           === 'number'  ? Math.min(10, Math.max(1, parsed.points)) : 7,
        isLastMessage:    false,
      } satisfies ChatResponse)
    } catch (err) {
      console.error('[/api/practice] chat error:', err)
      return NextResponse.json({
        aiMessage: 'Let\'s practice! Tell me something about yourself.',
        correction: null, isCorrect: true, correctedVersion: null,
        encouragement: 'أحسنت!', points: 7, isLastMessage: false,
      } satisfies ChatResponse)
    }
  }

  // ── CHAT-PRACTICE (session-based chat with sentence context) ──────────────
  if (type === 'chat-practice') {
    const sentences  = Array.isArray(body.sentences)
      ? (body.sentences as { english: string }[]).slice(0, 8)
      : []
    const history    = Array.isArray(body.messages)
      ? (body.messages as { role: string; content: string }[]).slice(-12)
      : []
    const userReply  = typeof body.userReply === 'string' ? body.userReply.trim() : ''
    const replyCount = typeof body.replyCount === 'number' ? body.replyCount : 0

    const apiMessages: { role: string; content: string }[] = [
      { role: 'system', content: chatPracticeSystem(level, sentences) },
      ...history,
    ]
    apiMessages.push({
      role: 'user',
      content: userReply
        || `[START] Greet the student warmly and ask your first question at ${level} level based on the sentences they practiced.`,
    })

    try {
      const raw    = await callOpenAI(apiKey, apiMessages, 350, 0.75)
      const parsed = safeParse(raw)

      // Force isLastMessage = true on the 3rd reply regardless of model
      const isLast = replyCount >= 2 || parsed.isLastMessage === true

      return NextResponse.json({
        aiMessage:        typeof parsed.aiMessage        === 'string'  ? parsed.aiMessage        : 'Great work! What did you learn today?',
        correction:       typeof parsed.correction       === 'string'  ? parsed.correction       : null,
        isCorrect:        typeof parsed.isCorrect        === 'boolean' ? parsed.isCorrect        : true,
        correctedVersion: typeof parsed.correctedVersion === 'string'  ? parsed.correctedVersion : null,
        encouragement:    typeof parsed.encouragement    === 'string'  ? parsed.encouragement    : 'أحسنت!',
        points:           typeof parsed.points           === 'number'  ? Math.min(10, Math.max(1, parsed.points)) : 7,
        isLastMessage:    isLast,
      } satisfies ChatResponse)
    } catch (err) {
      console.error('[/api/practice] chat-practice error:', err)
      return NextResponse.json({
        aiMessage: replyCount >= 2
          ? 'Amazing session today! You\'ve done great. 🎉'
          : 'Tell me what you remember from today\'s sentences!',
        correction: null, isCorrect: true, correctedVersion: null,
        encouragement: 'ممتاز!', points: 8, isLastMessage: replyCount >= 2,
      } satisfies ChatResponse)
    }
  }

  return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
}
