import type { GrammarLesson } from './types'

export const g23: GrammarLesson = {
  id: 23,
  slug: 'superlatives',
  emoji: '🥇',
  title: { en: 'The Biggest / The Most Beautiful / The Best', ar: 'أقصى درجة: الأكبر / الأجمل / الأفضل' },
  description: { en: 'Talk about the most extreme thing in a group', ar: 'كيف تتكلم عن الأعلى أو الأفضل في مجموعة' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🥇',
      title: 'The Biggest / The Most Beautiful / The Best',
      titleAr: 'أقصى درجة: الأكبر / الأجمل / الأفضل',
      level: 'A1',
      tagAr: 'درس ٢٣ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'المقارنة vs أقصى درجة 🔍',
      bodyAr:
        'في الدرس الماضي تعلمنا المقارنة بين شيئين: "Casablanca is bigger than Rabat." الآن نتعلم أقصى درجة — عندما نقارن شيئاً مع كل المجموعة: "Casablanca is the biggest city in Morocco." القاعدة: (١) صفة قصيرة: the + صفة + est (٢) صفة طويلة: the most + صفة. دائماً the قبلها!',
      arabicEx: 'الدار البيضاء هي المدينة الأكبر في المغرب. · هي الأجمل في الفصل.',
      englishEx: 'Casablanca is the biggest city in Morocco. · She is the most beautiful girl in the class.',
      noteAr: '💡 the + صفة قصيرة + est · the most + صفة طويلة — دائماً the!',
    },
    {
      kind: 'patternTable',
      titleAr: 'قواعد أقصى درجة',
      rows: [
        { pronoun: 'the + adj + est', pronounAr: 'tall → the tallest', verb: 'Subject + is/are + the + adj-est', exampleEn: 'He is the tallest in the class.', exampleAr: 'هو الأطول في الفصل.', emoji: '📏' },
        { pronoun: 'big → the biggest', pronounAr: 'مضاعفة + est', verb: 'the biggest / the hottest', exampleEn: 'This is the biggest city in Morocco.', exampleAr: 'هذه أكبر مدينة في المغرب.', emoji: '🏙️' },
        { pronoun: 'easy → the easiest', pronounAr: 'y → iest', verb: 'y → iest', exampleEn: 'This is the easiest exercise.', exampleAr: 'هذا أسهل تمرين.', emoji: '✏️' },
        { pronoun: 'the most + long adj', pronounAr: 'beautiful → the most beautiful', verb: 'the most + adj (طويلة)', exampleEn: 'She is the most beautiful girl in the class.', exampleAr: 'هي أجمل بنت في الفصل.', emoji: '💐' },
        { pronoun: 'the most expensive', pronounAr: 'الأغلى', verb: 'the most + expensive', exampleEn: 'This is the most expensive phone in the shop.', exampleAr: 'هذا أغلى هاتف في المحل.', emoji: '💰' },
        { pronoun: 'the most comfortable', pronounAr: 'الأكثر راحة', verb: 'the most + comfortable', exampleEn: 'This chair is the most comfortable.', exampleAr: 'هذا الكرسي هو الأكثر راحة.', emoji: '🪑' },
        { pronoun: 'in vs of', pronounAr: 'في المكان vs من بين', verb: 'the best in Morocco · the best of all', exampleEn: 'He is the best student of all.', exampleAr: 'هو أفضل طالب على الإطلاق.', emoji: '🏆' },
        { pronoun: 'شاذة: the best · the worst', pronounAr: 'good → the best · bad → the worst', verb: 'irregular superlatives', exampleEn: 'This is the best couscous I have ever eaten.', exampleAr: 'هذا أفضل كسكس أكلته في حياتي.', emoji: '🍲' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل بأقصى درجة 💬',
      items: [
        {
          tokens: [
            { text: 'Casablanca', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the biggest city', role: 'complement' }, { text: 'in Morocco', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'الدار البيضاء هي أكبر مدينة في المغرب.',
          emoji: '🏙️',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the most beautiful girl', role: 'complement' }, { text: 'in the class', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هي أجمل بنت في الفصل.',
          emoji: '💐',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the best student', role: 'complement' }, { text: 'of all', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هو أفضل طالب على الإطلاق.',
          emoji: '🏆',
        },
        {
          tokens: [
            { text: 'This', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the most expensive phone', role: 'complement' }, { text: 'in the shop', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هذا أغلى هاتف في المحل.',
          emoji: '📱',
        },
        {
          tokens: [
            { text: 'Mount Everest', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the highest mountain', role: 'complement' }, { text: 'in the world', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'جبل إيفرست هو أعلى جبل في العالم.',
          emoji: '🏔️',
        },
        {
          tokens: [
            { text: 'This couscous', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the best', role: 'complement' }, { text: 'I have ever eaten', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هذا أفضل كسكس أكلته في حياتي.',
          emoji: '🍲',
        },
        {
          tokens: [
            { text: 'This is', role: 'verb' }, { text: 'the easiest exercise', role: 'complement' },
            { text: 'in the lesson', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذا أسهل تمرين في الدرس.',
          emoji: '✏️',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the youngest', role: 'complement' }, { text: 'in the family', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هو الأصغر في العائلة.',
          emoji: '👶',
        },
        {
          tokens: [
            { text: 'January', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the coldest month', role: 'complement' }, { text: 'of the year', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'يناير هو أبرد شهر في السنة.',
          emoji: '❄️',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'speaks', role: 'verb' },
            { text: 'the most languages', role: 'complement' }, { text: 'in her class', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هي تتكلم أكثر لغة في فصلها.',
          emoji: '🌍',
        },
        {
          tokens: [
            { text: 'That was', role: 'verb' }, { text: 'the worst film', role: 'complement' },
            { text: 'I have ever seen', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'كان ذلك أسوأ فيلم رأيته في حياتي.',
          emoji: '😖',
        },
        {
          tokens: [
            { text: 'This hotel', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'the most comfortable', role: 'complement' }, { text: 'in the city', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'هذا الفندق الأكثر راحة في المدينة.',
          emoji: '🏨',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: أرقام قياسية عالمية 🌍',
      noteAr: 'انظر كيف نستخدم أقصى درجة عند الحديث عن الأشياء الاستثنائية',
      lines: [
        { speaker: 'A', text: 'Did you know that the Nile is the longest river in the world?', ar: 'هل تعلم أن نهر النيل هو أطول نهر في العالم؟' },
        { speaker: 'B', text: 'Really? I thought the Amazon was the longest!', ar: 'حقاً؟ ظننت أن الأمازون هو الأطول!' },
        { speaker: 'A', text: 'No, the Nile is the longest. And Russia is the biggest country.', ar: 'لا، النيل هو الأطول. وروسيا أكبر دولة.' },
        { speaker: 'B', text: 'What is the most expensive city in the world?', ar: 'ما هي أغلى مدينة في العالم؟' },
        { speaker: 'A', text: 'I think Zurich is the most expensive city in Europe.', ar: 'أظن أن زيورخ هي أغلى مدينة في أوروبا.' },
        { speaker: 'B', text: 'And Morocco? Which city has the best food?', ar: 'والمغرب؟ أي مدينة فيها أفضل أكل؟' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"the most big" خطأ — الصفات القصيرة تأخذ the + est', wrong: 'This is the most big city.', right: 'This is the biggest city.' },
        { type: 'mistake', ar: 'لا تنسى "the" قبل أقصى درجة — دائماً the!', wrong: 'She is most beautiful girl.', right: 'She is the most beautiful girl.' },
        { type: 'tip', ar: 'in + مكان أو مجموعة: "the best student in the class" · "the biggest city in Morocco"' },
        { type: 'rule', ar: 'of + كل المجموعة: "the best of all" · "the oldest of the three" · "the worst of everything"' },
        { type: 'tip', ar: 'good → the best · bad → the worst · far → the farthest/furthest — شاذة يجب حفظها' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'This is ', after: ' city in Morocco. (big)', answer: 'the biggest', choices: ['the most big', 'the bigger', 'the biggest'], ar: 'هذه أكبر مدينة في المغرب.' },
        { before: 'She is ', after: ' student in the class. (intelligent)', answer: 'the most intelligent', choices: ['the most intelligent', 'the intelligenter', 'the intelligentest'], ar: 'هي أذكى طالبة في الفصل.' },
        { before: 'This is ', after: ' exercise. (easy)', answer: 'the easiest', choices: ['the most easy', 'the easiest', 'the easyer'], ar: 'هذا أسهل تمرين.' },
        { before: 'He is ', after: ' player of all. (good)', answer: 'the best', choices: ['the goodest', 'the most good', 'the best'], ar: 'هو أفضل لاعب على الإطلاق.' },
        { before: 'January is ', after: ' month of the year. (cold)', answer: 'the coldest', choices: ['the coldest', 'the most cold', 'the colder'], ar: 'يناير أبرد شهر في السنة.' },
        { before: 'That was ', after: ' film I have ever seen. (bad)', answer: 'the worst', choices: ['the baddest', 'the most bad', 'the worst'], ar: 'كان ذلك أسوأ فيلم رأيته.' },
        { before: 'This is ', after: ' phone in the shop. (expensive)', answer: 'the most expensive', choices: ['the expensivest', 'the more expensive', 'the most expensive'], ar: 'هذا أغلى هاتف في المحل.' },
        { before: 'He is ', after: ' in the family. (young)', answer: 'the youngest', choices: ['the most young', 'the youngest', 'the youngesst'], ar: 'هو الأصغر في العائلة.' },
        { before: 'She is ', after: ' girl in the school. (tall)', answer: 'the tallest', choices: ['the most tall', 'the tallest', 'the taller'], ar: 'هي أطول بنت في المدرسة.' },
        { before: 'This hotel is ', after: ' in the city. (comfortable)', answer: 'the most comfortable', choices: ['the comfortablest', 'the most comfortable', 'the more comfortable'], ar: 'هذا الفندق الأكثر راحة في المدينة.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ['This is most big city.', 'This is the most big city.', 'This is the biggest city.'],
          correct: 2,
          explanationAr: '"the biggest" — big قصيرة فتأخذ the + gest (مضاعفة g). "most big" خطأ.',
        },
        {
          promptAr: 'أكمل: "She is ___ girl in the class." (beautiful)',
          choices: ['the most beautiful', 'the beautifulest', 'most beautiful'],
          correct: 0,
          explanationAr: '"the most beautiful" — beautiful طويلة فتأخذ the most. لا ننسى the!',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['He is the goodest student.', 'He is the most good student.', 'He is the best student.'],
          correct: 2,
          explanationAr: '"the best" — good → the best (شاذة).',
        },
        {
          promptAr: 'أكمل: "This is ___ exercise." (easy)',
          choices: ['the most easy', 'the easiest', 'the easyer'],
          correct: 1,
          explanationAr: '"the easiest" — easy → the easiest (y → iest).',
        },
        {
          promptAr: 'ما الفرق بين in وof في أقصى درجة؟',
          choices: [
            'in = للمجموعة · of = للمكان',
            'in = للمكان أو المجموعة · of = لعدد أو كل المجموعة',
            'كلاهما نفس المعنى',
          ],
          correct: 1,
          explanationAr: '"in" للمكان أو المجموعة (in Morocco, in the class) · "of" لكل المجموعة (of all, of the three).',
        },
        {
          promptAr: 'أكمل: "That was ___ film." (bad)',
          choices: ['the baddest', 'the most bad', 'the worst'],
          correct: 2,
          explanationAr: '"the worst" — bad → the worst (شاذة).',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She is most beautiful in class.', 'She is the most beautiful in the class.', 'She is the beautifulest in the class.'],
          correct: 1,
          explanationAr: '"the most beautiful" مع the — دائماً the قبل أقصى درجة!',
        },
        {
          promptAr: 'أكمل: "He is ___ in the family." (young)',
          choices: ['the most young', 'the youngest', 'the youngesst'],
          correct: 1,
          explanationAr: '"the youngest" — young قصيرة فتأخذ the + est.',
        },
        {
          promptAr: 'المقارنة بين شيئين تستخدم:',
          choices: ['أقصى درجة (the best)', 'المقارنة (better than)', 'كلاهما صحيح'],
          correct: 1,
          explanationAr: 'للمقارنة بين شيئين: better than. أقصى درجة للمقارنة مع كل المجموعة.',
        },
        {
          promptAr: 'أكمل: "January is ___ month of the year." (cold)',
          choices: ['the most cold', 'the coldest', 'the colder'],
          correct: 1,
          explanationAr: '"the coldest" — cold قصيرة فتأخذ the + est.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'صفة قصيرة: the + صفة + est (دائماً the!)', en: 'the tallest · the biggest · the coldest', example: 'He is the tallest in the class.' },
        { ar: 'صفة طويلة: the most + صفة', en: 'the most beautiful · the most expensive', example: 'This is the most expensive phone in the shop.' },
        { ar: 'شاذة: good → the best · bad → the worst', en: 'good → the best · bad → the worst · far → the farthest', example: 'This is the best couscous I have ever eaten.' },
      ],
    },
  ],
}
