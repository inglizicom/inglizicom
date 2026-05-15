import type { GrammarLesson } from './types'

export const g03: GrammarLesson = {
  id: 3,
  slug: 'articles',
  emoji: '📰',
  title: { en: 'Articles: a / an / the', ar: 'أدوات التعريف والتنكير' },
  description: { en: 'When to use a, an and the', ar: 'متى تستخدم a و an و the بالإنجليزية' },
  level: 'A0',
  sections: [
    {
      kind: 'cover',
      emoji: '📰',
      title: 'Articles',
      titleAr: 'أدوات التعريف والتنكير',
      level: 'A0',
      tagAr: 'درس ٣ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'لماذا "a cat" مرة و"the cat" مرة أخرى؟',
      bodyAr:
        'في العربية عندنا "ال" للتعريف فقط. لكن في الإنجليزية هناك ثلاثة: "a" للمجهول المفرد، "an" للمجهول المفرد أمام صوت صائت، و"the" للمعروف بين المتكلمين. مثال: رأيت قطة = I saw A cat. القطة ذهبت = THE cat left.',
      arabicEx: 'أنا أستاذ.',
      englishEx: 'I am A teacher.',
      noteAr: 'نقول "a teacher" لأن المهن تحتاج article — بدون "a" الجملة غلط!',
    },
    {
      kind: 'patternTable',
      titleAr: 'متى تستخدم كل article؟',
      rows: [
        { pronoun: 'a', pronounAr: 'قبل صوت ساكن', verb: 'a + consonant sound', exampleEn: 'a book / a car / a university', exampleAr: 'كتاب / سيارة / جامعة', emoji: '📚' },
        { pronoun: 'an', pronounAr: 'قبل صوت صائت', verb: 'an + vowel sound', exampleEn: 'an apple / an orange / an hour', exampleAr: 'تفاحة / برتقالة / ساعة', emoji: '🍎' },
        { pronoun: 'the', pronounAr: 'معروف / محدد', verb: 'the + known noun', exampleEn: 'the sun / the teacher / the book', exampleAr: 'الشمس / الأستاذ / الكتاب', emoji: '☀️' },
        { pronoun: 'بدون article', pronounAr: 'أسماء عامة / غير معدودة', verb: 'no article', exampleEn: 'water / love / Morocco / English', exampleAr: 'ماء / حب / المغرب / الإنجليزية', emoji: '🌊' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل مع a / an / the',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'am', role: 'verb' },
            { text: 'a', role: 'filler' }, { text: 'student', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا طالب.',
          emoji: '🎓',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'an', role: 'filler' }, { text: 'engineer', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي مهندسة.',
          emoji: '👩‍💻',
        },
        {
          tokens: [
            { text: 'The', role: 'filler' }, { text: 'sun', role: 'subject' },
            { text: 'is', role: 'verb' }, { text: 'very hot', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الشمس حارة جداً.',
          emoji: '☀️',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'have', role: 'verb' },
            { text: 'a', role: 'filler' }, { text: 'dog', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عندي كلب.',
          emoji: '🐕',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'an', role: 'filler' }, { text: 'honest man', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو رجل صادق.',
          emoji: '🤝',
        },
        {
          tokens: [
            { text: 'Please', role: 'filler' }, { text: 'open', role: 'verb' },
            { text: 'the', role: 'filler' }, { text: 'window', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'من فضلك افتح النافذة.',
          emoji: '🪟',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'love', role: 'verb' },
            { text: 'English', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا أحب الإنجليزية.',
          emoji: '❤️',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'drinks', role: 'verb' },
            { text: 'water', role: 'complement' }, { text: 'every day', role: 'filler' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي تشرب الماء كل يوم.',
          emoji: '💧',
        },
        {
          tokens: [
            { text: 'The', role: 'filler' }, { text: 'teacher', role: 'subject' },
            { text: 'is', role: 'verb' }, { text: 'in the classroom', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الأستاذ في القاعة.',
          emoji: '🏫',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"She is teacher" — المهن تحتاج a/an دائماً', wrong: 'She is teacher', right: 'She is a teacher' },
        { type: 'mistake', ar: '"a orange" — orange يبدأ بصوت صائت يحتاج an', wrong: 'a orange', right: 'an orange' },
        { type: 'tip', ar: 'بعض الكلمات لا تأخذ article أبداً: water, love, Morocco, happiness, English, Arabic' },
        { type: 'rule', ar: '"a university" وليس "an university" — نحكم بالصوت لا الحرف: u في university تُنطق /ju/ وهو صوت ساكن' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: 'He is ', after: ' doctor.', answer: 'a', choices: ['a', 'an', 'the'], ar: 'هو طبيب.' },
        { before: 'She is ', after: ' artist.', answer: 'an', choices: ['a', 'an', 'the'], ar: 'هي فنانة.' },
        { before: 'Please close ', after: ' door.', answer: 'the', choices: ['a', 'an', 'the'], ar: 'من فضلك أغلق الباب.' },
        { before: 'I have ', after: ' idea!', answer: 'an', choices: ['a', 'an', 'the'], ar: 'عندي فكرة!' },
        { before: 'I love ', after: '.', answer: 'Morocco', choices: ['the Morocco', 'a Morocco', 'Morocco'], ar: 'أنا أحب المغرب.' },
        { before: 'This is ', after: ' university.', answer: 'a', choices: ['a', 'an', 'the'], ar: 'هذه جامعة.' },
        { before: 'Open ', after: ' book please.', answer: 'the', choices: ['a', 'an', 'the'], ar: 'افتح الكتاب من فضلك.' },
        { before: 'I need ', after: ' umbrella.', answer: 'an', choices: ['a', 'an', 'the'], ar: 'أحتاج مظلة.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'أكمل: "I am ___ teacher."',
          choices: ['a', 'an', 'the'],
          correct: 0,
          explanationAr: '"teacher" يبدأ بصوت ساكن /t/ فنستخدم "a". كذلك المهن تحتاج a/an.',
        },
        {
          promptAr: 'أكمل: "She is ___ engineer."',
          choices: ['a', 'an', 'the'],
          correct: 1,
          explanationAr: '"engineer" يبدأ بصوت صائت /e/ فنستخدم "an".',
        },
        {
          promptAr: 'أكمل: "Close ___ window please."',
          choices: ['a', 'an', 'the'],
          correct: 2,
          explanationAr: 'الشخص أمامك يعرف أي نافذة نقصد — فنستخدم "the" للمعروف.',
        },
        {
          promptAr: 'أي جملة غلط؟',
          choices: ['I love Morocco.', 'She drinks the water.', 'He is a student.'],
          correct: 1,
          explanationAr: '"the water" في الحديث العام عن الماء غلط — نقول "She drinks water" بدون article.',
        },
        {
          promptAr: 'أكمل: "I have ___ idea."',
          choices: ['a', 'an', 'the'],
          correct: 1,
          explanationAr: '"idea" يبدأ بصوت صائت /i/ فنستخدم "an".',
        },
        {
          promptAr: 'لماذا نقول "a university" وليس "an university"؟',
          choices: ['لأن u حرف ساكن', 'لأن u في university تُنطق /ju/ كصوت ساكن', 'الكلتان صحيحتان'],
          correct: 1,
          explanationAr: 'نحكم بالصوت لا الحرف. "university" تبدأ بصوت /ju/ وهو ساكن فنستخدم "a".',
        },
        {
          promptAr: 'أكمل: "___ sun rises in the east."',
          choices: ['A', 'An', 'The'],
          correct: 2,
          explanationAr: '"The sun" لأن الشمس معروفة ووحيدة في العالم — نستخدم "the" للأشياء الفريدة.',
        },
        {
          promptAr: 'أي كلمة لا تحتاج article؟',
          choices: ['book', 'teacher', 'love'],
          correct: 2,
          explanationAr: '"love" كلمة مجردة غير معدودة — لا تأخذ article. نقول "I love you" لا "a love".',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: '"a" قبل صوت ساكن، "an" قبل صوت صائت', en: 'a + consonant · an + vowel sound', example: 'a book · an apple · a university' },
        { ar: '"the" للمعروف والمحدد بين المتكلمين', en: 'the = definite', example: 'Close the door. · The sun is hot.' },
        { ar: 'بعض الكلمات بدون article: أسماء الدول، المشاعر، السوائل بصفة عامة', en: 'No article: countries, abstract nouns', example: 'Morocco · love · water · English' },
      ],
    },
  ],
}
