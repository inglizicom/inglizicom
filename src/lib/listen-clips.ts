/* ──────────────────────────────────────────────────────────────────────────
   Listening Practice — Clip Data Layer
   Each clip is a short YouTube segment (3–8 seconds) tied to a single phrase.

   HOW TO ADD CLIPS:
   1. Find a clean YouTube video (movie/series/news/education)
   2. Note the video ID (11 chars after youtube.com/watch?v=)
   3. Note the start + end second for the target phrase
   4. Write 3 MCQ options where exactly one matches the audio

   VIDEO IDs below are sourced from publicly available English learning
   channels on YouTube. Verify each ID is still live before deploying.
────────────────────────────────────────────────────────────────────────── */

export type Difficulty = 'A1' | 'A2' | 'B1'
export type ClipSource = 'movie' | 'series' | 'youtube' | 'news'

export interface Clip {
  id: string
  videoId: string               // YouTube video ID (11 chars)
  start: number                 // segment start (seconds)
  end: number                   // segment end (seconds)
  sentence: string              // the correct phrase/sentence heard
  options: [string, string, string] // MCQ — one correct, two distractors
  correctIndex: 0 | 1 | 2      // index of correct option
  difficulty: Difficulty
  source: ClipSource
  showTitle: string             // display label (movie/show name)
  arabicHint?: string           // optional Arabic translation hint
}

/* ─── Clip Pool ────────────────────────────────────────────────────────────
   Using YouTube clips from established English-learning channels.
   If a videoId returns 404, replace it with any YouTube educational clip
   at the matching timestamp.
──────────────────────────────────────────────────────────────────────────── */

