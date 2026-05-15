import type { GrammarLesson } from './types'

export const g30: GrammarLesson = {
  id: 30,
  slug: 'verbs-ing-to',
  emoji: '🎯',
  title: { en: 'I like doing / I want to do', ar: 'أحب أن أفعل / أريد أن أفعل' },
  description: { en: 'Use two verbs together correctly', ar: 'كيف تستخدم فعلين معاً بشكل صحيح' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '🎯',
      title: 'I like doing / I want to do',
      titleAr: 'أحب أن أفعل / أريد أن أفعل',
      level: 'A1',
      tagAr: 'درس ٣٠ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'عندما تستخدم فعلين معاً في الإنجليزية 🤔',
      bodyAr:
        'في العربية نقول بسهولة: "أحب أن أسبح · أريد أن أذهب · أستمتع بالطبخ." في الإنجليزية عندما يأتي فعلان معاً، الفعل الثاني يتغير شكله حسب الفعل الأول: بعض الأفعال تأخذ -ing (مثل enjoy, like, love, hate, finish, stop) وبعضها تأخذ to + فعل (مثل want, need, decide, hope, plan) وبعضها تأخذ الاثنين!',
      arabicEx: 'أنا أحب السباحة. · أريد أن أذهب. · استمتعت بالطبخ.',
      englishEx: 'I like swimming. · I want to go. · I enjoyed cooking.',
      noteAr: '💡 enjoy/finish/stop → verb-ing · want/need/decide → to + verb · like/love/hate → كلاهما',
    },
    {
      kind: 'patternTable',
      titleAr: 'أفعال + ing أو أفعال + to',
      rows: [
        { pronoun: 'enjoy + verb-ing', pronounAr: 'يستمتع بـ', verb: 'enjoy + verb-ing', exampleEn: 'I enjoy swimming.', exampleAr: 'أستمتع بالسباحة.', emoji: '🏊' },
        { pronoun: 'finish + verb-ing', pronounAr: 'ينتهي من', verb: 'finish + verb-ing', exampleEn: 'She finished cooking.', exampleAr: 'انتهت من الطبخ.', emoji: '🍳' },
        { pronoun: 'stop + verb-ing', pronounAr: 'يتوقف عن', verb: 'stop + verb-ing', exampleEn: 'He stopped smoking.', exampleAr: 'توقف عن التدخين.', emoji: '🚭' },
        { pronoun: 'want + to + verb', pronounAr: 'يريد أن', verb: 'want + to + base verb', exampleEn: 'I want to learn English.', exampleAr: 'أريد أن أتعلم الإنجليزية.', emoji: '📚' },
        { pronoun: 'need + to + verb', pronounAr: 'يحتاج أن', verb: 'need + to + base verb', exampleEn: 'She needs to rest.', exampleAr: 'هي تحتاج للراحة.', emoji: '😴' },
        { pronoun: 'decide + to + verb', pronounAr: 'يقرر أن', verb: 'decide + to + base verb', exampleEn: 'He decided to travel.', exampleAr: 'قرر السفر.', emoji: '✈️' },
        { pronoun: 'like/love/hate + ing أو to', pronounAr: 'يحب / يكره (كلاهما)', verb: 'like + ing OR like + to + verb', exampleEn: 'I like swimming. / I like to swim.', exampleAr: 'أحب السباحة. (كلاهما صحيح)', emoji: '💙' },
        { pronoun: 'stop + to + verb (معنى مختلف!)', pronounAr: 'يتوقف من أجل', verb: 'stop + to + verb = توقف لكي يفعل', exampleEn: 'He stopped to buy coffee. (stopped walking, bought coffee)', exampleAr: 'توقف لكي يشتري قهوة. (غير المعنى!)', emoji: '☕' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'فعلان معاً — جمل حقيقية 💬',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'enjoy', role: 'verb' },
            { text: 'cooking', role: 'complement' }, { text: 'for my family', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أستمتع بالطبخ لعائلتي.',
          emoji: '🍳',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'wants', role: 'verb' },
            { text: 'to study', role: 'complement' }, { text: 'medicine', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'تريد أن تدرس الطب.',
          emoji: '🩺',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'stopped', role: 'verb' },
            { text: 'smoking', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'توقف عن التدخين.',
          emoji: '🚭',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'decided', role: 'verb' },
            { text: 'to travel', role: 'complement' }, { text: 'to France', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'قرروا السفر إلى فرنسا.',
          emoji: '✈️',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'love', role: 'verb' },
            { text: 'playing', role: 'complement' }, { text: 'football', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أحب لعب كرة القدم.',
          emoji: '⚽',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'needs', role: 'verb' },
            { text: 'to rest', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي تحتاج للراحة.',
          emoji: '😴',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'finished', role: 'verb' },
            { text: 'eating', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'انتهينا من الأكل.',
          emoji: '🍽️',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'hopes', role: 'verb' },
            { text: 'to find', role: 'complement' }, { text: 'a good job', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'يأمل في إيجاد عمل جيد.',
          emoji: '🤞',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'avoid', role: 'verb' },
            { text: 'eating', role: 'complement' }, { text: 'fast food', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أتجنب أكل الوجبات السريعة.',
          emoji: '🥗',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'plans', role: 'verb' },
            { text: 'to open', role: 'complement' }, { text: 'a salon', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'تخطط لفتح صالون.',
          emoji: '💇',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'hate', role: 'verb' },
            { text: 'waking up', role: 'complement' }, { text: 'early', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'أكره الاستيقاظ مبكراً.',
          emoji: '😫',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'keeps', role: 'verb' },
            { text: 'calling', role: 'complement' }, { text: 'me', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'يستمر في الاتصال بي.',
          emoji: '📱',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: الهوايات والخطط 🎨',
      noteAr: 'انظر كيف نستخدم الفعلين معاً في الحوار الطبيعي',
      lines: [
        { speaker: 'A', text: 'What do you enjoy doing in your free time?', ar: 'ماذا تستمتع بفعله في وقت فراغك؟' },
        { speaker: 'B', text: 'I love reading and I enjoy cooking. What about you?', ar: 'أحب القراءة وأستمتع بالطبخ. وأنت؟' },
        { speaker: 'A', text: 'I like listening to music and I want to learn to play guitar.', ar: 'أحب سماع الموسيقى وأريد أن أتعلم العزف على الغيتار.' },
        { speaker: 'B', text: 'That is great! I decided to take music lessons last year.', ar: 'رائع! قررت أخذ دروس في الموسيقى السنة الماضية.' },
        { speaker: 'A', text: 'Did you finish learning? Do you avoid playing in public?', ar: 'هل انتهيت من التعلم؟ هل تتجنب العزف أمام الناس؟' },
        { speaker: 'B', text: 'I am still learning! But I plan to perform in a concert one day.', ar: 'ما زلت أتعلم! لكن أخطط للعزف في حفلة يوماً ما.' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"I want swimming" خطأ — want تأخذ to + verb دائماً', wrong: 'I want swimming.', right: 'I want to swim.' },
        { type: 'mistake', ar: '"I enjoy to swim" خطأ — enjoy تأخذ verb-ing دائماً', wrong: 'I enjoy to swim.', right: 'I enjoy swimming.' },
        { type: 'tip', ar: 'stop + ing = توقف نهائياً عن الفعل · stop + to + verb = توقف لكي يفعل شيئاً آخر: "He stopped smoking." vs "He stopped to light a cigarette."' },
        { type: 'rule', ar: 'أفعال تأخذ -ing: enjoy, finish, stop, avoid, keep, hate, love, like, mind, suggest · أفعال تأخذ to: want, need, decide, plan, hope, forget, try, learn, manage' },
        { type: 'tip', ar: 'like, love, hate يأخذان الاثنين بنفس المعنى: "I like swimming / I like to swim" — كلاهما صحيح تماماً!' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I enjoy ', after: ' in the sea.', answer: 'swimming', choices: ['swim', 'to swim', 'swimming'], ar: 'أستمتع بالسباحة في البحر.' },
        { before: 'She wants ', after: ' medicine.', answer: 'to study', choices: ['studying', 'study', 'to study'], ar: 'تريد أن تدرس الطب.' },
        { before: 'He stopped ', after: ' years ago.', answer: 'smoking', choices: ['smoke', 'to smoke', 'smoking'], ar: 'توقف عن التدخين منذ سنوات.' },
        { before: 'They decided ', after: ' to France.', answer: 'to travel', choices: ['traveling', 'travel', 'to travel'], ar: 'قرروا السفر إلى فرنسا.' },
        { before: 'I love ', after: ' football.', answer: 'playing', choices: ['to play', 'play', 'playing'], ar: 'أحب لعب كرة القدم. (مع ing)' },
        { before: 'She needs ', after: '.', answer: 'to rest', choices: ['resting', 'rest', 'to rest'], ar: 'هي تحتاج للراحة.' },
        { before: 'I avoid ', after: ' fast food.', answer: 'eating', choices: ['eat', 'to eat', 'eating'], ar: 'أتجنب أكل الوجبات السريعة.' },
        { before: 'He hopes ', after: ' a good job.', answer: 'to find', choices: ['finding', 'find', 'to find'], ar: 'يأمل في إيجاد عمل جيد.' },
        { before: 'We finished ', after: ' at midnight.', answer: 'working', choices: ['work', 'to work', 'working'], ar: 'انتهينا من العمل في منتصف الليل.' },
        { before: 'She plans ', after: ' a salon.', answer: 'to open', choices: ['opening', 'open', 'to open'], ar: 'تخطط لفتح صالون.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ['I want swimming.', 'I want swim.', 'I want to swim.'],
          correct: 2,
          explanationAr: '"I want to swim." — want تأخذ to + فعل في أصله.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I enjoy to swim.', 'I enjoy swim.', 'I enjoy swimming.'],
          correct: 2,
          explanationAr: '"I enjoy swimming." — enjoy تأخذ verb-ing.',
        },
        {
          promptAr: 'أكمل: "She decided ___ travel to France."',
          choices: ['to', 'ing', 'that'],
          correct: 0,
          explanationAr: '"She decided to travel." — decide تأخذ to + verb.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['He stopped to smoke. (توقف نهائياً)', 'He stopped smoking. (توقف نهائياً)', 'كلاهما يعني نفس الشيء'],
          correct: 1,
          explanationAr: '"He stopped smoking." = توقف نهائياً عن التدخين. "He stopped to smoke." = توقف من أجل التدخين (معنى مختلف تماماً).',
        },
        {
          promptAr: 'أكمل: "I avoid ___ fast food."',
          choices: ['eat', 'to eat', 'eating'],
          correct: 2,
          explanationAr: '"avoid eating" — avoid تأخذ verb-ing.',
        },
        {
          promptAr: 'أكمل: "She needs ___ rest."',
          choices: ['to', 'of', 'for'],
          correct: 0,
          explanationAr: '"She needs to rest." — need تأخذ to + verb.',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ['I like to swim.', 'I like swimming.', 'كلاهما صحيح'],
          correct: 2,
          explanationAr: '"like" تأخذ كلاهما: "I like swimming" و"I like to swim" — كلاهما صحيح بنفس المعنى.',
        },
        {
          promptAr: 'أكمل: "He hopes ___ a good job."',
          choices: ['finding', 'find', 'to find'],
          correct: 2,
          explanationAr: '"hope to find" — hope تأخذ to + verb.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I enjoy to cook.', 'I enjoy cooking.', 'I enjoy cook.'],
          correct: 1,
          explanationAr: '"I enjoy cooking." — enjoy دائماً مع verb-ing.',
        },
        {
          promptAr: 'أكمل: "I hate ___ up early."',
          choices: ['wake', 'to wake', 'waking'],
          correct: 2,
          explanationAr: '"hate waking up" — hate يأخذ -ing (أو to wake، كلاهما صحيح، لكن -ing هو الجواب هنا).',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'أفعال + verb-ing: enjoy, finish, stop, avoid, keep, mind, suggest', en: 'I enjoy swimming · She finished cooking · He stopped smoking', example: 'They keep calling me. I avoid eating fast food.' },
        { ar: 'أفعال + to + verb: want, need, decide, plan, hope, forget, try', en: 'I want to go · She needs to rest · He decided to travel', example: 'I plan to open a business. She hopes to find a good job.' },
        { ar: 'like/love/hate يأخذان كلاهما بنفس المعنى · stop معناه يتغير حسب ما بعده', en: 'I like swimming = I like to swim · stop smoking ≠ stop to smoke', example: 'I love cooking. / I love to cook. Both correct!' },
      ],
    },
  ],
}
