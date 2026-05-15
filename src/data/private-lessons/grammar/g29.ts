import type { GrammarLesson } from './types'

export const g29: GrammarLesson = {
  id: 29,
  slug: 'much-many',
  emoji: '📦',
  title: { en: 'Much / Many / A lot of', ar: 'كثير: much / many / a lot of' },
  description: { en: 'Talk about large quantities', ar: 'كيف تتكلم عن الكميات الكبيرة' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '📦',
      title: 'Much / Many / A lot of',
      titleAr: 'كثير: much / many / a lot of',
      level: 'A1',
      tagAr: 'درس ٢٩ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'لماذا "كثير" في الإنجليزية أصعب من العربية؟ 🤔',
      bodyAr:
        'في العربية كلمة "كثير" تصلح لكل شيء: كثير مال، كثير أصدقاء، كثير وقت. في الإنجليزية يجب أن نفرق بين نوعين من الأسماء: (١) الأسماء المعدودة — يمكنك عدها: books, people, cars, friends. هذه تأخذ "many". (٢) الأسماء غير المعدودة — لا يمكنك عدها: water, money, time, information, advice. هذه تأخذ "much". لكن "a lot of" تصلح للنوعين معاً!',
      arabicEx: 'عندي كثير من الأصدقاء. · لدي كثير من الوقت. · شربت كثيراً من الماء.',
      englishEx: 'I have many friends. · I have a lot of time. · I drank a lot of water.',
      noteAr: '💡 معدود → many · غير معدود → much · كلاهما → a lot of',
    },
    {
      kind: 'patternTable',
      titleAr: 'much / many / a lot of — متى نستخدم كل واحد؟',
      rows: [
        { pronoun: 'many + أسماء معدودة', pronounAr: 'أشياء يمكن عدها', verb: 'many + plural noun', exampleEn: 'I have many friends.', exampleAr: 'عندي كثير من الأصدقاء.', emoji: '👥' },
        { pronoun: 'much + أسماء غير معدودة', pronounAr: 'أشياء لا يمكن عدها', verb: 'much + uncountable noun', exampleEn: 'I don\'t have much time.', exampleAr: 'ليس عندي وقت كثير.', emoji: '⏰' },
        { pronoun: 'a lot of / lots of', pronounAr: 'للنوعين — إيجابي', verb: 'a lot of + any noun (positive)', exampleEn: 'I have a lot of work today.', exampleAr: 'عندي كثير من العمل اليوم.', emoji: '💼' },
        { pronoun: 'How much? (غير معدود)', pronounAr: 'كم؟ — للأسعار والكميات', verb: 'How much + uncountable?', exampleEn: 'How much water do you drink?', exampleAr: 'كم ماءً تشرب؟', emoji: '💧' },
        { pronoun: 'How many? (معدود)', pronounAr: 'كم؟ — للأشياء المعدودة', verb: 'How many + plural noun?', exampleEn: 'How many books do you have?', exampleAr: 'كم كتاباً عندك؟', emoji: '📚' },
        { pronoun: 'much في الإيجابي (رسمي)', pronounAr: 'much في الإيجابي يبدو رسمياً', verb: 'prefer a lot of in positive', exampleEn: 'She earns a lot of money. (natural)', exampleAr: 'هي تكسب الكثير من المال. (طبيعي)', emoji: '💰' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'much / many / a lot of في جمل حقيقية 💬',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'have', role: 'verb' },
            { text: 'many friends', role: 'complement' }, { text: 'in Casablanca', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'عندي كثير من الأصدقاء في الدار البيضاء.',
          emoji: '👥',
        },
        {
          tokens: [
            { text: 'There are', role: 'verb' }, { text: 'many cars', role: 'subject' },
            { text: 'on the road today', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هناك كثير من السيارات في الطريق اليوم.',
          emoji: '🚗',
        },
        {
          tokens: [
            { text: "I", role: 'subject' }, { text: "don't have", role: 'negation' },
            { text: 'much time', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندي وقت كثير.',
          emoji: '⏰',
        },
        {
          tokens: [
            { text: 'How much', role: 'question' }, { text: 'money', role: 'subject' },
            { text: 'do you have', role: 'verb' }, { text: '?', role: 'filler' },
          ],
          ar: 'كم من المال عندك؟',
          emoji: '💰',
        },
        {
          tokens: [
            { text: 'How many', role: 'question' }, { text: 'languages', role: 'subject' },
            { text: 'do you speak', role: 'verb' }, { text: '?', role: 'filler' },
          ],
          ar: 'كم لغة تتحدث؟',
          emoji: '🌍',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'a lot of work', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عندها كثير من العمل.',
          emoji: '💼',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'drank', role: 'verb' },
            { text: 'a lot of water', role: 'complement' }, { text: 'after the match', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'شربنا الكثير من الماء بعد المباراة.',
          emoji: '💧',
        },
        {
          tokens: [
            { text: 'There is', role: 'verb' }, { text: 'not much sugar', role: 'subject' },
            { text: 'left', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لم يبق كثير من السكر.',
          emoji: '🍬',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'don\'t have', role: 'negation' },
            { text: 'many problems', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندي مشاكل كثيرة.',
          emoji: '😊',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'a lot of experience', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عندها خبرة كثيرة.',
          emoji: '⭐',
        },
        {
          tokens: [
            { text: 'How many', role: 'question' }, { text: 'people', role: 'subject' },
            { text: 'are in your family', role: 'verb' }, { text: '?', role: 'filler' },
          ],
          ar: 'كم شخصاً في عائلتك؟',
          emoji: '👨‍👩‍👧‍👦',
        },
        {
          tokens: [
            { text: 'There are', role: 'verb' }, { text: 'a lot of students', role: 'subject' },
            { text: 'in this class', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هناك كثير من الطلاب في هذا الفصل.',
          emoji: '🏫',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: الواجبات والعمل 📚',
      noteAr: 'انظر كيف نستخدم much وmany وa lot of في الحديث اليومي',
      lines: [
        { speaker: 'A', text: 'You look tired! Do you have a lot of work today?', ar: 'تبدو متعباً! هل عندك كثير من العمل اليوم؟' },
        { speaker: 'B', text: 'Yes! I have many meetings and a lot of emails.', ar: 'نعم! عندي كثير من الاجتماعات وكثير من الرسائل الإلكترونية.' },
        { speaker: 'A', text: 'How many meetings do you have?', ar: 'كم اجتماعاً عندك؟' },
        { speaker: 'B', text: 'Five! And I don\'t have much time for lunch.', ar: 'خمسة! وليس عندي وقت كثير للغداء.' },
        { speaker: 'A', text: 'That is too much. Do you drink much coffee?', ar: 'هذا كثير جداً. هل تشرب كثيراً من القهوة؟' },
        { speaker: 'B', text: 'Yes, a lot! I need much energy today!', ar: 'نعم، كثيراً! أحتاج طاقة كثيرة اليوم!' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"information" اسم غير معدود — "many informations" خطأ', wrong: 'I have many informations.', right: 'I have a lot of information.' },
        { type: 'mistake', ar: '"advice" غير معدود أيضاً: "many advices" خطأ', wrong: 'He gave me many advices.', right: 'He gave me a lot of advice.' },
        { type: 'tip', ar: 'عندما تشك: استخدم "a lot of" — تصلح للنوعين ومع الإيجابي والنفي والأسئلة!' },
        { type: 'rule', ar: 'How much = للأسماء غير المعدودة (How much water?) · How many = للأسماء المعدودة (How many books?)' },
        { type: 'tip', ar: 'أسماء غير معدودة شائعة: water, milk, coffee, money, time, information, advice, news, work, traffic, music, love' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I have ', after: ' friends.', answer: 'many', choices: ['much', 'many', 'a lot'], ar: 'عندي كثير من الأصدقاء.' },
        { before: "I don't have ", after: ' time.', answer: 'much', choices: ['many', 'much', 'lots'], ar: 'ليس عندي وقت كثير.' },
        { before: 'She has ', after: ' work today.', answer: 'a lot of', choices: ['many', 'much', 'a lot of'], ar: 'عندها كثير من العمل اليوم.' },
        { before: 'How ', after: ' water do you drink?', answer: 'much', choices: ['many', 'much', 'lots'], ar: 'كم ماءً تشرب؟' },
        { before: 'How ', after: ' languages do you speak?', answer: 'many', choices: ['much', 'many', 'lots'], ar: 'كم لغة تتحدث؟' },
        { before: 'There are ', after: ' cars on the road.', answer: 'a lot of', choices: ['much', 'a lot of', 'how many'], ar: 'هناك كثير من السيارات في الطريق.' },
        { before: 'I don\'t have ', after: ' money.', answer: 'much', choices: ['many', 'much', 'lots'], ar: 'ليس عندي مال كثير.' },
        { before: 'There are ', after: ' students in this class.', answer: 'many', choices: ['much', 'many', 'a lot'], ar: 'هناك كثير من الطلاب في هذا الفصل.' },
        { before: 'He gave me ', after: ' advice.', answer: 'a lot of', choices: ['many', 'much', 'a lot of'], ar: 'أعطاني كثيراً من النصائح.' },
        { before: 'How ', after: ' people are in your family?', answer: 'many', choices: ['much', 'many', 'a lot'], ar: 'كم شخصاً في عائلتك؟' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ['I have much friends.', 'I have many friends.', 'I have a lot friends.'],
          correct: 1,
          explanationAr: '"many friends" — friends اسم معدود (يمكن عده) فيأخذ many.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["I don't have many time.", "I don't have much time.", "I don't have a times."],
          correct: 1,
          explanationAr: '"much time" — time اسم غير معدود فيأخذ much.',
        },
        {
          promptAr: 'أكمل: "___ water do you drink?"',
          choices: ['How many', 'How much', 'How a lot of'],
          correct: 1,
          explanationAr: '"How much water" — water غير معدود.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I have many informations.', 'I have much informations.', 'I have a lot of information.'],
          correct: 2,
          explanationAr: '"information" غير معدود ولا يأتي بالجمع — "a lot of information".',
        },
        {
          promptAr: 'متى نستخدم "a lot of"؟',
          choices: ['مع المعدود فقط', 'مع غير المعدود فقط', 'مع المعدود وغير المعدود'],
          correct: 2,
          explanationAr: '"a lot of" تصلح للنوعين: a lot of books / a lot of water.',
        },
        {
          promptAr: 'أكمل: "___ people are in your family?"',
          choices: ['How much', 'How many', 'How a lot of'],
          correct: 1,
          explanationAr: '"How many people" — people معدود.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She gave me many advices.', 'She gave me much advices.', 'She gave me a lot of advice.'],
          correct: 2,
          explanationAr: '"advice" غير معدود — "a lot of advice" وليس advices.',
        },
        {
          promptAr: 'في الجملة الإيجابية، أيهما أطبيعي؟',
          choices: ['She earns much money.', 'She earns a lot of money.', 'She earns many money.'],
          correct: 1,
          explanationAr: '"a lot of money" أطبيعي في الجمل الإيجابية — much في الإيجابي يبدو رسمياً جداً.',
        },
        {
          promptAr: 'أكمل: "There are ___ cars on the road."',
          choices: ['much', 'a lot of', 'how many'],
          correct: 1,
          explanationAr: '"a lot of cars" — أو يمكن "many cars"، لكن "a lot of" هو الجواب الصحيح هنا.',
        },
        {
          promptAr: 'أي كلمة تصف "news" (الأخبار)؟',
          choices: ['many (معدود)', 'much (غير معدود)', 'كلاهما صحيح'],
          correct: 1,
          explanationAr: '"news" غير معدودة: "a lot of news" أو "not much news" — وليس "many news".',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'many + أسماء معدودة (يمكن عدها): friends, cars, books, people', en: 'many books · many friends · many mistakes', example: 'I have many friends. How many books?' },
        { ar: 'much + أسماء غير معدودة: water, money, time, information', en: 'much water · much money · much time', example: "I don't have much time. How much water?" },
        { ar: 'a lot of = للنوعين — الأبسط والأكثر شيوعاً في الجمل الإيجابية', en: 'a lot of books · a lot of water · lots of time', example: 'She has a lot of work. I drank a lot of water.' },
      ],
    },
  ],
}
