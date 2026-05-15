import type { GrammarLesson } from './types'

export const q09: GrammarLesson = {
  id: 109,
  slug: 'review-9',
  emoji: '🏆',
  title: { en: 'Review Quiz 9', ar: 'مراجعة ٩ — going to · will · الأفعال الشاذة' },
  description: { en: 'Test your knowledge of lessons 25-27', ar: 'اختبر فهمك للدروس ٢٥ و٢٦ و٢٧' },
  level: 'A1',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 9',
      titleAr: 'مراجعة شاملة ٩',
      level: 'A1',
      tagAr: 'دروس ٢٥ · ٢٦ · ٢٧',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — going to + will + الأفعال الشاذة',
      questions: [
        // Going to (4 questions)
        {
          promptAr: 'ما الصواب؟',
          choices: ["I going to study.", "I am going to study.", "I am going to studying."],
          correct: 1,
          explanationAr: '"I am going to study." — am + going to + فعل في أصله.',
        },
        {
          promptAr: 'متى نستخدم going to؟',
          choices: ['للقرارات اللحظية', 'للخطط المقررة مسبقاً', 'للتنبؤات العشوائية'],
          correct: 1,
          explanationAr: '"going to" للخطط المقررة مسبقاً — شيء قررته قبل لحظة الكلام.',
        },
        {
          promptAr: 'أكمل: "She ___ travel to Spain." (going to)',
          choices: ["am going to", "is going to", "are going to"],
          correct: 1,
          explanationAr: '"She is going to travel." — she تأخذ is.',
        },
        {
          promptAr: 'أكمل: "Is she going to ___?" (come)',
          choices: ['comes', 'coming', 'come'],
          correct: 2,
          explanationAr: '"come" — الفعل في أصله بعد going to.',
        },
        // Will (4 questions)
        {
          promptAr: 'ما الصواب؟',
          choices: ["I will to go.", "I will going.", "I will go."],
          correct: 2,
          explanationAr: '"I will go." — will + فعل في أصله بدون to.',
        },
        {
          promptAr: 'ما النفي الصحيح لـ will؟',
          choices: ["willn't", "won't", "willon't"],
          correct: 1,
          explanationAr: '"won\'t" = will not — هذا الاختصار الصحيح.',
        },
        {
          promptAr: 'The phone is ringing. ما القرار اللحظي الصحيح؟',
          choices: ["I'm going to answer it.", "I'll answer it.", "I answer it."],
          correct: 1,
          explanationAr: '"I\'ll answer it." — will للقرار اللحظي المفاجئ.',
        },
        {
          promptAr: 'الجواب القصير على "Will you help me?"',
          choices: ["Yes, I do.", "Yes, I will.", "Yes, I am."],
          correct: 1,
          explanationAr: '"Yes, I will." — الجواب القصير بـ will.',
        },
        // Irregular Past (4 questions)
        {
          promptAr: 'ما ماضي "go"؟',
          choices: ['goed', 'gone', 'went'],
          correct: 2,
          explanationAr: '"went" — go → went (شاذة، نفس الشكل للجميع).',
        },
        {
          promptAr: 'ما ماضي "eat"؟',
          choices: ['eated', 'ate', 'eaten'],
          correct: 1,
          explanationAr: '"ate" — eat → ate (شاذة).',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She goed to school.', 'She gone to school.', 'She went to school.'],
          correct: 2,
          explanationAr: '"She went to school." — go → went للجميع.',
        },
        {
          promptAr: 'أي فعل لا يتغير في الماضي؟',
          choices: ['go', 'eat', 'put'],
          correct: 2,
          explanationAr: '"put" — put → put (لا يتغير في الماضي).',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! ✨',
      rules: [
        { ar: 'going to: am/is/are + going to + فعل أصلي = خطة مسبقة', en: "I'm going to · She's going to · They're going to", example: "I'm going to study medicine next year." },
        { ar: 'will + فعل أصلي = قرار لحظي / وعد / تنبؤ · won\'t = النفي', en: "I'll help · She won't come · Will it rain?", example: "I'll call you. It won't rain today." },
        { ar: 'الأفعال الشاذة تتغير كلياً ولا تأخذ -ed · نفس الشكل للجميع', en: 'go→went · eat→ate · have→had · put→put (no change)', example: 'I went. She went. They went.' },
      ],
    },
  ],
}
