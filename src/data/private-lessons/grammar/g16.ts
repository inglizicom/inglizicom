import type { GrammarLesson } from './types'

export const g16: GrammarLesson = {
  id: 16,
  slug: 'simple-past-regular',
  emoji: '📖',
  title: { en: 'Simple Past: worked, played, lived', ar: 'الماضي البسيط: الأفعال المنتظمة' },
  description: { en: 'Talk about things that happened in the past', ar: 'كيف تتكلم عن أفعال انتهت في الماضي' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '📖',
      title: 'Simple Past',
      titleAr: 'الماضي البسيط',
      level: 'A1',
      tagAr: 'درس ١٦ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تتكلم عن الأمس والماضي؟ 📅',
      bodyAr:
        'الماضي البسيط للأفعال المنتظمة سهل جداً: نضيف "ed" في النهاية. والجميل أن الفعل لا يتغير مع أي ضمير — نفس الشكل مع I/he/she/we/they كلهم.',
      arabicEx: 'أنا عملت أمس.',
      englishEx: 'I WORKED yesterday.',
      noteAr: '⭐ نضيف -ed للجميع — لا s، لا تغيير: I worked / She worked / They worked',
    },
    {
      kind: 'patternTable',
      titleAr: 'قواعد إضافة -ed (مهمة جداً!)',
      rows: [
        { pronoun: 'فعل عادي', pronounAr: 'ينتهي بحرف عادي', verb: '+ ed', exampleEn: 'work → worked · play → played', exampleAr: 'عمل · لعب', emoji: '✏️' },
        { pronoun: 'فعل ينتهي بـ e', pronounAr: 'مثل: live, love, use', verb: '+ d فقط', exampleEn: 'live → lived · love → loved', exampleAr: 'عاش · أحب', emoji: '❤️' },
        { pronoun: 'فعل ينتهي بـ y', pronounAr: 'مثل: study, try, cry', verb: 'y → ied', exampleEn: 'study → studied · try → tried', exampleAr: 'درس · حاول', emoji: '📚' },
        { pronoun: 'فعل قصير ينتهي بـ CVC', pronounAr: 'حرف + حرف متحرك + حرف', verb: 'مضاعفة + ed', exampleEn: 'stop → stopped · plan → planned', exampleAr: 'توقف · خطط', emoji: '🛑' },
        { pronoun: 'كلمات زمنية', pronounAr: 'تدل على الماضي', verb: 'yesterday · ago · last', exampleEn: 'yesterday · last week · 2 years ago', exampleAr: 'أمس · الأسبوع الماضي · منذ سنتين', emoji: '📅' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'الماضي البسيط في جمل حقيقية 🌍',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'worked', role: 'verb' },
            { text: 'all day', role: 'complement' }, { text: 'yesterday', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عملت طوال اليوم أمس.',
          emoji: '💼',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'studied', role: 'verb' },
            { text: 'English', role: 'complement' }, { text: 'for two hours', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي درست الإنجليزية لمدة ساعتين.',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'visited', role: 'verb' },
            { text: 'Marrakech', role: 'complement' }, { text: 'last summer', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن زرنا مراكش الصيف الماضي.',
          emoji: '🕌',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'called', role: 'verb' },
            { text: 'me', role: 'complement' }, { text: 'this morning', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو اتصل بي هذا الصباح.',
          emoji: '📞',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'moved', role: 'verb' },
            { text: 'to a new house', role: 'complement' }, { text: 'last month', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هم انتقلوا إلى بيت جديد الشهر الماضي.',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'stopped', role: 'verb' },
            { text: 'smoking', role: 'complement' }, { text: '2 years ago', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي توقفت عن التدخين منذ سنتين.',
          emoji: '🚭',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'loved', role: 'verb' },
            { text: 'that film', role: 'complement' }, { text: '!', role: 'filler' },
          ],
          ar: 'أحببت ذلك الفيلم كثيراً!',
          emoji: '🎬',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'tried', role: 'verb' },
            { text: 'his best', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو بذل قصارى جهده.',
          emoji: '💪',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'played', role: 'verb' },
            { text: 'football', role: 'complement' }, { text: 'last weekend', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'نحن لعبنا كرة القدم عطلة نهاية الأسبوع الماضية.',
          emoji: '⚽',
        },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"I work yesterday" — في الماضي نحتاج worked', wrong: 'I work yesterday.', right: 'I worked yesterday.' },
        { type: 'mistake', ar: '"She stopted" — الفعل المنتهي بـ CVC يضاعف الحرف الأخير', wrong: 'She stopted.', right: 'She stopped.' },
        { type: 'tip', ar: 'أفعال شاذة (Irregular) لا تأخذ -ed: go→went · eat→ate · have→had · come→came · see→saw — سنتعلمها قريباً!' },
        { type: 'rule', ar: 'نفس الشكل مع جميع الضمائر: I worked · She worked · They worked — لا تغيير!' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — حوّل الفعل للماضي ✏️',
      exercises: [
        { before: 'She ', after: ' English for 2 hours. (study)', answer: 'studied', choices: ['studyed', 'studied', 'studid'], ar: 'هي درست الإنجليزية لساعتين.' },
        { before: 'I ', after: ' at home all day. (stay)', answer: 'stayed', choices: ['stay', 'stayed', 'staid'], ar: 'أنا بقيت في البيت طوال اليوم.' },
        { before: 'He ', after: ' to music on the bus. (listen)', answer: 'listened', choices: ['listen', 'listened', 'listend'], ar: 'هو استمع إلى الموسيقى في الحافلة.' },
        { before: 'They ', after: ' football yesterday. (play)', answer: 'played', choices: ['play', 'played', 'plaied'], ar: 'هم لعبوا كرة القدم أمس.' },
        { before: 'We ', after: ' a new restaurant last night. (try)', answer: 'tried', choices: ['tryed', 'tried', 'treid'], ar: 'نحن جربنا مطعماً جديداً ليلة أمس.' },
        { before: 'She ', after: ' smoking last year. (stop)', answer: 'stopped', choices: ['stoped', 'stopped', 'stopd'], ar: 'هي توقفت عن التدخين العام الماضي.' },
        { before: 'I ', after: ' in Casablanca for 5 years. (live)', answer: 'lived', choices: ['lived', 'liveed', 'livd'], ar: 'عشت في الدار البيضاء لمدة ٥ سنوات.' },
        { before: 'He ', after: ' very hard for the exam. (work)', answer: 'worked', choices: ['work', 'worked', 'workt'], ar: 'هو عمل بجد لأجل الامتحان.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما صيغة الماضي لـ "study"؟',
          choices: ['studyed', 'studied', 'studid'],
          correct: 1,
          explanationAr: 'study → studied (y تصبح ied).',
        },
        {
          promptAr: 'ما صيغة الماضي لـ "stop"؟',
          choices: ['stoped', 'stopped', 'stopd'],
          correct: 1,
          explanationAr: 'stop → stopped (مضاعفة p لأن الفعل ينتهي بـ CVC).',
        },
        {
          promptAr: 'ما صيغة الماضي لـ "live"؟',
          choices: ['liveed', 'lived', 'livd'],
          correct: 1,
          explanationAr: 'live → lived (فعل ينتهي بـ e إذن نضيف d فقط).',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I work yesterday.', 'I worked yesterday.', 'I was work yesterday.'],
          correct: 1,
          explanationAr: '"worked" — الماضي البسيط للفعل work.',
        },
        {
          promptAr: 'هل يتغير الفعل في الماضي مع he/she/it؟',
          choices: ['نعم، نضيف s', 'لا، نفس الشكل للجميع', 'نعم، نضيف ed إضافية'],
          correct: 1,
          explanationAr: 'نفس الشكل للجميع: I worked / She worked / They worked.',
        },
        {
          promptAr: 'ما صيغة الماضي لـ "try"؟',
          choices: ['tryed', 'tried', 'treid'],
          correct: 1,
          explanationAr: 'try → tried (y بعد حرف ساكن تصبح ied).',
        },
        {
          promptAr: 'أي كلمة تدل على الماضي؟',
          choices: ['tomorrow', 'last week', 'every day'],
          correct: 1,
          explanationAr: '"last week" = الأسبوع الماضي — تدل على الماضي.',
        },
        {
          promptAr: 'أكمل: "We ___ the game last night. (watch)"',
          choices: ['watch', 'watched', 'watches'],
          correct: 1,
          explanationAr: 'watch → watched في الماضي.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'معظم الأفعال: أضف -ed', en: 'work → worked · play → played', example: 'I worked all day.' },
        { ar: 'فعل ينتهي بـ e: أضف d فقط · فعل ينتهي بـ y: y→ied', en: 'live → lived · study → studied', example: 'She studied English.' },
        { ar: 'نفس الشكل مع جميع الضمائر — لا s، لا تغيير', en: 'I/She/They worked (same)', example: 'He worked. They worked.' },
      ],
    },
  ],
}
