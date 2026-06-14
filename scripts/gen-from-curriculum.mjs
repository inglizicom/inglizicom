/**
 * Regenerate per-LESSON quizzes, per-UNIT exams, and conversation tasks from the
 * REAL Level-1 (Atika.pdf) curriculum content embedded below. A0/A1, strictly on
 * the unit's own material. Run: node --env-file=.env.local scripts/gen-from-curriculum.mjs
 */
import { createClient } from '@supabase/supabase-js'
const OPENAI = process.env.OPENAI_API_KEY, URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!OPENAI || !URL || !KEY) { console.error('Missing env'); process.exit(1) }
const db = createClient(URL, KEY)

// ── Real curriculum content per unit (from Atika.pdf, Level 1 A0–A1) ──
const C = {
1: `GREETINGS: Hello / Hi / Hey, Good morning/afternoon/evening. How are you? I am fine. What's your name? My name is ___. Goodbye / Bye. See you (tomorrow/later/soon). Have a good day/night. Good night. Nice to meet you (too). How do you spell your name? It's spelled H-A-M-Z-A. Alphabet A–Z.
NUMBERS 1–900: one..ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty, twenty-one, thirty, forty (NOT 'fourty'), fifty, sixty, seventy, eighty, ninety, one hundred, two hundred.
AGE: How old are you/he/she/they? I am 27 (years old). He is 33. She is 47. They are 18.
PHONE: What is your/his/her phone number? My phone number is ...
COUNTRIES & NATIONALITIES: Morocco/Moroccan, Spain/Spanish, Italy/Italian, Egypt/Egyptian, Saudi Arabia/Saudi, USA/American, France/French, Algeria/Algerian, Tunisia/Tunisian. Where are you from? I'm from Morocco. What is your nationality? I am Moroccan.
JOBS: a teacher, a doctor, a student, a salesman, a pilot, a nurse, a barber, a farmer, a taxi driver, an engineer, a dentist, a graphic designer, unemployed. What is your job? / What do you do? I am a ___.
MARITAL STATUS: single, engaged, married, divorced, widowed, separated. Are you single? Yes, I am / No, I am not. Is he married? Yes, he is / No, he is not.`,
2: `COMPREHENSIVE CONVERSATION reviewing all of Unit 1 (greetings + self-introduction): name, how are you, where are you from, nationality, job, spelling your name, age, married/single, phone number. Example lines: "Hello! My name is Hamza. What's your name?", "Where are you from?", "I'm from Morocco.", "What is your nationality?", "I'm Moroccan.", "What's your job?", "I'm a barber.", "How old are you?", "I am 27 years old.", "Are you married?", "No, I'm not. I'm single.", "Nice to meet you."  Only Unit-1 language. No past tense.`,
3: `FAMILY TREE vocabulary: grandfather, grandmother, father, mother, brother, sister, husband, wife, son, daughter, grandson, granddaughter, aunt, uncle, cousins, sister-in-law, brother-in-law, nephew, niece; parents, grandparents, children, spouses.
RELATIONSHIPS: Who is X to Y? -> X is Y's (son/husband/daughter/father). e.g. "Adil is Maysoun's husband."
DESCRIBING PEOPLE — appearance: tall/short, thin/fat, strong/weak, handsome/ugly, beautiful/ugly, old/young. Personality: friendly/rude, funny/serious, smart/stupid, generous/mean, shy/outgoing, honest/dishonest. e.g. "My brother is tall and smart." "My parents are generous."`,
4: `INTRODUCE YOURSELF: "Hello, my name is Hamza. I am 28 years old. I am from Morocco. I live in Oued-Zem city. I am an English teacher. I am married. I live with my parents, my wife and my 3 kids."
INTRODUCING SOMEONE: "This is my friend. His/Her name is Ali/Salma. He/She is from Egypt. He/She lives in Cairo. He/She is 18 years old. He/She is single. He/She is a nurse/lawyer."
WH-QUESTIONS: When, What, Why, Where, How, Who, How old. "When is your birthday?", "Where do you live?", "Why are you here?", "How are you?", "Who is your friend?", "What's your name?", "What do you like to eat?"`,
5: `CLASSROOM vocabulary: classroom, notebook, table, school bag, school, students, teacher, pen, pencil, pencilcase, board, locker, eraser, ruler, lesson, homework, chairs, highlighter, exam, test, desk.
STUDENT phrases: Can you repeat, please? I don't understand. Can I go to the bathroom? I finished. What page, please? I forgot my book. Excuse me, I have a question.
TEACHER phrases: Listen / Read / Stop / Again. Repeat after me. Open your book. Focus everyone. Time's up. Raise your hand. Sit down. Stand up. Good job / Well done.`,
6: `VERBS — to be: I am, you are, he/she/it is, we/you/they are. to have: I/you/we/they have, he/she/it has. to go: I/you/we/they go, he/she/it goes. to do: I/you/we/they do, he/she/it does. Subject pronouns: I, you, he, she, it, we, they.
CONNECTORS: to, in, because, without, after, before, but, or, and, between, if, with. Examples: "I am in class.", "She goes to work.", "We have two kids.", "He is a nurse.", "They go before lunch.", "You have a book."`,
7: `HOUSE FURNITURE: bed, dresser, pillow, blanket, wardrobe, mirror, lamp, chair, sofa/couch, table, carpet, stove, dishwasher, fridge, television, washing machine.
PREPOSITIONS OF PLACE: behind, on, between, under, in front of, next to. Examples: "Where is the pillow? The pillow is on the bed.", "The carpet is under the bed.", "The lamp is next to the bed."`,
8: `DAILY ACTIVITIES: wake up, wash my face, brush my teeth, have my breakfast, make my bed, get dressed, put on my makeup, take a shower, go to work, go to school, leave work, go back home, have lunch/dinner, watch TV, do my homework, go to sleep.
TELLING TIME: What time is it? / What's the time? It's 1:30. It's 6:25. It's 9:00. It's 8:30.`,
9: `DAYS OF THE WEEK: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday (always Capital letter).
ADVERBS OF FREQUENCY: always (100%), usually, often, sometimes, rarely, never (0%).
SENTENCE STRUCTURE: subject + adverb + verb. "I always play football on Monday." "I never study on Friday." "I usually visit my grandmother on Saturday." With 'to be': "I am always happy."`,
10: `FOOD: cheese, noodles, pizza, roast chicken, steak, fish, omelette, barbecue, cake, popcorn, potato chips, bread, ice cream, sandwich, tacos, salad.
DRINKS: water, milk, orange juice, tea, coffee, lemon juice, soda, hot chocolate, energy drink, lemonade, chocolate milk, sparkling water, mineral water, milkshake, herbal tea, ginger tea.
PHRASES: What food do you like? I like roast chicken and salad. Do you like pizza? Yes, I do / No, I don't. What is your favourite drink? My favourite drink is chocolate milk.`,
11: `MEANS OF TRANSPORT: bicycle, motorcycle, car, bus, taxi, truck/lorry, train, subway/metro, airplane, ship, boat, ferry, cable car, van, skateboard, tram.
DEMONSTRATIVES: this (singular near), that (singular far), these (plural near), those (plural far). "This is a car.", "That is a ball.", "These are books.", "Those are chairs.", "What is this? This is a house."`,
12: `PLACES AROUND TOWN: bank, mosque, hospital, bakery, supermarket, school, park, pharmacy, gas station, post office, police station, bus station, library, hotel, cinema, laundry.
DIRECTIONS: go straight, turn right, turn left, at the roundabout, at the traffic lights, zebra crossing. "Where is the pharmacy? Go straight, then turn right."
THERE IS / THERE ARE: There is a room in the hotel. There are many buses. How many buses are there? There are five buses.`,
13: `JOBS: a doctor, a driver, a cook, a pilot, a cleaner, a teacher, a manager, a lawyer/judge.
VERBS: to cook, to swim, to read, to write, to drive, to ride, to play, to carry, to fly, to speak, to drink, to eat, to mix, to study, to work, to watch.
CAN / CAN'T (ability): Can you fly an airplane? No, I can't. A driver can drive a bus or a taxi. A cook can't work in a court. Can he speak English? No, he can't. He can speak Spanish.`,
14: `HOBBIES & FREE TIME: cooking, playing football, reading books, swimming, learning English, riding horses, climbing, hiking, camping, drawing, travelling, helping others, exercising, playing chess, video games, baking.
LIKE conjugation: I/you/we/they like, he/she/it likes. Negative: I don't like, he doesn't like. Question: Do you like...? Does he like...? "What do you like to do in your free time? I like hiking and drawing."`,
}

