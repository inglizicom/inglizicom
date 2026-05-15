import type { GrammarLesson } from './types'

export const g01: GrammarLesson = {
  id: 1,
  slug: 'to-be',
  emoji: '⚡',
  title: { en: 'To Be: am / is / are', ar: 'فعل التكوين: am · is · are' },
  description: { en: 'The most important verb in English', ar: 'أهم فعل في الإنجليزية — موجود في كل جملة' },
  level: 'A0',
  sections: [
    {
      kind: 'cover',
      emoji: '⚡',
      title: 'To Be',
      titleAr: 'فعل التكوين',
      level: 'A0',
      tagAr: 'درس ١ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'لماذا نتعلم To Be أولاً؟',
      bodyAr:
        'في العربية تقول «أنا طالب» بدون فعل. لكن في الإنجليزية لا يمكنك ذلك! تحتاج دائماً فعلاً يربط الجملة. هذا الفعل هو To Be. كل يوم تستخدمه مئات المرات: "I\'m tired" عندما تكون متعباً، "It\'s cold" عندما يكون الجو بارداً، "She\'s my sister" عندما تقدم أختك.',
      arabicEx: 'أنا طالب.',
      englishEx: 'I AM a student.',
      noteAr: 'الكلمة "AM" هي فعل To Be — بدونها الجملة ناقصة في الإنجليزية!',
    },
    {
      kind: 'patternTable',
      titleAr: 'كل ضمير يختار فعله الخاص',
      rows: [
        { pronoun: 'I', pronounAr: 'أنا', verb: 'am', exampleEn: "I'm happy.", exampleAr: 'أنا سعيد.', emoji: '😊' },
        { pronoun: 'You', pronounAr: 'أنتَ / أنتِ', verb: 'are', exampleEn: "You're my friend.", exampleAr: 'أنت صديقي.', emoji: '👫' },
        { pronoun: 'He', pronounAr: 'هو', verb: 'is', exampleEn: "He's a teacher.", exampleAr: 'هو أستاذ.', emoji: '👨' },
        { pronoun: 'She', pronounAr: 'هي', verb: 'is', exampleEn: "She's beautiful.", exampleAr: 'هي جميلة.', emoji: '👩' },
        { pronoun: 'It', pronounAr: 'هو / هي (للأشياء)', verb: 'is', exampleEn: "It's a cat.", exampleAr: 'إنها قطة.', emoji: '🐱' },
        { pronoun: 'We', pronounAr: 'نحن', verb: 'are', exampleEn: "We're students.", exampleAr: 'نحن طلاب.', emoji: '👥' },
        { pronoun: 'They', pronounAr: 'هم / هن', verb: 'are', exampleEn: "They're from Morocco.", exampleAr: 'هم من المغرب.', emoji: '🇲🇦' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل حقيقية مع To Be',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "'m", role: 'verb' },
            { text: 'a teacher', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنا أستاذ.',
          emoji: '👨‍🏫',
        },
        {
          tokens: [
            { text: 'You', role: 'subject' }, { text: "'re", role: 'verb' },
            { text: 'my student', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أنت طالبي.',
          emoji: '🎓',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: "'s", role: 'verb' },
            { text: 'very kind', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو لطيف جداً.',
          emoji: '😇',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: "'s", role: 'verb' },
            { text: 'from Morocco', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي من المغرب.',
          emoji: '🇲🇦',
        },
        {
          tokens: [
            { text: 'It', role: 'subject' }, { text: "'s", role: 'verb' },
            { text: 'very hot today', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الجو حار جداً اليوم.',
          emoji: '☀️',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: "'re", role: 'verb' },
            { text: 'ready', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن مستعدون.',
          emoji: '💪',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "'re", role: 'verb' },
            { text: 'good friends', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هم أصدقاء جيدون.',
          emoji: '🤝',
        },
        {
          tokens: [
            { text: 'My brother', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'a doctor', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أخي طبيب.',
          emoji: '👨‍⚕️',
        },
        {
          tokens: [
            { text: 'The weather', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'beautiful today', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الطقس جميل اليوم.',
          emoji: '🌤️',
        },
      ],
    },
    {
      kind: 'negation',
      titleAr: "النفي: am not · isn't · aren't",
      bodyAr:
        "لنفي الجملة نضيف NOT بعد فعل To Be. يمكن اختصارها: is not = isn't · are not = aren't",
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'am', role: 'verb' },
            { text: 'not', role: 'negation' }, { text: 'tired', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لست متعباً.',
          emoji: '😤',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: "isn't", role: 'verb' },
            { text: 'here', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو ليس هنا.',
          emoji: '🚶',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "aren't", role: 'verb' },
            { text: 'ready', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هم ليسوا مستعدين.',
          emoji: '⏳',
        },
      ],
    },
    {
      kind: 'questions',
      titleAr: 'الأسئلة: نقلب الترتيب',
      bodyAr: 'في السؤال نضع فعل To Be في البداية، قبل الضمير',
      items: [
        {
          q: [
            { text: 'Are', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'okay', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل أنت بخير؟',
        },
        {
          q: [
            { text: 'Is', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'a student', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل هي طالبة؟',
        },
        {
          q: [
            { text: 'Are', role: 'question' }, { text: 'they', role: 'subject' },
            { text: 'from Morocco', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل هم من المغرب؟',
        },
        {
          q: [
            { text: 'Am', role: 'question' }, { text: 'I', role: 'subject' },
            { text: 'late', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل أنا متأخر؟',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة',
      items: [
        { type: 'mistake', ar: '"She am happy" خطأ شائع جداً', wrong: 'She am happy', right: 'She is happy' },
        { type: 'mistake', ar: '"They is ready" — جمع يحتاج are', wrong: 'They is ready', right: 'They are ready' },
        { type: 'tip', ar: "اختصارات مهمة: I'm = I am · You're = You are · He's = He is · She's = She is · It's = It is · We're = We are · They're = They are" },
        { type: 'rule', ar: 'في الإنجليزية الفعل إلزامي — لا يمكن قول "I happy" — لا بد من "I am happy"' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة',
      exercises: [
        { before: '', after: " a doctor.", answer: 'I am', choices: ['I am', 'He is', 'They are'], ar: 'أنا طبيب.' },
        { before: 'She ', after: ' my teacher.', answer: 'is', choices: ['am', 'is', 'are'], ar: 'هي أستاذتي.' },
        { before: 'They ', after: ' from Morocco.', answer: 'are', choices: ['am', 'is', 'are'], ar: 'هم من المغرب.' },
        { before: '', after: ' he happy?', answer: 'Is', choices: ['Am', 'Is', 'Are'], ar: 'هل هو سعيد؟' },
        { before: 'We ', after: ' not ready.', answer: 'are', choices: ['am', 'is', 'are'], ar: 'نحن لسنا مستعدين.' },
        { before: 'It ', after: ' very cold today.', answer: 'is', choices: ['am', 'is', 'are'], ar: 'الجو بارد جداً اليوم.' },
        { before: 'You ', after: ' my best student.', answer: 'are', choices: ['am', 'is', 'are'], ar: 'أنت أفضل طالب لي.' },
        { before: "He ", after: " a kind person.", answer: 'is', choices: ['am', 'is', 'are'], ar: 'هو شخص لطيف.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع',
      questions: [
        {
          promptAr: 'ما هو فعل To Be الصحيح مع "I"؟',
          choices: ['am', 'is', 'are'],
          correct: 0,
          explanationAr: '"I" دائماً مع "am" — هذا استثناء يجب حفظه: I am, not I is أو I are!',
        },
        {
          promptAr: 'أكمل الجملة: "She ___ a student."',
          choices: ['am', 'is', 'are'],
          correct: 1,
          explanationAr: '"She" ضمير مفرد غائب تأتي مع "is" — نفس he وit.',
        },
        {
          promptAr: 'كيف تقول "هل أنت بخير؟" بالإنجليزية؟',
          choices: ['You are okay?', 'Are you okay?', 'Is you okay?'],
          correct: 1,
          explanationAr: 'في الأسئلة نضع To Be في البداية: "Are you okay?" — نعكس الترتيب.',
        },
        {
          promptAr: 'أكمل الجملة: "We ___ from Morocco."',
          choices: ['am', 'is', 'are'],
          correct: 2,
          explanationAr: '"We" جمع تأتي مع "are" — نفس you وthey.',
        },
        {
          promptAr: 'ما هو عكس "He is here"؟',
          choices: ["He isn't here.", 'He not here.', 'He is no here.'],
          correct: 0,
          explanationAr: "النفي: is + not = isn't — لا نقول 'He not here' بدون فعل!",
        },
        {
          promptAr: 'ما الاختصار الصحيح لـ "They are"؟',
          choices: ["They're", "They'is", "They'm"],
          correct: 0,
          explanationAr: "They are = They're — الفاصلة تحل محل الحرف المحذوف.",
        },
        {
          promptAr: 'أكمل: "It ___ very hot today."',
          choices: ['am', 'is', 'are'],
          correct: 1,
          explanationAr: '"It" تأتي مع "is" — تستخدمها للأشياء والطقس والوقت.',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ['I is tired.', 'She are happy.', 'We are ready.'],
          correct: 2,
          explanationAr: '"We are ready" صحيحة. I → am (ليس is)، She → is (ليس are).',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس',
      rules: [
        { ar: '"I" دائماً مع "am"', en: 'I → am', example: "I'm happy." },
        { ar: '"he / she / it" مع "is"', en: 'He / She / It → is', example: "She's beautiful." },
        { ar: '"you / we / they" مع "are"', en: 'You / We / They → are', example: "They're ready." },
      ],
    },
  ],
}
