import type { GrammarLesson } from './types'

export const g26: GrammarLesson = {
  id: 26,
  slug: 'will-future',
  emoji: '🔮',
  title: { en: 'Will', ar: 'المستقبل: will / سوف' },
  description: { en: 'Make predictions and spontaneous decisions', ar: 'للتنبؤات والقرارات اللحظية والوعود' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🔮',
      title: 'Will',
      titleAr: 'المستقبل: will / سوف',
      level: 'A1',
      tagAr: 'درس ٢٦ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'will — ثلاث حالات مهمة 🔮',
      bodyAr:
        '"will" يُستخدم في ثلاث حالات رئيسية: (١) قرار لحظي — تقرر الشيء في نفس لحظة الكلام: "The phone is ringing. I\'ll answer it." (٢) وعد — تعطي وعداً لشخص: "I\'ll call you tomorrow." (٣) تنبؤ — تتوقع شيئاً في المستقبل: "It will rain tomorrow." القاعدة الذهبية: will + فعل في أصله — نفس الشكل لجميع الضمائر!',
      arabicEx: 'سأجيب على الهاتف. (قرار لحظي) · سأتصل بك. (وعد) · ستمطر غداً. (تنبؤ)',
      englishEx: "I'll answer it. (spontaneous) · I'll call you. (promise) · It will rain. (prediction)",
      noteAr: '💡 will + base verb · نفس الشكل للجميع · won\'t = will not',
    },
    {
      kind: 'patternTable',
      titleAr: 'will مع جميع الضمائر',
      rows: [
        { pronoun: "I will / I'll", pronounAr: 'أنا سأفعل', verb: "I'll + base verb", exampleEn: "I'll help you with that.", exampleAr: 'سأساعدك في ذلك.', emoji: '🤝' },
        { pronoun: "He/She will / He'll", pronounAr: 'هو/هي سيفعل', verb: "He'll + base verb", exampleEn: "She'll pass the exam.", exampleAr: 'ستنجح في الامتحان.', emoji: '📝' },
        { pronoun: "You/We/They will", pronounAr: 'أنت/نحن/هم', verb: "They'll + base verb", exampleEn: "They'll arrive tomorrow.", exampleAr: 'سيصلون غداً.', emoji: '✈️' },
        { pronoun: "won't = will not", pronounAr: 'لن أفعل', verb: "won't + base verb", exampleEn: "It won't rain today.", exampleAr: 'لن تمطر اليوم.', emoji: '☀️' },
        { pronoun: "Will you...?", pronounAr: 'هل ستفعل؟', verb: "Will + subject + base verb?", exampleEn: "Will you marry me?", exampleAr: 'هل ستتزوجني؟', emoji: '💍' },
        { pronoun: "Short answers", pronounAr: 'أجوبة قصيرة', verb: "Yes, I will. / No, I won't.", exampleEn: "Will she come? Yes, she will.", exampleAr: 'هل ستأتي؟ نعم، ستأتي.', emoji: '✅' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل بـ will 💬',
      items: [
        {
          tokens: [
            { text: "I'll", role: 'subject' }, { text: 'help', role: 'verb' },
            { text: 'you', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'سأساعدك.',
          emoji: '🤝',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'will pass', role: 'verb' },
            { text: 'the exam', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ستنجح في الامتحان.',
          emoji: '📝',
        },
        {
          tokens: [
            { text: 'It', role: 'subject' }, { text: "won't rain", role: 'negation' },
            { text: 'today', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لن تمطر اليوم.',
          emoji: '☀️',
        },
        {
          tokens: [
            { text: 'Will', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'marry me', role: 'verb' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل ستتزوجني؟',
          emoji: '💍',
        },
        {
          tokens: [
            { text: 'I think', role: 'filler' }, { text: 'he', role: 'subject' },
            { text: 'will be', role: 'verb' }, { text: 'a great doctor', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أعتقد أنه سيكون طبيباً رائعاً.',
          emoji: '🩺',
        },
        {
          tokens: [
            { text: "I'll", role: 'subject' }, { text: 'call', role: 'verb' },
            { text: 'you', role: 'complement' }, { text: 'tomorrow', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'سأتصل بك غداً.',
          emoji: '📞',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: "won't be late", role: 'negation' },
            { text: '.', role: 'filler' },
          ],
          ar: 'لن نتأخر.',
          emoji: '⏰',
        },
        {
          tokens: [
            { text: 'Will', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'come', role: 'verb' }, { text: 'to the party', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل ستأتي إلى الحفلة؟',
          emoji: '🎉',
        },
        {
          tokens: [
            { text: "I'll", role: 'subject' }, { text: 'have', role: 'verb' },
            { text: 'a coffee, please', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'سآخذ قهوة من فضلك. (قرار لحظي)',
          emoji: '☕',
        },
        {
          tokens: [
            { text: "It'll", role: 'subject' }, { text: 'be', role: 'verb' },
            { text: 'OK', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ستكون الأمور على ما يرام.',
          emoji: '😊',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: "won't understand", role: 'negation' },
            { text: '.', role: 'filler' },
          ],
          ar: 'لن يفهموا.',
          emoji: '🤔',
        },
        {
          tokens: [
            { text: "I'll", role: 'subject' }, { text: 'never forget', role: 'verb' },
            { text: 'this day', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لن أنسى هذا اليوم أبداً.',
          emoji: '💫',
        },
      ],
    },
    {
      kind: 'negation',
      titleAr: "النفي بـ won't ❌",
      bodyAr: "won't = will not · نفس الشكل لجميع الضمائر · لا يتغير",
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: "won't", role: 'negation' },
            { text: 'be late', role: 'verb' }, { text: '.', role: 'filler' },
          ],
          ar: 'لن أتأخر.',
          emoji: '⏰',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: "won't", role: 'negation' },
            { text: 'tell', role: 'verb' }, { text: 'anyone', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'لن تخبر أحداً.',
          emoji: '🤫',
        },
        {
          tokens: [
            { text: 'It', role: 'subject' }, { text: "won't", role: 'negation' },
            { text: 'take', role: 'verb' }, { text: 'long', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'لن يستغرق وقتاً طويلاً.',
          emoji: '⚡',
        },
      ],
    },
    {
      kind: 'questions',
      titleAr: 'الأسئلة بـ Will ❓',
      bodyAr: 'الترتيب: Will + Subject + فعل في أصله...? · الجواب: Yes, I will. / No, I won\'t.',
      items: [
        {
          q: [
            { text: 'Will', role: 'question' }, { text: 'you', role: 'subject' },
            { text: 'help', role: 'verb' }, { text: 'me', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل ستساعدني؟',
        },
        {
          q: [
            { text: 'Will', role: 'question' }, { text: 'it', role: 'subject' },
            { text: 'rain', role: 'verb' }, { text: 'tomorrow', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل ستمطر غداً؟',
        },
        {
          q: [
            { text: 'Will', role: 'question' }, { text: 'they', role: 'subject' },
            { text: 'come', role: 'verb' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل سيأتون؟',
        },
        {
          q: [
            { text: 'Will', role: 'question' }, { text: 'she', role: 'subject' },
            { text: 'be', role: 'verb' }, { text: 'at home', role: 'complement' },
            { text: '?', role: 'filler' },
          ],
          ar: 'هل ستكون في البيت؟',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: وعود وخطط وتنبؤات 🗣️',
      noteAr: 'انظر كيف نستخدم will في مواقف مختلفة',
      lines: [
        { speaker: 'A', text: "I'm so tired. I don't want to cook tonight.", ar: 'أنا متعب جداً. لا أريد الطبخ الليلة.' },
        { speaker: 'B', text: "Don't worry! I'll cook for you.", ar: 'لا تقلق! سأطبخ لك.' },
        { speaker: 'A', text: "Really? You are so kind! What will you make?", ar: 'حقاً؟ أنت طيب جداً! ماذا ستصنع؟' },
        { speaker: 'B', text: "I'll make pasta. I think you'll like it.", ar: 'سأصنع باستا. أعتقد أنك ستحبها.' },
        { speaker: 'A', text: "Will it take long?", ar: 'هل ستأخذ وقتاً طويلاً؟' },
        { speaker: 'B', text: "No, it won't. It will be ready in twenty minutes!", ar: 'لا، لن تأخذ. ستكون جاهزة في عشرين دقيقة!' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"to" لا تجي بعد will أبداً', wrong: "I will to go to school.", right: "I will go to school." },
        { type: 'mistake', ar: 'will لا يتغير مع أي ضمير — نفس الشكل للجميع', wrong: "She wills come tomorrow.", right: "She will come tomorrow." },
        { type: 'tip', ar: 'الفرق: will = قرار الآن ("The phone is ringing → I\'ll answer.") · going to = خطة مسبقة ("أنا عندي موعد الساعة ٣.")' },
        { type: 'rule', ar: "won't = will not · I'll = I will · She'll = She will · They'll = They will" },
        { type: 'tip', ar: '"I think... / I believe... / probably" تعني غالباً will يأتي بعدها: "I think it will rain. / He will probably pass."' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: "I ", after: " help you.", answer: "will", choices: ["will", "am going to", "would"], ar: 'سأساعدك. (قرار لحظي)' },
        { before: "It ", after: " rain tomorrow.", answer: "won't", choices: ["willn't", "won't", "don't"], ar: 'لن تمطر غداً.' },
        { before: "", after: " you help me?", answer: "Will", choices: ["Are", "Do", "Will"], ar: 'هل ستساعدني؟' },
        { before: "She ", after: " pass the exam, I'm sure.", answer: "will", choices: ["wills", "will", "is"], ar: 'هي ستنجح في الامتحان، أنا متأكد.' },
        { before: "I ", after: " a coffee, please.", answer: "will have", choices: ["will have", "have will", "am having"], ar: 'سآخذ قهوة من فضلك.' },
        { before: "They ", after: " come to the party.", answer: "won't", choices: ["willn't", "won't", "aren't going"], ar: 'لن يأتوا إلى الحفلة.' },
        { before: "I think he ", after: " a great doctor.", answer: "will be", choices: ["will be", "will is", "is going"], ar: 'أعتقد أنه سيكون طبيباً رائعاً.' },
        { before: "", after: " it take long?", answer: "Will", choices: ["Does", "Is", "Will"], ar: 'هل ستستغرق وقتاً طويلاً؟' },
        { before: "Yes, I ", after: ".", answer: "will", choices: ["do", "will", "am"], ar: 'نعم، سأفعل. (جواب قصير)' },
        { before: "I ", after: " never forget this.", answer: "will", choices: ["won't", "will", "am going to"], ar: 'لن أنسى هذا أبداً.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ["I will to go.", "I will going.", "I will go."],
          correct: 2,
          explanationAr: '"I will go." — will + فعل في أصله بدون to.',
        },
        {
          promptAr: 'متى نستخدم will؟',
          choices: ['للخطط المقررة مسبقاً فقط', 'للقرارات اللحظية والوعود والتنبؤات', 'للأفعال الماضية'],
          correct: 1,
          explanationAr: '"will" للقرارات اللحظية + الوعود + التنبؤات المستقبلية.',
        },
        {
          promptAr: 'ما النفي الصحيح لـ will؟',
          choices: ["willn't", "won't", "willon't"],
          correct: 1,
          explanationAr: '"won\'t" = will not — هذا الاختصار الصحيح.',
        },
        {
          promptAr: 'أكمل: "___ she come tomorrow?"',
          choices: ['Does', 'Is', 'Will'],
          correct: 2,
          explanationAr: '"Will she come?" — will في بداية السؤال.',
        },
        {
          promptAr: 'الجواب القصير على "Will you help me?"',
          choices: ["Yes, I do.", "Yes, I will.", "Yes, I am."],
          correct: 1,
          explanationAr: '"Yes, I will." — الجواب القصير بـ will.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["She wills come.", "She will comes.", "She will come."],
          correct: 2,
          explanationAr: '"She will come." — will لا يتغير مع أي ضمير، والفعل في أصله.',
        },
        {
          promptAr: 'The phone is ringing. "___" — ما القرار اللحظي؟',
          choices: ["I'm going to answer it.", "I'll answer it.", "I answer it."],
          correct: 1,
          explanationAr: '"I\'ll answer it." — will للقرار اللحظي.',
        },
        {
          promptAr: 'أكمل: "I think it ___ rain tomorrow."',
          choices: ["is going to", "will", "won't"],
          correct: 1,
          explanationAr: '"I think it will rain." — تنبؤ، وبعد I think نستخدم will.',
        },
        {
          promptAr: 'أكمل: "It ___ take long."',
          choices: ["willn't", "won't", "isn't"],
          correct: 1,
          explanationAr: '"It won\'t take long." — won\'t = will not.',
        },
        {
          promptAr: 'ما الفرق بين will وgoing to؟',
          choices: [
            'will = خطة مسبقة · going to = قرار لحظي',
            'will = قرار لحظي أو وعد · going to = خطة مسبقة',
            'لا فرق بينهما',
          ],
          correct: 1,
          explanationAr: '"will" للقرار اللحظي أو الوعد أو التنبؤ · "going to" للخطة المقررة مسبقاً.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'will + فعل في أصله — نفس الشكل لجميع الضمائر', en: "I will · She will · They will (NOT wills)", example: "She will pass the exam. It won't rain today." },
        { ar: 'ثلاث حالات: قرار لحظي · وعد · تنبؤ', en: "I'll answer (spontaneous) · I'll call you (promise) · It will rain (prediction)", example: "I'll have a coffee. I'll call you. I think he'll be great." },
        { ar: "won't = will not · I'll = I will · الجواب: Yes, I will. / No, I won't.", en: "won't · I'll · She'll · They'll", example: "Will you help? Yes, I will. / No, I won't." },
      ],
    },
  ],
}
