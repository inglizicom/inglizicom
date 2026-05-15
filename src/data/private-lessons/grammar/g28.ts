import type { GrammarLesson } from './types'

export const g28: GrammarLesson = {
  id: 28,
  slug: 'some-any',
  emoji: '🔢',
  title: { en: 'Some / Any', ar: 'some و any: بعض / أي' },
  description: { en: "Talk about quantities you don't specify exactly", ar: 'كيف تتكلم عن كميات غير محددة' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🔢',
      title: 'Some / Any',
      titleAr: 'some و any: بعض / أي',
      level: 'A1',
      tagAr: 'درس ٢٨ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'some وany — كيف نتكلم عن الكميات غير المحددة؟ 🤔',
      bodyAr:
        'في العربية نقول "بعض" في كل الحالات: "عندي بعض المال / ليس عندي بعض المال / هل عندك بعض المال؟" بالإنجليزية نفرق: في الجمل الإيجابية نستخدم "some" · في الجمل النفية والأسئلة نستخدم "any". لكن هناك استثناء مهم: عند تقديم عرض أو طلب شيء بشكل مؤدب نستخدم "some" في السؤال أيضاً.',
      arabicEx: 'عندي بعض المال. · ليس عندي أي مال. · هل عندك بعض المال؟',
      englishEx: 'I have some money. · I don\'t have any money. · Do you have any money?',
      noteAr: '💡 some = جمل إيجابية · any = نفي + أسئلة · استثناء: some في عروض الضيافة',
    },
    {
      kind: 'patternTable',
      titleAr: 'متى نستخدم some ومتى any؟',
      rows: [
        { pronoun: 'some + إيجابي', pronounAr: 'جملة إيجابية', verb: 'I/She/We have some + noun', exampleEn: 'I have some money.', exampleAr: 'عندي بعض المال.', emoji: '💰' },
        { pronoun: 'some + إيجابي', pronounAr: 'مع الطعام والأشياء', verb: 'There is some + noun', exampleEn: 'There is some milk in the fridge.', exampleAr: 'هناك بعض الحليب في الثلاجة.', emoji: '🥛' },
        { pronoun: 'any + نفي', pronounAr: 'جملة نفية', verb: "I don't have any + noun", exampleEn: "I don't have any money.", exampleAr: 'ليس عندي أي مال.', emoji: '❌' },
        { pronoun: 'any + سؤال', pronounAr: 'جملة استفهامية', verb: 'Do you have any + noun?', exampleEn: 'Do you have any questions?', exampleAr: 'هل عندك أي أسئلة؟', emoji: '❓' },
        { pronoun: 'some في العروض', pronounAr: 'استثناء: للضيافة', verb: 'Would you like some + noun?', exampleEn: 'Would you like some tea?', exampleAr: 'هل تريد بعض الشاي؟', emoji: '🍵' },
        { pronoun: 'any = "أياً كان"', pronounAr: 'any في جملة إيجابية', verb: 'Any + noun + can/will...', exampleEn: 'Any teacher can help you.', exampleAr: 'أي معلم يمكنه مساعدتك.', emoji: '👨‍🏫' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'some وany في جمل حقيقية 💬',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'have', role: 'verb' },
            { text: 'some money', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عندي بعض المال.',
          emoji: '💰',
        },
        {
          tokens: [
            { text: 'There is', role: 'verb' }, { text: 'some milk', role: 'subject' },
            { text: 'in the fridge', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هناك بعض الحليب في الثلاجة.',
          emoji: '🥛',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'some friends', role: 'complement' }, { text: 'in Paris', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'عندها بعض الأصدقاء في باريس.',
          emoji: '🗼',
        },
        {
          tokens: [
            { text: "I", role: 'subject' }, { text: "don't have", role: 'negation' },
            { text: 'any money', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندي أي مال.',
          emoji: '😕',
        },
        {
          tokens: [
            { text: 'There', role: 'subject' }, { text: "isn't", role: 'negation' },
            { text: 'any bread', role: 'complement' }, { text: 'left', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'لم يبق أي خبز.',
          emoji: '🍞',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: "don't have", role: 'negation' },
            { text: 'any problems', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندنا أي مشاكل.',
          emoji: '😌',
        },
        {
          tokens: [
            { text: 'Do you have', role: 'question' }, { text: 'any questions', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل عندك أي أسئلة؟',
          emoji: '❓',
        },
        {
          tokens: [
            { text: 'Is there', role: 'question' }, { text: 'any sugar', role: 'subject' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل هناك أي سكر؟',
          emoji: '🍬',
        },
        {
          tokens: [
            { text: 'Would you like', role: 'question' }, { text: 'some coffee', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل تريد بعض القهوة؟ (عرض ضيافة)',
          emoji: '☕',
        },
        {
          tokens: [
            { text: 'Can I have', role: 'question' }, { text: 'some water', role: 'complement' },
            { text: 'please', role: 'filler' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل يمكنني الحصول على بعض الماء من فضلك؟ (طلب مؤدب)',
          emoji: '💧',
        },
        {
          tokens: [
            { text: 'Any', role: 'subject' }, { text: 'teacher', role: 'subject' },
            { text: 'can help', role: 'verb' }, { text: 'you', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أي معلم يمكنه مساعدتك.',
          emoji: '👨‍🏫',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'need', role: 'verb' },
            { text: 'some eggs', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحتاج بعض البيض.',
          emoji: '🥚',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: في المقهى ☕',
      noteAr: 'انظر كيف نستخدم some وany في الحياة اليومية',
      lines: [
        { speaker: 'A', text: 'Welcome! Would you like some tea or coffee?', ar: 'أهلاً وسهلاً! هل تريد بعض الشاي أو القهوة؟' },
        { speaker: 'B', text: 'I would like some coffee, please. Do you have any milk?', ar: 'أريد بعض القهوة من فضلك. هل عندكم أي حليب؟' },
        { speaker: 'A', text: 'Yes, we have some milk. Do you want some sugar too?', ar: 'نعم، عندنا بعض الحليب. هل تريد بعض السكر أيضاً؟' },
        { speaker: 'B', text: "No, thank you. I don't take any sugar.", ar: 'لا، شكراً. أنا لا آخذ أي سكر.' },
        { speaker: 'A', text: 'Do you want anything to eat? We have some sandwiches.', ar: 'هل تريد شيئاً للأكل؟ عندنا بعض الساندويشات.' },
        { speaker: 'B', text: "Yes please! I'm hungry. I didn't eat any breakfast today.", ar: 'نعم من فضلك! أنا جائع. لم آكل أي فطور اليوم.' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"some" في الجمل النفية خطأ — نستخدم any', wrong: "I don't have some money.", right: "I don't have any money." },
        { type: 'mistake', ar: '"any" في الجمل الإيجابية العادية خطأ (إلا معنى "أياً كان")', wrong: 'I have any friends in Casablanca.', right: 'I have some friends in Casablanca.' },
        { type: 'tip', ar: 'عند تقديم عرض أو طلب شيء بشكل مؤدب نستخدم some في السؤال: "Would you like some tea?" / "Can I have some water?"' },
        { type: 'rule', ar: 'some وany يُستخدمان مع الأسماء المعدودة الجمع (some books, any questions) ومع الأسماء غير المعدودة (some water, any milk)' },
        { type: 'tip', ar: 'any في جملة إيجابية = "أياً كان / أي واحد": "Any teacher can help you." = كل معلم مؤهل للمساعدة' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I have ', after: ' money.', answer: 'some', choices: ['any', 'some', 'a'], ar: 'عندي بعض المال.' },
        { before: "I don't have ", after: ' money.', answer: 'any', choices: ['some', 'any', 'a'], ar: 'ليس عندي أي مال.' },
        { before: 'Do you have ', after: ' questions?', answer: 'any', choices: ['some', 'any', 'a'], ar: 'هل عندك أي أسئلة؟' },
        { before: 'Would you like ', after: ' tea?', answer: 'some', choices: ['any', 'some', 'a'], ar: 'هل تريد بعض الشاي؟ (عرض)' },
        { before: 'There is ', after: ' milk in the fridge.', answer: 'some', choices: ['some', 'any', 'many'], ar: 'هناك بعض الحليب في الثلاجة.' },
        { before: "There isn't ", after: ' bread left.', answer: 'any', choices: ['some', 'any', 'many'], ar: 'لم يبق أي خبز.' },
        { before: 'We need ', after: ' eggs.', answer: 'some', choices: ['any', 'some', 'many'], ar: 'نحتاج بعض البيض.' },
        { before: 'Is there ', after: ' sugar?', answer: 'any', choices: ['some', 'any', 'many'], ar: 'هل هناك أي سكر؟' },
        { before: 'Can I have ', after: ' water please?', answer: 'some', choices: ['any', 'some', 'many'], ar: 'هل يمكنني الحصول على بعض الماء؟ (طلب مؤدب)' },
        { before: '', after: ' teacher can help you.', answer: 'Any', choices: ['Some', 'Any', 'A'], ar: 'أي معلم يمكنه مساعدتك.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ["I don't have some money.", "I don't have any money.", "I don't have a money."],
          correct: 1,
          explanationAr: '"any" في الجمل النفية — وليس some.',
        },
        {
          promptAr: 'أكمل: "I have ___ friends in Paris."',
          choices: ['any', 'some', 'a'],
          correct: 1,
          explanationAr: '"some" في الجمل الإيجابية.',
        },
        {
          promptAr: 'أكمل: "Do you have ___ questions?"',
          choices: ['some', 'a', 'any'],
          correct: 2,
          explanationAr: '"any" في الأسئلة العادية.',
        },
        {
          promptAr: 'أكمل: "Would you like ___ tea?" (عرض ضيافة)',
          choices: ['any', 'some', 'a'],
          correct: 1,
          explanationAr: '"some" في العروض المؤدبة — هذا استثناء مهم!',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["There isn't some bread.", "There isn't any bread.", "There isn't a bread."],
          correct: 1,
          explanationAr: '"any" مع النفي في جملة There is/isn\'t.',
        },
        {
          promptAr: 'أكمل: "___ teacher can help you." (معنى: أي معلم)',
          choices: ['Some', 'A', 'Any'],
          correct: 2,
          explanationAr: '"Any" في الجمل الإيجابية بمعنى "أياً كان" أو "كل".',
        },
        {
          promptAr: 'أكمل: "We have ___ milk in the fridge."',
          choices: ['any', 'some', 'many'],
          correct: 1,
          explanationAr: '"some" في الجملة الإيجابية.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I have any questions.', 'I have some questions.', 'I have a questions.'],
          correct: 1,
          explanationAr: '"some questions" في الجملة الإيجابية.',
        },
        {
          promptAr: 'أكمل: "Can I have ___ water please?" (طلب مؤدب)',
          choices: ['any', 'some', 'many'],
          correct: 1,
          explanationAr: '"some" في الطلبات المؤدبة — كالعروض.',
        },
        {
          promptAr: 'أكمل: "Is there ___ sugar?"',
          choices: ['some', 'any', 'many'],
          correct: 1,
          explanationAr: '"any" في الأسئلة العادية — إلا إذا كان عرضاً.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'some في الجمل الإيجابية: عندنا كمية من الشيء', en: 'I have some money. There is some milk.', example: 'She has some friends in Casablanca.' },
        { ar: 'any في الجمل النفية والأسئلة العادية', en: "I don't have any money. Do you have any questions?", example: "There isn't any bread. Do you have any milk?" },
        { ar: 'استثناء: some في العروض والطلبات المؤدبة · any = أياً كان في الجمل الإيجابية', en: 'Would you like some tea? · Any teacher can help.', example: "Can I have some water? Any book will do." },
      ],
    },
  ],
}
