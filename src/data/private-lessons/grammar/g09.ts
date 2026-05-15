import type { GrammarLesson } from './types'

export const g09: GrammarLesson = {
  id: 9,
  slug: 'there-is-are',
  emoji: '📍',
  title: { en: 'There is / There are', ar: 'يوجد / توجد' },
  description: { en: 'Talk about existence of things', ar: 'كيف تتكلم عن وجود الأشياء والناس' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '📍',
      title: 'There is / There are',
      titleAr: 'يوجد / توجد',
      level: 'A1',
      tagAr: 'درس ٩ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تقول "يوجد" و"توجد" بالإنجليزية؟',
      bodyAr:
        'في العربية نقول "يوجد كتاب على الطاولة" أو "هناك كتاب". الإنجليزية تستخدم "There is" للمفرد و"There are" للجمع. مثل To Be تماماً: is للمفرد، are للجمع. الفائدة الرئيسية: لتقديم شيء جديد أو وصف مكان ما.',
      arabicEx: 'يوجد مطعم قريب من هنا.',
      englishEx: 'THERE IS a restaurant nearby.',
      noteAr: '"THERE IS" يعادل "يوجد" — يستخدم دائماً لتقديم الأشياء لأول مرة!',
    },
    {
      kind: 'patternTable',
      titleAr: 'there is أم there are؟',
      rows: [
        { pronoun: 'There is', pronounAr: 'يوجد (مفرد)', verb: 'there is + noun', exampleEn: 'There is a bank nearby.', exampleAr: 'يوجد بنك قريباً.', emoji: '🏦' },
        { pronoun: 'There are', pronounAr: 'يوجد (جمع)', verb: 'there are + noun', exampleEn: 'There are many restaurants.', exampleAr: 'يوجد مطاعم كثيرة.', emoji: '🍽️' },
        { pronoun: "There isn't", pronounAr: 'لا يوجد (مفرد)', verb: "there isn't + noun", exampleEn: "There isn't a hotel here.", exampleAr: 'لا يوجد فندق هنا.', emoji: '🚫' },
        { pronoun: "There aren't", pronounAr: 'لا يوجد (جمع)', verb: "there aren't + noun", exampleEn: "There aren't any taxis.", exampleAr: 'لا توجد سيارات أجرة.', emoji: '🚕' },
        { pronoun: 'Is there...?', pronounAr: 'هل يوجد؟ (مفرد)', verb: 'Is there + noun?', exampleEn: 'Is there a pharmacy here?', exampleAr: 'هل يوجد صيدلية هنا؟', emoji: '💊' },
        { pronoun: 'Are there...?', pronounAr: 'هل يوجد؟ (جمع)', verb: 'Are there + noun?', exampleEn: 'Are there any students?', exampleAr: 'هل يوجد طلاب؟', emoji: '🎓' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل there is / there are في الحياة اليومية',
      items: [
        {
          tokens: [
            { text: 'There is', role: 'verb' }, { text: 'a supermarket', role: 'subject' },
            { text: 'near my house', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'يوجد سوبرماركت قرب بيتي.',
          emoji: '🛒',
        },
        {
          tokens: [
            { text: 'There are', role: 'verb' }, { text: 'many students', role: 'subject' },
            { text: 'in the class', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'يوجد طلاب كثيرون في الفصل.',
          emoji: '🎓',
        },
        {
          tokens: [
            { text: 'There is', role: 'verb' }, { text: 'a problem', role: 'subject' },
            { text: 'with the internet', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'توجد مشكلة في الإنترنت.',
          emoji: '📡',
        },
        {
          tokens: [
            { text: "There isn't", role: 'verb' }, { text: 'a hotel', role: 'subject' },
            { text: 'in this village', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لا يوجد فندق في هذه القرية.',
          emoji: '🏘️',
        },
        {
          tokens: [
            { text: 'Is there', role: 'question' }, { text: 'a pharmacy', role: 'subject' },
            { text: 'nearby', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل يوجد صيدلية قريباً؟',
          emoji: '💊',
        },
        {
          tokens: [
            { text: 'There are', role: 'verb' }, { text: 'three bedrooms', role: 'subject' },
            { text: 'in the house', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'يوجد ثلاث غرف نوم في البيت.',
          emoji: '🛏️',
        },
        {
          tokens: [
            { text: "There aren't", role: 'verb' }, { text: 'any taxis', role: 'subject' },
            { text: 'at this hour', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لا توجد سيارات أجرة في هذه الساعة.',
          emoji: '🚕',
        },
        {
          tokens: [
            { text: 'Are there', role: 'question' }, { text: 'any restaurants', role: 'subject' },
            { text: 'here', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل توجد مطاعم هنا؟',
          emoji: '🍽️',
        },
        {
          tokens: [
            { text: 'There is', role: 'verb' }, { text: 'a message', role: 'subject' },
            { text: 'for you', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'توجد رسالة لك.',
          emoji: '📩',
        },
      ],
    },
    {
      kind: 'negation',
      titleAr: "النفي: there isn't / there aren't",
      bodyAr: "للنفي: there isn't (مفرد) · there aren't (جمع)",
      items: [
        {
          tokens: [
            { text: "There isn't", role: 'negation' }, { text: 'a parking', role: 'subject' },
            { text: 'here', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لا يوجد موقف سيارات هنا.',
          emoji: '🅿️',
        },
        {
          tokens: [
            { text: "There aren't", role: 'negation' }, { text: 'any seats', role: 'subject' },
            { text: 'left', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لا توجد مقاعد متبقية.',
          emoji: '💺',
        },
        {
          tokens: [
            { text: "There isn't", role: 'negation' }, { text: 'enough time', role: 'subject' },
            { text: '.', role: 'filler' },
          ],
          ar: 'لا يوجد وقت كافٍ.',
          emoji: '⏰',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"There is many people" — many يعني جمع يحتاج are', wrong: 'There is many people', right: 'There are many people' },
        { type: 'mistake', ar: '"There are a cat" — a يعني مفرد يحتاج is', wrong: 'There are a cat', right: 'There is a cat' },
        { type: 'tip', ar: 'السؤال: Is there...? (مفرد) / Are there...? (جمع) — الجواب: Yes, there is / No, there isn\'t' },
        { type: 'rule', ar: 'نختار is أو are حسب الكلمة التي تأتي بعد there is/are — المفرد أو الجمع هو المحدِّد' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: 'There ', after: ' a cat in the garden.', answer: 'is', choices: ['is', 'are', 'am'], ar: 'يوجد قطة في الحديقة.' },
        { before: 'There ', after: ' many students in the class.', answer: 'are', choices: ['is', 'are', 'am'], ar: 'يوجد طلاب كثيرون في الفصل.' },
        { before: '', after: ' there a hospital near here?', answer: 'Is', choices: ['Is', 'Are', 'Do'], ar: 'هل يوجد مستشفى قريباً؟' },
        { before: "There ", after: " a problem with the phone.", answer: 'is', choices: ['is', 'are', 'has'], ar: 'توجد مشكلة في الهاتف.' },
        { before: "There ", after: " any taxis outside.", answer: "aren't", choices: ["isn't", "aren't", "don't"], ar: 'لا توجد سيارات أجرة في الخارج.' },
        { before: '', after: ' there any restaurants here?', answer: 'Are', choices: ['Is', 'Are', 'Do'], ar: 'هل توجد مطاعم هنا؟' },
        { before: 'There ', after: ' three floors in this building.', answer: 'are', choices: ['is', 'are', 'has'], ar: 'يوجد ثلاثة طوابق في هذا المبنى.' },
        { before: "There ", after: " a message for you.", answer: 'is', choices: ['is', 'are', 'has'], ar: 'توجد رسالة لك.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'أكمل: "There ___ a bank nearby."',
          choices: ['is', 'are', 'am'],
          correct: 0,
          explanationAr: '"a bank" مفرد → نستخدم "There is".',
        },
        {
          promptAr: 'أكمل: "There ___ many people in the market."',
          choices: ['is', 'are', 'am'],
          correct: 1,
          explanationAr: '"many people" جمع → نستخدم "There are".',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ['There is many cars.', 'There are a car.', 'There are many cars.'],
          correct: 2,
          explanationAr: '"There are many cars" — many cars جمع → are.',
        },
        {
          promptAr: 'كيف تسأل عن وجود مطعم؟',
          choices: ['There is a restaurant?', 'Is there a restaurant?', 'Are there a restaurant?'],
          correct: 1,
          explanationAr: 'السؤال للمفرد: "Is there a restaurant?"',
        },
        {
          promptAr: 'أكمل النفي: "There ___ a parking here."',
          choices: ["isn't", "aren't", "don't"],
          correct: 0,
          explanationAr: '"a parking" مفرد → نفيه: "There isn\'t".',
        },
        {
          promptAr: 'ما الجواب القصير لـ "Is there a supermarket here?" (نعم)',
          choices: ['Yes, there are.', 'Yes, there is.', 'Yes, it is.'],
          correct: 1,
          explanationAr: '"Is there?" → الجواب القصير: "Yes, there is."',
        },
        {
          promptAr: 'أكمل: "___ there any seats left?"',
          choices: ['Is', 'Are', 'Do'],
          correct: 1,
          explanationAr: '"any seats" جمع → "Are there any seats?"',
        },
        {
          promptAr: 'أي جملة غلط؟',
          choices: ['There is a problem.', 'There are five rooms.', 'There are a message for you.'],
          correct: 2,
          explanationAr: '"a message" مفرد → "There is a message" وليس "There are".',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: '"There is" للمفرد · "There are" للجمع', en: 'There is (singular) · There are (plural)', example: 'There is a cat. There are many cats.' },
        { ar: "النفي: There isn't (مفرد) · There aren't (جمع)", en: "Negative: isn't / aren't", example: "There isn't a hotel. There aren't taxis." },
        { ar: 'السؤال: Is there...? (مفرد) · Are there...? (جمع)', en: 'Question: Is there? / Are there?', example: 'Is there a bank? Are there restaurants?' },
      ],
    },
  ],
}
