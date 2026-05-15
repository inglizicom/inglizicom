import type { GrammarLesson } from './types'

export const q05: GrammarLesson = {
  id: 105,
  slug: 'review-5',
  emoji: '🏆',
  title: { en: 'Review Quiz 5', ar: 'مراجعة ٥ — حروف الجر · was/were' },
  description: { en: 'Test your knowledge of lessons 13-15', ar: 'اختبر فهمك للدروس الثالث عشر والرابع عشر والخامس عشر' },
  level: 'A1',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 5',
      titleAr: 'مراجعة شاملة ٥',
      level: 'A1',
      tagAr: 'دروس ١٣ · ١٤ · ١٥',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — حروف المكان + حروف الوقت + was/were',
      questions: [
        // Prepositions of Place (4 questions)
        {
          promptAr: 'أكمل: "The book is ___ the table." (على سطح الطاولة)',
          choices: ['in', 'on', 'at'],
          correct: 1,
          explanationAr: '"on" للأسطح.',
        },
        {
          promptAr: 'أكمل: "She is ___ school right now."',
          choices: ['in', 'on', 'at'],
          correct: 2,
          explanationAr: '"at school" — تعبير ثابت.',
        },
        {
          promptAr: 'أكمل: "The cat is ___ the bed." (تحت)',
          choices: ['on', 'in', 'under'],
          correct: 2,
          explanationAr: '"under" = تحت.',
        },
        {
          promptAr: 'كيف تقول "في الدار البيضاء"؟',
          choices: ['at Casablanca', 'on Casablanca', 'in Casablanca'],
          correct: 2,
          explanationAr: '"in" للمدن والبلدان.',
        },
        // Prepositions of Time (4 questions)
        {
          promptAr: 'أكمل: "I wake up ___ 6am."',
          choices: ['at', 'on', 'in'],
          correct: 0,
          explanationAr: '"at 6am" — at للساعات.',
        },
        {
          promptAr: 'أكمل: "Her birthday is ___ April."',
          choices: ['at', 'on', 'in'],
          correct: 2,
          explanationAr: '"in April" — in للشهور.',
        },
        {
          promptAr: 'أكمل: "We have class ___ Monday."',
          choices: ['at', 'on', 'in'],
          correct: 1,
          explanationAr: '"on Monday" — on للأيام.',
        },
        {
          promptAr: 'كيف تقول "في الليل"؟',
          choices: ['in night', 'on night', 'at night'],
          correct: 2,
          explanationAr: '"at night" — استثناء مهم!',
        },
        // Was/Were (4 questions)
        {
          promptAr: 'أكمل: "She ___ at home yesterday."',
          choices: ['was', 'were', 'is'],
          correct: 0,
          explanationAr: '"she" + "was" في الماضي.',
        },
        {
          promptAr: 'أكمل: "They ___ very tired last night."',
          choices: ['was', 'were', 'are'],
          correct: 1,
          explanationAr: '"they" + "were" في الماضي.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I were happy.', 'I was happy.', 'I am was happy.'],
          correct: 1,
          explanationAr: '"I was" — I دائماً مع was.',
        },
        {
          promptAr: 'أكمل: "___ the exam difficult?" (سؤال)',
          choices: ['Was', 'Were', 'Did'],
          correct: 0,
          explanationAr: '"Was the exam...?" — للمفرد.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ذكّر نفسك بهذه القواعد 🎯',
      rules: [
        { ar: 'in = داخل · on = على سطح · at = نقطة محددة', en: 'in the box · on the table · at school', example: 'The book is on the table. She is at work.' },
        { ar: 'AT + ساعة · ON + يوم · IN + شهر/سنة/فصل', en: 'at 7am · on Monday · in January', example: 'The class is at 9am on Monday.' },
        { ar: 'was (I/he/she/it) · were (you/we/they)', en: 'was / were', example: 'I was tired. They were happy.' },
      ],
    },
  ],
}
