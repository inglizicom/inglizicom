import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { message, words, lessonTitle, history } = await req.json()

  if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

  const wordList = (words as string[]).join(', ')

  const systemPrompt = `You are a friendly English coach for Arabic speakers.
The student just finished a lesson called "${lessonTitle}". They learned these 3 words: ${wordList}.

Your job:
- Ask simple questions using ONLY these words
- Keep every message SHORT (1-2 sentences max)
- Mix English with a little Arabic to help them understand
- Celebrate when they answer correctly 🎉
- Gently correct mistakes without explaining grammar rules
- After 3-4 exchanges, tell them they did great and the lesson is complete

Start by asking a simple question using one of the words.
Never explain grammar. Just use the language naturally.`

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...(history || []),
    { role: 'user', content: message },
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 150,
    temperature: 0.7,
  })

  const reply = completion.choices[0]?.message?.content ?? 'Good job! 🎉'
  return NextResponse.json({ reply })
}
