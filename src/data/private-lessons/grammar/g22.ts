import type { GrammarLesson } from './types'

export const g22: GrammarLesson = {
  id: 22,
  slug: 'comparatives',
  emoji: '📈',
  title: { en: 'Bigger / More Beautiful / Better', ar: 'المقارنة: أكبر / أجمل / أفضل' },
  description: { en: 'Compare two things', ar: 'كيف تقارن بين شيئين' },
  level: 'A1',
  sections: [
    {
      kind: 'cover',
      emoji: '📈',
      title: 'Bigger / More Beautiful / Better',
      titleAr: 'المقارنة: أكبر / أجمل / أفضل',
      level: 'A1',
      tagAr: 'درس ٢٢ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'كيف تقارن بين شيئين؟ 🔍',
      bodyAr:
        'في العربية نضع "أ" في البداية: أكبر، أسرع، أجمل. بالإنجليزية عندنا قاعدتان: (١) الصفات القصيرة (مقطع واحد) نضيف لها -er في النهاية: big → bigger. (٢) الصفات الطويلة (مقطعان أو أكثر) نضع more قبلها: more beautiful, more expensive. وبعد الصفة دائماً نستخدم "than" للمقارنة.',
      arabicEx: 'الدار البيضاء أكبر من الرباط. · هذا الهاتف أغلى من ذاك.',
      englishEx: 'Casablanca is bigger than Rabat. · This phone is more expensive than that one.',
      noteAr: '💡 صفة قصيرة + er + than · more + صفة طويلة + than',
    },
    {
      kind: 'patternTable',
      titleAr: 'قواعد المقارنة',
      rows: [
        { pronoun: 'صفة قصيرة + er', pronounAr: 'tall → taller', verb: 'Subject + is/are + adj-er + than', exampleEn: 'He is taller than his brother.', exampleAr: 'هو أطول من أخيه.', emoji: '📏' },
        { pronoun: 'fast → faster', pronounAr: 'سريع → أسرع', verb: 'adj + er + than', exampleEn: 'This car is faster than that one.', exampleAr: 'هذه السيارة أسرع من تلك.', emoji: '🚗' },
        { pronoun: 'مضاعفة الحرف الأخير', pronounAr: 'big → bigger · hot → hotter', verb: 'CVC → double + er', exampleEn: 'Morocco is bigger than Portugal.', exampleAr: 'المغرب أكبر من البرتغال.', emoji: '🗺️' },
        { pronoun: 'y → ier', pronounAr: 'happy → happier · easy → easier', verb: 'adj (y) → ier + than', exampleEn: 'This exercise is easier than that one.', exampleAr: 'هذا التمرين أسهل من ذاك.', emoji: '😊' },
        { pronoun: 'more + صفة طويلة', pronounAr: 'beautiful → more beautiful', verb: 'more + long adj + than', exampleEn: 'She is more beautiful than her sister.', exampleAr: 'هي أجمل من أختها.', emoji: '💐' },
        { pronoun: 'more expensive', pronounAr: 'غالٍ → أغلى', verb: 'more + expensive + than', exampleEn: 'Gold is more expensive than silver.', exampleAr: 'الذهب أغلى من الفضة.', emoji: '💰' },
        { pronoun: 'more comfortable', pronounAr: 'مريح → أكثر راحة', verb: 'more + comfortable + than', exampleEn: 'A bed is more comfortable than a sofa.', exampleAr: 'السرير أكثر راحة من الأريكة.', emoji: '🛏️' },
        { pronoun: 'شاذة: good → better · bad → worse', pronounAr: 'جيد → أفضل · سيئ → أسوأ', verb: 'irregular forms', exampleEn: 'This film is better than that one.', exampleAr: 'هذا الفيلم أفضل من ذاك.', emoji: '🎬' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'جمل مقارنة حقيقية 💬',
      items: [
        {
          tokens: [
            { text: 'Casablanca', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'bigger', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'Rabat', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الدار البيضاء أكبر من الرباط.',
          emoji: '🏙️',
        },
        {
          tokens: [
            { text: 'English', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'easier', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'Japanese', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الإنجليزية أسهل من اليابانية.',
          emoji: '📚',
        },
        {
          tokens: [
            { text: 'This phone', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'more expensive', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'my old one', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذا الهاتف أغلى من هاتفي القديم.',
          emoji: '📱',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'taller', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'his friend', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هو أطول من صديقه.',
          emoji: '👤',
        },
        {
          tokens: [
            { text: 'The train', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'faster', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'the bus', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'القطار أسرع من الحافلة.',
          emoji: '🚂',
        },
        {
          tokens: [
            { text: 'Today', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'hotter', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'yesterday', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'اليوم أحر من الأمس.',
          emoji: '☀️',
        },
        {
          tokens: [
            { text: 'My new job', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'better', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'my old job', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عملي الجديد أفضل من عملي القديم.',
          emoji: '💼',
        },
        {
          tokens: [
            { text: 'The weather', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'worse', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'last week', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الطقس أسوأ من الأسبوع الماضي.',
          emoji: '🌧️',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'more intelligent', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'I thought', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هي أذكى مما كنت أظن.',
          emoji: '🧠',
        },
        {
          tokens: [
            { text: 'Agadir', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'warmer', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'Tangier', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أكادير أدفأ من طنجة.',
          emoji: '🌞',
        },
        {
          tokens: [
            { text: 'Fruit', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'healthier', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'chocolate', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الفاكهة أصح من الشوكولاتة.',
          emoji: '🍎',
        },
        {
          tokens: [
            { text: 'This book', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'more interesting', role: 'complement' }, { text: 'than', role: 'filler' },
            { text: 'that one', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذا الكتاب أكثر إثارة من ذاك.',
          emoji: '📖',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: مقارنة هاتفين 📱',
      noteAr: 'انظر كيف نستخدم المقارنة في الحياة اليومية',
      lines: [
        { speaker: 'A', text: 'I want to buy a new phone. Which one is better?', ar: 'أريد شراء هاتف جديد. أيهما أفضل؟' },
        { speaker: 'B', text: 'This iPhone is more expensive, but it is faster.', ar: 'هذا الآيفون أغلى، لكنه أسرع.' },
        { speaker: 'A', text: 'How much more expensive is it?', ar: 'بكم هو أغلى؟' },
        { speaker: 'B', text: 'About five hundred dirhams more. But the camera is much better.', ar: 'بحوالي خمسمئة درهم أكثر. لكن الكاميرا أفضل بكثير.' },
        { speaker: 'A', text: 'The other phone is cheaper and the battery is bigger.', ar: 'الهاتف الآخر أرخص والبطارية أكبر.' },
        { speaker: 'B', text: 'That is true. It depends on what is more important to you!', ar: 'هذا صحيح. يعتمد على ما هو أهم بالنسبة لك!' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: '"more big" خطأ — الصفات القصيرة تأخذ -er وليس more', wrong: 'This is more big than that.', right: 'This is bigger than that.' },
        { type: 'mistake', ar: 'لا تنسى "than" بعد الصفة المقارنة عند ذكر الشيء الثاني', wrong: 'He is taller his brother.', right: 'He is taller than his brother.' },
        { type: 'tip', ar: 'الصفات المنتهية بحرف ساكن + حرف علة + حرف ساكن (big, hot, fat) تضاعف الحرف الأخير: bigger, hotter, fatter' },
        { type: 'rule', ar: 'good → better (أفضل) · bad → worse (أسوأ) · far → farther/further (أبعد) — هذه أفعال شاذة يجب حفظها' },
        { type: 'tip', ar: '"much" تُقوي المقارنة: much bigger, much more expensive = أكبر بكثير، أغلى بكثير' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'Casablanca is ', after: ' than Rabat. (big)', answer: 'bigger', choices: ['more big', 'bigger', 'biggest'], ar: 'الدار البيضاء أكبر من الرباط.' },
        { before: 'This phone is ', after: ' than my old one. (expensive)', answer: 'more expensive', choices: ['expensiver', 'more expensive', 'most expensive'], ar: 'هذا الهاتف أغلى من هاتفي القديم.' },
        { before: 'English is ', after: ' than Japanese. (easy)', answer: 'easier', choices: ['more easy', 'easyer', 'easier'], ar: 'الإنجليزية أسهل من اليابانية.' },
        { before: 'My new job is ', after: ' than my old one. (good)', answer: 'better', choices: ['gooder', 'more good', 'better'], ar: 'عملي الجديد أفضل من القديم.' },
        { before: 'Today is ', after: ' than yesterday. (hot)', answer: 'hotter', choices: ['hoter', 'more hot', 'hotter'], ar: 'اليوم أحر من الأمس.' },
        { before: 'The train is ', after: ' the bus. (fast)', answer: 'faster than', choices: ['fast than', 'faster than', 'more fast'], ar: 'القطار أسرع من الحافلة.' },
        { before: 'She is ', after: ' than her sister. (beautiful)', answer: 'more beautiful', choices: ['beautifuler', 'more beautiful', 'beautifuller'], ar: 'هي أجمل من أختها.' },
        { before: 'The weather is ', after: ' than last week. (bad)', answer: 'worse', choices: ['badder', 'more bad', 'worse'], ar: 'الطقس أسوأ من الأسبوع الماضي.' },
        { before: 'He is ', after: ' than his friend. (tall)', answer: 'taller', choices: ['taller', 'more tall', 'tallest'], ar: 'هو أطول من صديقه.' },
        { before: 'Fruit is ', after: ' than chocolate. (healthy)', answer: 'healthier', choices: ['more healthy', 'healthier', 'healthyer'], ar: 'الفاكهة أصح من الشوكولاتة.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ['This is more big than that.', 'This is bigger than that.', 'This is biger than that.'],
          correct: 1,
          explanationAr: '"bigger" — الصفات القصيرة تأخذ -er. big → bigger (مضاعفة g).',
        },
        {
          promptAr: 'أكمل: "This phone is ___ than that one." (expensive)',
          choices: ['expensiver', 'more expensive', 'most expensive'],
          correct: 1,
          explanationAr: '"more expensive" — الصفات الطويلة تأخذ more.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['He is taller his brother.', 'He is taller than his brother.', 'He is more tall than his brother.'],
          correct: 1,
          explanationAr: '"taller than" — لا ننسى than، وtall قصيرة فتأخذ -er.',
        },
        {
          promptAr: 'ما صيغة المقارنة لـ good؟',
          choices: ['gooder', 'more good', 'better'],
          correct: 2,
          explanationAr: '"better" — good → better (شاذة، يجب حفظها).',
        },
        {
          promptAr: 'ما صيغة المقارنة لـ bad؟',
          choices: ['badder', 'more bad', 'worse'],
          correct: 2,
          explanationAr: '"worse" — bad → worse (شاذة، يجب حفظها).',
        },
        {
          promptAr: 'أكمل: "English is ___ than Japanese." (easy)',
          choices: ['more easy', 'easyer', 'easier'],
          correct: 2,
          explanationAr: '"easier" — easy → easier (y → ier).',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['Today is hoter than yesterday.', 'Today is more hot than yesterday.', 'Today is hotter than yesterday.'],
          correct: 2,
          explanationAr: '"hotter" — hot قصيرة وتنتهي بـ CVC فتضاعف t وتضيف -er.',
        },
        {
          promptAr: 'أكمل: "She is ___ than her sister." (beautiful)',
          choices: ['beautifuler', 'more beautiful', 'beautifuller'],
          correct: 1,
          explanationAr: '"more beautiful" — beautiful طويلة (٣ مقاطع) فتأخذ more.',
        },
        {
          promptAr: 'كيف تقول "أكبر بكثير"؟',
          choices: ['very bigger', 'much bigger', 'more bigger'],
          correct: 1,
          explanationAr: '"much bigger" — much يقوي المقارنة.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['She is more happy than before.', 'She is happyer than before.', 'She is happier than before.'],
          correct: 2,
          explanationAr: '"happier" — happy → happier (y → ier).',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'صفة قصيرة (مقطع واحد): أضف -er + than', en: 'tall → taller · fast → faster · big → bigger', example: 'He is taller than his brother.' },
        { ar: 'صفة طويلة (مقطعان+): more + صفة + than', en: 'more beautiful · more expensive · more comfortable', example: 'This phone is more expensive than that one.' },
        { ar: 'شاذة يجب حفظها: good → better · bad → worse', en: 'good → better · bad → worse · far → farther', example: 'My new job is better than my old one.' },
      ],
    },
  ],
}
