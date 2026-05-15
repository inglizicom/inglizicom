import type { GrammarLesson } from './types'

export const g05: GrammarLesson = {
  id: 5,
  slug: 'have-has',
  emoji: '🎁',
  title: { en: 'Have / Has', ar: 'have و has — عندي / عنده' },
  description: { en: 'Talk about what you own and possess', ar: 'كيف تتكلم عما تملكه أو تمتلكه' },
  level: 'A0',
  sections: [
    {
      kind: 'cover',
      emoji: '🎁',
      title: 'Have / Has',
      titleAr: 'have و has',
      level: 'A0',
      tagAr: 'درس ٥ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'الفرق بين have و has — متى تستخدم كلاً منهما؟',
      bodyAr:
        'في العربية نقول "عندي" و"عنده" و"عندهم" — كلها نفس المعنى. لكن في الإنجليزية "have" مع معظم الضمائر، بينما "has" مع he/she/it فقط. مثل "is" التي تختص بالمفرد الغائب، "has" تختص به أيضاً.',
      arabicEx: 'عندي كتاب. عنده سيارة.',
      englishEx: 'I HAVE a book. He HAS a car.',
      noteAr: '"HAS" فقط مع he/she/it — كل الضمائر الأخرى تستخدم "have"!',
    },
    {
      kind: 'patternTable',
      titleAr: 'have أم has؟',
      rows: [
        { pronoun: 'I', pronounAr: 'أنا', verb: 'have', exampleEn: 'I have a dog.', exampleAr: 'عندي كلب.', emoji: '🐕' },
        { pronoun: 'You', pronounAr: 'أنتَ / أنتِ', verb: 'have', exampleEn: 'You have a nice car.', exampleAr: 'عندك سيارة جميلة.', emoji: '🚗' },
        { pronoun: 'He', pronounAr: 'هو', verb: 'has', exampleEn: 'He has a new phone.', exampleAr: 'عنده هاتف جديد.', emoji: '📱' },
        { pronoun: 'She', pronounAr: 'هي', verb: 'has', exampleEn: 'She has two sisters.', exampleAr: 'عندها أختان.', emoji: '👭' },
        { pronoun: 'It', pronounAr: 'هو / هي (أشياء)', verb: 'has', exampleEn: 'It has four legs.', exampleAr: 'له أربع أرجل.', emoji: '🐾' },
        { pronoun: 'We', pronounAr: 'نحن', verb: 'have', exampleEn: 'We have a big house.', exampleAr: 'عندنا بيت كبير.', emoji: '🏠' },
        { pronoun: 'They', pronounAr: 'هم / هن', verb: 'have', exampleEn: 'They have three children.', exampleAr: 'عندهم ثلاثة أطفال.', emoji: '👨‍👩‍👦' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل حقيقية مع have / has',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'have', role: 'verb' },
            { text: 'a new laptop', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عندي لابتوب جديد.',
          emoji: '💻',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'beautiful eyes', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عندها عيون جميلة.',
          emoji: '👁️',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'have', role: 'verb' },
            { text: 'a test tomorrow', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عندنا اختبار غداً.',
          emoji: '📝',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'no time', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عنده وقت.',
          emoji: '⏰',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'have', role: 'verb' },
            { text: 'a lot of money', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عندهم الكثير من المال.',
          emoji: '💰',
        },
        {
          tokens: [
            { text: 'The school', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'a big library', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'للمدرسة مكتبة كبيرة.',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "haven't", role: 'verb' },
            { text: 'got time', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندي وقت.',
          emoji: '⏳',
        },
        {
          tokens: [
            { text: 'Do you', role: 'question' }, { text: 'have', role: 'verb' },
            { text: 'a pen', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل عندك قلم؟',
          emoji: '🖊️',
        },
        {
          tokens: [
            { text: 'My cat', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'white fur', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'قطتي لها فرو أبيض.',
          emoji: '🐱',
        },
      ],
    },
    {
      kind: 'negation',
      titleAr: "النفي: don't have / doesn't have",
      bodyAr: "للنفي نستخدم: don't have (مع I/you/we/they) و doesn't have (مع he/she/it)",
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "don't", role: 'negation' },
            { text: 'have', role: 'verb' }, { text: 'a car', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندي سيارة.',
          emoji: '🚫',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: "doesn't", role: 'negation' },
            { text: 'have', role: 'verb' }, { text: 'a phone', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندها هاتف.',
          emoji: '📵',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "don't", role: 'negation' },
            { text: 'have', role: 'verb' }, { text: 'children', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ليس عندهم أطفال.',
          emoji: '👨‍👩‍👦',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"She have a car" — she تحتاج has', wrong: 'She have a car', right: 'She has a car' },
        { type: 'mistake', ar: '"He don\'t have time" — he يحتاج doesn\'t', wrong: "He don't have time", right: "He doesn't have time" },
        { type: 'tip', ar: "have got = have في الإنجليزية البريطانية: 'I've got a dog' = 'I have a dog' — نفس المعنى" },
        { type: 'rule', ar: 'فقط he/she/it تستخدم has — كل الضمائر الأخرى: I/you/we/they تستخدم have' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: 'She ', after: ' a red car.', answer: 'has', choices: ['have', 'has', 'is'], ar: 'عندها سيارة حمراء.' },
        { before: 'They ', after: ' two cats.', answer: 'have', choices: ['have', 'has', 'are'], ar: 'عندهم قطتان.' },
        { before: 'He ', after: " a headache.", answer: 'has', choices: ['have', 'has', 'is'], ar: 'عنده صداع.' },
        { before: 'We ', after: ' a big family.', answer: 'have', choices: ['have', 'has', 'are'], ar: 'عندنا عائلة كبيرة.' },
        { before: "She doesn't ", after: ' time.', answer: 'have', choices: ['have', 'has', 'had'], ar: 'ليس عندها وقت.' },
        { before: 'Do you ', after: ' a pen?', answer: 'have', choices: ['have', 'has', 'had'], ar: 'هل عندك قلم؟' },
        { before: 'The school ', after: ' a big yard.', answer: 'has', choices: ['have', 'has', 'is'], ar: 'للمدرسة فناء كبير.' },
        { before: 'I ', after: ' no money today.', answer: 'have', choices: ['have', 'has', 'am'], ar: 'ليس عندي مال اليوم.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'أكمل: "She ___ a beautiful house."',
          choices: ['have', 'has', 'is'],
          correct: 1,
          explanationAr: '"she" مفرد غائب تستخدم "has" — نفس is في To Be.',
        },
        {
          promptAr: 'أكمل: "We ___ many friends."',
          choices: ['have', 'has', 'are'],
          correct: 0,
          explanationAr: '"we" جمع تستخدم "have" — have مع I/you/we/they.',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ["She have a dog.", "She has a dog.", "She is have a dog."],
          correct: 1,
          explanationAr: '"She has a dog" — she + has (ليس have).',
        },
        {
          promptAr: 'أكمل النفي: "He ___ have a car."',
          choices: ["don't", "doesn't", "isn't"],
          correct: 1,
          explanationAr: 'نفي have مع he/she/it = "doesn\'t have".',
        },
        {
          promptAr: '"I\'ve got a cat" يعني:',
          choices: ['I am a cat', 'I have a cat', 'I want a cat'],
          correct: 1,
          explanationAr: "'I've got = I have — have got اختصار بريطاني شائع.",
        },
        {
          promptAr: 'أكمل: "The dog ___ long ears."',
          choices: ['have', 'has', 'are'],
          correct: 1,
          explanationAr: '"The dog" مفرد (it) يستخدم "has".',
        },
        {
          promptAr: 'أكمل: "Do they ___ children?"',
          choices: ['have', 'has', 'are'],
          correct: 0,
          explanationAr: 'في الأسئلة مع they نستخدم "Do they have" — لا نستخدم has هنا.',
        },
        {
          promptAr: 'أي جملة غلط؟',
          choices: ['I have a problem.', 'They have two cars.', 'She have a test today.'],
          correct: 2,
          explanationAr: '"She have" غلط — she تحتاج has: "She has a test today."',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: 'have مع: I / you / we / they', en: 'have → I, you, we, they', example: 'I have a car. They have money.' },
        { ar: 'has مع: he / she / it', en: 'has → he, she, it', example: 'She has a dog. He has time.' },
        { ar: "النفي: don't have (I/you/we/they) · doesn't have (he/she/it)", en: "don't/doesn't have", example: "I don't have time. She doesn't have a car." },
      ],
    },
  ],
}
