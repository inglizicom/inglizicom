import type { GrammarLesson } from './types'

export const g11: GrammarLesson = {
  id: 11,
  slug: 'adjectives',
  emoji: '🎨',
  title: { en: 'Adjectives', ar: 'الصفات' },
  description: { en: 'Describe people, places and things', ar: 'كيف تصف الناس والأماكن والأشياء' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🎨',
      title: 'Adjectives',
      titleAr: 'الصفات',
      level: 'A1',
      tagAr: 'درس ١١ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'الصفة في الإنجليزية تأتي قبل الاسم! 🔄',
      bodyAr:
        'في العربية نقول "سيارة سريعة" — الاسم أولاً ثم الصفة. لكن في الإنجليزية العكس تماماً: "a fast car" — الصفة أولاً ثم الاسم. هذا الفرق مهم جداً ويسبب أخطاء كثيرة!',
      arabicEx: 'سيارة حمراء — بيت كبير',
      englishEx: 'a RED car — a BIG house',
      noteAr: '⚠️ الصفة قبل الاسم دائماً: red car ✅ · car red ❌',
    },
    {
      kind: 'patternTable',
      titleAr: 'أزواج الصفات المتضادة — الأكثر استخداماً',
      rows: [
        { pronoun: 'big / large', pronounAr: 'كبير', verb: 'small / little', exampleEn: 'a big city / a small town', exampleAr: 'مدينة كبيرة / بلدة صغيرة', emoji: '🏙️' },
        { pronoun: 'hot', pronounAr: 'حار', verb: 'cold', exampleEn: 'hot coffee / cold water', exampleAr: 'قهوة ساخنة / ماء بارد', emoji: '🔥' },
        { pronoun: 'fast / quick', pronounAr: 'سريع', verb: 'slow', exampleEn: 'a fast car / a slow train', exampleAr: 'سيارة سريعة / قطار بطيء', emoji: '🚄' },
        { pronoun: 'beautiful / pretty', pronounAr: 'جميل/ة', verb: 'ugly', exampleEn: 'a beautiful flower / an ugly building', exampleAr: 'زهرة جميلة / مبنى قبيح', emoji: '🌸' },
        { pronoun: 'expensive', pronounAr: 'غالي', verb: 'cheap', exampleEn: 'an expensive phone / a cheap shirt', exampleAr: 'هاتف غالي / قميص رخيص', emoji: '💸' },
        { pronoun: 'easy', pronounAr: 'سهل', verb: 'difficult / hard', exampleEn: 'an easy test / a difficult question', exampleAr: 'اختبار سهل / سؤال صعب', emoji: '📝' },
        { pronoun: 'happy / glad', pronounAr: 'سعيد', verb: 'sad / unhappy', exampleEn: 'a happy child / a sad story', exampleAr: 'طفل سعيد / قصة حزينة', emoji: '😊' },
        { pronoun: 'young', pronounAr: 'شاب/ة', verb: 'old', exampleEn: 'a young teacher / an old building', exampleAr: 'أستاذ شاب / مبنى قديم', emoji: '👴' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'الصفة في جمل حقيقية 🌍',
      items: [
        {
          tokens: [
            { text: 'This is', role: 'verb' }, { text: 'a', role: 'filler' },
            { text: 'beautiful', role: 'subject' }, { text: 'city', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذه مدينة جميلة.',
          emoji: '🏙️',
        },
        {
          tokens: [
            { text: 'He has', role: 'verb' }, { text: 'a', role: 'filler' },
            { text: 'fast', role: 'subject' }, { text: 'car', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو عنده سيارة سريعة.',
          emoji: '🚗',
        },
        {
          tokens: [
            { text: 'Morocco is', role: 'verb' },
            { text: 'a', role: 'filler' },
            { text: 'beautiful', role: 'subject' },
            { text: 'country', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'المغرب بلد جميل.',
          emoji: '🇲🇦',
        },
        {
          tokens: [
            { text: 'She is', role: 'verb' },
            { text: 'a', role: 'filler' },
            { text: 'young', role: 'subject' },
            { text: 'doctor', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هي طبيبة شابة.',
          emoji: '👩‍⚕️',
        },
        {
          tokens: [
            { text: 'English is', role: 'verb' },
            { text: 'an', role: 'filler' },
            { text: 'important', role: 'subject' },
            { text: 'language', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'الإنجليزية لغة مهمة.',
          emoji: '🌐',
        },
        {
          tokens: [
            { text: 'This coffee is', role: 'verb' },
            { text: 'very', role: 'filler' },
            { text: 'hot', role: 'subject' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هذه القهوة ساخنة جداً.',
          emoji: '☕',
        },
        {
          tokens: [
            { text: 'It was', role: 'verb' },
            { text: 'a', role: 'filler' },
            { text: 'difficult', role: 'subject' },
            { text: 'exam', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'كان اختباراً صعباً.',
          emoji: '😓',
        },
        {
          tokens: [
            { text: 'I need', role: 'verb' },
            { text: 'a', role: 'filler' },
            { text: 'cheap', role: 'subject' },
            { text: 'hotel', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أحتاج فندقاً رخيصاً.',
          emoji: '🏨',
        },
        {
          tokens: [
            { text: "She's", role: 'subject' },
            { text: 'very', role: 'filler' },
            { text: 'happy', role: 'complement' },
            { text: 'today', role: 'filler' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هي سعيدة جداً اليوم.',
          emoji: '😄',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"car red" — الصفة تأتي قبل الاسم في الإنجليزية', wrong: 'I have a car red.', right: 'I have a red car.' },
        { type: 'tip', ar: 'الصفة مع To Be تأتي بعد الفعل: "The car is red" — هنا red بعد is وهذا صحيح أيضاً' },
        { type: 'tip', ar: 'الصفة في الإنجليزية لا تتغير في الجمع! — "a red car / red cars" وليس "reds cars"' },
        { type: 'rule', ar: 'الصفة في موضعين: (١) قبل الاسم: "a big house" · (٢) بعد To Be: "The house is big"' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'She lives in a ', after: ' house.', answer: 'big', choices: ['big', 'house big', 'bigs'], ar: 'هي تسكن في بيت كبير.' },
        { before: 'This is an ', after: ' lesson.', answer: 'easy', choices: ['easy', 'easily', 'easing'], ar: 'هذا درس سهل.' },
        { before: 'He drives a ', after: ' car.', answer: 'fast', choices: ['fast', 'faster', 'fastly'], ar: 'هو يقود سيارة سريعة.' },
        { before: 'The weather is ', after: ' today.', answer: 'cold', choices: ['cold', 'coldly', 'colds'], ar: 'الطقس بارد اليوم.' },
        { before: 'I need a ', after: ' phone.', answer: 'cheap', choices: ['cheap', 'cheaper', 'cheaply'], ar: 'أحتاج هاتفاً رخيصاً.' },
        { before: 'She is a ', after: ' doctor.', answer: 'young', choices: ['young', 'youth', 'youngly'], ar: 'هي طبيبة شابة.' },
        { before: 'It was a ', after: ' film.', answer: 'beautiful', choices: ['beautiful', 'beauty', 'beautifully'], ar: 'كان فيلماً جميلاً.' },
        { before: "That's a really ", after: ' question.', answer: 'difficult', choices: ['difficult', 'difficulty', 'difficultly'], ar: 'هذا سؤال صعب حقاً.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'أين تأتي الصفة في الإنجليزية؟',
          choices: ['بعد الاسم', 'قبل الاسم', 'في نهاية الجملة'],
          correct: 1,
          explanationAr: 'الصفة تأتي قبل الاسم: "a big house" وليس "a house big".',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I have a car red.', 'I have a red car.', 'I have red a car.'],
          correct: 1,
          explanationAr: '"a red car" — الصفة red قبل الاسم car.',
        },
        {
          promptAr: 'أكمل: "She is a ___ teacher." (شابة)',
          choices: ['young', 'youngly', 'youth'],
          correct: 0,
          explanationAr: '"young" هي الصفة الصحيحة.',
        },
        {
          promptAr: 'ما مضاد "expensive"؟',
          choices: ['slow', 'cheap', 'small'],
          correct: 1,
          explanationAr: 'expensive = غالي · cheap = رخيص.',
        },
        {
          promptAr: 'أكمل: "This is ___ easy question."',
          choices: ['a', 'an', 'the'],
          correct: 1,
          explanationAr: '"easy" يبدأ بصوت صائت (e) إذن "an easy question".',
        },
        {
          promptAr: 'كيف تقول "مبنى قديم" بالإنجليزية؟',
          choices: ['building old', 'old building', 'oldly building'],
          correct: 1,
          explanationAr: '"old building" — الصفة old قبل الاسم building.',
        },
        {
          promptAr: 'ما الصواب في الجمع؟',
          choices: ['two bigs houses', 'two big houses', 'two house bigs'],
          correct: 1,
          explanationAr: 'الصفة لا تتغير في الجمع: "two big houses" وليس "bigs".',
        },
        {
          promptAr: 'أكمل: "The exam was very ___."',
          choices: ['difficulty', 'difficultly', 'difficult'],
          correct: 2,
          explanationAr: 'بعد To Be نستخدم الصفة: "very difficult".',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'الصفة قبل الاسم دائماً', en: 'adjective + noun', example: 'a big house / a fast car' },
        { ar: 'الصفة بعد To Be: subject + is/are + adjective', en: 'The house is big.', example: 'She is happy. / It is cold.' },
        { ar: 'الصفة لا تتغير في الجمع', en: 'big house → big houses', example: 'two beautiful flowers' },
      ],
    },
  ],
}
