import type { Lesson } from './level1-book.ts'

/**
 * «الإنجليزية من الصفر (الدارجة)» — Level 1, the pages around the nineteen
 * lessons of data/level1-book-v2.ts.
 *
 * STARTER (S1–S8) comes before Lesson 1, because a complete beginner does not
 * start with "Good morning": first reading (letter sounds, then 3- and
 * 4-letter words and syllables), then the everyday word sets a child learns
 * first — days, months, seasons, colours, the five senses, the body. Every
 * example is about "I / you / my / your", the book's focus. The Starter has
 * its own numbers (S1…), so Lessons 1–19 keep their numbers, their QR audio
 * links and their page numbers.
 *
 * REVIEWS come after every three lessons from Lesson 7 on (and after the
 * Starter). Their exercises' answers go to the answer key the book page
 * builds from every exercise block.
 *
 * Lesson numbers here (101…, 201…) are only keys: the header shows `tag`.
 */

/* ── STARTER ─────────────────────────────────────────────────────────── */

export const LEVEL1_STARTER: Lesson[] = [
  /* S1 · Letter sounds and 3-letter words */
  { n: 101, tag: 'Starter 1', titleAr: 'الأصوات وكلمات من 3 حروف', titleEn: 'Phonics 1', blocks: [
    { t: 'banner', title: 'Learn to Read 1 - تعلّم القراءة', icons: ['🔤', '📖'] },
    { t: 'callout', text: 'في الإنجليزية لكل حرف اسم (A = "إيه") وصوت (a = "أَ"). لنقرأ نستعمل الصوت، لا الاسم.' },
    { t: 'bar', title: 'Short vowels - الحروف المتحركة القصيرة' },
    { t: 'cards', cols: 5, items: [
      ['🍎', 'a — apple', 'صوت "أَ" مفتوح'], ['🥚', 'e — egg', 'صوت "إِ" قصير'], ['🐛', 'i — insect', 'صوت "إ" خفيف'],
      ['🐙', 'o — octopus', 'صوت "أُو" قصير'], ['☂️', 'u — umbrella', 'صوت "أَ" قصير'],
    ] },
    { t: 'bar', title: 'Blend the sounds - اجمع الأصوات' },
    { t: 'grid', rows: [
      { dark: true, cells: ['c – a – t', 'd – o – g', 's – u – n', 'b – e – d', 'p – i – g', 'b – u – s'] },
      { cells: ['cat 🐱', 'dog 🐶', 'sun ☀️', 'bed 🛏️', 'pig 🐷', 'bus 🚌'] },
      { cells: ['قط', 'كلب', 'شمس', 'سرير', 'خنزير', 'حافلة'], size: 11 },
    ] },
    { t: 'callout', text: 'اقرأ كل صوت ببطء: c… a… t… ثم أسرِع حتى تسمع الكلمة كاملة: cat!' },
    { t: 'bar', title: 'Word families - عائلات الكلمات' },
    { t: 'boxes', cols: 3, items: [
      { title: '-at', lines: ['cat', 'hat', 'bat', 'mat', 'rat'] },
      { title: '-an', lines: ['can', 'fan', 'man', 'pan', 'van'] },
      { title: '-en', lines: ['hen', 'pen', 'ten', 'men'] },
      { title: '-ig', lines: ['big', 'dig', 'pig', 'wig', 'fig'] },
      { title: '-op', lines: ['hop', 'mop', 'top', 'pop'] },
      { title: '-ug', lines: ['bug', 'hug', 'mug', 'rug', 'jug'] },
    ] },
    { t: 'pageBreak' },
    { t: 'bar', title: 'Read and say - اقرأ وقل' },
    { t: 'cards', items: [
      ['🗺️', 'map', 'خريطة'], ['🦊', 'fox', 'ثعلب'], ['📦', 'box', 'صندوق'], ['☕', 'cup', 'فنجان'],
      ['🖊️', 'pen', 'قلم'], ['🐔', 'hen', 'دجاجة'], ['🔟', 'ten', 'عشرة'], ['👜', 'bag', 'حقيبة'],
      ['🕸️', 'web', 'شبكة عنكبوت'], ['🍯', 'jam', 'مربّى (كونفيتور)'], ['👄', 'lip', 'شفة'], ['6️⃣', 'six', 'ستة'],
    ] },
    { t: 'bar', title: 'Read the sentences - اقرأ الجمل' },
    { t: 'bullets', box: true, cols: 2, size: 14, items: [
      'I am a man. - أنا رجل.', 'I have a cat. - عندي قط.', 'I have a red pen. - عندي قلم أحمر.', 'My cat is big. - قطّي كبير.',
      'You have a dog. - عندك كلب.', 'Your bag is on the bed. - حقيبتك فوق السرير.', 'I can hop. - أستطيع القفز.', 'I sit in the sun. - أجلس في الشمس.',
    ] },
    { t: 'exercise', title: 'Read and match - اقرأ واربط', instr: 'اكتب الحرف المناسب.', lettered: true, bank: ['🐱', '☀️', '🛏️', '🐷', '🚌', '🦊'], cols: 2, items: [
      { q: 'pig → ___', a: 'd' }, { q: 'sun → ___', a: 'b' }, { q: 'fox → ___', a: 'f' },
      { q: 'cat → ___', a: 'a' }, { q: 'bus → ___', a: 'e' }, { q: 'bed → ___', a: 'c' },
    ] },
    { t: 'exercise', title: 'Find the missing letter - الحرف الناقص', cols: 2, items: [
      { q: 'c _ t  🐱', a: 'a' }, { q: 'd _ g  🐶', a: 'o' }, { q: 'p _ n  🖊️', a: 'e' }, { q: 's _ n  ☀️', a: 'u' },
      { q: 'p _ g  🐷', a: 'i' }, { q: 'b _ x  📦', a: 'o' }, { q: 'h _ n  🐔', a: 'e' }, { q: 'c _ p  ☕', a: 'u' },
    ] },
  ] },

  /* S2 · 4-letter words and syllables */
  { n: 102, tag: 'Starter 2', titleAr: 'كلمات من 4 حروف والمقاطع', titleEn: 'Phonics 2', blocks: [
    { t: 'banner', title: 'Learn to Read 2 - تعلّم القراءة', icons: ['🔤', '👏'] },
    { t: 'bar', title: 'Two consonants together - حرفان ساكنان معًا' },
    { t: 'sub', text: 'At the start - في البداية' },
    { t: 'grid', rows: [
      { dark: true, cells: ['fr + og', 'dr + um', 'fl + ag', 'cr + ab', 'st + op', 'cl + ap'] },
      { cells: ['frog 🐸', 'drum 🥁', 'flag 🚩', 'crab 🦀', 'stop 🛑', 'clap 👏'] },
      { cells: ['ضفدع', 'طبل', 'علم', 'سلطعون', 'قف', 'صفّق'], size: 11 },
    ] },
    { t: 'sub', text: 'At the end - في النهاية' },
    { t: 'grid', rows: [
      { dark: true, cells: ['ha + nd', 'mi + lk', 'la + mp', 'te + nt', 'gi + ft', 'ri + ng'] },
      { cells: ['hand ✋', 'milk 🥛', 'lamp 💡', 'tent ⛺', 'gift 🎁', 'ring 💍'] },
      { cells: ['يد', 'حليب', 'مصباح', 'خيمة', 'هدية', 'خاتم'], size: 11 },
    ] },
    { t: 'bar', title: 'Two letters, one sound - حرفان، صوت واحد' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'grid', boxed: true, rows: [
        { dark: true, cells: ['sh = "ش"', 'ch = "تش"', 'th', 'ck = "ك"'] },
        { cells: ['fish 🐟', 'chip 🍟', 'bath 🛁', 'duck 🦆'], size: 12 },
        { cells: ['ship 🚢', 'chin', 'this', 'sock 🧦'], size: 12 },
        { cells: ['shop 🛍️', 'much', 'that', 'back'], size: 12 },
      ] }],
      [{ t: 'callout', text: 'th لها صوتان: خفيف كما في bath (مثل "ث")، وقوي كما في this و that (مثل "ذ").' }],
    ] },
    { t: 'bar', title: 'The magic e - الـ e السحرية' },
    { t: 'grid', rows: [
      { dark: true, cells: ['can → cane', 'kit → kite', 'hop → hope', 'cub → cube'] },
      { cells: ['cake 🎂', 'bike 🚲', 'home 🏠', 'tube'] },
      { cells: ['game 🎮', 'five 5️⃣', 'nose 👃', 'cute'] },
    ] },
    { t: 'callout', text: 'الـ e في آخر الكلمة لا تُنطق، لكنها تجعل الحرف المتحرك يقول اسمه: a = "إيه" في cake، i = "آي" في bike، o = "أو" في home.' },
    { t: 'pageBreak' },
    { t: 'bar', title: 'Syllables - المقاطع: صفّق مع كل مقطع 👏' },
    { t: 'grid', rows: [
      { dark: true, cells: ['1 👏', '2 👏👏', '2 👏👏', '3 👏👏👏'] },
      { cells: ['book', 'ta – ble', 'pen – cil', 'ba – na – na'], size: 13 },
      { cells: ['cat', 'win – dow', 'rab – bit', 'com – pu – ter'], size: 13 },
      { cells: ['milk', 'doc – tor', 'tea – cher', 'tel – e – phone'], size: 13 },
    ] },
    { t: 'callout', text: 'الكلمة الطويلة سهلة إذا قسّمتها: com… pu… ter = computer.' },
    { t: 'bar', title: 'Read the sentences - اقرأ الجمل' },
    { t: 'bullets', box: true, cols: 2, size: 14, items: [
      'I have a frog. - عندي ضفدع.', 'I drink milk. - أشرب الحليب.', 'My hand is on the desk. - يدي فوق المكتب.', 'I like my bike. - أحب درّاجتي.',
      'You have a big cake. - عندك كعكة كبيرة.', 'Your home is nice. - بيتك جميل.', 'I am a teacher. - أنا أستاذ.', 'My ship is in the sea. - سفينتي في البحر.',
    ] },
    { t: 'exercise', title: 'Read and write - اقرأ واكتب الكلمة', cols: 2, items: [
      { q: 'fr + og = ___  🐸', a: 'frog' }, { q: 'ha + nd = ___  ✋', a: 'hand' }, { q: 'sh + ip = ___  🚢', a: 'ship' },
      { q: 'du + ck = ___  🦆', a: 'duck' }, { q: 'ca + ke = ___  🎂', a: 'cake' }, { q: 'bi + ke = ___  🚲', a: 'bike' },
    ] },
    { t: 'exercise', title: 'How many syllables? - كم مقطعًا؟', cols: 2, items: [
      { q: 'banana', a: '3' }, { q: 'pen', a: '1' }, { q: 'window', a: '2' }, { q: 'computer', a: '3' },
      { q: 'doctor', a: '2' }, { q: 'milk', a: '1' },
    ] },
  ] },

  /* S3 · The days of the week */
  { n: 103, tag: 'Starter 3', titleAr: 'أيام الأسبوع', titleEn: 'The days of the week', blocks: [
    { t: 'banner', title: 'The Days of the Week - أيام الأسبوع', icons: ['📅', '🗓️'] },
    { t: 'grid', boxed: true, rows: [
      { dark: true, cells: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { cells: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], size: 11 },
      { cells: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'] },
    ] },
    { t: 'callout', text: 'أيام الأسبوع تبدأ دائمًا بحرف كبير: Monday ✓ — monday ✗' },
    { t: 'bar', title: 'Yesterday - Today - Tomorrow' },
    { t: 'grid', rows: [
      { dark: true, cells: ['yesterday', 'today', 'tomorrow'] },
      { cells: ['أمس (البارح)', 'اليوم', 'غدًا (غدّا)'] },
    ] },
    { t: 'qa', rows: [
      ['What day is it today?', "It's Monday.", 'ما اليوم؟', 'اليوم الإثنين.'],
      ["What's your favourite day?", 'My favourite day is Friday.', 'ما يومك المفضل؟', 'يومي المفضل هو الجمعة.'],
      ['Do you work on Saturday?', "Yes, I do. / No, I don't.", 'هل تعمل يوم السبت؟', 'نعم. / لا.'],
    ] },
    { t: 'bar', title: 'on + day' },
    { t: 'bullets', box: true, cols: 2, size: 13.5, items: [
      'I go to the gym on Monday. - أذهب إلى قاعة الرياضة يوم الإثنين.', 'I visit my family on Sunday. - أزور عائلتي يوم الأحد.',
      'I study English on Tuesday. - أدرس الإنجليزية يوم الثلاثاء.', 'I go to the hammam on Friday. - أذهب إلى الحمّام يوم الجمعة.',
      'I rest on the weekend. - أرتاح في نهاية الأسبوع.', 'I work from Monday to Friday. - أعمل من الإثنين إلى الجمعة.',
    ] },
    { t: 'exercise', title: 'Complete the week - أكمل الأسبوع', cols: 2, items: [
      { q: 'Monday → ___', a: 'Tuesday' }, { q: 'Wednesday → ___', a: 'Thursday' }, { q: 'Friday → ___', a: 'Saturday' },
      { q: 'Saturday → ___', a: 'Sunday' }, { q: 'Sunday → ___', a: 'Monday' }, { q: 'Tuesday → ___', a: 'Wednesday' },
    ] },
    { t: 'answers', items: ['What day is it today?', "What's your favourite day?", 'What do you do on Sunday?'] },
  ] },

  /* S4 · The months */
  { n: 104, tag: 'Starter 4', titleAr: 'شهور السنة', titleEn: 'The months', blocks: [
    { t: 'banner', title: 'The Months of the Year - شهور السنة', icons: ['🗓️', '🎂'] },
    { t: 'grid', boxed: true, rows: [
      { dark: true, cells: ['January', 'February', 'March', 'April', 'May', 'June'] },
      { cells: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو'] },
      { dark: true, cells: ['July', 'August', 'September', 'October', 'November', 'December'] },
      { cells: ['يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'] },
    ] },
    { t: 'callout', text: 'الشهور أيضًا تبدأ بحرف كبير: May ✓. ونقول in + الشهر: in May — في شهر ماي.' },
    { t: 'bar', title: 'My birthday - عيد ميلادي' },
    { t: 'qa', rows: [
      ['When is your birthday?', 'My birthday is in May.', 'متى عيد ميلادك؟', 'عيد ميلادي في شهر ماي.'],
      ["What's your favourite month?", 'My favourite month is August.', 'ما شهرك المفضل؟', 'شهري المفضل هو غشت.'],
      ['Is your birthday in winter?', "Yes, it is. / No, it isn't.", 'هل عيد ميلادك في الشتاء؟', 'نعم. / لا.'],
    ] },
    { t: 'bar', title: 'in + month' },
    { t: 'bullets', box: true, cols: 2, size: 13.5, items: [
      'I go to the beach in July. - أذهب إلى الشاطئ في يوليوز.', 'I start school in September. - أبدأ الدراسة في شتنبر.',
      'I travel in August. - أسافر في غشت.', 'My exams are in June. - امتحاناتي في يونيو.',
      'I am very busy in December. - أنا مشغول جدًا في دجنبر.', 'I love April. - أحب شهر أبريل.',
    ] },
    { t: 'exercise', title: 'Which month comes next? - ما الشهر التالي؟', cols: 2, items: [
      { q: 'January → ___', a: 'February' }, { q: 'March → ___', a: 'April' }, { q: 'June → ___', a: 'July' },
      { q: 'August → ___', a: 'September' }, { q: 'October → ___', a: 'November' }, { q: 'December → ___', a: 'January' },
    ] },
    { t: 'answers', items: ['When is your birthday?', "What's your favourite month?"] },
  ] },

  /* S5 · The seasons and the weather */
  { n: 105, tag: 'Starter 5', titleAr: 'الفصول والطقس', titleEn: 'The seasons', blocks: [
    { t: 'banner', title: 'The Four Seasons - الفصول الأربعة', icons: ['🌸', '❄️'] },
    { t: 'cards', cols: 4, items: [
      ['🌸', 'spring', 'الربيع'], ['☀️', 'summer', 'الصيف'], ['🍂', 'autumn', 'الخريف'], ['❄️', 'winter', 'الشتاء'],
    ] },
    { t: 'grid', rows: [
      { dark: true, cells: ['spring', 'summer', 'autumn', 'winter'] },
      { cells: ['March – April – May', 'June – July – August', 'September – October – November', 'December – January – February'], size: 11 },
    ] },
    { t: 'bar', title: 'The weather - الطقس' },
    { t: 'cards', items: [
      ['☀️', "It's sunny.", 'الجو مشمس'], ['🔥', "It's hot.", 'الجو حار'], ['🥶', "It's cold.", 'الجو بارد'], ['🌧️', "It's rainy.", 'الجو ممطر'],
      ['💨', "It's windy.", 'الجو عاصف (فيه الريح)'], ['☁️', "It's cloudy.", 'الجو غائم'], ['🌨️', "It's snowy.", 'الجو مثلج'], ['🌤️', "It's warm.", 'الجو دافئ'],
    ] },
    { t: 'bar', title: 'Talking about seasons' },
    { t: 'qa', rows: [
      ["What's your favourite season?", 'My favourite season is spring.', 'ما فصلك المفضل؟', 'فصلي المفضل هو الربيع.'],
      ["What's the weather like today?", "It's sunny and hot.", 'كيف الطقس اليوم؟', 'الجو مشمس وحار.'],
      ['Do you like winter?', "Yes, I do. / No, I don't.", 'هل تحب الشتاء؟', 'نعم. / لا.'],
    ] },
    { t: 'bullets', box: true, cols: 2, size: 13.5, items: [
      'I swim in summer. - أسبح في الصيف.', 'I wear a coat in winter. - ألبس معطفًا في الشتاء.',
      'I love spring. - أحب الربيع.', 'It is rainy in autumn. - الجو ممطر في الخريف.',
    ] },
    { t: 'exercise', title: 'Which season? - أيّ فصل؟', cols: 2, items: [
      { q: 'August → ___', a: 'summer' }, { q: 'January → ___', a: 'winter' }, { q: 'April → ___', a: 'spring' },
      { q: 'October → ___', a: 'autumn' }, { q: 'December → ___', a: 'winter' }, { q: 'June → ___', a: 'summer' },
    ] },
  ] },

  /* S6 · Colours */
  { n: 106, tag: 'Starter 6', titleAr: 'الألوان', titleEn: 'Colours', blocks: [
    { t: 'banner', title: 'Colours - الألوان', icons: ['🎨', '🌈'] },
    { t: 'cards', items: [
      ['🟥', 'red', 'أحمر (حمر)'], ['🟦', 'blue', 'أزرق (زرق)'], ['🟩', 'green', 'أخضر (خضر)'], ['🟨', 'yellow', 'أصفر (صفر)'],
      ['🟧', 'orange', 'برتقالي (ليموني)'], ['🟪', 'purple', 'بنفسجي (موف)'], ['🌸', 'pink', 'وردي (روز)'], ['🟫', 'brown', 'بنّي (قهوي)'],
      ['⬛', 'black', 'أسود (كحل)'], ['⬜', 'white', 'أبيض (بيض)'], ['🐘', 'grey', 'رمادي (رمادي)'], ['🏅', 'gold', 'ذهبي'],
    ] },
    { t: 'callout', text: 'اللون يأتي قبل الاسم: a red car ✓ — a car red ✗. ونقول light blue (أزرق فاتح) و dark blue (أزرق غامق).' },
    { t: 'bar', title: 'What colour is it? - ما لونه؟' },
    { t: 'qa', rows: [
      ['What colour is your bag?', "It's black.", 'ما لون حقيبتك؟', 'إنها سوداء.'],
      ["What's your favourite colour?", 'My favourite colour is blue.', 'ما لونك المفضل؟', 'لوني المفضل هو الأزرق.'],
      ['Is your car white?', "Yes, it is. / No, it isn't. It's grey.", 'هل سيارتك بيضاء؟', 'نعم. / لا، إنها رمادية.'],
    ] },
    { t: 'bullets', box: true, cols: 2, size: 13.5, items: [
      'I have a red pen. - عندي قلم أحمر.', 'My phone is black. - هاتفي أسود.', 'I like green tea. - أحب الشاي الأخضر.', 'My eyes are brown. - عيناي بنّيتان.',
      'Your shirt is blue. - قميصك أزرق.', 'Your house is white. - بيتك أبيض.',
    ] },
    { t: 'exercise', title: 'What colour? - أيّ لون؟', cols: 2, items: [
      { q: 'the sun ☀️ → ___', a: 'yellow' }, { q: 'the sky ☁️ → ___', a: 'blue' }, { q: 'a banana 🍌 → ___', a: 'yellow' },
      { q: 'grass 🌱 → ___', a: 'green' }, { q: 'milk 🥛 → ___', a: 'white' }, { q: 'an orange 🍊 → ___', a: 'orange' },
    ] },
    { t: 'answers', items: ["What's your favourite colour?", 'What colour is your phone?'] },
  ] },

  /* S7 · The five senses */
  { n: 107, tag: 'Starter 7', titleAr: 'الحواس الخمس', titleEn: 'The five senses', blocks: [
    { t: 'banner', title: 'The Five Senses - الحواس الخمس', icons: ['👀', '👂'] },
    { t: 'cards', cols: 5, items: [
      ['👀', 'see', 'أرى (بالعينين)'], ['👂', 'hear', 'أسمع (بالأذنين)'], ['👃', 'smell', 'أشمّ (بالأنف)'],
      ['👅', 'taste', 'أتذوّق (باللسان)'], ['✋', 'touch', 'ألمس (باليدين)'],
    ] },
    { t: 'bar', title: 'I see with my eyes - أرى بعينيّ' },
    { t: 'grid', rows: [
      { dark: true, cells: ['I see with my eyes.', 'I hear with my ears.', 'I smell with my nose.', 'I taste with my tongue.', 'I touch with my hands.'], size: 11 },
      { cells: ['أرى بعينيّ', 'أسمع بأذنيّ', 'أشمّ بأنفي', 'أتذوّق بلساني', 'ألمس بيديّ'], size: 11 },
    ] },
    { t: 'bar', title: 'Words for the senses - كلمات للحواس' },
    { t: 'row', widths: '1fr 1fr', blocks: [
      [{ t: 'pairs', cols: 1, side: true, size: 12, items: [['sweet – salty', 'حلو – مالح'], ['hot – cold', 'ساخن – بارد'], ['soft – hard', 'ناعم – صلب'], ['loud – quiet', 'صاخب – هادئ'], ['big – small', 'كبير – صغير']] }],
      [{ t: 'bullets', box: true, size: 13, items: ['The cake is sweet. - الكعكة حلوة.', 'My tea is hot. - شايي ساخن.', 'My cat is soft. - قطّي ناعم.', 'The music is loud. - الموسيقى صاخبة.', 'I smell coffee. - أشمّ رائحة القهوة.'] }],
    ] },
    { t: 'qa', rows: [
      ['What do you see?', 'I see a big tree.', 'ماذا ترى؟', 'أرى شجرة كبيرة.'],
      ['What do you hear?', 'I hear music.', 'ماذا تسمع؟', 'أسمع موسيقى.'],
    ] },
    { t: 'exercise', title: 'Which sense? - أيّ حاسة؟', cols: 2, items: [
      { q: 'music 🎵 → I ___', a: 'hear' }, { q: 'a flower 🌹 → I ___', a: 'smell' }, { q: 'a film 🎬 → I ___', a: 'see' },
      { q: 'chocolate 🍫 → I ___', a: 'taste' }, { q: 'my cat 🐱 → I ___', a: 'touch' }, { q: 'the sea 🌊 → I ___', a: 'see' },
    ] },
  ] },

  /* S8 · The body */
  { n: 108, tag: 'Starter 8', titleAr: 'أعضاء الجسم', titleEn: 'The body', blocks: [
    { t: 'banner', title: 'My Body - جسمي', icons: ['🧍', '💪'] },
    { t: 'cards', items: [
      ['🙂', 'head', 'رأس (راس)'], ['💇', 'hair', 'شعر (شعر)'], ['😊', 'face', 'وجه (وجه)'], ['👁️', 'eye', 'عين'],
      ['👂', 'ear', 'أذن (ودن)'], ['👃', 'nose', 'أنف (نيف)'], ['👄', 'mouth', 'فم (فم)'], ['🦷', 'tooth', 'سن (سنة)'],
      ['🦒', 'neck', 'عنق (عنق)'], ['💪', 'arm', 'ذراع'], ['✋', 'hand', 'يد (يد)'], ['☝️', 'finger', 'إصبع (صبع)'],
      ['🦵', 'leg', 'رجل (رجل)'], ['🦶', 'foot', 'قدم (رجل)'], ['🧍', 'back', 'ظهر (ضهر)'], ['🫃', 'stomach', 'بطن (كرش)'],
    ] },
    { t: 'bar', title: 'One - Two - واحد / اثنان' },
    { t: 'grid', rows: [
      { dark: true, cells: ['one eye → two eyes', 'one ear → two ears', 'one hand → two hands', 'one foot → two feet ⚠️', 'one tooth → teeth ⚠️'], size: 11 },
      { cells: ['عين ← عينان', 'أذن ← أذنان', 'يد ← يدان', 'قدم ← قدمان', 'سن ← أسنان'], size: 11 },
    ] },
    { t: 'callout', text: 'نضيف s للجمع: eye → eyes. لكن انتبه: foot → feet و tooth → teeth.' },
    { t: 'bar', title: 'My body - جسمي' },
    { t: 'bullets', box: true, cols: 2, size: 13.5, items: [
      'I have two eyes. - عندي عينان.', 'I have ten fingers. - عندي عشرة أصابع.', 'My hair is black. - شعري أسود.', 'My eyes are brown. - عيناي بنّيتان.',
      'Touch your nose! - المس أنفك!', 'Raise your hand! - ارفع يدك!', 'Close your eyes! - أغمض عينيك!', 'Open your mouth! - افتح فمك!',
    ] },
    { t: 'callout', text: 'لعبة Simon says: الأستاذ يقول "Simon says: touch your nose!" فتلمس أنفك. إذا لم يقل "Simon says" لا تتحرك!' },
    { t: 'exercise', title: 'Two of them - اكتب الجمع', cols: 2, items: [
      { q: 'one eye → two ___', a: 'eyes' }, { q: 'one hand → two ___', a: 'hands' }, { q: 'one foot → two ___', a: 'feet' },
      { q: 'one ear → two ___', a: 'ears' }, { q: 'one leg → two ___', a: 'legs' }, { q: 'one tooth → many ___', a: 'teeth' },
    ] },
  ] },
]

/* ── REVIEWS ─────────────────────────────────────────────────────────── */

/** After the Starter: reading, days, months, seasons, colours, senses, body. */
export const STARTER_REVIEW: Lesson = { n: 109, tag: 'Starter Review', titleAr: 'مراجعة البداية', titleEn: 'Starter review', blocks: [
  { t: 'banner', title: 'Starter Review - مراجعة', icons: ['✅', '🔁'] },
  { t: 'exercise', title: 'Read and write the word - اقرأ واكتب', cols: 2, items: [
    { q: 'd – o – g = ___', a: 'dog' }, { q: 'fr – og = ___', a: 'frog' }, { q: 'sh – ip = ___', a: 'ship' }, { q: 'c – a – ke = ___', a: 'cake' },
    { q: 's – u – n = ___', a: 'sun' }, { q: 'mi – lk = ___', a: 'milk' },
  ] },
  { t: 'exercise', title: 'Days and months - الأيام والشهور', cols: 2, items: [
    { q: 'The day after Friday: ___', a: 'Saturday' }, { q: 'The day before Monday: ___', a: 'Sunday' },
    { q: 'The month after April: ___', a: 'May' }, { q: 'The month before September: ___', a: 'August' },
    { q: 'The first month: ___', a: 'January' }, { q: 'The last month: ___', a: 'December' },
  ] },
  { t: 'exercise', title: 'Seasons and colours - الفصول والألوان', cols: 2, items: [
    { q: 'It is hot in ___.', a: 'summer' }, { q: 'It is cold in ___.', a: 'winter' }, { q: 'Flowers are in ___.', a: 'spring' },
    { q: 'The sky is ___.', a: 'blue' }, { q: 'Grass is ___.', a: 'green' }, { q: 'Snow is ___.', a: 'white' },
  ] },
  { t: 'exercise', title: 'The senses and the body - الحواس والجسم', cols: 2, items: [
    { q: 'I hear with my ___.', a: 'ears' }, { q: 'I see with my ___.', a: 'eyes' }, { q: 'I smell with my ___.', a: 'nose' },
    { q: 'I touch with my ___.', a: 'hands' }, { q: 'one foot → two ___', a: 'feet' }, { q: 'I taste with my ___.', a: 'tongue' },
  ] },
  { t: 'bar', title: 'About you - عنك' },
  { t: 'answers', items: ["What's your favourite day?", 'When is your birthday?', "What's your favourite season?", "What's your favourite colour?"] },
] }

/** Reviews inside the nineteen lessons: `after` = the lesson they follow. */
export const LEVEL1_REVIEWS: { after: number; lesson: Lesson }[] = [
  { after: 9, lesson: { n: 201, tag: 'Review 1', titleAr: 'مراجعة الدروس 7–9', titleEn: 'Review: lessons 7–9', blocks: [
    { t: 'banner', title: 'Review 1 - مراجعة الدروس 7 – 9', icons: ['✅', '🔁'] },
    { t: 'exercise', title: 'I → He / She - أضف s أو es', cols: 2, items: [
      { q: 'I work. → She ___.', a: 'works' }, { q: 'I watch TV. → He ___ TV.', a: 'watches' }, { q: 'I go home. → She ___ home.', a: 'goes' },
      { q: 'I study. → He ___.', a: 'studies' }, { q: 'I have lunch. → She ___ lunch.', a: 'has' }, { q: 'I wash my face. → He ___ his face.', a: 'washes' },
    ] },
    { t: 'exercise', title: 'Classroom words: a or an? - a أم an؟', cols: 2, items: [
      { q: '___ pen', a: 'a' }, { q: '___ eraser', a: 'an' }, { q: '___ notebook', a: 'a' },
      { q: '___ exam', a: 'an' }, { q: '___ ruler', a: 'a' }, { q: '___ English book', a: 'an' },
    ] },
    { t: 'exercise', title: 'am / is / are - have / has', cols: 2, items: [
      { q: 'I ___ a student.', a: 'am' }, { q: 'You ___ my friend.', a: 'are' }, { q: 'She ___ a doctor.', a: 'is' },
      { q: 'I ___ two brothers.', a: 'have' }, { q: 'He ___ a car.', a: 'has' }, { q: 'We ___ Moroccan.', a: 'are' },
    ] },
    { t: 'exercise', title: 'Small words - and / but / or / because', bank: ['and', 'but', 'or', 'because'], cols: 1, items: [
      { q: 'I drink tea ___ I eat bread.', a: 'and' }, { q: 'I am tired ___ I work a lot.', a: 'because' },
      { q: 'Do you want tea ___ coffee?', a: 'or' }, { q: 'I am happy, ___ I am tired.', a: 'but' },
    ] },
    { t: 'bar', title: 'About you - عنك' },
    { t: 'answers', items: ['What time do you get up?', "What's in your school bag?", 'Do you have a car?'] },
  ] } },
  { after: 12, lesson: { n: 202, tag: 'Review 2', titleAr: 'مراجعة الدروس 10–12', titleEn: 'Review: lessons 10–12', blocks: [
    { t: 'banner', title: 'Review 2 - مراجعة الدروس 10 – 12', icons: ['✅', '🔁'] },
    { t: 'exercise', title: 'My house - بيتي', bank: ['kitchen', 'bedroom', 'bathroom', 'living room'], cols: 1, items: [
      { q: 'I sleep in my ___.', a: 'bedroom' }, { q: 'I cook in the ___.', a: 'kitchen' },
      { q: 'I take a shower in the ___.', a: 'bathroom' }, { q: 'I watch TV in the ___.', a: 'living room' },
    ] },
    { t: 'exercise', title: 'Prepositions - حروف الجر', bank: ['on', 'under', 'next to', 'between'], cols: 1, items: [
      { q: 'My phone is ___ the table. (فوق)', a: 'on' }, { q: 'My cat is ___ the bed. (تحت)', a: 'under' },
      { q: 'The lamp is ___ the sofa. (بجانب)', a: 'next to' }, { q: 'The plant is ___ the door and the window. (بين)', a: 'between' },
    ] },
    { t: 'exercise', title: 'What time is it? - كم الساعة؟', cols: 2, items: [
      { q: '7:00 → It\'s seven ___.', a: "o'clock" }, { q: '7:30 → It\'s half ___ seven.', a: 'past' },
      { q: '7:15 → It\'s quarter ___ seven.', a: 'past' }, { q: '7:45 → It\'s quarter ___ eight.', a: 'to' },
    ] },
    { t: 'exercise', title: 'How often? - كم مرة؟', instr: 'رتّب الكلمات.', cols: 1, items: [
      { q: 'drink / I / always / tea →', a: 'I always drink tea.' },
      { q: 'never / I / late / am →', a: 'I am never late.' },
      { q: 'go / I / to the gym / sometimes →', a: 'I sometimes go to the gym.' },
    ] },
    { t: 'bar', title: 'About you - عنك' },
    { t: 'answers', items: ['Where is your bed?', 'What time do you go to bed?', 'How often do you visit your family?'] },
  ] } },
  { after: 15, lesson: { n: 203, tag: 'Review 3', titleAr: 'مراجعة الدروس 13–15', titleEn: 'Review: lessons 13–15', blocks: [
    { t: 'banner', title: 'Review 3 - مراجعة الدروس 13 – 15', icons: ['✅', '🔁'] },
    { t: 'exercise', title: 'Food and drinks - الطعام والمشروبات', bank: ['bread', 'fish', 'mint tea', 'orange juice', 'rice', 'water'], cols: 2, items: [
      { q: '🍞 → ___', a: 'bread' }, { q: '🐟 → ___', a: 'fish' }, { q: '🍵 → ___', a: 'mint tea' },
      { q: '🍊 → ___', a: 'orange juice' }, { q: '🍚 → ___', a: 'rice' }, { q: '💧 → ___', a: 'water' },
    ] },
    { t: 'exercise', title: 'Do you like…? - هل تحب؟', cols: 1, items: [
      { q: 'Do you like pizza? 🙂 → Yes, I ___.', a: 'do' }, { q: 'Do you like fish? 🙁 → No, I ___.', a: "don't" },
      { q: 'Would you like a drink? → Yes, ___.', a: 'please' },
    ] },
    { t: 'exercise', title: 'a cup / a glass / a bottle / a can', bank: ['cup', 'glass', 'bottle', 'can'], cols: 2, items: [
      { q: 'a ___ of coffee', a: 'cup' }, { q: 'a ___ of water', a: 'glass' }, { q: 'a ___ of juice', a: 'bottle' }, { q: 'a ___ of soda', a: 'can' },
    ] },
    { t: 'exercise', title: 'Transport - this / that / these / those', cols: 1, items: [
      { q: 'I go to work ___ bus.', a: 'by' }, { q: 'I go to school ___ foot.', a: 'on' },
      { q: '___ is my car. (قريبة، واحدة)', a: 'This' }, { q: '___ are my keys. (قريبة، عدّة)', a: 'These' },
    ] },
    { t: 'bar', title: 'About you - عنك' },
    { t: 'answers', items: ["What's your favourite food?", "What's your favourite drink?", 'How do you go to work?'] },
  ] } },
  { after: 19, lesson: { n: 204, tag: 'Review 4', titleAr: 'مراجعة الدروس 16–19', titleEn: 'Review: lessons 16–19', blocks: [
    { t: 'banner', title: 'Review 4 - مراجعة الدروس 16 – 19', icons: ['✅', '🏆'] },
    { t: 'exercise', title: 'In town - في المدينة', bank: ['pharmacy', 'bakery', 'bank', 'hospital'], cols: 1, items: [
      { q: 'I buy bread at the ___.', a: 'bakery' }, { q: 'I buy medicine at the ___.', a: 'pharmacy' },
      { q: 'I get money at the ___.', a: 'bank' }, { q: 'A doctor works at the ___.', a: 'hospital' },
    ] },
    { t: 'exercise', title: 'There is / There are', cols: 1, items: [
      { q: 'There ___ a park near my house.', a: 'is' }, { q: 'There ___ two cafés on my street.', a: 'are' },
      { q: 'There ___ a cinema in my village. (✗)', a: "isn't" }, { q: '___ there a bus stop near you? — Yes, there is.', a: 'Is' },
    ] },
    { t: 'exercise', title: "can / can't", cols: 1, items: [
      { q: 'I ___ swim. ✓', a: 'can' }, { q: 'I ___ drive. ✗', a: "can't" }, { q: '___ you speak English? — Yes, I can.', a: 'Can' },
    ] },
    { t: 'exercise', title: 'like + -ing', cols: 2, items: [
      { q: 'I like ___ (read).', a: 'reading' }, { q: 'I like ___ (swim).', a: 'swimming' },
      { q: 'I like ___ (cook).', a: 'cooking' }, { q: "I don't like ___ (run).", a: 'running' },
    ] },
    { t: 'bar', title: 'About you - عنك' },
    { t: 'answers', items: ['Is there a park near your house?', 'Can you swim?', 'What do you like doing in your free time?'] },
  ] } },
]
