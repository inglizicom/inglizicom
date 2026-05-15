import type { GrammarLesson } from './types'

export const g12: GrammarLesson = {
  id: 12,
  slug: 'frequency-adverbs',
  emoji: '📊',
  title: { en: 'Always / Usually / Sometimes / Never', ar: 'ظروف التكرار' },
  description: { en: 'Say how often you do things', ar: 'كيف تقول كم مرة تفعل الأشياء' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '📊',
      title: 'Frequency Adverbs',
      titleAr: 'ظروف التكرار',
      level: 'A1',
      tagAr: 'درس ١٢ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تقول "دائماً" أو "أحياناً" بالإنجليزية؟ 🤔',
      bodyAr:
        'ظروف التكرار تخبرنا كم مرة نفعل شيئاً. تأتي قبل الفعل الرئيسي، لكن بعد To Be. هذا الفرق في الموضع مهم جداً!',
      arabicEx: 'أنا دائماً آكل الفطور.',
      englishEx: 'I ALWAYS eat breakfast.',
      noteAr: '📍 always/usually/sometimes/never تأتي قبل الفعل الرئيسي وبعد To Be',
    },
    {
      kind: 'patternTable',
      titleAr: 'ظروف التكرار من 100% إلى 0%',
      rows: [
        { pronoun: 'always', pronounAr: 'دائماً', verb: '100%', exampleEn: 'I always drink water.', exampleAr: 'أنا دائماً أشرب الماء.', emoji: '💯' },
        { pronoun: 'usually', pronounAr: 'عادةً', verb: '75-80%', exampleEn: 'She usually wakes up early.', exampleAr: 'هي عادةً تستيقظ مبكراً.', emoji: '🌅' },
        { pronoun: 'often', pronounAr: 'كثيراً / غالباً', verb: '50-70%', exampleEn: 'We often eat outside.', exampleAr: 'نحن كثيراً نأكل في الخارج.', emoji: '🍽️' },
        { pronoun: 'sometimes', pronounAr: 'أحياناً', verb: '30-50%', exampleEn: 'He sometimes watches TV.', exampleAr: 'هو أحياناً يشاهد التلفاز.', emoji: '📺' },
        { pronoun: 'rarely / seldom', pronounAr: 'نادراً', verb: '10-20%', exampleEn: 'They rarely go to the cinema.', exampleAr: 'هم نادراً يذهبون للسينما.', emoji: '🎬' },
        { pronoun: 'never', pronounAr: 'أبداً / لا أبداً', verb: '0%', exampleEn: 'I never smoke.', exampleAr: 'أنا لا أدخن أبداً.', emoji: '🚭' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'ظروف التكرار في جمل حقيقية 📅',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'always', role: 'question' },
            { text: 'brush', role: 'verb' }, { text: 'my teeth', role: 'complement' },
            { text: 'before bed', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا دائماً أفرش أسناني قبل النوم.',
          emoji: '🦷',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'usually', role: 'question' },
            { text: 'cooks', role: 'verb' }, { text: 'dinner', role: 'complement' },
            { text: 'at home', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي عادةً تطبخ العشاء في البيت.',
          emoji: '🍳',
        },
        {
          tokens: [
            { text: 'He is', role: 'verb' }, { text: 'always', role: 'question' },
            { text: 'late', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو دائماً متأخر. (always بعد is)',
          emoji: '⏰',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'sometimes', role: 'question' },
            { text: 'play', role: 'verb' }, { text: 'football', role: 'complement' },
            { text: 'on weekends', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هم أحياناً يلعبون كرة القدم في عطلة الأسبوع.',
          emoji: '⚽',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'never', role: 'negation' },
            { text: 'eat', role: 'verb' }, { text: 'fast food', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا لا آكل الوجبات السريعة أبداً.',
          emoji: '🍔',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'often', role: 'question' },
            { text: 'go', role: 'verb' }, { text: 'for a walk', role: 'complement' },
            { text: 'in the morning', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن كثيراً ما نتمشى في الصباح.',
          emoji: '🚶',
        },
        {
          tokens: [
            { text: 'She is', role: 'verb' }, { text: 'usually', role: 'question' },
            { text: 'happy', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي عادةً سعيدة.',
          emoji: '😊',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'rarely', role: 'question' },
            { text: 'drinks', role: 'verb' }, { text: 'coffee', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو نادراً يشرب القهوة.',
          emoji: '☕',
        },
        {
          tokens: [
            { text: 'Do you', role: 'question' }, { text: 'always', role: 'question' },
            { text: 'wake up', role: 'verb' }, { text: 'early', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل أنت دائماً تستيقظ مبكراً؟',
          emoji: '🌄',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"I eat always breakfast" — always يجب أن يأتي قبل الفعل الرئيسي', wrong: 'I eat always breakfast.', right: 'I always eat breakfast.' },
        { type: 'tip', ar: 'مع To Be العكس: "She is always late" ✅ — always بعد is/am/are وليس قبله' },
        { type: 'rule', ar: '"never" و"rarely" نفي ضمني — لا نحتاج don\'t معهم: "I never smoke" ✅ · "I don\'t never smoke" ❌' },
        { type: 'tip', ar: 'ترتيب الأقوى للأضعف: always → usually → often → sometimes → rarely → never' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I ', after: ' drink water every day.', answer: 'always', choices: ['always', 'never', 'sometimes'], ar: 'أنا دائماً أشرب الماء كل يوم.' },
        { before: 'She ', after: ' late for class.', answer: 'is never', choices: ['is never', 'never is', 'is not'], ar: 'هي لا تتأخر عن الفصل أبداً.' },
        { before: 'He ', after: ' eats vegetables.', answer: 'rarely', choices: ['rarely', 'always', 'usually'], ar: 'هو نادراً ما يأكل الخضروات.' },
        { before: 'We ', after: ' go out on Fridays.', answer: 'often', choices: ['often', 'never', 'is always'], ar: 'نحن كثيراً ما نخرج يوم الجمعة.' },
        { before: 'I ', after: ' forget my phone.', answer: 'sometimes', choices: ['sometimes', 'always', 'usually'], ar: 'أنا أحياناً أنسى هاتفي.' },
        { before: 'She is ', after: ' happy.', answer: 'usually', choices: ['usually', 'never', 'always is'], ar: 'هي عادةً سعيدة.' },
        { before: 'He ', after: ' smokes.', answer: 'never', choices: ['never', 'always', 'usually'], ar: 'هو لا يدخن أبداً.' },
        { before: 'They ', after: ' speak English at home.', answer: 'sometimes', choices: ['sometimes', 'rarelly', 'allways'], ar: 'هم أحياناً يتكلمون الإنجليزية في البيت.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'أين يأتي ظرف التكرار مع الفعل العادي؟',
          choices: ['بعد الفعل', 'قبل الفعل', 'في نهاية الجملة'],
          correct: 1,
          explanationAr: '"I always eat breakfast" — always قبل الفعل eat.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She is late always.', 'She always is late.', 'She is always late.'],
          correct: 2,
          explanationAr: 'مع To Be: Subject + is + frequency adverb: "She is always late".',
        },
        {
          promptAr: '"never" تعني:',
          choices: ['دائماً', 'أحياناً', 'أبداً (0%)'],
          correct: 2,
          explanationAr: '"never" = 0% — لا يحدث أبداً.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["I don't never eat meat.", 'I never eat meat.', 'I eat never meat.'],
          correct: 1,
          explanationAr: '"never" نفي بنفسه — لا نحتاج don\'t معه: "I never eat meat".',
        },
        {
          promptAr: 'رتب من الأكثر للأقل: usually / always / sometimes',
          choices: ['always → usually → sometimes', 'sometimes → always → usually', 'usually → sometimes → always'],
          correct: 0,
          explanationAr: 'always (100%) → usually (75%) → sometimes (40%).',
        },
        {
          promptAr: 'أكمل: "He ___ goes to the gym." (كثيراً)',
          choices: ['never', 'often', 'rarely'],
          correct: 1,
          explanationAr: '"often" = كثيراً / غالباً.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I eat always breakfast.', 'Always I eat breakfast.', 'I always eat breakfast.'],
          correct: 2,
          explanationAr: '"I always eat breakfast" — الظرف بين الضمير والفعل.',
        },
        {
          promptAr: '"rarely" تعني:',
          choices: ['دائماً', 'أحياناً', 'نادراً'],
          correct: 2,
          explanationAr: '"rarely" = نادراً — يحدث بنسبة 10-20% فقط.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'مع الأفعال العادية: قبل الفعل', en: 'Subject + adverb + verb', example: 'I always eat breakfast.' },
        { ar: 'مع To Be: بعد am/is/are', en: 'Subject + is + adverb', example: 'She is usually happy.' },
        { ar: '"never" نفي بنفسه — لا تضف don\'t', en: 'I never + verb', example: 'He never smokes.' },
      ],
    },
  ],
}