const QUIZ_SYS = (level = 'A0') => `You are a careful English teacher writing a quiz for ABSOLUTE-BEGINNER Arabic speakers (CEFR ${level}).
Respond ONLY JSON: { "questions":[ { "q":"نص السؤال بالعربية", "choices":["English A","English B","English C","English D"], "answer":0, "explain":"شرح قصير بالعربية" } ] }
HARD RULES:
- Use ONLY the vocabulary, phrases and grammar in the UNIT CONTENT provided. Do NOT introduce any word or grammar not present in it.
- No past tense, no future, unless it appears in the content. No invented names/phone numbers/dialogues.
- Question text "q" in Arabic; choices in English (except when the question asks for the Arabic meaning, then choices are Arabic). 4 choices, one correct, vary the correct index.
- Mix: vocabulary meaning, fill-in-the-blank, choose the correct sentence/word order, spelling (e.g. Forty vs Fourty), and simple translation.
- Plausible beginner distractors, never silly.`

async function ai(system, user, max = 2200) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.3, max_tokens: max, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 160))
  return JSON.parse(d.choices?.[0]?.message?.content ?? '{}')
}
const clean = arr => (Array.isArray(arr) ? arr : []).map(q => ({
  q: String(q?.q ?? '').trim(),
  choices: Array.isArray(q?.choices) ? q.choices.map(c => String(c)).filter(Boolean).slice(0, 4) : [],
  answer: Number.isInteger(q?.answer) ? q.answer : 0,
  explain: q?.explain ? String(q.explain) : undefined,
})).filter(q => q.q && q.choices.length >= 3 && q.answer < q.choices.length)

