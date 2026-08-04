import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Grades the free-writing task at the end of the placement test.
 *
 * This is placement, not assessment of paid work: the output steers a course
 * recommendation, it does not certify anything. The client always computes a
 * deterministic local analysis first and merges this on top, so a failure here
 * costs richer feedback and nothing else — the learner still gets a result.
 *
 * (Unit-conversation grading elsewhere in the product stays MANUAL by the
 * team's decision; that is a different job and this route must not be reused
 * for it.) */

const SYSTEM = `You are an experienced CEFR examiner placing an ARABIC-SPEAKING learner of English.

You will receive a writing task and a learner's response. Judge ONLY the response.

Respond with a valid JSON object and nothing else. No markdown, no code fences.

Shape:
{
  "score": 0-100,
  "estimated": "A0" | "A1" | "A2" | "B1" | "B2" | "C1",
  "strengths": ["نقطة قوة بالعربية", "..."],
  "issues": [
    { "fragment": "the exact wrong text from the learner", "note": "شرح الخطأ بالعربية", "fix": "the corrected English" }
  ],
  "corrected": "the learner's text rewritten correctly, keeping their meaning and their voice"
}

Rules:
- "estimated" must reflect what THIS text demonstrates, not what the task asked for. A learner given a B2 task who writes three simple sentences is A1.
- Be accurate, not generous. Placing someone too high wastes their money and their time; they will sit in a class they cannot follow.
- "strengths" and "note" MUST be in Arabic. "fragment", "fix" and "corrected" MUST stay in English.
- Give at most 4 strengths and at most 6 issues. Prioritise errors that block communication over stylistic preferences.
- "fragment" must be copied EXACTLY from the learner's text so it can be highlighted.
- If the response is off-topic, empty, or not English, score it low and say so plainly in the strengths/issues.
- Never invent text the learner did not write.`

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  let body: { text?: string; prompt?: string; level?: string; minWords?: number }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  const text = (body.text ?? '').trim()
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })
  if (text.length > 4000) return NextResponse.json({ error: 'text too long' }, { status: 413 })

  const user = [
    `TASK (level ${body.level ?? '—'}, minimum ${body.minWords ?? 0} words):`,
    body.prompt ?? '',
    '',
    "LEARNER'S RESPONSE:",
    text,
  ].join('\n')

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: user },
        ],
      }),
      // the client aborts at 12s; give the model a little less
      signal: AbortSignal.timeout(11000),
    })

    if (!res.ok) {
      console.error('[grade-writing] upstream', res.status)
      return NextResponse.json({ error: 'grading unavailable' }, { status: 502 })
    }

    const json = await res.json()
    const raw = json?.choices?.[0]?.message?.content
    if (typeof raw !== 'string') return NextResponse.json({ error: 'empty response' }, { status: 502 })

    let parsed: unknown
    try { parsed = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'unparseable response' }, { status: 502 })
    }

    const p = parsed as Record<string, unknown>
    const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1']

    // Only pass through what matches the contract — the client merges this
    // with its own analysis and must not be handed shapes it didn't expect.
    return NextResponse.json({
      score: typeof p.score === 'number' ? Math.max(0, Math.min(100, Math.round(p.score))) : undefined,
      estimated: typeof p.estimated === 'string' && LEVELS.includes(p.estimated) ? p.estimated : undefined,
      strengths: Array.isArray(p.strengths)
        ? p.strengths.filter(s => typeof s === 'string').slice(0, 4) : undefined,
      issues: Array.isArray(p.issues)
        ? p.issues
            .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
            .filter(i => typeof i.fragment === 'string' && typeof i.note === 'string')
            .slice(0, 6)
            .map(i => ({
              fragment: String(i.fragment),
              note: String(i.note),
              fix: typeof i.fix === 'string' ? i.fix : undefined,
            }))
        : undefined,
      corrected: typeof p.corrected === 'string' ? p.corrected.slice(0, 4000) : undefined,
    })
  } catch (err) {
    console.error('[grade-writing]', err)
    return NextResponse.json({ error: 'grading failed' }, { status: 502 })
  }
}
