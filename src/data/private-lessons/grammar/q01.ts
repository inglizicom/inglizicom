import type { GrammarLesson } from './types'

export const q01: GrammarLesson = {
  id: 101,
  slug: 'review-1',
  emoji: '🏆',
  title: { en: 'Review Quiz 1', ar: 'مراجعة ١ — To Be · الملكية · المقالات' },
  description: { en: 'Test your knowledge of lessons 1-3', ar: 'اختبر فهمك للدروس الأولى' },
  level: 'A0',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 1',
      titleAr: 'مراجعة شاملة ١',
      level: 'A0',
      tagAr: 'دروس ١ · ٢ · ٣',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — To Be + الملكية + المقالات',
      questions: [
        // To Be (4 questions)
        {
          promptAr: 'أكمل: "She ___ my teacher."',
          choices: ['am', 'is', 'are'],
          correct: 1,
          explanationAr: '"she" تستخدم "is" — مفردة غائبة.',
        },
        {
          promptAr: 'أكمل: "We ___ from Morocco."',
          choices: ['am', 'is', 'are'],
          correct: 2,
          explanationAr: '"we" تستخدم "are".',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I are happy.', 'I is happy.', 'I am happy.'],
          correct: 2,
          explanationAr: '"I" دائماً مع "am" — استثناء يجب حفظه!',
        },
        {
          promptAr: 'كيف تسأل "هل أنت بخير؟"',
          choices: ['You are okay?', 'Are you okay?', 'Is you okay?'],
          correct: 1,
          explanationAr: 'في السؤال نقلب الترتيب: "Are you okay?"',
        },
        // Possessives (4 questions)
        {
          promptAr: 'أكمل: "___ name is Hamza." (اسمي)',
          choices: ['My', 'Your', 'His'],
          correct: 0,
          explanationAr: '"I" → "my" — "My name is Hamza."',
        },
        {
          promptAr: 'أكمل: "She loves ___ cat." (قطتها)',
          choices: ['his', 'her', 'their'],
          correct: 1,
          explanationAr: '"she" → "her" — المؤنثة.',
        },
        {
          promptAr: 'أكمل: "They lost ___ keys." (مفاتيحهم)',
          choices: ['our', 'your', 'their'],
          correct: 2,
          explanationAr: '"they" → "their".',
        },
        {
          promptAr: 'ما الفرق بين "his" و"he\'s"؟',
          choices: ['نفس المعنى', 'his = ملكية · he\'s = he is', 'he\'s = ملكية · his = he is'],
          correct: 1,
          explanationAr: '"his" = ملكية: "his car" · "he\'s" = he is: "he\'s happy".',
        },
        // Articles (4 questions)
        {
          promptAr: 'أكمل: "She is ___ doctor."',
          choices: ['a', 'an', 'the'],
          correct: 0,
          explanationAr: '"doctor" يبدأ بحرف ساكن (d) إذن "a doctor".',
        },
        {
          promptAr: 'أكمل: "He eats ___ apple every day."',
          choices: ['a', 'an', 'the'],
          correct: 1,
          explanationAr: '"apple" يبدأ بصوت صائت (a) إذن "an apple".',
        },
        {
          promptAr: 'أكمل: "Close ___ door, please." (الباب المعروف)',
          choices: ['a', 'an', 'the'],
          correct: 2,
          explanationAr: '"the door" — الباب محدد ومعروف.',
        },
        {
          promptAr: 'أكمل: "He is ___ engineer."',
          choices: ['a', 'an', 'the'],
          correct: 1,
          explanationAr: '"engineer" يبدأ بصوت صائت (e) إذن "an engineer".',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ذكّر نفسك بهذه القواعد 🎯',
      rules: [
        { ar: 'To Be: I→am · he/she/it→is · you/we/they→are', en: 'am / is / are', example: 'She is happy. We are students.' },
        { ar: 'الملكية: my/your/his/her/its/our/their', en: 'Possessives before nouns', example: 'My name is Hamza.' },
        { ar: 'المقالات: a (ساكن) · an (صائت) · the (محدد)', en: 'a / an / the', example: 'a book · an apple · the door' },
      ],
    },
  ],
}
