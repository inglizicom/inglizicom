import type { GrammarLesson } from './types'

export const q02: GrammarLesson = {
  id: 102,
  slug: 'review-2',
  emoji: '🏆',
  title: { en: 'Review Quiz 2', ar: 'مراجعة ٢ — الإشارة · have/has · المضارع البسيط' },
  description: { en: 'Test your knowledge of lessons 4-6', ar: 'اختبر فهمك للدروس الرابع والخامس والسادس' },
  level: 'A0',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 2',
      titleAr: 'مراجعة شاملة ٢',
      level: 'A0',
      tagAr: 'دروس ٤ · ٥ · ٦',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — الإشارة + have/has + المضارع البسيط',
      questions: [
        // This/That/These/Those (4 questions)
        {
          promptAr: 'تشير إلى كتاب قريب منك (مفرد) — ماذا تقول؟',
          choices: ['That is a book.', 'This is a book.', 'These is a book.'],
          correct: 1,
          explanationAr: '"this" = قريب + مفرد.',
        },
        {
          promptAr: 'أكمل: "___ are my sisters." (هنا قريبات، أكثر من واحدة)',
          choices: ['This', 'That', 'These'],
          correct: 2,
          explanationAr: '"these" = قريب + جمع.',
        },
        {
          promptAr: 'أكمل: "___ is a beautiful building." (بعيد)',
          choices: ['This', 'That', 'Those'],
          correct: 1,
          explanationAr: '"that" = بعيد + مفرد.',
        },
        {
          promptAr: 'ما الفرق بين "these" و"those"؟',
          choices: ['these = بعيد · those = قريب', 'these = قريب + جمع · those = بعيد + جمع', 'نفس المعنى'],
          correct: 1,
          explanationAr: '"these" = قريب + جمع · "those" = بعيد + جمع.',
        },
        // Have/Has (4 questions)
        {
          promptAr: 'أكمل: "She ___ two brothers."',
          choices: ['have', 'has', 'is'],
          correct: 1,
          explanationAr: '"she" تستخدم "has".',
        },
        {
          promptAr: 'أكمل: "We ___ a big house."',
          choices: ['have', 'has', 'are'],
          correct: 0,
          explanationAr: '"we" تستخدم "have".',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["He don't have time.", "He doesn't have time.", "He hasn't time."],
          correct: 1,
          explanationAr: 'مع "he" النفي هو "doesn\'t have".',
        },
        {
          promptAr: 'من يستخدم "has"؟',
          choices: ['I / You / We / They', 'He / She / It', 'الكل'],
          correct: 1,
          explanationAr: 'فقط he/she/it تستخدم "has".',
        },
        // Simple Present (4 questions)
        {
          promptAr: 'أكمل: "He ___ in a bank." (work)',
          choices: ['work', 'works', 'is work'],
          correct: 1,
          explanationAr: '"he" يأخذ s: "works".',
        },
        {
          promptAr: 'أكمل: "They ___ football every Sunday." (play)',
          choices: ['plays', 'play', 'is play'],
          correct: 1,
          explanationAr: '"they" لا تأخذ s: "play".',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She is work every day.', 'She works every day.', 'She work every day.'],
          correct: 1,
          explanationAr: 'مع "she" نضيف s: "works". ولا نستخدم "is" مع العادات.',
        },
        {
          promptAr: 'متى نستخدم المضارع البسيط؟',
          choices: ['للأفعال اللحظية (الآن)', 'للعادات والحقائق الدائمة', 'للأفعال الماضية'],
          correct: 1,
          explanationAr: 'المضارع البسيط للعادات (every day) والحقائق الدائمة.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ذكّر نفسك بهذه القواعد 🎯',
      rules: [
        { ar: 'this/that (مفرد) · these/those (جمع) · قريب/بعيد', en: 'this (near) · that (far) · these/those (plural)', example: 'This is my phone. Those are his books.' },
        { ar: 'have (I/you/we/they) · has (he/she/it)', en: 'have / has', example: 'She has a car. We have a big house.' },
        { ar: 'المضارع البسيط: أضف s مع he/she/it', en: 'He works · She lives · It runs', example: 'She drinks coffee every morning.' },
      ],
    },
  ],
}
