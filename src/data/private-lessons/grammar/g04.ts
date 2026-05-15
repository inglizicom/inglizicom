import type { GrammarLesson } from './types'

export const g04: GrammarLesson = {
  id: 4,
  slug: 'this-that',
  emoji: '👆',
  title: { en: 'This / That / These / Those', ar: 'أسماء الإشارة' },
  description: { en: 'Point to things near and far', ar: 'كيف تشير إلى الأشياء القريبة والبعيدة' },
  level: 'A0',
  sections: [
    {
      kind: 'cover',
      emoji: '👆',
      title: 'This / That / These / Those',
      titleAr: 'أسماء الإشارة',
      level: 'A0',
      tagAr: 'درس ٤ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'هذا / ذلك / هؤلاء / أولئك بالإنجليزية',
      bodyAr:
        'في العربية نقول "هذا" للقريب المفرد و"هؤلاء" للقريب الجمع. الإنجليزية نفس الفكرة! this = هذا (قريب مفرد)، these = هؤلاء (قريب جمع)، that = ذلك (بعيد مفرد)، those = أولئك (بعيد جمع). تستخدمها كثيراً في السوق والمحادثة اليومية.',
      arabicEx: 'هذا الكتاب غالٍ.',
      englishEx: 'THIS book is expensive.',
      noteAr: '"THIS" للقريب منك — ترافقها "is" لأنها مفردة!',
    },
    {
      kind: 'patternTable',
      titleAr: 'الفرق بين this / that / these / those',
      rows: [
        { pronoun: 'this', pronounAr: 'هذا / هذه (قريب)', verb: 'this + is', exampleEn: 'This is my book.', exampleAr: 'هذا كتابي.', emoji: '📚' },
        { pronoun: 'that', pronounAr: 'ذلك / تلك (بعيد)', verb: 'that + is', exampleEn: 'That is her car.', exampleAr: 'تلك سيارتها.', emoji: '🚗' },
        { pronoun: 'these', pronounAr: 'هؤلاء / هذه (قريب جمع)', verb: 'these + are', exampleEn: 'These are my friends.', exampleAr: 'هؤلاء أصدقائي.', emoji: '👥' },
        { pronoun: 'those', pronounAr: 'أولئك / تلك (بعيد جمع)', verb: 'those + are', exampleEn: 'Those are his books.', exampleAr: 'تلك كتبه.', emoji: '📖' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل حقيقية مع أسماء الإشارة',
      items: [
        {
          tokens: [
            { text: 'This', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'my phone', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذا هاتفي.',
          emoji: '📱',
        },
        {
          tokens: [
            { text: 'That', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'a beautiful house', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ذلك بيت جميل.',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'These', role: 'subject' }, { text: 'are', role: 'verb' },
            { text: 'my books', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذه كتبي.',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'Those', role: 'subject' }, { text: 'are', role: 'verb' },
            { text: 'expensive shoes', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'تلك أحذية غالية.',
          emoji: '👟',
        },
        {
          tokens: [
            { text: 'Is', role: 'question' }, { text: 'this', role: 'subject' },
            { text: 'your bag', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل هذه حقيبتك؟',
          emoji: '🎒',
        },
        {
          tokens: [
            { text: 'This', role: 'subject' }, { text: 'coffee', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'very hot', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذا القهوة حارة جداً.',
          emoji: '☕',
        },
        {
          tokens: [
            { text: 'Those', role: 'subject' }, { text: 'students', role: 'complement' },
            { text: 'are', role: 'verb' }, { text: 'very good', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أولئك الطلاب ممتازون.',
          emoji: '🎓',
        },
        {
          tokens: [
            { text: 'That', role: 'subject' }, { text: 'man', role: 'complement' },
            { text: 'is', role: 'verb' }, { text: 'my father', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ذلك الرجل أبي.',
          emoji: '👨',
        },
        {
          tokens: [
            { text: 'Are', role: 'question' }, { text: 'these', role: 'subject' },
            { text: 'your keys', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل هذه مفاتيحك؟',
          emoji: '🔑',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"These is my books" — these جمع تحتاج are', wrong: 'These is my books', right: 'These are my books' },
        { type: 'mistake', ar: '"This are beautiful" — this مفرد يحتاج is', wrong: 'This are beautiful', right: 'This is beautiful (أو These are beautiful إذا جمع)' },
        { type: 'tip', ar: 'this/these → قريب منك (هنا عندك) · that/those → بعيد عنك (هناك)' },
        { type: 'rule', ar: 'this + is · these + are · that + is · those + are — نفس قاعدة المفرد والجمع' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: '', after: ' is my car. (قريب)', answer: 'This', choices: ['This', 'That', 'These'], ar: 'هذه سيارتي.' },
        { before: '', after: ' are my friends. (قريب)', answer: 'These', choices: ['This', 'These', 'Those'], ar: 'هؤلاء أصدقائي.' },
        { before: '', after: ' is a big building. (بعيد)', answer: 'That', choices: ['This', 'That', 'Those'], ar: 'ذلك مبنى كبير.' },
        { before: '', after: ' are beautiful flowers. (بعيد)', answer: 'Those', choices: ['These', 'Those', 'That'], ar: 'تلك زهور جميلة.' },
        { before: 'Is ', after: ' your book? (قريب، مفرد)', answer: 'this', choices: ['this', 'that', 'these'], ar: 'هل هذا كتابك؟' },
        { before: 'Are ', after: ' your keys? (قريب، جمع)', answer: 'these', choices: ['this', 'these', 'those'], ar: 'هل هذه مفاتيحك؟' },
        { before: 'These books ', after: ' expensive.', answer: 'are', choices: ['is', 'are', 'am'], ar: 'هذه الكتب غالية.' },
        { before: 'That house ', after: ' beautiful.', answer: 'is', choices: ['is', 'are', 'am'], ar: 'ذلك البيت جميل.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'تشير إلى كتاب في يدك وتقول:',
          choices: ['That is my book.', 'This is my book.', 'These is my book.'],
          correct: 1,
          explanationAr: 'الكتاب في يدك = قريب مفرد = "This is my book."',
        },
        {
          promptAr: 'أكمل: "These ___ my shoes."',
          choices: ['is', 'are', 'am'],
          correct: 1,
          explanationAr: '"These" جمع تحتاج "are" — نفس they/we.',
        },
        {
          promptAr: 'ترى شجرة بعيدة وتقول:',
          choices: ['This is a big tree.', 'These are a big tree.', 'That is a big tree.'],
          correct: 2,
          explanationAr: 'بعيد مفرد = "That is a big tree."',
        },
        {
          promptAr: 'أكمل: "___ are my books." (كتب في يدك)',
          choices: ['This', 'These', 'Those'],
          correct: 1,
          explanationAr: 'قريب + جمع = "These are my books."',
        },
        {
          promptAr: 'أي جملة غلط؟',
          choices: ['This is good.', 'These are nice.', 'Those is cheap.'],
          correct: 2,
          explanationAr: '"Those is" غلط. Those جمع تحتاج are: "Those are cheap."',
        },
        {
          promptAr: 'ترى مجموعة سيارات بعيدة:',
          choices: ['This are nice cars.', 'That are nice cars.', 'Those are nice cars.'],
          correct: 2,
          explanationAr: 'بعيد + جمع = "Those are nice cars."',
        },
        {
          promptAr: 'ما الفرق بين this و that؟',
          choices: ['this = جمع · that = مفرد', 'this = قريب · that = بعيد', 'this = مؤنث · that = مذكر'],
          correct: 1,
          explanationAr: 'this = قريب منك (هنا) · that = بعيد عنك (هناك) — كلاهما مفرد.',
        },
        {
          promptAr: 'أكمل: "Is ___ your brother?" (رجل بعيد)',
          choices: ['this', 'that', 'those'],
          correct: 1,
          explanationAr: 'بعيد مفرد = "that": Is that your brother?',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: 'this (قريب مفرد) + is · these (قريب جمع) + are', en: 'this + is · these + are', example: 'This is nice. · These are nice.' },
        { ar: 'that (بعيد مفرد) + is · those (بعيد جمع) + are', en: 'that + is · those + are', example: 'That is far. · Those are far.' },
        { ar: 'القريب = this/these · البعيد = that/those', en: 'Near: this/these · Far: that/those', example: 'This book here · That building there' },
      ],
    },
  ],
}
