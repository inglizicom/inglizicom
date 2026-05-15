import type { GrammarLesson } from './types'

export const g18: GrammarLesson = {
  id: 18,
  slug: 'past-questions',
  emoji: '❓',
  title: { en: 'Did you...?', ar: 'أسئلة الماضي: هل فعلت؟' },
  description: { en: 'Ask questions about the past', ar: 'كيف تسأل عن أفعال حدثت في الماضي' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '❓',
      title: 'Did you...?',
      titleAr: 'أسئلة الماضي',
      level: 'A1',
      tagAr: 'درس ١٨ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تسأل "هل ذهبت؟" أو "هل أكلت؟" 🤔',
      bodyAr:
        'للسؤال في الماضي نضع "Did" في البداية قبل الضمير. نفس القاعدة الذهبية: الفعل بعد Did يبقى في أصله بدون -ed. الجواب القصير: Yes, I did. / No, I didn\'t.',
      arabicEx: 'هل ذهبت إلى المدرسة؟',
      englishEx: 'DID you go to school?',
      noteAr: '💡 Did + Subject + فعل في أصله...? · الجواب: Yes, I did. / No, I didn\'t.',
    },
    {
      kind: 'patternTable',
      titleAr: 'Did مع جميع الضمائر',
      rows: [
        { pronoun: 'Did I...?', pronounAr: 'هل أنا؟', verb: 'Did I + verb?', exampleEn: 'Did I say something wrong?', exampleAr: 'هل قلت شيئاً خاطئاً؟', emoji: '😅' },
        { pronoun: 'Did you...?', pronounAr: 'هل أنت؟', verb: 'Did you + verb?', exampleEn: 'Did you eat already?', exampleAr: 'هل أكلت بالفعل؟', emoji: '🍽️' },
        { pronoun: 'Did he...?', pronounAr: 'هل هو؟', verb: 'Did he + verb?', exampleEn: 'Did he call you?', exampleAr: 'هل اتصل بك؟', emoji: '📞' },
        { pronoun: 'Did she...?', pronounAr: 'هل هي؟', verb: 'Did she + verb?', exampleEn: 'Did she pass the exam?', exampleAr: 'هل نجحت في الامتحان؟', emoji: '📝' },
        { pronoun: 'Did we...?', pronounAr: 'هل نحن؟', verb: 'Did we + verb?', exampleEn: 'Did we make a mistake?', exampleAr: 'هل ارتكبنا خطأ؟', emoji: '🤔' },
        { pronoun: 'Did they...?', pronounAr: 'هل هم؟', verb: 'Did they + verb?', exampleEn: 'Did they arrive yet?', exampleAr: 'هل وصلوا بعد؟', emoji: '🚶' },
      ],
    },
    {
      kind: 'questions',
      titleAr: 'أسئلة حقيقية بـ Did ❓',
      bodyAr: 'الترتيب: Did + Subject + Verb في أصله + ...?',
      items: [
        {
          q: [
            { text: 'Did', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'sleep', role: 'verb' }, { text: 'well', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل نمت جيداً؟',
        },
        {
          q: [
            { text: 'Did', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'call', role: 'verb' }, { text: 'you', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل اتصلت بك؟',
        },
        {
          q: [
            { text: 'Did', role: 'question' }, { text: 'they', role: 'subject' },
            { text: 'enjoy', role: 'verb' }, { text: 'the trip', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل استمتعوا بالرحلة؟',
        },
        {
          q: [
            { text: 'What', role: 'filler' }, { text: 'did', role: 'question' },
            { text: 'you', role: 'subject' }, { text: 'eat', role: 'verb' },
            { text: 'for lunch', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'ماذا أكلت على الغداء؟',
        },
        {
          q: [
            { text: 'Where', role: 'filler' }, { text: 'did', role: 'question' },
            { text: 'he', role: 'subject' }, { text: 'go', role: 'verb' },
            { text: 'yesterday', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'أين ذهب أمس؟',
        },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'الأجوبة القصيرة والجمل الكاملة 💬',
      items: [
        {
          tokens: [
            { text: 'Yes,', role: 'filler' }, { text: 'I', role: 'subject' },
            { text: 'did', role: 'verb' }, { text: '.', role: 'filler' },
          ],
          ar: 'نعم، فعلت.',
          emoji: '✅',
        },
        {
          tokens: [
            { text: 'No,', role: 'filler' }, { text: 'I', role: 'subject' },
            { text: "didn't", role: 'negation' }, { text: '.', role: 'filler' },
          ],
          ar: 'لا، لم أفعل.',
          emoji: '❌',
        },
        {
          tokens: [
            { text: 'Yes,', role: 'filler' }, { text: 'she', role: 'subject' },
            { text: 'did', role: 'verb' }, { text: '.', role: 'filler' },
          ],
          ar: 'نعم، فعلت. (جواب Did she...?)',
          emoji: '✅',
        },
        {
          tokens: [
            { text: 'Did', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'finish', role: 'verb' }, { text: 'your homework', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل أنهيت واجبك؟',
          emoji: '📓',
        },
        {
          tokens: [
            { text: 'Did', role: 'question' }, { text: 'he', role: 'subject' },
            { text: 'work', role: 'verb' }, { text: 'yesterday', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل عمل أمس؟',
          emoji: '💼',
        },
        {
          tokens: [
            { text: 'What', role: 'filler' }, { text: 'did', role: 'question' },
            { text: 'you', role: 'subject' }, { text: 'do', role: 'verb' },
            { text: 'last weekend', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'ماذا فعلت عطلة نهاية الأسبوع الماضية؟',
          emoji: '🗓️',
        },
        {
          tokens: [
            { text: 'Did', role: 'question' }, { text: 'they', role: 'subject' },
            { text: 'like', role: 'verb' }, { text: 'the food', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل أحبوا الطعام؟',
          emoji: '🍲',
        },
        {
          tokens: [
            { text: 'When', role: 'filler' }, { text: 'did', role: 'question' },
            { text: 'you', role: 'subject' }, { text: 'arrive', role: 'verb' },
            { text: '?', role: 'filler' },
          ],
          ar: 'متى وصلت؟',
          emoji: '✈️',
        },
        {
          tokens: [
            { text: 'Did', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'pass', role: 'verb' }, { text: 'the exam', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل نجحت في الامتحان؟',
          emoji: '📝',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"Did she went?" — الفعل بعد Did يبقى في أصله go وليس went', wrong: 'Did she went to school?', right: 'Did she go to school?' },
        { type: 'mistake', ar: '"Did you worked?" — work بدون -ed بعد Did', wrong: 'Did you worked yesterday?', right: 'Did you work yesterday?' },
        { type: 'tip', ar: 'أسئلة WH مع Did: What did you do? · Where did he go? · When did they arrive? · Why did she leave?' },
        { type: 'rule', ar: 'الجواب القصير: Yes, I/he/she/we/they did. / No, I/he/she/we/they didn\'t.' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل السؤال ✏️',
      exercises: [
        { before: '', after: ' you eat breakfast this morning?', answer: 'Did', choices: ['Did', 'Do', 'Was'], ar: 'هل أكلت الفطور هذا الصباح؟' },
        { before: '', after: ' she pass the exam?', answer: 'Did', choices: ['Did', 'Does', 'Was'], ar: 'هل نجحت في الامتحان؟' },
        { before: 'Did he ', after: ' to school yesterday? (go)', answer: 'go', choices: ['go', 'went', 'going'], ar: 'هل ذهب إلى المدرسة أمس؟' },
        { before: '', after: ' they arrive on time?', answer: 'Did', choices: ['Did', 'Do', 'Were'], ar: 'هل وصلوا في الوقت المناسب؟' },
        { before: 'What did you ', after: ' last weekend?', answer: 'do', choices: ['do', 'did', 'done'], ar: 'ماذا فعلت عطلة نهاية الأسبوع الماضية؟' },
        { before: '', after: ' she call you last night?', answer: 'Did', choices: ['Did', 'Does', 'Is'], ar: 'هل اتصلت بك ليلة أمس؟' },
        { before: 'Did they ', after: ' the film? (like)', answer: 'like', choices: ['like', 'liked', 'likes'], ar: 'هل أحبوا الفيلم؟' },
        { before: 'Where did he ', after: ' last summer?', answer: 'go', choices: ['went', 'go', 'goes'], ar: 'أين ذهب الصيف الماضي؟' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
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
          explanationAr: '"go" في أصله بعد Did — وليس went.',
        },
        {
          promptAr: 'الجواب على "Did you eat?"',
          choices: ["Yes, I ate.", "Yes, I did.", "Yes, I do."],
          correct: 1,
          explanationAr: '"Yes, I did." أو "No, I didn\'t." — الجواب القصير.',
        },
        {
          promptAr: 'أكمل: "What ___ you do last weekend?"',
          choices: ['do', 'did', 'done'],
          correct: 1,
          explanationAr: '"What did you do?" — did للماضي.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['Did you worked?', 'Did you work?', 'Did you works?'],
          correct: 1,
          explanationAr: '"work" في أصله بعد Did — بدون -ed وبدون s.',
        },
        {
          promptAr: 'الجواب النفي على "Did he come?"',
          choices: ["No, he didn't.", "No, he doesn't.", "No, he wasn't."],
          correct: 0,
          explanationAr: '"No, he didn\'t." — النفي القصير في الماضي.',
        },
        {
          promptAr: 'أكمل: "Where ___ they go on holiday?"',
          choices: ['do', 'did', 'does'],
          correct: 1,
          explanationAr: '"Where did they go?" — did للماضي.',
        },
        {
          promptAr: 'كيف تسأل "هل أكلت؟"',
          choices: ['You ate?', 'Did you eat?', 'Do you eat?'],
          correct: 1,
          explanationAr: '"Did you eat?" — Did في البداية للماضي.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'Did + Subject + فعل في أصله...?', en: 'Did you go? · Did she eat?', example: 'Did they enjoy the trip?' },
        { ar: 'الفعل بعد Did يبقى في أصله — بدون -ed وبدون s', en: "Did she go? (NOT went)", example: 'Did you work? (NOT worked)' },
        { ar: 'الجواب: Yes, I did. / No, I didn\'t.', en: 'Yes, she did. / No, he didn\'t.', example: 'Did you sleep well? Yes, I did.' },
      ],
    },
  ],
}
