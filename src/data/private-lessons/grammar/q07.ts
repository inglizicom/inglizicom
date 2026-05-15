import type { GrammarLesson } from './types'

export const q07: GrammarLesson = {
  id: 107,
  slug: 'review-7',
  emoji: '🏆',
  title: { en: 'Review Quiz 7', ar: 'مراجعة ٧ — كلمات الاستفهام · الأرقام · الألوان' },
  description: { en: 'Test your knowledge of lessons 19-21', ar: 'اختبر فهمك للدروس التاسع عشر والعشرين والحادي والعشرين' },
  level: 'A0',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 7',
      titleAr: 'مراجعة شاملة ٧',
      level: 'A0',
      tagAr: 'دروس ١٩ · ٢٠ · ٢١',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — كلمات الاستفهام + الأرقام + الألوان',
      questions: [
        // Question Words (4 questions)
        {
          promptAr: 'كيف تسأل عن اسم شخص؟',
          choices: ['Where is your name?', 'What is your name?', 'Who is your name?'],
          correct: 1,
          explanationAr: '"What" نسأل بها عن الأشياء والمعلومات مثل الاسم.',
        },
        {
          promptAr: 'أكمل: "___ do you live?"',
          choices: ['When', 'Who', 'Where'],
          correct: 2,
          explanationAr: '"Where" نسأل بها عن المكان.',
        },
        {
          promptAr: 'كيف تسأل عن العمر؟',
          choices: ['How much are you?', 'How old are you?', 'How many years you?'],
          correct: 1,
          explanationAr: '"How old are you?" هي الصيغة الصحيحة للسؤال عن العمر.',
        },
        {
          promptAr: 'أكمل: "___ are you late?" — تريد السؤال عن السبب',
          choices: ['What', 'Where', 'Why'],
          correct: 2,
          explanationAr: '"Why" نسأل بها عن السبب.',
        },
        // Numbers (4 questions)
        {
          promptAr: 'كيف تقول "عمري عشرون سنة" بالإنجليزية؟',
          choices: ['I have twenty years.', 'I am twenty years old.', 'My age has twenty.'],
          correct: 1,
          explanationAr: '"I am twenty years old." — نستخدم am/is مع العمر، وليس have.',
        },
        {
          promptAr: 'ما هو الرقم 15 بالإنجليزية؟',
          choices: ['fifty', 'fifteen', 'fiveteen'],
          correct: 1,
          explanationAr: '"fifteen" — خمسة عشر. الأرقام ١٣-١٩ تنتهي بـ teen.',
        },
        {
          promptAr: 'كيف تكتب ٤٥ بالإنجليزية؟',
          choices: ['fourty-five', 'forty-five', 'forty five'],
          correct: 1,
          explanationAr: '"forty-five" — بشرطة. وانتبه: forty وليس fourty.',
        },
        {
          promptAr: 'كيف تقرأ سنة 1998؟',
          choices: ['nineteen ninety-eight', 'one thousand nine hundred ninety eight', 'nineteen and ninety-eight'],
          correct: 0,
          explanationAr: '"nineteen ninety-eight" — السنوات تُقرأ جزءين.',
        },
        // Colors (4 questions)
        {
          promptAr: 'ما الصواب؟',
          choices: ['I want a jacket red.', 'I want a red jacket.', 'I want red a jacket.'],
          correct: 1,
          explanationAr: 'الصفة تجي قبل الاسم: "a red jacket".',
        },
        {
          promptAr: 'كيف تقول "أحذية سوداء" بالإنجليزية؟',
          choices: ['blacks shoes', 'shoes black', 'black shoes'],
          correct: 2,
          explanationAr: '"black shoes" — الصفة قبل الاسم ولا تتغير في الجمع.',
        },
        {
          promptAr: 'ما الصواب قبل "orange"؟',
          choices: ['a orange bag', 'an orange bag', 'the orange'],
          correct: 1,
          explanationAr: '"an orange bag" — orange تبدأ بصوت حرف علة فنستخدم an.',
        },
        {
          promptAr: 'كيف تقول "أزرق فاتح"؟',
          choices: ['blue light', 'light blue', 'lighter blue'],
          correct: 1,
          explanationAr: '"light blue" — light يجي قبل اللون.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ✨',
      rules: [
        { ar: 'كلمات الاستفهام: What/Where/When/Who/Why/How + is/are/do + Subject', en: 'What is your name? · Where do you live?', example: 'Why are you late? · How old are you?' },
        { ar: 'الأرقام المركبة بشرطة · العمر بـ I am · السنوات بجزءين', en: 'twenty-one · I am 23 years old · nineteen ninety-five', example: 'How old are you? I am thirty-two.' },
        { ar: 'الصفة قبل الاسم · الألوان لا تتغير في الجمع · light/dark للدرجات', en: 'a red car · red cars (NOT reds) · light blue', example: 'She has brown eyes. I want a dark green jacket.' },
      ],
    },
  ],
}
