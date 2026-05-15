import type { GrammarLesson } from './types'

export const g25: GrammarLesson = {
  id: 25,
  slug: 'going-to',
  emoji: '🚀',
  title: { en: "I'm going to...", ar: 'المستقبل المخطط: سأفعل' },
  description: { en: 'Talk about plans and intentions', ar: 'كيف تتكلم عن الخطط والنوايا' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🚀',
      title: "I'm going to...",
      titleAr: 'المستقبل المخطط: سأفعل',
      level: 'A1',
      tagAr: 'درس ٢٥ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: '"going to" — للخطط المقررة مسبقاً 📅',
      bodyAr:
        '"going to" تعبر عن خطة أو نية قررتها قبل لحظة الكلام. مثال: "أنا قررت أن أسافر إلى إسبانيا في الصيف" — "I am going to travel to Spain this summer." الفرق بين will وgoing to: going to = خطة مقررة مسبقاً · will = قرار لحظي أو وعد أو تنبؤ. القاعدة: am/is/are + going to + فعل في أصله.',
      arabicEx: 'أنا سأدرس الطب. (خطة مقررة) · هي ستسافر للسياحة.',
      englishEx: "I am going to study medicine. (planned) · She's going to travel for tourism.",
      noteAr: '💡 am/is/are + going to + base verb = خطة مقررة مسبقاً',
    },
    {
      kind: 'patternTable',
      titleAr: 'going to مع جميع الضمائر',
      rows: [
        { pronoun: "I am going to", pronounAr: 'أنا سأفعل', verb: "I'm going to + verb", exampleEn: "I'm going to study medicine.", exampleAr: 'أنا سأدرس الطب.', emoji: '🩺' },
        { pronoun: 'He/She is going to', pronounAr: 'هو/هي سيفعل', verb: "He's / She's going to + verb", exampleEn: "She's going to travel to Spain.", exampleAr: 'هي ستسافر إلى إسبانيا.', emoji: '✈️' },
        { pronoun: 'You/We/They are going to', pronounAr: 'أنت/نحن/هم سنفعل', verb: "We're going to + verb", exampleEn: "We're going to open a restaurant.", exampleAr: 'نحن سنفتح مطعماً.', emoji: '🍽️' },
        { pronoun: 'النفي: not going to', pronounAr: 'لن أفعل', verb: "I'm not going to + verb", exampleEn: "I'm not going to eat fast food anymore.", exampleAr: 'لن آكل وجبات سريعة بعد الآن.', emoji: '🚫' },
        { pronoun: 'السؤال: Are you going to...?', pronounAr: 'هل ستفعل؟', verb: 'Are you going to + verb...?', exampleEn: 'Are you going to study tonight?', exampleAr: 'هل ستذاكر الليلة؟', emoji: '❓' },
        { pronoun: 'Is he going to...?', pronounAr: 'هل سيفعل؟', verb: 'Is he going to + verb...?', exampleEn: 'Is he going to come to the party?', exampleAr: 'هل سيأتي إلى الحفلة؟', emoji: '🎉' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل بالمستقبل المخطط 💬',
      items: [
        {
          tokens: [
            { text: "I'm", role: 'subject' }, { text: 'going to study', role: 'verb' },
            { text: 'medicine', role: 'complement' }, { text: 'next year', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'سأدرس الطب السنة القادمة.',
          emoji: '🩺',
        },
        {
          tokens: [
            { text: "She's", role: 'subject' }, { text: 'going to travel', role: 'verb' },
            { text: 'to Spain', role: 'complement' }, { text: 'this summer', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'ستسافر إلى إسبانيا هذا الصيف.',
          emoji: '✈️',
        },
        {
          tokens: [
            { text: "We're", role: 'subject' }, { text: 'going to open', role: 'verb' },
            { text: 'a restaurant', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'سنفتح مطعماً.',
          emoji: '🍽️',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is going to buy', role: 'verb' },
            { text: 'a new car', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'سيشتري سيارة جديدة.',
          emoji: '🚗',
        },
        {
          tokens: [
            { text: "I'm", role: 'subject' }, { text: 'going to learn', role: 'verb' },
            { text: 'how to cook', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'سأتعلم كيف أطبخ.',
          emoji: '👨‍🍳',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'are going to get married', role: 'verb' },
            { text: 'in June', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'سيتزوجان في يونيو.',
          emoji: '💍',
        },
        {
          tokens: [
            { text: "I'm", role: 'subject' }, { text: "not going to eat", role: 'negation' },
            { text: 'fast food', role: 'complement' }, { text: 'anymore', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'لن آكل وجبات سريعة بعد الآن.',
          emoji: '🥗',
        },
        {
          tokens: [
            { text: 'Are you', role: 'question' }, { text: 'going to come', role: 'verb' },
            { text: 'to the party', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل ستأتي إلى الحفلة؟',
          emoji: '🎉',
        },
        {
          tokens: [
            { text: 'My brother', role: 'subject' }, { text: 'is going to start', role: 'verb' },
            { text: 'his own business', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أخي سيبدأ مشروعه الخاص.',
          emoji: '🏢',
        },
        {
          tokens: [
            { text: "We're", role: 'subject' }, { text: 'going to visit', role: 'verb' },
            { text: 'our grandmother', role: 'complement' }, { text: 'this weekend', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'سنزور جدتنا هذه العطلة.',
          emoji: '👵',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'is going to take', role: 'verb' },
            { text: 'English classes', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ستأخذ دروساً في الإنجليزية.',
          emoji: '📚',
        },
        {
          tokens: [
            { text: "It's", role: 'subject' }, { text: 'going to rain', role: 'verb' },
            { text: 'today', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ستمطر اليوم.',
          emoji: '🌧️',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: خطط المستقبل 🗓️',
      noteAr: 'انظر كيف نتكلم عن الخطط المستقبلية',
      lines: [
        { speaker: 'A', text: "What are you going to do after you finish university?", ar: 'ماذا ستفعل بعد تخرجك من الجامعة؟' },
        { speaker: 'B', text: "I'm going to look for a job in IT. What about you?", ar: 'سأبحث عن عمل في تقنية المعلومات. وأنت؟' },
        { speaker: 'A', text: "I'm going to travel to Canada. I have a cousin there.", ar: 'سأسافر إلى كندا. عندي ابن عم هناك.' },
        { speaker: 'B', text: "Really? Are you going to study there too?", ar: 'حقاً؟ هل ستدرس هناك أيضاً؟' },
        { speaker: 'A', text: "Yes, I'm going to study English and business.", ar: 'نعم، سأدرس الإنجليزية والأعمال.' },
        { speaker: 'B', text: "That is amazing! We are going to miss you here.", ar: 'رائع! سنفتقدك هنا.' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"going to" + فعل في أصله — لا to مرتين!', wrong: "I'm going to to eat.", right: "I'm going to eat." },
        { type: 'mistake', ar: '"going to go" صحيح تماماً! going to + go — لا مشكلة', wrong: "I'm going to go. (NOT wrong!)", right: "I'm going to go to the market." },
        { type: 'tip', ar: 'الفرق: going to = خطة مسبقة ("لقد قررت") · will = قرار لحظي ("قررت الآن فجأة")' },
        { type: 'rule', ar: 'am/is/are تتغير حسب الضمير: I am · He/She/It is · You/We/They are — لكن going to لا تتغير!' },
        { type: 'tip', ar: 'كلمات تدل على going to: tomorrow, next week, next year, this summer, soon, in the future' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: "I ", after: " study medicine.", answer: "am going to", choices: ["am going to", "is going to", "are going to"], ar: 'سأدرس الطب.' },
        { before: "She ", after: " travel to Spain.", answer: "is going to", choices: ["am going to", "is going to", "are going to"], ar: 'ستسافر إلى إسبانيا.' },
        { before: "We ", after: " open a restaurant.", answer: "are going to", choices: ["is going to", "am going to", "are going to"], ar: 'سنفتح مطعماً.' },
        { before: "I ", after: " eat fast food anymore.", answer: "am not going to", choices: ["am not going to", "is not going to", "not going to"], ar: 'لن آكل وجبات سريعة.' },
        { before: "", after: " you going to study tonight?", answer: "Are", choices: ["Is", "Am", "Are"], ar: 'هل ستذاكر الليلة؟' },
        { before: "He is going to ", after: " a new car.", answer: "buy", choices: ["buys", "buying", "buy"], ar: 'سيشتري سيارة جديدة.' },
        { before: "They ", after: " get married in June.", answer: "are going to", choices: ["is going to", "am going to", "are going to"], ar: 'سيتزوجان في يونيو.' },
        { before: "Is she going to ", after: " to the party?", answer: "come", choices: ["comes", "coming", "come"], ar: 'هل ستأتي إلى الحفلة؟' },
        { before: "It ", after: " rain today.", answer: "is going to", choices: ["are going to", "is going to", "am going to"], ar: 'ستمطر اليوم.' },
        { before: "My brother is going to ", after: " his own business.", answer: "start", choices: ["starts", "starting", "start"], ar: 'أخي سيبدأ مشروعه الخاص.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ["I going to study.", "I am going to study.", "I am going to studying."],
          correct: 1,
          explanationAr: '"I am going to study." — am + going to + فعل في أصله.',
        },
        {
          promptAr: 'أكمل: "She ___ travel to Spain."',
          choices: ["am going to", "is going to", "are going to"],
          correct: 1,
          explanationAr: '"She is going to" — she تأخذ is.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["I'm going to to eat.", "I'm going eat.", "I'm going to eat."],
          correct: 2,
          explanationAr: '"I\'m going to eat." — فعل في أصله بعد going to، بدون to ثانية.',
        },
        {
          promptAr: 'متى نستخدم going to؟',
          choices: ['للقرارات اللحظية', 'للخطط المقررة مسبقاً', 'للوعود فقط'],
          correct: 1,
          explanationAr: '"going to" للخطط المقررة مسبقاً — شيء قررته قبل لحظة الكلام.',
        },
        {
          promptAr: 'ما النفي الصحيح؟',
          choices: ["I not going to eat.", "I'm not going to eat.", "I'm going not to eat."],
          correct: 1,
          explanationAr: '"I\'m not going to eat." — not تجي بعد am.',
        },
        {
          promptAr: 'أكمل: "___ you going to study tonight?"',
          choices: ['Is', 'Am', 'Are'],
          correct: 2,
          explanationAr: '"Are you going to...?" — you تأخذ are.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ["We is going to travel.", "We are going to travel.", "We am going to travel."],
          correct: 1,
          explanationAr: '"We are going to travel." — we تأخذ are.',
        },
        {
          promptAr: 'ما الفعل الصحيح بعد going to؟',
          choices: ["She is going to buys.", "She is going to buying.", "She is going to buy."],
          correct: 2,
          explanationAr: '"going to buy" — الفعل في أصله بعد going to.',
        },
        {
          promptAr: 'الفرق بين going to وwill:',
          choices: [
            'going to = قرار لحظي · will = خطة مسبقة',
            'going to = خطة مسبقة · will = قرار لحظي أو وعد',
            'لا فرق بينهما',
          ],
          correct: 1,
          explanationAr: '"going to" للخطط المسبقة · "will" للقرارات اللحظية أو الوعود أو التنبؤات.',
        },
        {
          promptAr: 'أكمل: "It ___ rain today."',
          choices: ["am going to", "is going to", "are going to"],
          correct: 1,
          explanationAr: '"It is going to rain." — it تأخذ is.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'am/is/are + going to + فعل في أصله = خطة مقررة مسبقاً', en: "I'm going to · He's going to · They're going to", example: "I'm going to study medicine next year." },
        { ar: 'النفي: am/is/are + not + going to + فعل', en: "I'm not going to · He isn't going to", example: "I'm not going to eat fast food anymore." },
        { ar: 'going to = خطة مسبقة · will = قرار لحظي أو وعد', en: "going to: I'm going to visit → decided before · will: I'll help you → decided now", example: "Are you going to come? I'll be there at 8." },
      ],
    },
  ],
}
