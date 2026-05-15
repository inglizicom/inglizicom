import type { GrammarLesson } from './types'

export const q06: GrammarLesson = {
  id: 106,
  slug: 'review-6',
  emoji: '🏆',
  title: { en: 'Review Quiz 6', ar: 'مراجعة ٦ — الماضي البسيط · didn\'t · Did you?' },
  description: { en: 'Test your knowledge of lessons 16-18', ar: 'اختبر فهمك للدروس السادس عشر والسابع عشر والثامن عشر' },
  level: 'A1',
  isReview: true,
  sections: [
    {
      kind: 'cover',
      emoji: '🏆',
      title: 'Review Quiz 6',
      titleAr: 'مراجعة شاملة ٦',
      level: 'A1',
      tagAr: 'دروس ١٦ · ١٧ · ١٨',
    },
    {
      kind: 'quiz',
      titleAr: '١٢ سؤالاً — الماضي البسيط + النفي + الأسئلة',
      questions: [
        // Simple Past Regular (4 questions)
        {
          promptAr: 'ما صيغة الماضي لـ "study"؟',
          choices: ['studyed', 'studied', 'studid'],
          correct: 1,
          explanationAr: 'study → studied (y + حرف ساكن → ied).',
        },
        {
          promptAr: 'ما صيغة الماضي لـ "stop"؟',
          choices: ['stoped', 'stopped', 'stopd'],
          correct: 1,
          explanationAr: 'stop → stopped (CVC → مضاعفة p + ed).',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I work yesterday.', 'I worked yesterday.', 'I was work yesterday.'],
          correct: 1,
          explanationAr: '"worked" — الماضي البسيط.',
        },
        {
          promptAr: 'هل الفعل يتغير مع he/she/it في الماضي البسيط؟',
          choices: ['نعم، نضيف s', 'لا، نفس الشكل للجميع', 'نعم، نضيف es'],
          correct: 1,
          explanationAr: 'نفس الشكل للجميع: I worked / She worked / They worked.',
        },
        // Didn't (4 questions)
        {
          promptAr: 'أكمل: "She ___ go to work yesterday."',
          choices: ["doesn't", "didn't", "wasn't"],
          correct: 1,
          explanationAr: '"didn\'t" للنفي في الماضي.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["I didn't worked.", "I didn't work.", "I not worked."],
          correct: 1,
          explanationAr: '"didn\'t work" — الفعل في أصله بعد didn\'t.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["She didn't went.", "She didn't goes.", "She didn't go."],
          correct: 2,
          explanationAr: '"go" في أصله بعد didn\'t — وليس went.',
        },
        {
          promptAr: 'من يستخدم "didn\'t"؟',
          choices: ['I فقط', 'he/she/it فقط', 'جميع الضمائر'],
          correct: 2,
          explanationAr: '"didn\'t" مع جميع الضمائر.',
        },
        // Did Questions (4 questions)
        {
          promptAr: 'أكمل: "___ she go to school yesterday?"',
          choices: ['Does', 'Did', 'Was'],
          correct: 1,
          explanationAr: '"Did" للأسئلة في الماضي.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['Did she went?', 'Did she goes?', 'Did she go?'],
          correct: 2,
          explanationAr: '"go" في أصله بعد Did.',
        },
        {
          promptAr: 'الجواب على "Did you eat?"',
          choices: ["Yes, I ate.", "Yes, I did.", "Yes, I do."],
          correct: 1,
          explanationAr: '"Yes, I did." — الجواب القصير.',
        },
        {
          promptAr: 'أكمل: "What ___ you do last weekend?"',
          choices: ['do', 'did', 'done'],
          correct: 1,
          explanationAr: '"What did you do?" — did للماضي.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'أحسنت! أتممت مستوى A1 🎓',
      rules: [
        { ar: 'الماضي البسيط: أضف -ed (نفس الشكل للجميع)', en: 'work → worked · study → studied', example: 'She worked yesterday. They played football.' },
        { ar: 'النفي: didn\'t + فعل في أصله (للجميع)', en: "didn't + base verb", example: "I didn't go. She didn't eat." },
        { ar: 'السؤال: Did + Subject + فعل في أصله...?', en: 'Did you go? · Did she eat?', example: "Did they enjoy the trip? Yes, they did." },
      ],
    },
  ],
}