const { data: mods } = await db.from('lms_modules')
  .select('id, title, module_order, lms_courses!inner(is_published)')
  .eq('lms_courses.is_published', true).order('module_order')

for (const m of (mods ?? [])) {
  const src = C[m.module_order]
  if (!src) { console.log(`– U${m.module_order} no curriculum, skip`); continue }
  try {
    // 1) UNIT EXAM (10–12)
    const ex = clean((await ai(QUIZ_SYS(), `UNIT CONTENT:\n${src}\n\nWrite the end-of-unit exam: 10–12 questions covering this unit's content only.`, 2800)).questions)
    if (ex.length >= 10) await db.from('lms_modules').update({ exam_quiz: { questions: ex } }).eq('id', m.id)
    // 2) CONVERSATION TASK
    const t = await ai(`You design a tiny A0 writing task from the unit content. JSON: { "sentences":["جملة عربية1","جملة عربية2","جملة عربية3"], "topic":"موضوع محادثة قصيرة بالعربية" } — sentences must translate to English that only uses the unit's language.`, `UNIT CONTENT:\n${src}`, 500)
    const sents = (Array.isArray(t.sentences) ? t.sentences : []).map(s => String(s).trim()).filter(Boolean).slice(0, 4)
    if (sents.length >= 2 && t.topic) {
      const prompt = `📝 مهمّتك في هذه الوحدة:\n\n١) ترجم هذه الجمل إلى الإنجليزية:\n${sents.map((x, i) => `   ${['أ','ب','ج','د'][i]}) ${x}`).join('\n')}\n\n٢) اكتب محادثة قصيرة (٣–٤ أسطر) بالإنجليزية عن: ${t.topic}\n\n✍️ اكتب كل ذلك في الصندوق بالأسفل ثم أرسله للتصحيح.`
      await db.from('lms_modules').update({ conversation_prompt: prompt }).eq('id', m.id)
    }
    // 3) PER-LESSON QUIZZES (focus each lesson within the unit content)
    const { data: lessons } = await db.from('lms_lessons').select('id, title').eq('module_id', m.id).order('lesson_order')
    let lq = 0
    for (const l of (lessons ?? [])) {
      const q = clean((await ai(QUIZ_SYS(), `UNIT CONTENT:\n${src}\n\nFocus on the part of this unit about: "${l.title}". Write 6–7 questions for THIS lesson only, using the unit's language.`, 1600)).questions)
      if (q.length >= 5) { await db.from('lms_lessons').update({ quiz: { questions: q }, has_quiz: true }).eq('id', l.id); lq++ }
    }
    console.log(`✓ U${m.module_order} ${m.title} — exam ${ex.length}Q, ${lq} lesson quizzes, task ✓`)
  } catch (e) { console.log(`✗ U${m.module_order} ${e.message}`) }
}
console.log('\nDone.')
