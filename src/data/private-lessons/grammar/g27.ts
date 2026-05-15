import type { GrammarLesson } from './types'

export const g27: GrammarLesson = {
  id: 27,
  slug: 'irregular-past',
  emoji: '⚡',
  title: { en: 'Irregular Verbs: went, ate, had, saw...', ar: 'الأفعال الشاذة في الماضي' },
  description: { en: 'The 25 most important irregular verbs', ar: 'أهم ٢٥ فعل شاذ يجب حفظه' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '⚡',
      title: 'Irregular Verbs: went, ate, had, saw...',
      titleAr: 'الأفعال الشاذة في الماضي',
      level: 'A1',
      tagAr: 'درس ٢٧ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'لماذا "went" وليس "goed"؟ 🤔',
      bodyAr:
        'تعلمنا أن الأفعال العادية في الماضي تأخذ -ed: work → worked, play → played. لكن هناك أفعال شاذة تتغير بشكل كامل ولا تأخذ -ed: go → went, eat → ate, have → had. لا قاعدة ثابتة — يجب الحفظ! لكن البشرى السارة: صيغة الماضي تبقى نفسها مع جميع الضمائر: I went, she went, they went.',
      arabicEx: 'ذهبت إلى السوق. · أكلت البيتزا. · رأيت فيلماً.',
      englishEx: 'I went to the market. · She ate pizza. · We saw a film.',
      noteAr: '💡 الفعل الشاذ نفسه للجميع: I went / she went / they went',
    },
    {
      kind: 'patternTable',
      titleAr: 'أهم الأفعال الشاذة',
      rows: [
        { pronoun: 'go → went', pronounAr: 'يذهب → ذهب', verb: 'went (same for all subjects)', exampleEn: 'I went to school yesterday.', exampleAr: 'ذهبت إلى المدرسة أمس.', emoji: '🏫' },
        { pronoun: 'eat → ate', pronounAr: 'يأكل → أكل', verb: 'ate (same for all subjects)', exampleEn: 'She ate pizza for dinner.', exampleAr: 'أكلت بيتزا على العشاء.', emoji: '🍕' },
        { pronoun: 'have → had', pronounAr: 'يملك/لديه → كان عنده', verb: 'had (same for all subjects)', exampleEn: 'They had a great time.', exampleAr: 'كان عندهم وقت رائع.', emoji: '🎉' },
        { pronoun: 'come → came', pronounAr: 'يأتي → جاء', verb: 'came (same for all subjects)', exampleEn: 'He came late to the meeting.', exampleAr: 'جاء متأخراً إلى الاجتماع.', emoji: '🕐' },
        { pronoun: 'see → saw', pronounAr: 'يرى → رأى', verb: 'saw (same for all subjects)', exampleEn: 'We saw a good film last night.', exampleAr: 'رأينا فيلماً جيداً الليلة الماضية.', emoji: '🎬' },
        { pronoun: 'get → got', pronounAr: 'يحصل → حصل', verb: 'got (same for all subjects)', exampleEn: 'I got a new phone.', exampleAr: 'حصلت على هاتف جديد.', emoji: '📱' },
        { pronoun: 'make → made', pronounAr: 'يصنع → صنع', verb: 'made (same for all subjects)', exampleEn: 'She made a delicious cake.', exampleAr: 'صنعت كيكة لذيذة.', emoji: '🎂' },
        { pronoun: 'take → took', pronounAr: 'يأخذ → أخذ', verb: 'took (same for all subjects)', exampleEn: 'He took my pen by mistake.', exampleAr: 'أخذ قلمي بالخطأ.', emoji: '✏️' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'المزيد من الأفعال الشاذة الأهم 💬',
      items: [
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'knew', role: 'verb' },
            { text: 'the answer', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عرفت الجواب. (know → knew)',
          emoji: '💡',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'thought', role: 'verb' },
            { text: 'it was a good idea', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ظنت أنها كانت فكرة جيدة. (think → thought)',
          emoji: '🧠',
        },
        {
          tokens: [
            { text: 'We', role: 'subject' }, { text: 'bought', role: 'verb' },
            { text: 'new clothes', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'اشترينا ملابس جديدة. (buy → bought)',
          emoji: '🛍️',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'said', role: 'verb' },
            { text: 'hello', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'قال مرحباً. (say → said)',
          emoji: '👋',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'gave', role: 'verb' },
            { text: 'her a gift', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أعطيتها هدية. (give → gave)',
          emoji: '🎁',
        },
        {
          tokens: [
            { text: 'They', role: 'subject' }, { text: 'found', role: 'verb' },
            { text: 'the keys', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'وجدوا المفاتيح. (find → found)',
          emoji: '🔑',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'put', role: 'verb' },
            { text: 'the book on the table', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'وضعت الكتاب على الطاولة. (put → put — لا يتغير!)',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'brought', role: 'verb' },
            { text: 'food for everyone', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'جلب طعاماً للجميع. (bring → brought)',
          emoji: '🍱',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'felt', role: 'verb' },
            { text: 'very tired', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'شعرت بتعب شديد. (feel → felt)',
          emoji: '😴',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'left', role: 'verb' },
            { text: 'early', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'غادرت مبكراً. (leave → left)',
          emoji: '🚪',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'wrote', role: 'verb' },
            { text: 'a letter', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'كتبت رسالة. (write → wrote)',
          emoji: '✉️',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'ran', role: 'verb' },
            { text: 'very fast', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'ركض بسرعة كبيرة. (run → ran)',
          emoji: '🏃',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: ماذا فعلت أمس؟ 🗓️',
      noteAr: 'انظر كيف نستخدم الأفعال الشاذة عند الحديث عن الماضي',
      lines: [
        { speaker: 'A', text: 'How was your day yesterday?', ar: 'كيف كان يومك أمس؟' },
        { speaker: 'B', text: 'It was great! I went to the market in the morning and bought some vegetables.', ar: 'كان رائعاً! ذهبت إلى السوق في الصباح واشتريت بعض الخضروات.' },
        { speaker: 'A', text: 'Oh nice! Did you cook?', ar: 'رائع! هل طبخت؟' },
        { speaker: 'B', text: 'Yes! I made couscous for the family. They said it was delicious!', ar: 'نعم! صنعت الكسكس للعائلة. قالوا إنه كان لذيذاً!' },
        { speaker: 'A', text: 'And in the evening? What did you do?', ar: 'وفي المساء؟ ماذا فعلت؟' },
        { speaker: 'B', text: 'We saw a film together and went to sleep early. I felt so relaxed!', ar: 'شاهدنا فيلماً معاً وذهبنا للنوم مبكراً. شعرت بالراحة التامة!' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: 'الأفعال الشاذة لا تأخذ -ed أبداً', wrong: 'I goed to school. / She ated pizza.', right: 'I went to school. / She ate pizza.' },
        { type: 'mistake', ar: 'bought وbrought — احذر من الخلط: bought = اشترى · brought = جلب', wrong: 'I buyed it. / She bringed it.', right: 'I bought it. / She brought it.' },
        { type: 'tip', ar: 'بعض الأفعال لا تتغير أبداً في الماضي: put → put · read → read · cut → cut · let → let · hit → hit' },
        { type: 'rule', ar: 'الأفعال الشاذة نفسها لجميع الضمائر: I went / she went / they went — لا تضيف s أو ed' },
        { type: 'tip', ar: 'احفظها في مجموعات بنفس النمط: feel→felt · leave→left · sleep→slept / bring→brought · buy→bought · think→thought' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'I ', after: ' to the market yesterday. (go)', answer: 'went', choices: ['goed', 'gone', 'went'], ar: 'ذهبت إلى السوق أمس.' },
        { before: 'She ', after: ' pizza for dinner. (eat)', answer: 'ate', choices: ['eated', 'ate', 'eaten'], ar: 'أكلت بيتزا على العشاء.' },
        { before: 'We ', after: ' a great time. (have)', answer: 'had', choices: ['haved', 'had', 'has'], ar: 'قضينا وقتاً رائعاً.' },
        { before: 'He ', after: ' late to the meeting. (come)', answer: 'came', choices: ['comed', 'came', 'come'], ar: 'جاء متأخراً إلى الاجتماع.' },
        { before: 'They ', after: ' a good film. (see)', answer: 'saw', choices: ['seed', 'seen', 'saw'], ar: 'شاهدوا فيلماً جيداً.' },
        { before: 'I ', after: ' new clothes. (buy)', answer: 'bought', choices: ['buyed', 'bringed', 'bought'], ar: 'اشتريت ملابس جديدة.' },
        { before: 'She ', after: ' the book on the table. (put)', answer: 'put', choices: ['putted', 'puted', 'put'], ar: 'وضعت الكتاب على الطاولة.' },
        { before: 'He ', after: ' food for everyone. (bring)', answer: 'brought', choices: ['bringed', 'brung', 'brought'], ar: 'جلب طعاماً للجميع.' },
        { before: 'I ', after: ' very tired yesterday. (feel)', answer: 'felt', choices: ['feeled', 'felt', 'feel'], ar: 'شعرت بتعب شديد أمس.' },
        { before: 'She ', after: ' a letter to her friend. (write)', answer: 'wrote', choices: ['writed', 'written', 'wrote'], ar: 'كتبت رسالة لصديقتها.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما ماضي "go"؟',
          choices: ['goed', 'gone', 'went'],
          correct: 2,
          explanationAr: '"went" — go → went (شاذة، يجب حفظها).',
        },
        {
          promptAr: 'ما ماضي "eat"؟',
          choices: ['eated', 'ate', 'eaten'],
          correct: 1,
          explanationAr: '"ate" — eat → ate (شاذة).',
        },
        {
          promptAr: 'ما ماضي "have"؟',
          choices: ['haved', 'has', 'had'],
          correct: 2,
          explanationAr: '"had" — have → had (شاذة).',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She goed to school.', 'She gone to school.', 'She went to school.'],
          correct: 2,
          explanationAr: '"She went to school." — go → went للجميع.',
        },
        {
          promptAr: 'ما ماضي "buy"؟',
          choices: ['buyed', 'bought', 'bringed'],
          correct: 1,
          explanationAr: '"bought" — buy → bought (شاذة). لا تخلطها مع brought.',
        },
        {
          promptAr: 'أي فعل لا يتغير في الماضي؟',
          choices: ['go', 'eat', 'put'],
          correct: 2,
          explanationAr: '"put" — put → put (لا يتغير في الماضي).',
        },
        {
          promptAr: 'ما ماضي "think"؟',
          choices: ['thinked', 'thunk', 'thought'],
          correct: 2,
          explanationAr: '"thought" — think → thought (شاذة).',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I finded the keys.', 'I found the keys.', 'I find the keys.'],
          correct: 1,
          explanationAr: '"I found the keys." — find → found (شاذة).',
        },
        {
          promptAr: 'الفرق بين bought وbrought:',
          choices: ['لا فرق', 'bought = اشترى · brought = جلب', 'bought = جلب · brought = اشترى'],
          correct: 1,
          explanationAr: '"bought" = ماضي buy (اشترى) · "brought" = ماضي bring (جلب). لا تخلط بينهما!',
        },
        {
          promptAr: 'ما ماضي "feel"؟',
          choices: ['feeled', 'felt', 'fall'],
          correct: 1,
          explanationAr: '"felt" — feel → felt (نفس نمط leave→left, sleep→slept).',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'الأفعال الشاذة لا تأخذ -ed — تتغير بشكل كامل ويجب الحفظ', en: 'go→went · eat→ate · have→had · come→came · see→saw', example: 'I went to school. She ate pizza. They had fun.' },
        { ar: 'صيغة الماضي الشاذة نفسها لجميع الضمائر', en: 'I went / She went / They went (NOT she wented)', example: 'He bought a car. She bought a bag. They bought tickets.' },
        { ar: 'بعض الأفعال لا تتغير: put, read, cut, let, hit', en: 'put → put · read → read · cut → cut', example: 'She put the book on the table. I read it yesterday.' },
      ],
    },
  ],
}
