import type { GrammarLesson } from './types'

export const g08: GrammarLesson = {
  id: 8,
  slug: 'do-does-questions',
  emoji: '❓',
  title: { en: 'Do / Does Questions', ar: 'أسئلة المضارع: Do / Does' },
  description: { en: 'Ask questions in the simple present', ar: 'كيف تسأل في المضارع البسيط' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '❓',
      title: 'Do / Does Questions',
      titleAr: 'أسئلة المضارع: Do / Does',
      level: 'A1',
      tagAr: 'درس ٨ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تسأل "هل تحب القهوة؟" بالإنجليزية؟',
      bodyAr:
        'لصياغة سؤال في المضارع البسيط نضع Do أو Does في البداية. Do مع I/you/we/they، وDoes مع he/she/it. مثل النفي تماماً، الفعل يبقى في أصله بعد Does. وهناك جواب قصير مهم: Yes, I do. / No, she doesn\'t.',
      arabicEx: 'هل تحب القهوة؟',
      englishEx: 'DO you like coffee?',
      noteAr: "نلاحظ أن 'like' بدون s — الـ s ذهبت إلى Does في السؤال!",
    },
    {
      kind: 'patternTable',
      titleAr: 'Do أم Does في السؤال؟',
      rows: [
        { pronoun: 'Do I...?', pronounAr: 'هل أنا...؟', verb: 'Do I need...?', exampleEn: 'Do I need a visa?', exampleAr: 'هل أحتاج تأشيرة؟', emoji: '🛂' },
        { pronoun: 'Do you...?', pronounAr: 'هل أنتَ...؟', verb: 'Do you like...?', exampleEn: 'Do you like football?', exampleAr: 'هل تحب كرة القدم؟', emoji: '⚽' },
        { pronoun: 'Does he...?', pronounAr: 'هل هو...؟', verb: 'Does he work...?', exampleEn: 'Does he work here?', exampleAr: 'هل يعمل هنا؟', emoji: '💼' },
        { pronoun: 'Does she...?', pronounAr: 'هل هي...؟', verb: 'Does she speak...?', exampleEn: 'Does she speak French?', exampleAr: 'هل تتكلم الفرنسية؟', emoji: '🗣️' },
        { pronoun: 'Do we...?', pronounAr: 'هل نحن...؟', verb: 'Do we have...?', exampleEn: 'Do we have class today?', exampleAr: 'هل عندنا درس اليوم؟', emoji: '📅' },
        { pronoun: 'Do they...?', pronounAr: 'هل هم...؟', verb: 'Do they live...?', exampleEn: 'Do they live nearby?', exampleAr: 'هل يسكنون قريباً؟', emoji: '🏘️' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل الأسئلة في الحياة اليومية',
      items: [
        {
          tokens: [
            { text: 'Do', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'speak', role: 'verb' }, { text: 'English', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل تتكلم الإنجليزية؟',
          emoji: '🗣️',
        },
        {
          tokens: [
            { text: 'Does', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'live', role: 'verb' }, { text: 'in Casablanca', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل هي تسكن في الدار البيضاء؟',
          emoji: '🏙️',
        },
        {
          tokens: [
            { text: 'Do', role: 'question' }, { text: 'they', role: 'subject' },
            { text: 'have', role: 'verb' }, { text: 'children', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل عندهم أطفال؟',
          emoji: '👨‍👩‍👦',
        },
        {
          tokens: [
            { text: 'Does', role: 'question' }, { text: 'he', role: 'subject' },
            { text: 'work', role: 'verb' }, { text: 'on weekends', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل يعمل في عطل نهاية الأسبوع؟',
          emoji: '📅',
        },
        {
          tokens: [
            { text: 'Do', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'like', role: 'verb' }, { text: 'coffee', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل تحب القهوة؟',
          emoji: '☕',
        },
        {
          tokens: [
            { text: 'Does', role: 'question' }, { text: 'your brother', role: 'subject' },
            { text: 'study', role: 'verb' }, { text: 'medicine', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل يدرس أخوك الطب؟',
          emoji: '🏥',
        },
        {
          tokens: [
            { text: 'Do', role: 'question' }, { text: 'we', role: 'subject' },
            { text: 'need', role: 'verb' }, { text: 'a reservation', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل نحتاج حجزاً؟',
          emoji: '📋',
        },
        {
          tokens: [
            { text: 'Does', role: 'question' }, { text: 'the train', role: 'subject' },
            { text: 'stop', role: 'verb' }, { text: 'here', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل القطار يتوقف هنا؟',
          emoji: '🚂',
        },
        {
          tokens: [
            { text: 'Do', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'know', role: 'verb' }, { text: 'her name', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل تعرف اسمها؟',
          emoji: '🤔',
        },
      ],
    },
    {
      kind: 'questions',
      titleAr: 'الأجوبة القصيرة — مهمة جداً',
      bodyAr: 'في الجواب القصير: Yes, I do. / No, I don\'t. / Yes, she does. / No, he doesn\'t.',
      items: [
        {
          q: [
            { text: 'Do', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'like', role: 'verb' }, { text: 'English', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل تحب الإنجليزية؟ — Yes, I do. / No, I don\'t.',
        },
        {
          q: [
            { text: 'Does', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'work', role: 'verb' }, { text: 'here', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل هي تعمل هنا؟ — Yes, she does. / No, she doesn\'t.',
        },
        {
          q: [
            { text: 'Does', role: 'question' }, { text: 'he', role: 'subject' },
            { text: 'speak', role: 'verb' }, { text: 'Arabic', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل يتكلم العربية؟ — Yes, he does. / No, he doesn\'t.',
        },
        {
          q: [
            { text: 'Do', role: 'question' }, { text: 'they', role: 'subject' },
            { text: 'have', role: 'verb' }, { text: 'a garden', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل عندهم حديقة؟ — Yes, they do. / No, they don\'t.',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"Does she likes coffee?" — الفعل بدون s بعد Does', wrong: 'Does she likes coffee?', right: 'Does she like coffee?' },
        { type: 'mistake', ar: '"Do he work here?" — he يحتاج Does', wrong: 'Do he work here?', right: 'Does he work here?' },
        { type: 'tip', ar: 'الجواب القصير مهم: Yes, I do / No, I don\'t / Yes, she does / No, she doesn\'t' },
        { type: 'rule', ar: 'Do/Does في السؤال = فعل مساعد — لا معنى له وحده إلا في الأسئلة والنفي' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: '', after: ' you like pizza?', answer: 'Do', choices: ['Do', 'Does', 'Is'], ar: 'هل تحب البيتزا؟' },
        { before: '', after: ' she speak Arabic?', answer: 'Does', choices: ['Do', 'Does', 'Is'], ar: 'هل تتكلم العربية؟' },
        { before: '', after: ' they live here?', answer: 'Do', choices: ['Do', 'Does', 'Are'], ar: 'هل يسكنون هنا؟' },
        { before: '', after: ' he work on Fridays?', answer: 'Does', choices: ['Do', 'Does', 'Is'], ar: 'هل يعمل يوم الجمعة؟' },
        { before: 'Does she ', after: ' French?', answer: 'speak', choices: ['speak', 'speaks', 'speaking'], ar: 'هل هي تتكلم الفرنسية؟' },
        { before: 'Do they ', after: ' a car?', answer: 'have', choices: ['have', 'has', 'having'], ar: 'هل عندهم سيارة؟' },
        { before: '', after: ' your mother cook every day?', answer: 'Does', choices: ['Do', 'Does', 'Is'], ar: 'هل أمك تطبخ كل يوم؟' },
        { before: 'Yes, I ', after: '.', answer: 'do', choices: ['do', 'does', 'am'], ar: 'نعم، أنا (جواب قصير).' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'أكمل: "___ she work in a hospital?"',
          choices: ['Do', 'Does', 'Is'],
          correct: 1,
          explanationAr: '"she" تحتاج "Does" في السؤال: "Does she work?"',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ['Does she likes coffee?', 'Does she like coffee?', 'Do she likes coffee?'],
          correct: 1,
          explanationAr: 'الفعل بعد Does يبقى في أصله بدون s: "Does she like?"',
        },
        {
          promptAr: 'ما الجواب القصير لـ "Do you speak English?" (نعم)',
          choices: ['Yes, I speak.', 'Yes, I do.', 'Yes, I does.'],
          correct: 1,
          explanationAr: 'الجواب القصير: "Yes, I do." — بسيط وصحيح.',
        },
        {
          promptAr: 'أكمل: "___ they have a garden?"',
          choices: ['Do', 'Does', 'Are'],
          correct: 0,
          explanationAr: '"they" تحتاج "Do" في السؤال: "Do they have?"',
        },
        {
          promptAr: 'ما الجواب القصير لـ "Does she like coffee?" (لا)',
          choices: ["No, she don't.", "No, she doesn't.", "No, she isn't."],
          correct: 1,
          explanationAr: "الجواب القصير بالنفي: \"No, she doesn't.\"",
        },
        {
          promptAr: 'أكمل: "Does your father ___ Arabic?"',
          choices: ['speaks', 'speak', 'speaking'],
          correct: 1,
          explanationAr: 'الفعل بعد Does يبقى في أصله: "speak" وليس "speaks".',
        },
        {
          promptAr: 'أي سؤال غلط؟',
          choices: ['Do you like music?', 'Does he work here?', 'Do she have a car?'],
          correct: 2,
          explanationAr: '"Do she" غلط — she تحتاج Does: "Does she have a car?"',
        },
        {
          promptAr: '"Do/Does" في السؤال هو:',
          choices: ['فعل رئيسي بمعنى يفعل', 'فعل مساعد لصياغة السؤال', 'اختصار لـ do not'],
          correct: 1,
          explanationAr: 'Do/Does في السؤال = فعل مساعد — يساعد في صياغة السؤال فقط.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: 'Do في السؤال مع: I / you / we / they', en: 'Do → I, you, we, they', example: 'Do you like it? Do they have a car?' },
        { ar: 'Does في السؤال مع: he / she / it', en: 'Does → he, she, it', example: 'Does she work here? Does he know?' },
        { ar: 'الفعل بعد Do/Does في أصله — بدون s', en: 'verb = base form after Do/Does', example: 'Does she like (not likes)?' },
      ],
    },
  ],
}