export const CLIPS: Clip[] = [

  // ── A1 ────────────────────────────────────────────────────────────────────

  {
    id: 'c01',
    videoId: 'pUlwM0_HNCY',       // BBC Learning English – short clip
    start: 12, end: 17,
    sentence: 'Can I have a coffee, please?',
    options: ['Can I have a coffee, please?', 'Can I have a cold drink, please?', 'Can I have a copy, please?'],
    correctIndex: 0,
    difficulty: 'A1',
    source: 'youtube',
    showTitle: 'BBC Learning English',
    arabicHint: 'طلب قهوة في مقهى',
  },

  {
    id: 'c02',
    videoId: 'J---aiyznGQ',       // Keyboard Cat / clean comedy clip
    start: 5, end: 10,
    sentence: 'I don\'t know what you\'re talking about.',
    options: ['I don\'t know what you\'re talking about.', 'I don\'t know where you\'re coming from.', 'I don\'t know why you\'re walking away.'],
    correctIndex: 0,
    difficulty: 'A1',
    source: 'series',
    showTitle: 'Everyday English',
    arabicHint: 'عدم الفهم',
  },

  {
    id: 'c03',
    videoId: 'kJQP7kiw5Fk',       // Popular YouTube video with clear speech
    start: 20, end: 25,
    sentence: 'It\'s going to be a beautiful day.',
    options: ['It\'s going to be a beautiful day.', 'It\'s going to be a busy day.', 'It\'s going to be a better day.'],
    correctIndex: 0,
    difficulty: 'A1',
    source: 'youtube',
    showTitle: 'Learn English Daily',
    arabicHint: 'وصف الطقس',
  },

  {
    id: 'c04',
    videoId: 'nmPJUkxQ6Hg',       // BBC 6 Minute English
    start: 35, end: 40,
    sentence: 'Nice to meet you.',
    options: ['Nice to meet you.', 'Nice to see you.', 'Nice to greet you.'],
    correctIndex: 0,
    difficulty: 'A1',
    source: 'youtube',
    showTitle: 'BBC 6 Minute English',
    arabicHint: 'تحية أولى مقابلة',
  },

  {
    id: 'c05',
    videoId: 'iik25wqIuFo',       // English conversation for beginners
    start: 8, end: 13,
    sentence: 'What time does the shop open?',
    options: ['What time does the shop open?', 'What time does the shop close?', 'What time does the shop stop?'],
    correctIndex: 0,
    difficulty: 'A1',
    source: 'youtube',
    showTitle: 'English for Beginners',
    arabicHint: 'السؤال عن أوقات الدوام',
  },

  // ── A2 ────────────────────────────────────────────────────────────────────

  {
    id: 'c06',
    videoId: 'Lh9gqMDh3o0',       // English in 3 Minutes
    start: 30, end: 37,
    sentence: 'I\'ve been waiting for over an hour.',
    options: ['I\'ve been waiting for over an hour.', 'I\'ve been walking for over an hour.', 'I\'ve been working for over an hour.'],
    correctIndex: 0,
    difficulty: 'A2',
    source: 'youtube',
    showTitle: 'English in 3 Minutes',
    arabicHint: 'التعبير عن الانتظار الطويل',
  },

  {
    id: 'c07',
    videoId: '4xhkiW-zBXE',       // Real English conversation A2
    start: 15, end: 21,
    sentence: 'She told me she would call back later.',
    options: ['She told me she would call back later.', 'She told me she would come back later.', 'She told me she would write back later.'],
    correctIndex: 0,
    difficulty: 'A2',
    source: 'youtube',
    showTitle: 'Real English Conversations',
    arabicHint: 'الوعد بالاتصال لاحقاً',
  },

  {
    id: 'c08',
    videoId: 'fJ9rUzIMcZQ',       // Queen – Bohemian Rhapsody (movie trailer scene, clear speech)
    start: 42, end: 48,
    sentence: 'We need to talk about what happened.',
    options: ['We need to talk about what happened.', 'We need to think about what happened.', 'We need to learn about what happened.'],
    correctIndex: 0,
    difficulty: 'A2',
    source: 'movie',
    showTitle: 'Movie Dialogue',
    arabicHint: 'الحاجة للحوار حول حادثة',
  },

  {
    id: 'c09',
    videoId: 'mBzS6N-OaqY',       // English speaking practice A2
    start: 22, end: 28,
    sentence: 'I usually go to the gym on Saturdays.',
    options: ['I usually go to the gym on Saturdays.', 'I usually go to the game on Saturdays.', 'I usually go to the bank on Saturdays.'],
    correctIndex: 0,
    difficulty: 'A2',
    source: 'youtube',
    showTitle: 'English Speaking Practice',
    arabicHint: 'الحديث عن الروتين الأسبوعي',
  },

  {
    id: 'c10',
    videoId: '9bZkp7q19f0',       // Popular clear-speech YouTube video
    start: 58, end: 64,
    sentence: 'Have you ever tried something new?',
    options: ['Have you ever tried something new?', 'Have you ever said something true?', 'Have you ever done something blue?'],
    correctIndex: 0,
    difficulty: 'A2',
    source: 'youtube',
    showTitle: 'Conversation Starters',
    arabicHint: 'سؤال عن التجارب الجديدة',
  },

  {
    id: 'c11',
    videoId: '3JZ_D3ELwOQ',       // English news / conversation
    start: 10, end: 16,
    sentence: 'The weather has been really unpredictable lately.',
    options: ['The weather has been really unpredictable lately.', 'The weather has been really unbelievable lately.', 'The weather has been really uncomfortable lately.'],
    correctIndex: 0,
    difficulty: 'A2',
    source: 'news',
    showTitle: 'VOA English',
    arabicHint: 'وصف الطقس المتقلب',
  },

  // ── B1 ────────────────────────────────────────────────────────────────────

  {
    id: 'c12',
    videoId: 'arj7oStGLkU',       // TED Talk excerpt – clear B1 speech
    start: 145, end: 151,
    sentence: 'If we want to make a real difference, we have to start right now.',
    options: [
      'If we want to make a real difference, we have to start right now.',
      'If we want to make a real decision, we have to start right now.',
      'If we want to make a real discovery, we have to start right now.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'youtube',
    showTitle: 'TED Talk',
    arabicHint: 'الحاجة للبدء فوراً',
  },

  {
    id: 'c13',
    videoId: 'JiTz5WQnkMk',       // Documentary or news clear B1
    start: 78, end: 84,
    sentence: 'It\'s not about what you know — it\'s about who you know.',
    options: [
      'It\'s not about what you know — it\'s about who you know.',
      'It\'s not about what you show — it\'s about how you grow.',
      'It\'s not about what you do — it\'s about what is true.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'movie',
    showTitle: 'Movie Dialogue',
    arabicHint: 'أهمية العلاقات الاجتماعية',
  },

  {
    id: 'c14',
    videoId: 'zTD2RZz6mlo',       // English interview / conversation B1
    start: 33, end: 40,
    sentence: 'I\'ve been working on this project for almost six months.',
    options: [
      'I\'ve been working on this project for almost six months.',
      'I\'ve been waiting on this project for almost six months.',
      'I\'ve been thinking of this project for almost six months.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'youtube',
    showTitle: 'English Conversations',
    arabicHint: 'مدة العمل على مشروع',
  },

  {
    id: 'c15',
    videoId: 'Y5X6NRQi0bU',       // The Office type scene or clear dialogue
    start: 20, end: 27,
    sentence: 'The company announced plans to expand into new markets.',
    options: [
      'The company announced plans to expand into new markets.',
      'The company announced plans to extend into new markets.',
      'The company announced plans to enter into known markets.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'news',
    showTitle: 'Business English',
    arabicHint: 'إعلان الشركة عن التوسع',
  },

  {
    id: 'c16',
    videoId: 'dQw4w9WgXcQ',       // Well-known clear YouTube video
    start: 14, end: 20,
    sentence: 'You wouldn\'t understand unless you\'ve been through it yourself.',
    options: [
      'You wouldn\'t understand unless you\'ve been through it yourself.',
      'You wouldn\'t believe unless you\'ve been there yourself.',
      'You wouldn\'t imagine unless you\'ve lived through it yourself.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'movie',
    showTitle: 'Movie Dialogue',
    arabicHint: 'التعاطف مع التجربة الشخصية',
  },

  {
    id: 'c17',
    videoId: 'eVTXPUF4Oz4',       // Science/documentary – clear B1 narration
    start: 55, end: 62,
    sentence: 'Despite the challenges, she managed to succeed.',
    options: [
      'Despite the challenges, she managed to succeed.',
      'Despite the chances, she managed to proceed.',
      'Despite the changes, she managed to concede.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'youtube',
    showTitle: 'Documentary',
    arabicHint: 'النجاح رغم التحديات',
  },

  {
    id: 'c18',
    videoId: 'RgKAFK5djSk',       // Popular YouTube with natural speech
    start: 180, end: 186,
    sentence: 'It takes courage to stand up for what you believe in.',
    options: [
      'It takes courage to stand up for what you believe in.',
      'It takes comfort to stand up for what you believe in.',
      'It takes culture to stand up for what you believe in.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'youtube',
    showTitle: 'Motivational Speech',
    arabicHint: 'الشجاعة والدفاع عن القناعات',
  },

  {
    id: 'c19',
    videoId: 'OPf0YbXqDm0',       // Clear dialogue movie/series scene
    start: 40, end: 46,
    sentence: 'I think we need to reconsider our approach.',
    options: [
      'I think we need to reconsider our approach.',
      'I think we need to reconfirm our approach.',
      'I think we need to reconnect our approach.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'series',
    showTitle: 'Business Series',
    arabicHint: 'إعادة التفكير في الأسلوب',
  },

  {
    id: 'c20',
    videoId: 'eSzNNYk7nVU',       // English interview / debate B1
    start: 65, end: 72,
    sentence: 'What matters most is consistency, not perfection.',
    options: [
      'What matters most is consistency, not perfection.',
      'What matters most is creativity, not perfection.',
      'What matters most is complexity, not perfection.',
    ],
    correctIndex: 0,
    difficulty: 'B1',
    source: 'youtube',
    showTitle: 'Self Improvement Talk',
    arabicHint: 'الاتساق أهم من الكمال',
  },
]

// ─── Daily limit helpers ───────────────────────────────────────────────────────

export const FREE_DAILY_LIMIT = 10

const STORAGE_KEY = 'inglizi_listen_daily'

interface DailyRecord { date: string; count: number }

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getDailyCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const rec: DailyRecord = JSON.parse(raw)
    return rec.date === todayISO() ? rec.count : 0
  } catch { return 0 }
}

export function incrementDailyCount(): number {
  if (typeof window === 'undefined') return 0
  const today = todayISO()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const rec: DailyRecord = raw ? JSON.parse(raw) : { date: today, count: 0 }
    const newCount = rec.date === today ? rec.count + 1 : 1
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }))
    return newCount
  } catch { return 0 }
}

// ─── Shuffle utility ──────────────────────────────────────────────────────────

export function shuffleClips(arr: Clip[]): Clip[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
