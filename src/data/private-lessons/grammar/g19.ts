import type { GrammarLesson } from './types'

export const g19: GrammarLesson = {
  id: 19,
  slug: 'question-words',
  emoji: '❓',
  title: { en: 'What / Where / When / Who / Why / How', ar: 'كلمات الاستفهام' },
  description: { en: 'Ask any question in English', ar: 'كيف تسأل أي سؤال بالإنجليزية' },
  level: 'A0',
  sections: [
    {
      kind: 'cover',
      emoji: '❓',
      title: 'What / Where / When / Who / Why / How',
      titleAr: 'كلمات الاستفهام',
      level: 'A0',
      tagAr: 'درس ١٩ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'لماذا نحتاج كلمات الاستفهام؟ 🤔',
      bodyAr:
        'في العربية عندنا كلمات مثل "ماذا، أين، متى، من، لماذا، كيف" — بالإنجليزية نفس الفكرة تماماً! كل كلمة استفهام تسأل عن نوع معين من المعلومات. القاعدة الذهبية: كلمة الاستفهام تجي في بداية الجملة، ثم بعدها is/are/do/does/did، ثم الضمير، ثم الفعل.',
      arabicEx: 'ما اسمك؟ · أين تسكن؟ · متى تبدأ الدراسة؟',
      englishEx: 'What is your name? · Where do you live? · When does school start?',
      noteAr: '💡 كلمة الاستفهام + is/are/do/does + Subject + ...?',
    },
    {
      kind: 'patternTable',
      titleAr: 'كلمات الاستفهام الأساسية',
      rows: [
        { pronoun: 'What', pronounAr: 'ماذا / ما', verb: 'What + is/do...?', exampleEn: 'What is your name?', exampleAr: 'ما اسمك؟', emoji: '📛' },
        { pronoun: 'Where', pronounAr: 'أين', verb: 'Where + is/do...?', exampleEn: 'Where do you live?', exampleAr: 'أين تسكن؟', emoji: '📍' },
        { pronoun: 'When', pronounAr: 'متى', verb: 'When + is/do...?', exampleEn: 'When is your birthday?', exampleAr: 'متى عيد ميلادك؟', emoji: '🎂' },
        { pronoun: 'Who', pronounAr: 'من', verb: 'Who + is...?', exampleEn: 'Who is that?', exampleAr: 'من هذا؟', emoji: '👤' },
        { pronoun: 'Why', pronounAr: 'لماذا', verb: 'Why + are/do...?', exampleEn: 'Why are you late?', exampleAr: 'لماذا أنت متأخر؟', emoji: '🕐' },
        { pronoun: 'How', pronounAr: 'كيف', verb: 'How + are...?', exampleEn: 'How are you?', exampleAr: 'كيف حالك؟', emoji: '😊' },
        { pronoun: 'How old', pronounAr: 'كم عمرك', verb: 'How old + are...?', exampleEn: 'How old are you?', exampleAr: 'كم عمرك؟', emoji: '🎂' },
        { pronoun: 'How much', pronounAr: 'بكم / كم الثمن', verb: 'How much + is...?', exampleEn: 'How much is this?', exampleAr: 'بكم هذا؟', emoji: '💰' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل حقيقية بكلمات الاستفهام 💬',
      items: [
        {
          tokens: [
            { text: 'What', role: 'question' }, { text: 'is', role: 'verb' },
            { text: 'your name', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'ما اسمك؟',
          emoji: '📛',
        },
        {
          tokens: [
            { text: 'Where', role: 'question' }, { text: 'do', role: 'verb' },
            { text: 'you', role: 'subject' }, { text: 'live', role: 'verb' },
            { text: '?', role: 'filler' },
          ],
          ar: 'أين تسكن؟',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'When', role: 'question' }, { text: 'is', role: 'verb' },
            { text: 'your birthday', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'متى عيد ميلادك؟',
          emoji: '🎂',
        },
        {
          tokens: [
            { text: 'Who', role: 'question' }, { text: 'is', role: 'verb' },
            { text: 'your teacher', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'من هو معلمك؟',
          emoji: '👨‍🏫',
        },
        {
          tokens: [
            { text: 'Why', role: 'question' }, { text: 'are', role: 'verb' },
            { text: 'you', role: 'subject' }, { text: 'tired', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'لماذا أنت متعب؟',
          emoji: '😴',
        },
        {
          tokens: [
            { text: 'How', role: 'question' }, { text: 'are', role: 'verb' },
            { text: 'you', role: 'subject' }, { text: '?', role: 'filler' },
          ],
          ar: 'كيف حالك؟',
          emoji: '😊',
        },
        {
          tokens: [
            { text: 'How old', role: 'question' }, { text: 'are', role: 'verb' },
            { text: 'you', role: 'subject' }, { text: '?', role: 'filler' },
          ],
          ar: 'كم عمرك؟',
          emoji: '🎂',
        },
        {
          tokens: [
            { text: 'How much', role: 'question' }, { text: 'is', role: 'verb' },
            { text: 'this shirt', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'بكم هذا القميص؟',
          emoji: '👕',
        },
        {
          tokens: [
            { text: 'What', role: 'question' }, { text: 'do', role: 'verb' },
            { text: 'you', role: 'subject' }, { text: 'do', role: 'verb' },
            { text: 'for work', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'ماذا تعمل؟',
          emoji: '💼',
        },
        {
          tokens: [
            { text: 'Where', role: 'question' }, { text: 'is', role: 'verb' },
            { text: 'the nearest pharmacy', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'أين أقرب صيدلية؟',
          emoji: '💊',
        },
        {
          tokens: [
            { text: 'Why', role: 'question' }, { text: 'do', role: 'verb' },
            { text: 'you', role: 'subject' }, { text: 'study English', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'لماذا تدرس الإنجليزية؟',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'When', role: 'question' }, { text: 'do', role: 'verb' },
            { text: 'you', role: 'subject' }, { text: 'finish work', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'متى تنتهي من العمل؟',
          emoji: '🕔',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: أول يوم في الكلاس 🗣️',
      noteAr: 'انظر كيف نستخدم مختلف كلمات الاستفهام في محادثة حقيقية',
      lines: [
        { speaker: 'A', text: 'Hi! What is your name?', ar: 'مرحباً! ما اسمك؟' },
        { speaker: 'B', text: 'My name is Karim. And you?', ar: 'اسمي كريم. وأنت؟' },
        { speaker: 'A', text: 'I am Sara. Where are you from?', ar: 'أنا سارة. من أين أنت؟' },
        { speaker: 'B', text: 'I am from Casablanca. How old are you?', ar: 'أنا من الدار البيضاء. كم عمرك؟' },
        { speaker: 'A', text: 'I am twenty-two. Why are you learning English?', ar: 'عمري اثنان وعشرون. لماذا تتعلم الإنجليزية؟' },
        { speaker: 'B', text: 'Because I want to work in a hotel. How about you?', ar: 'لأنني أريد العمل في فندق. وأنت؟' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: 'لا تنسى is/are/do بعد كلمة الاستفهام مباشرة', wrong: 'What your name?', right: 'What is your name?' },
        { type: 'mistake', ar: '"How many years you have?" — هذه ترجمة حرفية من العربية خاطئة', wrong: 'How many years have you?', right: 'How old are you?' },
        { type: 'tip', ar: 'Who يأتي معه is مباشرة بدون do/does — "Who is she?" وليس "Who does she is?"' },
        { type: 'rule', ar: 'الترتيب الصحيح: كلمة الاستفهام + is/are/do/does + Subject + فعل + ...?' },
        { type: 'tip', ar: 'How much = للأشياء غير معدودة (كم الثمن، كم الكمية) · How many = للأشياء المعدودة (كم كتاباً، كم شخصاً)' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل السؤال ✏️',
      exercises: [
        { before: '', after: ' is your name?', answer: 'What', choices: ['What', 'Where', 'Who'], ar: 'ما اسمك؟' },
        { before: '', after: ' do you live?', answer: 'Where', choices: ['When', 'Where', 'Why'], ar: 'أين تسكن؟' },
        { before: '', after: ' is your birthday?', answer: 'When', choices: ['Where', 'What', 'When'], ar: 'متى عيد ميلادك؟' },
        { before: '', after: ' is your best friend?', answer: 'Who', choices: ['What', 'Who', 'How'], ar: 'من هو أفضل صديق لك؟' },
        { before: '', after: ' are you late?', answer: 'Why', choices: ['How', 'Why', 'When'], ar: 'لماذا أنت متأخر؟' },
        { before: '', after: ' are you?', answer: 'How', choices: ['Who', 'What', 'How'], ar: 'كيف حالك؟' },
        { before: 'How ', after: ' are you?', answer: 'old', choices: ['old', 'much', 'many'], ar: 'كم عمرك؟' },
        { before: 'How ', after: ' is this?', answer: 'much', choices: ['many', 'old', 'much'], ar: 'بكم هذا؟' },
        { before: 'What ', after: ' you do for work?', answer: 'do', choices: ['is', 'do', 'are'], ar: 'ماذا تعمل؟' },
        { before: 'Where ', after: ' the station?', answer: 'is', choices: ['do', 'are', 'is'], ar: 'أين المحطة؟' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'كيف تسأل عن اسم شخص؟',
          choices: ['Where is your name?', 'What is your name?', 'Who is your name?'],
          correct: 1,
          explanationAr: '"What" نسأل بها عن الأشياء والمعلومات مثل الاسم.',
        },
        {
          promptAr: 'أكمل: "___ do you live?"',
          choices: ['When', 'Who', 'Where'],
          correct: 2,
          explanationAr: '"Where" نسأل بها عن المكان.',
        },
        {
          promptAr: 'كيف تسأل عن العمر بالإنجليزية؟',
          choices: ['How much are you?', 'How old are you?', 'How many years you?'],
          correct: 1,
          explanationAr: '"How old are you?" هي الصيغة الصحيحة للسؤال عن العمر.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['What your name?', 'What is your name?', 'What are your name?'],
          correct: 1,
          explanationAr: 'نحتاج "is" بعد What عند السؤال عن شيء مفرد.',
        },
        {
          promptAr: 'أكمل: "___ is your birthday?"',
          choices: ['Where', 'When', 'Why'],
          correct: 1,
          explanationAr: '"When" نسأل بها عن الوقت والتاريخ.',
        },
        {
          promptAr: 'كيف تسأل عن السعر؟',
          choices: ['How much is this?', 'How many is this?', 'What much is this?'],
          correct: 0,
          explanationAr: '"How much" للسؤال عن السعر أو الكمية غير المعدودة.',
        },
        {
          promptAr: 'أكمل: "___ are you tired?"',
          choices: ['What', 'Where', 'Why'],
          correct: 2,
          explanationAr: '"Why" نسأل بها عن السبب.',
        },
        {
          promptAr: 'ما الصواب للسؤال عن شخص؟',
          choices: ['What is she?', 'Who is she?', 'How is she?'],
          correct: 1,
          explanationAr: '"Who" نسأل بها عن الأشخاص.',
        },
        {
          promptAr: 'أكمل: "___ do you finish work?"',
          choices: ['When', 'Who', 'Why'],
          correct: 0,
          explanationAr: '"When" نسأل بها عن الوقت.',
        },
        {
          promptAr: 'أكمل: "___ are you?" — تريد السؤال عن الحال',
          choices: ['What', 'Who', 'How'],
          correct: 2,
          explanationAr: '"How are you?" للسؤال عن الحال والأحوال.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'كل كلمة استفهام تسأل عن نوع مختلف من المعلومات', en: 'What=thing · Where=place · When=time · Who=person · Why=reason · How=manner', example: 'What is your job? Where do you work?' },
        { ar: 'الترتيب: كلمة الاستفهام + is/are/do/does + Subject + ...?', en: 'Question word + auxiliary + subject + verb', example: 'Where do you live? Why are you late?' },
        { ar: 'How old = العمر · How much = السعر أو الكمية · How many = العدد', en: 'How old → age · How much → price · How many → count', example: 'How old are you? How much is this?' },
      ],
    },
  ],
}
