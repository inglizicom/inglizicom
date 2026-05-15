import type { GrammarLesson } from './types'

export const q08: GrammarLesson = {
  id: 108,
  slug: 'review-8',
  emoji: '🏆',
  title: { en: 'Review Quiz 8', ar: 'مراجعة ٨ — المقارنة · أقصى درجة · المضارع المستمر' },
  description: { en: 'Test your knowledge of lessons 22-24', ar: 'اختبر فهمك للدروس ٢٢ و٢٣ و٢٤' },
  level: 'A1',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 8',
      titleAr: 'مراجعة شاملة ٨',
      level: 'A1',
      tagAr: 'دروس ٢٢ · ٢٣ · ٢٤',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — المقارنة + أقصى درجة + المضارع المستمر',
      questions: [
        // Comparatives (4 questions)
        {
          promptAr: 'ما الصواب؟',
          choices: ['This is more big than that.', 'This is bigger than that.', 'This is biger than that.'],
          correct: 1,
          explanationAr: '"bigger" — big قصيرة فتأخذ -er مع مضاعفة g.',
        },
        {
          promptAr: 'أكمل: "This phone is ___ than mine." (expensive)',
          choices: ['expensiver', 'more expensive', 'most expensive'],
          correct: 1,
          explanationAr: '"more expensive" — الصفات الطويلة تأخذ more.',
        },
        {
          promptAr: 'ما صيغة المقارنة لـ good؟',
          choices: ['gooder', 'more good', 'better'],
          correct: 2,
          explanationAr: '"better" — good → better (شاذة، يجب حفظها).',
        },
        {
          promptAr: 'أكمل: "English is ___ than Japanese." (easy)',
          choices: ['more easy', 'easyer', 'easier'],
          correct: 2,
          explanationAr: '"easier" — easy → easier (y → ier).',
        },
        // Superlatives (4 questions)
        {
          promptAr: 'ما الصواب؟',
          choices: ['This is most big city.', 'This is the most big city.', 'This is the biggest city.'],
          correct: 2,
          explanationAr: '"the biggest" — big قصيرة فتأخذ the + gest. لا نقول "most big".',
        },
        {
          promptAr: 'أكمل: "She is ___ girl in the class." (beautiful)',
          choices: ['the most beautiful', 'the beautifulest', 'most beautiful'],
          correct: 0,
          explanationAr: '"the most beautiful" — beautiful طويلة. ولا ننسى the!',
        },
        {
          promptAr: 'ما صيغة أقصى درجة لـ bad؟',
          choices: ['the baddest', 'the most bad', 'the worst'],
          correct: 2,
          explanationAr: '"the worst" — bad → the worst (شاذة).',
        },
        {
          promptAr: 'أكمل: "He is ___ student of all." (good)',
          choices: ['the goodest', 'the most good', 'the best'],
          correct: 2,
          explanationAr: '"the best" — good → the best (شاذة).',
        },
        // Present Continuous (4 questions)
        {
          promptAr: 'ما الصواب؟',
          choices: ['I working now.', 'I am work now.', 'I am working now.'],
          correct: 2,
          explanationAr: '"I am working now." — am + verb-ing.',
        },
        {
          promptAr: 'أكمل: "She ___ dinner." (cook)',
          choices: ['is cooks', 'is cooking', 'are cooking'],
          correct: 1,
          explanationAr: '"She is cooking" — she تأخذ is، والفعل بـ -ing.',
        },
        {
          promptAr: 'ما الفعل الصحيح: run → ___ing',
          choices: ['runing', 'running', 'runeing'],
          correct: 1,
          explanationAr: '"running" — run ينتهي بـ CVC فتضاعف n.',
        },
        {
          promptAr: 'أي فعل لا يُستخدم في المضارع المستمر؟',
          choices: ['eat', 'know', 'study'],
          correct: 1,
          explanationAr: '"know" فعل حالة — نقول "I know" وليس "I am knowing".',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ✨',
      rules: [
        { ar: 'المقارنة: صفة قصيرة + er + than · more + صفة طويلة + than', en: 'taller than · more expensive than', example: 'This is bigger than that. She is more intelligent than him.' },
        { ar: 'أقصى درجة: the + صفة + est · the most + صفة طويلة (دائماً the!)', en: 'the biggest · the most beautiful', example: 'He is the best student of all.' },
        { ar: 'المضارع المستمر: am/is/are + verb-ing للأشياء التي تحدث الآن', en: 'I am eating · She is working · They are studying', example: 'What are you doing? I am studying right now.' },
      ],
    },
  ],
}
