import type { GrammarLesson } from './types'

export const g20: GrammarLesson = {
  id: 20,
  slug: 'numbers',
  emoji: '🔢',
  title: { en: 'Numbers 1-100', ar: 'الأرقام من ١ إلى ١٠٠' },
  description: { en: 'Count, tell time, talk about age and price', ar: 'العد والوقت والعمر والأسعار' },
  level: 'A0',
  sections: [
    {
      kind: 'cover',
      emoji: '🔢',
      title: 'Numbers 1-100',
      titleAr: 'الأرقام من ١ إلى ١٠٠',
      level: 'A0',
      tagAr: 'درس ٢٠ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'لماذا الأرقام مهمة جداً؟ 🔢',
      bodyAr:
        'الأرقام بالإنجليزية تحتاجها في كل مكان: تقول عمرك، تسأل عن السعر، تعطي رقم هاتفك، تقول العنوان، تحجز موعداً. بعض الأرقام لها أشكال غريبة يجب حفظها — خاصة ١١ و١٢ و١٣ حتى ١٩. بعد ذلك القاعدة سهلة: عشرات + وحدات (twenty-one, thirty-five).',
      arabicEx: 'عمري ثلاثة وعشرون سنة. · هذا يكلف مئة درهم.',
      englishEx: 'I am twenty-three years old. · This costs one hundred dirhams.',
      noteAr: '💡 ١-١٢ يجب حفظها · ١٣-١٩ تنتهي بـ teen · ٢٠-٩٠ تنتهي بـ ty · مركبة: twenty-one, forty-five...',
    },
    {
      kind: 'patternTable',
      titleAr: 'الأرقام — من ١ حتى المئة',
      rows: [
        { pronoun: '1-10', pronounAr: 'من واحد لعشرة', verb: 'one two three four five six seven eight nine ten', exampleEn: 'I have five brothers.', exampleAr: 'عندي خمسة إخوة.', emoji: '✋' },
        { pronoun: '11-19', pronounAr: 'الأرقام المنتهية بـ teen', verb: 'eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen', exampleEn: 'She is thirteen years old.', exampleAr: 'عمرها ثلاثة عشر سنة.', emoji: '🔢' },
        { pronoun: '20-90', pronounAr: 'العشرات', verb: 'twenty thirty forty fifty sixty seventy eighty ninety', exampleEn: 'He is forty years old.', exampleAr: 'عمره أربعون سنة.', emoji: '🔟' },
        { pronoun: '21, 35, 67...', pronounAr: 'أرقام مركبة', verb: 'twenty-one thirty-five sixty-seven (عشرات - وحدات بشرطة)', exampleEn: 'My sister is twenty-five.', exampleAr: 'عمر أختي خمسة وعشرون.', emoji: '🔗' },
        { pronoun: '100', pronounAr: 'مئة', verb: 'one hundred / a hundred', exampleEn: 'This costs one hundred dirhams.', exampleAr: 'هذا يكلف مئة درهم.', emoji: '💯' },
        { pronoun: 'الترتيبية', pronounAr: 'أول ثاني ثالث...', verb: 'first second third fourth fifth sixth seventh eighth ninth tenth', exampleEn: 'I live on the third floor.', exampleAr: 'أسكن في الطابق الثالث.', emoji: '🏆' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'الأرقام في الحياة اليومية 💬',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'am', role: 'verb' },
            { text: 'twenty-three', role: 'complement' }, { text: 'years old', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'عمري ثلاثة وعشرون سنة.',
          emoji: '🎂',
        },
        {
          tokens: [
            { text: 'My phone number', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'zero six', role: 'complement' }, { text: 'thirty-one', role: 'complement' },
            { text: 'forty-two', role: 'complement' }, { text: 'fifty-eight', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'رقم هاتفي هو صفر ستة واحد وثلاثون اثنان وأربعون ثمانية وخمسون.',
          emoji: '📱',
        },
        {
          tokens: [
            { text: 'This shirt', role: 'subject' }, { text: 'costs', role: 'verb' },
            { text: 'ninety-five dirhams', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذا القميص يكلف خمسة وتسعين درهماً.',
          emoji: '👕',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'live', role: 'verb' },
            { text: 'on the fifth floor', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أسكن في الطابق الخامس.',
          emoji: '🏢',
        },
        {
          tokens: [
            { text: 'There are', role: 'verb' }, { text: 'thirty students', role: 'subject' },
            { text: 'in my class', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'في فصلي ثلاثون طالباً.',
          emoji: '🏫',
        },
        {
          tokens: [
            { text: 'The meeting', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'at two o\'clock', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الاجتماع في الساعة الثانية.',
          emoji: '🕐',
        },
        {
          tokens: [
            { text: 'My address', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'number sixty-four', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عنواني هو رقم أربعة وستون.',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'in the second year', role: 'complement' }, { text: 'of university', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هو في السنة الثانية من الجامعة.',
          emoji: '🎓',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'need', role: 'verb' },
            { text: 'twelve eggs', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحتاج اثني عشر بيضة.',
          emoji: '🥚',
        },
        {
          tokens: [
            { text: 'The ticket', role: 'subject' }, { text: 'costs', role: 'verb' },
            { text: 'one hundred and fifty dirhams', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'تكلف التذكرة مئة وخمسين درهماً.',
          emoji: '🎫',
        },
        {
          tokens: [
            { text: 'There are', role: 'verb' }, { text: 'sixty seconds', role: 'subject' },
            { text: 'in a minute', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'في الدقيقة ستون ثانية.',
          emoji: '⏱️',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'was born', role: 'verb' },
            { text: 'in nineteen ninety-five', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'وُلدت سنة ألف وتسعمئة وخمسة وتسعين.',
          emoji: '👶',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: في السوق 🛍️',
      noteAr: 'انظر كيف نستخدم الأرقام في الحياة اليومية',
      lines: [
        { speaker: 'A', text: 'Excuse me, how much is this jacket?', ar: 'عفواً، بكم هذه الجاكيتة؟' },
        { speaker: 'B', text: 'It is three hundred and fifty dirhams.', ar: 'ثلاثمئة وخمسون درهماً.' },
        { speaker: 'A', text: 'That is too expensive. What about this one?', ar: 'هذا غالي جداً. وهذه؟' },
        { speaker: 'B', text: 'This one is two hundred dirhams. It is very good quality.', ar: 'هذه بمئتي درهم. جودتها ممتازة.' },
        { speaker: 'A', text: 'OK, I will take it. Do you have change for five hundred?', ar: 'حسناً، سآخذها. هل عندك صرف لخمسمئة؟' },
        { speaker: 'B', text: 'Yes, here is three hundred dirhams change. Thank you!', ar: 'نعم، هذه ثلاثمئة درهم باقي. شكراً!' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: 'في العربية نقول "عندي عشرون سنة" — بالإنجليزية نقول "I am twenty" أو "I am twenty years old"', wrong: 'I have twenty years.', right: 'I am twenty years old.' },
        { type: 'mistake', ar: 'thirteen وthirty — يُلفظان بشكل مختلف: thirteen (ثلاثة عشر) و thirty (ثلاثون) — انتبه جيداً!', wrong: 'I am thirty. (وأنت تقصد 13)', right: 'I am thirteen. (أو thirty إذا كان 30)' },
        { type: 'tip', ar: '١١ و١٢ شاذان: eleven و twelve — لا ينتهيان بـ teen. احفظهما منفصلين.' },
        { type: 'rule', ar: 'الأرقام المركبة من ٢١ إلى ٩٩ تُكتب بشرطة: twenty-one, forty-five, sixty-eight' },
        { type: 'tip', ar: 'لقراءة السنوات: 1995 = nineteen ninety-five · 2024 = twenty twenty-four · 2000 = two thousand' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I am ', after: ' years old.', answer: 'twenty-five', choices: ['twenty-five', 'five and twenty', 'twenty five'], ar: 'عمري خمسة وعشرون سنة.' },
        { before: 'This costs ', after: ' dirhams.', answer: 'fifty', choices: ['fifteen', 'fifty', 'fiveteen'], ar: 'هذا يكلف خمسين درهماً.' },
        { before: 'I live on the ', after: ' floor.', answer: 'third', choices: ['three', 'third', 'thirth'], ar: 'أسكن في الطابق الثالث.' },
        { before: 'There are ', after: ' students in my class.', answer: 'thirty', choices: ['thirteen', 'thirty', 'therty'], ar: 'في فصلي ثلاثون طالباً.' },
        { before: 'My sister is ', after: ' years old.', answer: 'fifteen', choices: ['fifty', 'fifteen', 'fifth'], ar: 'عمر أختي خمس عشرة سنة.' },
        { before: 'The ticket costs ', after: ' dirhams.', answer: 'one hundred', choices: ['a hundreds', 'one hundred', 'hundred one'], ar: 'التذكرة بمئة درهم.' },
        { before: 'She was born in ', after: '.', answer: 'nineteen ninety-eight', choices: ['nineteen ninety-eight', 'nineteen and ninety-eight', 'one thousand nine hundred ninety eight'], ar: 'وُلدت سنة ١٩٩٨.' },
        { before: 'I need ', after: ' eggs.', answer: 'twelve', choices: ['twelve', 'twenty', 'twelfth'], ar: 'أحتاج اثني عشر بيضة.' },
        { before: 'He is the ', after: ' student in class.', answer: 'first', choices: ['one', 'first', 'oned'], ar: 'هو أول طالب في الفصل.' },
        { before: 'We have ', after: ' dirhams.', answer: 'eighty', choices: ['eighteen', 'eighty', 'eigthy'], ar: 'عندنا ثمانون درهماً.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'كيف تقول "عمري عشرون سنة" بالإنجليزية؟',
          choices: ['I have twenty years.', 'I am twenty years old.', 'My age is twenty years.'],
          correct: 1,
          explanationAr: '"I am twenty years old." — نستخدم am/is/are مع العمر، وليس have.',
        },
        {
          promptAr: 'ما هو الرقم 15 بالإنجليزية؟',
          choices: ['fifty', 'fifteen', 'fiveteen'],
          correct: 1,
          explanationAr: '"fifteen" — خمسة عشر. لا تُكتب كـ fiveteen.',
        },
        {
          promptAr: 'كيف تكتب ٤٥ بالإنجليزية؟',
          choices: ['fourty-five', 'forty-five', 'forty five'],
          correct: 1,
          explanationAr: '"forty-five" — انتبه: forty بدون u وليس fourty.',
        },
        {
          promptAr: 'ما الفرق بين thirteen وthirty؟',
          choices: ['لا فرق', 'thirteen = 13 · thirty = 30', 'thirteen = 30 · thirty = 13'],
          correct: 1,
          explanationAr: 'thirteen = ١٣ · thirty = ٣٠ — احذر من الخلط بينهما!',
        },
        {
          promptAr: 'كيف تقول "الطابق الثالث"؟',
          choices: ['three floor', 'the third floor', 'the three floor'],
          correct: 1,
          explanationAr: '"the third floor" — نستخدم الترتيبي third وليس العددي three.',
        },
        {
          promptAr: 'كيف تقرأ سنة 1998؟',
          choices: ['one thousand nine hundred ninety eight', 'nineteen ninety-eight', 'nineteen and ninety-eight'],
          correct: 1,
          explanationAr: '"nineteen ninety-eight" — السنوات تُقرأ جزءين.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I am first.', 'I have first.', 'I is first.'],
          correct: 0,
          explanationAr: '"I am first." — أنا الأول. نستخدم am مع I.',
        },
        {
          promptAr: 'كيف تقول ١٢ بالإنجليزية؟',
          choices: ['twelvty', 'twelfth', 'twelve'],
          correct: 2,
          explanationAr: '"twelve" — اثنا عشر. شاذ ويجب حفظه.',
        },
        {
          promptAr: 'ما الصواب لكتابة ٢١؟',
          choices: ['twenty one', 'twenty-one', 'twentyone'],
          correct: 1,
          explanationAr: '"twenty-one" — الأرقام المركبة تُكتب بشرطة.',
        },
        {
          promptAr: 'كيف تقول "مئة درهم"؟',
          choices: ['a hundreds dirhams', 'one hundred dirhams', 'hundred dirhams'],
          correct: 1,
          explanationAr: '"one hundred" أو "a hundred" — كلاهما صحيح، لكن "one hundred" أوضح.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: '١١ و١٢ شاذان، ١٣-١٩ تنتهي بـ teen، ٢٠-٩٠ تنتهي بـ ty', en: 'eleven, twelve → thirteen...nineteen → twenty...ninety', example: 'fifteen · thirty · seventy-two' },
        { ar: 'الأرقام المركبة تُكتب بشرطة: twenty-one, forty-five', en: 'twenty + hyphen + one = twenty-one', example: 'thirty-five · sixty-eight · ninety-nine' },
        { ar: 'للعمر: I am + رقم + years old (وليس I have)', en: 'I am twenty-three years old.', example: 'She is thirty years old. He is fifteen.' },
      ],
    },
  ],
}
