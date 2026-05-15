import type { GrammarLesson } from './types'

export const g21: GrammarLesson = {
  id: 21,
  slug: 'colors',
  emoji: '🌈',
  title: { en: 'Colors & Descriptions', ar: 'الألوان والأوصاف' },
  description: { en: 'Describe things using colors and more', ar: 'كيف تصف الأشياء بالألوان وغيرها' },
  level: 'A0',
  sections: [
    {
      kind: 'cover',
      emoji: '🌈',
      title: 'Colors & Descriptions',
      titleAr: 'الألوان والأوصاف',
      level: 'A0',
      tagAr: 'درس ٢١ · قواعد',
    },
    {
      kind: 'hook',
      titleAr: 'الألوان — أسهل صفات بالإنجليزية 🌈',
      bodyAr:
        'الألوان في الإنجليزية سهلة جداً! لا تتغير مع المذكر والمؤنث ولا مع الجمع — "a red car" و"red cars" · "a red bag" و"a red dress" — نفس الكلمة دائماً. الصفة في الإنجليزية تجي دائماً قبل الاسم: "a red car" وليس "a car red". أو تجي بعد فعل To Be: "The car is red."',
      arabicEx: 'سيارة حمراء · حقيبة زرقاء · قميص أبيض',
      englishEx: 'a red car · a blue bag · a white shirt',
      noteAr: '💡 الصفة قبل الاسم: a blue car · أو بعد is/are: The car is blue.',
    },
    {
      kind: 'patternTable',
      titleAr: 'الألوان الأساسية',
      rows: [
        { pronoun: 'red', pronounAr: 'أحمر', verb: 'a red + noun', exampleEn: 'a red car', exampleAr: 'سيارة حمراء', emoji: '🔴' },
        { pronoun: 'blue', pronounAr: 'أزرق', verb: 'a blue + noun', exampleEn: 'a blue bag', exampleAr: 'حقيبة زرقاء', emoji: '🔵' },
        { pronoun: 'green', pronounAr: 'أخضر', verb: 'a green + noun', exampleEn: 'a green shirt', exampleAr: 'قميص أخضر', emoji: '🟢' },
        { pronoun: 'yellow', pronounAr: 'أصفر', verb: 'a yellow + noun', exampleEn: 'a yellow flower', exampleAr: 'زهرة صفراء', emoji: '🟡' },
        { pronoun: 'white', pronounAr: 'أبيض', verb: 'a white + noun', exampleEn: 'a white dress', exampleAr: 'فستان أبيض', emoji: '⚪' },
        { pronoun: 'black', pronounAr: 'أسود', verb: 'a black + noun', exampleEn: 'black shoes', exampleAr: 'حذاء أسود', emoji: '⚫' },
        { pronoun: 'orange', pronounAr: 'برتقالي', verb: 'an orange + noun', exampleEn: 'an orange jacket', exampleAr: 'جاكيتة برتقالية', emoji: '🟠' },
        { pronoun: 'purple', pronounAr: 'بنفسجي', verb: 'a purple + noun', exampleEn: 'a purple scarf', exampleAr: 'وشاح بنفسجي', emoji: '🟣' },
        { pronoun: 'brown', pronounAr: 'بني', verb: 'a brown + noun', exampleEn: 'brown hair', exampleAr: 'شعر بني', emoji: '🟫' },
        { pronoun: 'grey', pronounAr: 'رمادي', verb: 'a grey + noun', exampleEn: 'a grey coat', exampleAr: 'معطف رمادي', emoji: '🩶' },
        { pronoun: 'light blue', pronounAr: 'أزرق فاتح', verb: 'light + color', exampleEn: 'light blue jeans', exampleAr: 'جينز أزرق فاتح', emoji: '👖' },
        { pronoun: 'dark green', pronounAr: 'أخضر غامق', verb: 'dark + color', exampleEn: 'a dark green jacket', exampleAr: 'جاكيتة خضراء غامقة', emoji: '🫙' },
      ],
    },
    {
      kind: 'sentences',
      titleAr: 'الألوان في جمل حقيقية 💬',
      items: [
        {
          tokens: [
            { text: 'My car', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'white', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'سيارتي بيضاء.',
          emoji: '🚗',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'brown eyes', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'عيناها بنيتان.',
          emoji: '👁️',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'want', role: 'verb' },
            { text: 'a black jacket', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أريد جاكيتة سوداء.',
          emoji: '🧥',
        },
        {
          tokens: [
            { text: 'His shirt', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'dark blue', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'قميصه أزرق غامق.',
          emoji: '👔',
        },
        {
          tokens: [
            { text: 'The walls', role: 'subject' }, { text: 'are', role: 'verb' },
            { text: 'light yellow', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'الجدران صفراء فاتحة.',
          emoji: '🏠',
        },
        {
          tokens: [
            { text: 'Do you have', role: 'verb' }, { text: 'this', role: 'subject' },
            { text: 'in red', role: 'complement' }, { text: '?', role: 'filler' },
          ],
          ar: 'هل عندك هذا باللون الأحمر؟',
          emoji: '🛍️',
        },
        {
          tokens: [
            { text: 'She', role: 'subject' }, { text: 'has', role: 'verb' },
            { text: 'long black hair', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'شعرها طويل وأسود.',
          emoji: '💇',
        },
        {
          tokens: [
            { text: 'I', role: 'subject' }, { text: 'prefer', role: 'verb' },
            { text: 'dark colors', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'أفضل الألوان الغامقة.',
          emoji: '🎨',
        },
        {
          tokens: [
            { text: 'My favorite color', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'green', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'لوني المفضل هو الأخضر.',
          emoji: '💚',
        },
        {
          tokens: [
            { text: 'These', role: 'subject' }, { text: 'are', role: 'verb' },
            { text: 'orange shoes', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'هذه أحذية برتقالية.',
          emoji: '👟',
        },
        {
          tokens: [
            { text: 'The sky', role: 'subject' }, { text: 'is', role: 'verb' },
            { text: 'light blue', role: 'complement' }, { text: 'today', role: 'complement' },
            { text: '.', role: 'filler' },
          ],
          ar: 'السماء أزرق فاتح اليوم.',
          emoji: '🌤️',
        },
        {
          tokens: [
            { text: 'He', role: 'subject' }, { text: 'is wearing', role: 'verb' },
            { text: 'a grey suit', role: 'complement' }, { text: '.', role: 'filler' },
          ],
          ar: 'يرتدي بدلة رمادية.',
          emoji: '🤵',
        },
      ],
    },
    {
      kind: 'dialogue',
      titleAr: 'محادثة: التسوق للملابس 🛍️',
      noteAr: 'انظر كيف نستخدم الألوان عند الشراء',
      lines: [
        { speaker: 'A', text: 'Excuse me, I am looking for a jacket.', ar: 'عفواً، أبحث عن جاكيتة.' },
        { speaker: 'B', text: 'What color do you want?', ar: 'أي لون تريد؟' },
        { speaker: 'A', text: 'I like black or dark blue. Do you have these in my size?', ar: 'أحب الأسود أو الأزرق الغامق. هل عندك هذه بمقاسي؟' },
        { speaker: 'B', text: 'Yes! This black one is very popular. And this dark blue jacket is also nice.', ar: 'نعم! هذه السوداء مشهورة جداً. وهذه الزرقاء الغامقة أيضاً جميلة.' },
        { speaker: 'A', text: 'I prefer the black one. How much is it?', ar: 'أفضل السوداء. بكم هي؟' },
        { speaker: 'B', text: 'It is two hundred and fifty dirhams. It is a good price!', ar: 'بمئتين وخمسين درهماً. سعر جيد!' },
      ],
    },
    {
      kind: 'notes',
      titleAr: 'ملاحظات مهمة ⚠️',
      items: [
        { type: 'mistake', ar: 'الألوان لا تتغير في الجمع — "red cars" وليس "reds cars"', wrong: 'I have two reds cars.', right: 'I have two red cars.' },
        { type: 'mistake', ar: 'الصفة في الإنجليزية تجي قبل الاسم وليس بعده', wrong: 'I want a jacket black.', right: 'I want a black jacket.' },
        { type: 'tip', ar: 'light + لون = فاتح · dark + لون = غامق · هكذا تصف درجات الألوان: light blue, dark green' },
        { type: 'rule', ar: 'الصفة في موضعين: (١) قبل الاسم: "a red bag" · (٢) بعد is/are: "The bag is red."' },
        { type: 'tip', ar: 'لإضافة an قبل orange: "an orange bag" — لأن orange تبدأ بصوت حرف العلة' },
      ],
    },
    {
      kind: 'practice',
      titleAr: 'تدريب — أكمل الجملة ✏️',
      exercises: [
        { before: 'My car is ', after: '.', answer: 'white', choices: ['white', 'whites', 'whitely'], ar: 'سيارتي بيضاء.' },
        { before: 'I want ', after: ' jacket.', answer: 'a black', choices: ['a black', 'a blacks', 'black a'], ar: 'أريد جاكيتة سوداء.' },
        { before: 'She has ', after: ' hair.', answer: 'brown', choices: ['browne', 'brown', 'browns'], ar: 'شعرها بني.' },
        { before: 'The sky is ', after: ' today.', answer: 'light blue', choices: ['light blue', 'lights blue', 'light blues'], ar: 'السماء أزرق فاتح اليوم.' },
        { before: 'Do you have this in ', after: '?', answer: 'red', choices: ['redly', 'reds', 'red'], ar: 'هل عندك هذا باللون الأحمر؟' },
        { before: 'I prefer ', after: ' colors.', answer: 'dark', choices: ['darkness', 'darks', 'dark'], ar: 'أفضل الألوان الغامقة.' },
        { before: 'He is wearing ', after: ' orange shirt.', answer: 'an', choices: ['a', 'an', 'the'], ar: 'يرتدي قميصاً برتقالياً.' },
        { before: 'These shoes are ', after: '.', answer: 'green', choices: ['greens', 'green', 'greenly'], ar: 'هذه الأحذية خضراء.' },
        { before: 'My favorite color is ', after: '.', answer: 'blue', choices: ['blues', 'bluely', 'blue'], ar: 'لوني المفضل هو الأزرق.' },
        { before: 'She has ', after: ' eyes.', answer: 'grey', choices: ['greyed', 'greys', 'grey'], ar: 'عيناها رماديتان.' },
      ],
    },
    {
      kind: 'quiz',
      titleAr: 'اختبار سريع 🎯',
      questions: [
        {
          promptAr: 'ما الصواب؟',
          choices: ['I want a jacket red.', 'I want a red jacket.', 'I want red a jacket.'],
          correct: 1,
          explanationAr: 'الصفة تجي قبل الاسم: "a red jacket".',
        },
        {
          promptAr: 'كيف تقول "أحذية سوداء" بالإنجليزية؟',
          choices: ['blacks shoes', 'shoes black', 'black shoes'],
          correct: 2,
          explanationAr: '"black shoes" — الصفة قبل الاسم ولا تتغير في الجمع.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['My car are white.', 'My car is white.', 'My car be white.'],
          correct: 1,
          explanationAr: '"My car is white." — مفرد فنستخدم is.',
        },
        {
          promptAr: 'كيف تقول "أزرق فاتح"؟',
          choices: ['blue light', 'light blue', 'lighter blue'],
          correct: 1,
          explanationAr: '"light blue" — light يجي قبل اللون.',
        },
        {
          promptAr: 'أكمل: "She has ___ eyes."',
          choices: ['brownes', 'browns', 'brown'],
          correct: 2,
          explanationAr: '"brown" — الألوان لا تتغير مع الجمع.',
        },
        {
          promptAr: 'ما اللون العربي لـ purple؟',
          choices: ['برتقالي', 'بنفسجي', 'رمادي'],
          correct: 1,
          explanationAr: 'purple = بنفسجي.',
        },
        {
          promptAr: 'أي جملة صحيحة؟',
          choices: ['The cars is red.', 'The cars are red.', 'The cars be red.'],
          correct: 1,
          explanationAr: '"The cars are red." — جمع فنستخدم are.',
        },
        {
          promptAr: 'ما الصواب قبل "orange"؟',
          choices: ['a orange bag', 'an orange bag', 'the orange bag'],
          correct: 1,
          explanationAr: '"an orange bag" — orange تبدأ بصوت حرف علة فنستخدم an.',
        },
        {
          promptAr: 'ما الصواب؟',
          choices: ['I have two blacks cars.', 'I have two black car.', 'I have two black cars.'],
          correct: 2,
          explanationAr: '"two black cars" — black لا تتغير، cars جمع بـ s.',
        },
        {
          promptAr: 'كيف تقول "أخضر غامق"؟',
          choices: ['green dark', 'darker green', 'dark green'],
          correct: 2,
          explanationAr: '"dark green" — dark يجي قبل اللون.',
        },
      ],
    },
    {
      kind: 'summary',
      titleAr: 'ملخص الدرس 🎯',
      rules: [
        { ar: 'الصفة تجي قبل الاسم في الإنجليزية دائماً', en: 'a red car · a blue bag · a white shirt', example: 'I want a black jacket. She has brown eyes.' },
        { ar: 'الألوان لا تتغير في الجمع أو مع المذكر/المؤنث', en: 'a red car → red cars (NOT reds cars)', example: 'two blue bags · three green shirts' },
        { ar: 'light + لون = فاتح · dark + لون = غامق', en: 'light blue · dark green · light grey', example: 'She is wearing a light pink dress.' },
      ],
    },
  ],
}
