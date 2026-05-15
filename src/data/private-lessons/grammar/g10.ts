import type { GrammarLesson } from './types'

export const g10: GrammarLesson = {
  id: 10,
  slug: 'can-cant',
  emoji: '💪',
  title: { en: 'Can / Can\'t', ar: 'القدرة: أستطيع / لا أستطيع' },
  description: { en: 'Talk about what you can and can\'t do', ar: 'كيف تتكلم عن ما تستطيع وما لا تستطيع فعله' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '💪',
      title: "Can / Can't",
      titleAr: 'أستطيع / لا أستطيع',
      level: 'A1',
      tagAr: 'درس ١٠ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تقول "أنا أستطيع السباحة"؟ 🤔',
      bodyAr:
        'في العربية نقول "أستطيع / أقدر". في الإنجليزية نستخدم "can" قبل الفعل. الجميل في "can" أنه لا يتغير أبداً — نفس الكلمة مع كل الضمائر!',
      arabicEx: 'أنا أستطيع السباحة.',
      englishEx: 'I can swim.',
      noteAr: '⭐ "can" لا يأخذ s أبداً — حتى مع he/she/it!',
    },
    {
      kind: 'patternTable',
      titleAr: '"can" نفس الكلمة مع الجميع!',
      rows: [
        { pronoun: 'I', pronounAr: 'أنا', verb: 'can', exampleEn: 'I can drive.', exampleAr: 'أنا أستطيع القيادة.', emoji: '🚗' },
        { pronoun: 'You', pronounAr: 'أنت', verb: 'can', exampleEn: 'You can do it!', exampleAr: 'أنت تستطيع ذلك!', emoji: '💪' },
        { pronoun: 'He', pronounAr: 'هو', verb: 'can', exampleEn: 'He can speak 3 languages.', exampleAr: 'هو يستطيع التكلم بـ٣ لغات.', emoji: '🗣️' },
        { pronoun: 'She', pronounAr: 'هي', verb: 'can', exampleEn: 'She can cook very well.', exampleAr: 'هي تستطيع الطبخ جيداً.', emoji: '👩‍🍳' },
        { pronoun: 'We', pronounAr: 'نحن', verb: 'can', exampleEn: 'We can help you.', exampleAr: 'نحن نستطيع مساعدتك.', emoji: '🤝' },
        { pronoun: 'They', pronounAr: 'هم', verb: 'can', exampleEn: 'They can play guitar.', exampleAr: 'هم يستطيعون العزف على الغيتار.', emoji: '🎸' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل حقيقية مع can 💬',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' },
            { text: 'can', role: 'verb' },
            { text: 'speak Arabic', role: 'complement' },
            { text: 'and English', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أنا أستطيع التكلم بالعربية والإنجليزية.',
          emoji: '🌍',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' },
            { text: 'can', role: 'verb' },
            { text: 'run very fast', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هي تستطيع الجري بسرعة كبيرة.',
          emoji: '🏃',
        },
        {
          tokens: [
            { text: 'Can', role: 'question' },
            { text: 'you', role: 'subject' },
            { text: 'help me', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل تستطيع مساعدتي؟',
          emoji: '🙏',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' },
            { text: "can't", role: 'negation' },
            { text: 'swim', role: 'verb' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هو لا يستطيع السباحة.',
          emoji: '🏊',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' },
            { text: 'can', role: 'verb' },
            { text: 'do this', role: 'complement' },
            { text: 'together', role: 'complement' },
            { text: '!', role: 'filler' },
          ],
          ar: 'نحن نستطيع فعل هذا معاً!',
          emoji: '🤜🤛',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' },
            { text: "can't", role: 'negation' },
            { text: 'find', role: 'verb' },
            { text: 'my keys', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أنا لا أستطيع إيجاد مفاتيحي.',
          emoji: '🔑',
        },
      ],
    },
    {
      kind: 'negation',
      titleAr: "النفي: can't / cannot 🚫",
      bodyAr: "can't = cannot (اختصار). نستخدمه لنقول لا نستطيع فعل شيء.",
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' },
            { text: "can't", role: 'negation' },
            { text: 'drive', role: 'verb' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أنا لا أستطيع القيادة.',
          emoji: '🚗',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' },
            { text: "can't", role: 'negation' },
            { text: 'come', role: 'verb' },
            { text: 'today', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هي لا تستطيع المجيء اليوم.',
          emoji: '😔',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' },
            { text: "can't", role: 'negation' },
            { text: 'speak', role: 'verb' },
            { text: 'English', role: 'complement' },
            { text: 'yet', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هم لا يستطيعون التكلم بالإنجليزية بعد.',
          emoji: '📚',
        },
      ],
    },
    {
      kind: 'questions',
      titleAr: 'الأسئلة مع Can ❓',
      bodyAr: 'في السؤال نضع Can في البداية. الجواب: Yes, I can. / No, I can\'t.',
      items: [
        {
          q: [
            { text: 'Can', role: 'question' },
            { text: 'you', role: 'subject' },
            { text: 'swim', role: 'verb' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل تستطيع السباحة؟',
        },
        {
          q: [
            { text: 'Can', role: 'question' },
            { text: 'she', role: 'subject' },
            { text: 'speak', role: 'verb' },
            { text: 'French', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل هي تستطيع التكلم بالفرنسية؟',
        },
        {
          q: [
            { text: 'Can', role: 'question' },
            { text: 'I', role: 'subject' },
            { text: 'help you', role: 'verb' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل أستطيع مساعدتك؟',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"She cans swim" — can لا يتغير أبداً، حتى مع he/she/it', wrong: 'She cans swim', right: 'She can swim' },
        { type: 'mistake', ar: '"I can to swim" — لا نضع to بعد can', wrong: 'I can to swim', right: 'I can swim' },
        { type: 'tip', ar: '"can" للقدرة الحالية — "could" للماضي أو للطلب المؤدب: "Could you help me?" أكثر أدباً من "Can you help me?"' },
        { type: 'rule', ar: 'الفعل بعد can يبقى في أصله: can swim · can speak · can drive — بدون to وبدون s' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'She ', after: ' cook very well.', answer: 'can', choices: ['can', "can't", 'cans'], ar: 'هي تستطيع الطبخ جيداً.' },
        { before: 'I ', after: " fly — I'm not a bird!", answer: "can't", choices: ['can', "can't", 'cans'], ar: 'أنا لا أستطيع الطيران — لست طائراً!' },
        { before: '', after: ' you help me?', answer: 'Can', choices: ['Can', 'Does', 'Is'], ar: 'هل تستطيع مساعدتي؟' },
        { before: 'He ', after: ' speak three languages!', answer: 'can', choices: ['can', 'cans', "doesn't"], ar: 'هو يستطيع التكلم بثلاث لغات!' },
        { before: 'They ', after: ' come tomorrow.', answer: "can't", choices: ['can', "can't", 'not'], ar: 'هم لا يستطيعون المجيء غداً.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'أكمل: "He ___ play guitar." (يستطيع)',
          choices: ['can', 'cans', 'is can'],
          correct: 0,
          explanationAr: '"can" لا يتغير أبداً — حتى مع he/she/it لا نضيف s.',
        },
        {
          promptAr: 'ما عكس "I can swim"؟',
          choices: ["I can't swim.", "I don't can swim.", "I not swim."],
          correct: 0,
          explanationAr: 'النفي هو "can\'t" — "I can\'t swim".',
        },
        {
          promptAr: 'كيف تسأل "هل تستطيع القيادة؟"',
          choices: ['You can drive?', 'Can you drive?', 'Do you can drive?'],
          correct: 1,
          explanationAr: 'في السؤال نضع "Can" في البداية: "Can you drive?"',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She cans cook.', 'She can cooks.', 'She can cook.'],
          correct: 2,
          explanationAr: '"can" لا يأخذ s، والفعل بعده يبقى في أصله: "can cook".',
        },
        {
          promptAr: 'الجواب على "Can you speak French?" هو:',
          choices: ["Yes, I do.", "Yes, I can.", "Yes, I am."],
          correct: 1,
          explanationAr: 'مع "can" الجواب هو "Yes, I can." أو "No, I can\'t."',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: '"can" لا يتغير مع أي ضمير', en: 'can (same for everyone)', example: 'He can speak French.' },
        { ar: "النفي: can't / cannot", en: "can + not = can't", example: "I can't fly." },
        { ar: 'السؤال: Can + Subject + Verb...?', en: 'Can you drive?', example: "Can she swim?" },
      ],
    },
  ],
}
