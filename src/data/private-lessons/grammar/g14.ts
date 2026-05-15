import type { GrammarLesson } from './types'

export const g14: GrammarLesson = {
  id: 14,
  slug: 'prepositions-time',
  emoji: '⏰',
  title: { en: 'In / On / At (Time)', ar: 'حروف الجر: الوقت' },
  description: { en: 'Say when things happen', ar: 'كيف تتكلم عن الوقت والتواريخ' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '⏰',
      title: 'Prepositions of Time',
      titleAr: 'حروف الجر: الوقت',
      level: 'A1',
      tagAr: 'درس ١٤ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'نفس الحروف — معنى مختلف للوقت! 🤔',
      bodyAr:
        '"in" و"on" و"at" نستخدمها أيضاً للوقت — لكن بقواعد مختلفة. القاعدة السهلة: AT للساعات الدقيقة · ON للأيام والتواريخ · IN للشهور والسنوات والفصول.',
      arabicEx: 'أنا أستيقظ في الساعة السابعة.',
      englishEx: 'I wake up AT 7 o\'clock.',
      noteAr: '🕐 AT + ساعة · 📅 ON + يوم · 📆 IN + شهر/سنة/فصل',
    },
    {
      kind: 'patternTable',
      titleAr: 'متى نستخدم كل حرف للوقت؟',
      rows: [
        { pronoun: 'at', pronounAr: 'للساعات والأوقات المحددة', verb: 'at + time', exampleEn: 'at 7am · at noon · at midnight', exampleAr: 'في الساعة ٧ · في الظهيرة · في منتصف الليل', emoji: '🕐' },
        { pronoun: 'on', pronounAr: 'للأيام والتواريخ', verb: 'on + day/date', exampleEn: 'on Monday · on my birthday · on 25 December', exampleAr: 'يوم الاثنين · في عيد ميلادي · في ٢٥ ديسمبر', emoji: '📅' },
        { pronoun: 'in', pronounAr: 'للشهور والسنوات والفصول', verb: 'in + month/year/season', exampleEn: 'in January · in 2024 · in summer', exampleAr: 'في يناير · في ٢٠٢٤ · في الصيف', emoji: '📆' },
        { pronoun: 'in', pronounAr: 'لأجزاء اليوم', verb: 'in the morning/afternoon/evening', exampleEn: 'in the morning · in the evening', exampleAr: 'في الصباح · في المساء', emoji: '🌅' },
        { pronoun: 'at', pronounAr: 'استثناءات مهمة', verb: 'at night · at the weekend', exampleEn: 'at night · at the weekend', exampleAr: 'في الليل · في نهاية الأسبوع', emoji: '🌙' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'حروف الجر الزمنية في جمل حقيقية 📅',
      items: [
        {
          tokens: [
            { text: 'I wake up', role: 'verb' }, { text: 'at', role: 'question' },
            { text: '6:30', role: 'complement' }, { text: 'every day', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا أستيقظ في الساعة ٦:٣٠ كل يوم.',
          emoji: '⏰',
        },
        {
          tokens: [
            { text: 'My class is', role: 'verb' }, { text: 'on', role: 'question' },
            { text: 'Monday', role: 'complement' }, { text: 'and Wednesday', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'فصلي يوم الاثنين والأربعاء.',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'I was born', role: 'verb' }, { text: 'in', role: 'question' },
            { text: '1998', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا وُلدت في ١٩٩٨.',
          emoji: '🎂',
        },
        {
          tokens: [
            { text: 'The shop opens', role: 'verb' }, { text: 'at', role: 'question' },
            { text: '9am', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'المحل يفتح في الساعة التاسعة صباحاً.',
          emoji: '🏪',
        },
        {
          tokens: [
            { text: 'We go to the beach', role: 'verb' }, { text: 'in', role: 'question' },
            { text: 'summer', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن نذهب إلى الشاطئ في الصيف.',
          emoji: '🏖️',
        },
        {
          tokens: [
            { text: 'Her birthday is', role: 'verb' }, { text: 'on', role: 'question' },
            { text: '15 March', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عيد ميلادها في ١٥ مارس.',
          emoji: '🎉',
        },
        {
          tokens: [
            { text: 'I study', role: 'verb' }, { text: 'in the', role: 'question' },
            { text: 'evening', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا أدرس في المساء.',
          emoji: '🌆',
        },
        {
          tokens: [
            { text: "It's cold", role: 'verb' }, { text: 'in', role: 'question' },
            { text: 'December', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'يكون البرد في ديسمبر.',
          emoji: '❄️',
        },
        {
          tokens: [
            { text: 'I never sleep', role: 'verb' }, { text: 'at', role: 'question' },
            { text: 'noon', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا لا أنام أبداً في الظهيرة.',
          emoji: '😴',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"I wake up in 7am" — الساعات تحتاج at', wrong: 'I wake up in 7am.', right: 'I wake up at 7am.' },
        { type: 'mistake', ar: '"She was born in Monday" — الأيام تحتاج on', wrong: 'She was born in Monday.', right: 'She was born on Monday.' },
        { type: 'rule', ar: '"at night" استثناء مهم — نقول at night وليس in night! لكن: in the morning · in the afternoon · in the evening' },
        { type: 'tip', ar: 'تذكير سهل: AT = ⏰ ساعة دقيقة · ON = 📅 يوم أو تاريخ · IN = 🗓️ فترة أطول (شهر/سنة/فصل)' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I wake up ', after: ' 7am.', answer: 'at', choices: ['at', 'on', 'in'], ar: 'أنا أستيقظ في الساعة السابعة.' },
        { before: 'My birthday is ', after: ' June.', answer: 'in', choices: ['at', 'on', 'in'], ar: 'عيد ميلادي في يونيو.' },
        { before: 'We have class ', after: ' Monday.', answer: 'on', choices: ['at', 'on', 'in'], ar: 'عندنا فصل يوم الاثنين.' },
        { before: 'It rains a lot ', after: ' winter.', answer: 'in', choices: ['at', 'on', 'in'], ar: 'يمطر كثيراً في الشتاء.' },
        { before: 'She calls me ', after: ' night.', answer: 'at', choices: ['at', 'on', 'in'], ar: 'هي تتصل بي في الليل.' },
        { before: 'The meeting is ', after: ' 3 o\'clock.', answer: 'at', choices: ['at', 'on', 'in'], ar: 'الاجتماع في الساعة الثالثة.' },
        { before: 'I study ', after: ' the morning.', answer: 'in', choices: ['at', 'on', 'in'], ar: 'أنا أدرس في الصباح.' },
        { before: 'She was born ', after: ' 15 April.', answer: 'on', choices: ['at', 'on', 'in'], ar: 'هي وُلدت في ١٥ أبريل.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'أكمل: "I have class ___ Monday."',
          choices: ['at', 'on', 'in'],
          correct: 1,
          explanationAr: '"on Monday" — on للأيام.',
        },
        {
          promptAr: 'أكمل: "She was born ___ 1995."',
          choices: ['at', 'on', 'in'],
          correct: 2,
          explanationAr: '"in 1995" — in للسنوات.',
        },
        {
          promptAr: 'أكمل: "The movie starts ___ 8pm."',
          choices: ['at', 'on', 'in'],
          correct: 0,
          explanationAr: '"at 8pm" — at للساعات.',
        },
        {
          promptAr: 'كيف تقول "في الليل"؟',
          choices: ['in night', 'on night', 'at night'],
          correct: 2,
          explanationAr: '"at night" — استثناء مهم! نقول at night وليس in night.',
        },
        {
          promptAr: 'أكمل: "It\'s very hot ___ summer."',
          choices: ['at', 'on', 'in'],
          correct: 2,
          explanationAr: '"in summer" — in للفصول.',
        },
        {
          promptAr: 'أكمل: "Her birthday is ___ 25 December."',
          choices: ['at', 'on', 'in'],
          correct: 1,
          explanationAr: '"on 25 December" — on للتواريخ.',
        },
        {
          promptAr: 'أكمل: "I study ___ the evening."',
          choices: ['at', 'on', 'in'],
          correct: 2,
          explanationAr: '"in the evening" — in لأجزاء اليوم (morning/afternoon/evening).',
        },
        {
          promptAr: 'ما القاعدة السهلة للتذكر؟',
          choices: ['AT = يوم · ON = ساعة · IN = شهر', 'AT = ساعة · ON = يوم · IN = شهر/سنة', 'AT = شهر · ON = سنة · IN = يوم'],
          correct: 1,
          explanationAr: 'AT + ساعة دقيقة · ON + يوم/تاريخ · IN + شهر/سنة/فصل.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'AT + وقت دقيق (ساعة)', en: 'at 7am · at noon · at midnight', example: 'The class starts at 9am.' },
        { ar: 'ON + يوم أو تاريخ', en: 'on Monday · on 15 March', example: 'My birthday is on 20 April.' },
        { ar: 'IN + شهر أو سنة أو فصل', en: 'in January · in 2024 · in summer', example: 'It rains a lot in winter.' },
      ],
    },
  ],
}
