import type { GrammarLesson } from './types'

export const g07: GrammarLesson = {
  id: 7,
  slug: 'dont-doesnt',
  emoji: '🚫',
  title: { en: "Don't / Doesn't", ar: 'النفي: don\'t و doesn\'t' },
  description: { en: 'Make negative sentences in the present', ar: 'كيف تنفي الجمل في المضارع البسيط' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🚫',
      title: "Don't / Doesn't",
      titleAr: "النفي: don't و doesn't",
      level: 'A1',
      tagAr: 'درس ٧ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تقول "لا أحب" و"لا يأكل"؟',
      bodyAr:
        'لنفي أفعال المضارع البسيط نستخدم don\'t أو doesn\'t قبل الفعل. القاعدة الذهبية: doesn\'t تأخذ الـ s بدلاً من الفعل. يعني "She works" ← "She doesn\'t work" (ليس "doesn\'t works"). الـ s انتقلت من الفعل إلى does!',
      arabicEx: 'هي لا تشرب القهوة.',
      englishEx: "She DOESN'T drink coffee.",
      noteAr: "اللاحظ أن 'drink' بدون s — الـ s ذهبت إلى doesn't",
    },
    {
      kind: 'patternTable',
      titleAr: "don't أم doesn't؟",
      rows: [
        { pronoun: 'I', pronounAr: 'أنا', verb: "don't", exampleEn: "I don't like sugar.", exampleAr: 'لا أحب السكر.', emoji: '🍬' },
        { pronoun: 'You', pronounAr: 'أنتَ / أنتِ', verb: "don't", exampleEn: "You don't have time.", exampleAr: 'ليس عندك وقت.', emoji: '⏰' },
        { pronoun: 'He', pronounAr: 'هو', verb: "doesn't", exampleEn: "He doesn't eat meat.", exampleAr: 'هو لا يأكل اللحم.', emoji: '🥩' },
        { pronoun: 'She', pronounAr: 'هي', verb: "doesn't", exampleEn: "She doesn't drink coffee.", exampleAr: 'هي لا تشرب القهوة.', emoji: '☕' },
        { pronoun: 'We', pronounAr: 'نحن', verb: "don't", exampleEn: "We don't work on Sundays.", exampleAr: 'لا نعمل يوم الأحد.', emoji: '🏖️' },
        { pronoun: 'They', pronounAr: 'هم / هن', verb: "don't", exampleEn: "They don't speak Arabic.", exampleAr: 'هم لا يتكلمون العربية.', emoji: '🌍' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل النفي في الحياة اليومية',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "don't", role: 'negation' },
            { text: 'like', role: 'verb' }, { text: 'coffee', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لا أحب القهوة.',
          emoji: '☕',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: "doesn't", role: 'negation' },
            { text: 'eat', role: 'verb' }, { text: 'meat', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي لا تأكل اللحم.',
          emoji: '🥩',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: "doesn't", role: 'negation' },
            { text: 'speak', role: 'verb' }, { text: 'French', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو لا يتكلم الفرنسية.',
          emoji: '🇫🇷',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: "don't", role: 'negation' },
            { text: 'have', role: 'verb' }, { text: 'a car', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندنا سيارة.',
          emoji: '🚗',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "don't", role: 'negation' },
            { text: 'live', role: 'verb' }, { text: 'here', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هم لا يسكنون هنا.',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'My brother', role: 'subject' }, { text: "doesn't", role: 'negation' },
            { text: 'study', role: 'verb' }, { text: 'English', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أخي لا يدرس الإنجليزية.',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "don't", role: 'negation' },
            { text: 'understand', role: 'verb' }, { text: 'this word', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لا أفهم هذه الكلمة.',
          emoji: '❓',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: "doesn't", role: 'negation' },
            { text: 'work', role: 'verb' }, { text: 'on weekends', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي لا تعمل في عطل نهاية الأسبوع.',
          emoji: '🏖️',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: "doesn't", role: 'negation' },
            { text: 'know', role: 'verb' }, { text: 'the answer', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو لا يعرف الجواب.',
          emoji: '🤷',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"He doesn\'t works" — الفعل يبقى بدون s بعد doesn\'t', wrong: "He doesn't works", right: "He doesn't work" },
        { type: 'mistake', ar: '"She don\'t like it" — she تحتاج doesn\'t', wrong: "She don't like it", right: "She doesn't like it" },
        { type: 'tip', ar: "don't = do not · doesn't = does not — اختصارات للحديث العادي" },
        { type: 'rule', ar: "القاعدة الذهبية: doesn't تأخذ الـ s بدلاً من الفعل — الفعل يبقى في أصله" },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: 'She ', after: ' like coffee.', answer: "doesn't", choices: ["don't", "doesn't", "isn't"], ar: 'هي لا تحب القهوة.' },
        { before: 'I ', after: ' eat meat.', answer: "don't", choices: ["don't", "doesn't", "am not"], ar: 'لا آكل اللحم.' },
        { before: 'He ', after: ' work on Fridays.', answer: "doesn't", choices: ["don't", "doesn't", "isn't"], ar: 'هو لا يعمل يوم الجمعة.' },
        { before: 'They ', after: ' speak English.', answer: "don't", choices: ["don't", "doesn't", "aren't"], ar: 'هم لا يتكلمون الإنجليزية.' },
        { before: 'She doesn\'t ', after: ' here.', answer: 'live', choices: ['live', 'lives', 'living'], ar: 'هي لا تسكن هنا.' },
        { before: 'My father ', after: ' watch TV.', answer: "doesn't", choices: ["don't", "doesn't", "isn't"], ar: 'أبي لا يشاهد التلفزيون.' },
        { before: 'We ', after: ' have a dog.', answer: "don't", choices: ["don't", "doesn't", "aren't"], ar: 'ليس عندنا كلب.' },
        { before: "He doesn't ", after: ' the answer.', answer: 'know', choices: ['know', 'knows', 'knowing'], ar: 'هو لا يعرف الجواب.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'أكمل: "She ___ like pizza."',
          choices: ["don't", "doesn't", "isn't"],
          correct: 1,
          explanationAr: '"she" تحتاج "doesn\'t" — لا نستخدم don\'t مع he/she/it.',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ["He doesn't works.", "He doesn't work.", "He don't work."],
          correct: 1,
          explanationAr: '"doesn\'t work" — الفعل يبقى بدون s بعد doesn\'t.',
        },
        {
          promptAr: 'أكمل: "I ___ understand this."',
          choices: ["don't", "doesn't", "am not"],
          correct: 0,
          explanationAr: '"I" تستخدم "don\'t": I don\'t understand.',
        },
        {
          promptAr: '"doesn\'t" = ؟',
          choices: ['does not', 'do not', 'is not'],
          correct: 0,
          explanationAr: "doesn't = does not — اختصار للحديث العادي.",
        },
        {
          promptAr: 'أكمل: "They ___ live in Casablanca."',
          choices: ["don't", "doesn't", "aren't"],
          correct: 0,
          explanationAr: '"they" تستخدم "don\'t": They don\'t live.',
        },
        {
          promptAr: 'أي جملة غلط؟',
          choices: ["I don't eat sugar.", "She doesn't drink coffee.", "He don't work here."],
          correct: 2,
          explanationAr: '"He don\'t" غلط — he تحتاج doesn\'t: "He doesn\'t work here."',
        },
        {
          promptAr: 'أكمل: "My sister ___ speak Arabic."',
          choices: ["don't", "doesn't", "isn't"],
          correct: 1,
          explanationAr: '"my sister" = she → "doesn\'t speak".',
        },
        {
          promptAr: 'لماذا نقول "She doesn\'t work" وليس "She doesn\'t works"؟',
          choices: ['لأن work فعل غير منتظم', 'لأن الـ s انتقلت إلى doesn\'t', 'لأن she ضمير مؤنث'],
          correct: 1,
          explanationAr: "القاعدة الذهبية: الـ s في doesn't — الفعل يبقى في أصله بدون تغيير.",
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: "don't مع: I / you / we / they", en: "don't → I, you, we, they", example: "I don't like it. They don't work." },
        { ar: "doesn't مع: he / she / it", en: "doesn't → he, she, it", example: "She doesn't eat meat. He doesn't know." },
        { ar: "الفعل بعد don't/doesn't يبقى في أصله — بدون s", en: "verb stays base form", example: "She doesn't work (not works)" },
      ],
    },
  ],
}
