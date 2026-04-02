/* ─────────────────────────────────────────────────────────────
   Article data — 15 rich articles for the Inglizi.com blog.
   Content blocks are rendered by the [slug] page.
───────────────────────────────────────────────────────────── */

export type BlockType =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'tip'; text: string; label?: string }
  | { type: 'highlight'; text: string }
  | { type: 'divider' }

export interface Article {
  id: number
  slug: string
  title: string
  excerpt: string
  content: BlockType[]
  category: string
  categoryColor: string
  tags: string[]
  readTime: string
  date: string
  img: string
  featured: boolean
  author: string
}

export const categories = [
  { label: 'الكل',            color: 'bg-gray-100 text-gray-700' },
  { label: 'نصائح التعلم',    color: 'bg-blue-100 text-blue-700' },
  { label: 'النطق والكلام',   color: 'bg-green-100 text-green-700' },
  { label: 'أخطاء شائعة',    color: 'bg-red-100 text-red-700' },
  { label: 'تحفيز وثقة',     color: 'bg-yellow-100 text-yellow-700' },
  { label: 'إنجليزية العمل',  color: 'bg-purple-100 text-purple-700' },
]

export const articles: Article[] = [
  /* ── 1 ── */
  {
    id: 1,
    slug: 'how-to-learn-english-fast',
    title: '7 أسرار تجعلك تتعلم الإنجليزية بسرعة مذهلة',
    excerpt: 'هل تتساءل لماذا بعض الناس يتعلمون الإنجليزية بسرعة بينما يظل آخرون في مكانهم لسنوات؟ الفرق ليس في الذكاء — بل في الطريقة.',
    category: 'نصائح التعلم',
    categoryColor: 'bg-blue-100 text-blue-700',
    tags: ['تعلم الإنجليزية', 'نصائح', 'مبتدئ'],
    readTime: '6',
    date: '15 مارس 2025',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=85',
    featured: true,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'كثير من الناس يقضون سنوات في دراسة الإنجليزية دون تحقيق نتائج حقيقية. السبب ليس قلة الذكاء أو الجهد — بل الطريقة الخاطئة. في هذا المقال، أشارك معك الأسرار السبعة التي غيّرت مسيرة آلاف طلابي.' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', alt: 'طالب يدرس بتركيز', caption: 'الطريقة الصحيحة تجعل كل دقيقة تحمل نتيجة' },
      { type: 'heading', text: 'السر الأول: تكلم من اليوم الأول', level: 2 },
      { type: 'paragraph', text: 'الخطأ الأكبر الذي يرتكبه المتعلمون هو انتظار "الاستعداد" قبل الكلام. الحقيقة أنك لن تكون مستعداً أبداً بهذه الطريقة. ابدأ بكلمة، ثم جملة، ثم حوار — من أول يوم.' },
      { type: 'quote', text: 'الكلام هو الذي يجعلك تتعلم الكلام. لا شيء آخر.', author: 'حمزة القصراوي' },
      { type: 'heading', text: 'السر الثاني: الاستماع المكثف', level: 2 },
      { type: 'paragraph', text: 'استمع لمحتوى إنجليزي يومياً — أغاني، بودكاست، أفلام. دماغك يمتص الأنماط اللغوية تدريجياً حتى بدون أن تشعر. الهدف ليس الفهم الكامل في البداية.' },
      { type: 'tip', text: 'استمع لنفس المقطع 3 مرات: مرة بدون ترجمة، مرة مع الترجمة، ومرة بدونها مجدداً.', label: '💡 نصيحة عملية' },
      { type: 'heading', text: 'السر الثالث: الجمل بدلاً من الكلمات', level: 2 },
      { type: 'paragraph', text: 'بدلاً من حفظ قوائم كلمات، احفظ جملاً كاملة. "I am really excited about this" أفضل بكثير من حفظ كلمة "excited" وحدها.' },
      { type: 'list', items: ['احفظ 3 جمل جديدة كل يوم', 'استخدمها في سياق حقيقي', 'كررها بصوت عالٍ 5 مرات', 'اكتبها في دفتر خاص'] },
      { type: 'heading', text: 'السر الرابع: التكرار الذكي', level: 2 },
      { type: 'paragraph', text: 'علم النفس أثبت أن الذاكرة تحتاج إلى تكرار منتظم. راجع ما تعلمته بعد يوم، ثم بعد أسبوع، ثم بعد شهر. هذا يثبّت المعلومات في ذاكرتك طويلة المدى.' },
      { type: 'heading', text: 'السر الخامس: شريك المحادثة', level: 2 },
      { type: 'paragraph', text: 'مجرد وجود شخص تتكلم معه بالإنجليزية يضاعف سرعة تقدمك. ابحث عن مجموعات تعلم، أو تدرب مع زميل، أو انضم إلى مجتمعات إنجليزية على الإنترنت.' },
      { type: 'heading', text: 'السر السادس: اجعلها ممتعة', level: 2 },
      { type: 'paragraph', text: 'تعلم من خلال ما تحب: إذا كنت تحب الرياضة، تابع تعليقات المباريات بالإنجليزية. إذا كنت تحب الطبخ، شاهد برامج الطبخ. إذا كنت تحب التكنولوجيا، اقرأ المقالات التقنية.' },
      { type: 'heading', text: 'السر السابع: الثبات لا الكمال', level: 2 },
      { type: 'paragraph', text: '20 دقيقة يومياً أفضل بكثير من 3 ساعات مرة في الأسبوع. الدماغ البشري يتعلم من التكرار المنتظم. لا تبحث عن الكمال — ابحث عن التقدم المستمر.' },
      { type: 'highlight', text: 'الخلاصة: غيّر طريقتك، وليس جهدك. طبّق هذه الأسرار السبعة لمدة شهر واحد وستندهش من النتائج.' },
    ],
  },

  /* ── 2 ── */
  {
    id: 2,
    slug: 'common-arabic-english-mistakes',
    title: '10 أخطاء شائعة يرتكبها العرب عند تعلم الإنجليزية',
    excerpt: 'هناك أخطاء نكررها جميعاً بدون أن ندرك. تعرّف عليها الآن وتجنّبها لتسريع تقدمك بشكل ملحوظ.',
    category: 'أخطاء شائعة',
    categoryColor: 'bg-red-100 text-red-700',
    tags: ['أخطاء', 'مبتدئ', 'قواعد'],
    readTime: '7',
    date: '8 مارس 2025',
    img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'بعد سنوات من تدريس الإنجليزية للناطقين بالعربية، لاحظت نفس الأخطاء تتكرر مراراً. هذه الأخطاء ليست بسبب قلة الذكاء — بل بسبب تأثير اللغة العربية على طريقة التفكير.' },
      { type: 'heading', text: 'الخطأ الأول: الترجمة الحرفية', level: 2 },
      { type: 'paragraph', text: 'مثلاً نقول "I am agree" ترجمة لـ"أنا موافق"، لكن الصحيح هو "I agree" بدون "am". كذلك نقول "I am tired from work" بدلاً من "I am tired of work".' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80', alt: 'شخص يدرس الفرق بين اللغتين', caption: 'الفهم العميق يمنع الترجمة الحرفية' },
      { type: 'heading', text: 'الخطأ الثاني: إهمال الفاعل', level: 2 },
      { type: 'paragraph', text: 'في العربية نقول "ذهبت إلى المدرسة" دون ذكر الفاعل. لكن في الإنجليزية الفاعل ضروري دائماً: "I went to school". الجملة بدون فاعل خاطئة.' },
      { type: 'quote', text: 'الإنجليزية لغة الفاعل. لا جملة بدون Subject.' },
      { type: 'heading', text: 'الخطأ الثالث: نطق حرف P', level: 2 },
      { type: 'paragraph', text: 'العرب يميلون لنطق P مثل B. فيقولون "baper" بدلاً من "paper". هذا الخطأ يؤثر على الوضوح. الحل: ضع يدك أمام فمك — يجب أن تحس بنفس الهواء عند نطق P.' },
      { type: 'tip', text: 'تدرب: pen/ben, park/bark, pat/bat — لاحظ الفرق في الهواء المنطلق.', label: '🎯 تمرين نطق' },
      { type: 'heading', text: 'الخطأ الرابع: نسيان S في المفرد الغائب', level: 2 },
      { type: 'paragraph', text: 'كثيراً ما نسمع "He go to work every day" بدلاً من "He goes to work every day". إضافة S للفعل مع he/she/it في المضارع البسيط أمر جوهري.' },
      { type: 'list', items: ['He go ❌ → He goes ✓', 'She like ❌ → She likes ✓', 'It work ❌ → It works ✓'] },
      { type: 'heading', text: 'الأخطاء 5-10 بإيجاز', level: 2 },
      { type: 'list', items: [
        'الخلط بين since وfor',
        'استخدام make وdo بشكل خاطئ',
        'نسيان ال the في المواضع الصحيحة',
        'قول "I want to tell you something" بدلاً من "I want to say something to you"',
        'نسيان الفاصلة الزمنية: "Since 2 years" بدلاً من "For 2 years"',
        'استخدام "nervous" كاسم بدلاً من "nerve"',
      ]},
      { type: 'highlight', text: 'معرفة هذه الأخطاء هي الخطوة الأولى لتجنبها. راجعها باستمرار حتى يصبح الصحيح طبيعياً.' },
    ],
  },

  /* ── 3 ── */
  {
    id: 3,
    slug: 'speak-without-fear',
    title: 'كيف تتكلم الإنجليزية بدون خوف أو حرج؟',
    excerpt: 'الخوف من الكلام هو أكبر عائق يواجهه المتعلمون. في هذا المقال نشرح أسباب هذا الخوف وكيف تتخلص منه نهائياً.',
    category: 'تحفيز وثقة',
    categoryColor: 'bg-yellow-100 text-yellow-700',
    tags: ['خوف', 'ثقة', 'كلام'],
    readTime: '7',
    date: '1 مارس 2025',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'قابلت آلاف الطلاب الذين يعرفون الإنجليزية جيداً لكنهم لا يستطيعون فتح أفواههم عند الحاجة. المشكلة ليست في اللغة — بل في الرأس.' },
      { type: 'quote', text: 'لا تخف من الخطأ، فهو طريق التعلم. كل محترف كان يوماً مبتدئاً يرتكب أخطاء.', author: 'حمزة القصراوي' },
      { type: 'heading', text: 'لماذا نخاف من الكلام؟', level: 2 },
      { type: 'paragraph', text: 'الخوف يأتي من عدة مصادر: الخوف من الحكم عليك، الخوف من ارتكاب الأخطاء، ومقارنة نفسك بالناطقين الأصليين. هذه مخاوف طبيعية جداً.' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', alt: 'شخص يتحدث بثقة', caption: 'الثقة تُبنى تدريجياً، خطوة خطوة' },
      { type: 'heading', text: 'الحل الأول: أعد تعريف النجاح', level: 2 },
      { type: 'paragraph', text: 'النجاح ليس الكلام بدون أخطاء. النجاح هو إيصال رسالتك للمستمع. حتى لو أخطأت في الزمن أو النحو — إذا فهم الشخص ما تريد قوله، فأنت ناجح.' },
      { type: 'heading', text: 'الحل الثاني: ابدأ بالبيئات الآمنة', level: 2 },
      { type: 'list', items: ['تحدث مع نفسك أمام المرآة', 'سجّل صوتك وراجعه', 'تحدث مع مجموعات تعلم صغيرة', 'استخدم تطبيقات المحادثة مع الذكاء الاصطناعي'] },
      { type: 'tip', text: 'ابدأ بجمل قصيرة جداً. "Hello, how are you?" كافية لبناء الثقة في البداية.', label: '🛡️ نقطة أمان' },
      { type: 'heading', text: 'الحل الثالث: احتفل بكل كلمة', level: 2 },
      { type: 'paragraph', text: 'كل مرة تنطق فيها كلمة إنجليزية صحيحة هي إنجاز. ركّز على التقدم لا على الكمال. وثّق تقدمك وستفاجأ بالفرق بعد شهر واحد.' },
      { type: 'highlight', text: 'الخوف لا يختفي بالانتظار — يختفي بالفعل. خذ خطوة واحدة اليوم، وغداً ستكون أسهل.' },
    ],
  },

  /* ── 4 ── */
  {
    id: 4,
    slug: 'daily-english-routine',
    title: 'روتين يومي من 20 دقيقة لتحسين إنجليزيتك',
    excerpt: 'لا تحتاج ساعات طويلة. فقط 20 دقيقة يومياً بالطريقة الصحيحة تحدث فرقاً هائلاً خلال شهر.',
    category: 'نصائح التعلم',
    categoryColor: 'bg-blue-100 text-blue-700',
    tags: ['روتين', 'يومي', 'وقت قليل'],
    readTime: '5',
    date: '22 فبراير 2025',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'أكثر عذر يسمعه المدربون هو "لا وقت لديّ". لكن الحقيقة أن 20 دقيقة يومياً — وهي أقل من حلقة واحدة من مسلسلك المفضل — كافية لتحقيق تقدم ملحوظ.' },
      { type: 'heading', text: 'الروتين اليومي المثالي', level: 2 },
      { type: 'image', src: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80', alt: 'شخص يدرس بجدول زمني', caption: 'التنظيم هو السر' },
      { type: 'list', ordered: true, items: [
        'الدقائق 1-5: استمع لحوار قصير وأعد مقاطع لم تفهمها',
        'الدقائق 6-10: تعلم 3 كلمات جديدة مع جملة كاملة لكل منها',
        'الدقائق 11-15: كرر بصوت عالٍ — النطق يحتاج ممارسة',
        'الدقائق 16-20: اكتب 3 جمل عن يومك بالإنجليزية',
      ]},
      { type: 'quote', text: 'الاتساق أهم من الكمية. 20 دقيقة كل يوم تساوي 100 ساعة في السنة.' },
      { type: 'heading', text: 'أدوات تساعدك', level: 2 },
      { type: 'list', items: ['Anki للمفردات', 'BBC Learning English للاستماع', 'HelloTalk لممارسة الكلام', 'دفتر ملاحظات للكتابة اليومية'] },
      { type: 'tip', text: 'ضع تذكيراً في هاتفك في نفس الوقت كل يوم. الروتين يصبح عادة بعد 21 يوماً.', label: '⏰ تذكير مهم' },
      { type: 'highlight', text: 'ابدأ الأسبوع القادم وسترى الفرق. اتبع هذا الروتين لـ30 يوماً وأخبرنا بالنتيجة!' },
    ],
  },

  /* ── 5 ── */
  {
    id: 5,
    slug: 'pronunciation-tips',
    title: 'أهم 5 تقنيات لتحسين نطقك في الإنجليزية',
    excerpt: 'النطق الجيد يجعلك أكثر وضوحاً وثقة. إليك أقوى التقنيات التي يستخدمها المحترفون.',
    category: 'النطق والكلام',
    categoryColor: 'bg-green-100 text-green-700',
    tags: ['نطق', 'pronunciation', 'تحدث'],
    readTime: '8',
    date: '15 فبراير 2025',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'يمكنك معرفة ألف كلمة إنجليزية ولكن إذا لم تنطقها بشكل صحيح، لن يفهمك أحد. النطق هو الجسر بين المعرفة والتواصل الفعلي.' },
      { type: 'heading', text: 'التقنية الأولى: Shadowing', level: 2 },
      { type: 'paragraph', text: 'هذه التقنية الأقوى على الإطلاق. استمع لجملة من ناطق أصلي، ثم كررها فوراً بنفس الإيقاع والتنغيم والسرعة. حاكي لا تترجم.' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=800&q=80', alt: 'تمرين نطق', caption: 'تمرين الـ Shadowing يحسن النطق بسرعة ملحوظة' },
      { type: 'quote', text: 'اسمع الصوت، قلّده، ثم اجعله صوتك أنت.' },
      { type: 'heading', text: 'التقنية الثانية: تسجيل الصوت', level: 2 },
      { type: 'paragraph', text: 'كثيرون لا يعرفون كيف يبدو صوتهم حقاً. سجّل نفسك وهي تقرأ فقرة، ثم قارنها بنفس الفقرة من ناطق أصلي. ستكتشف نقاط ضعف لم تكن تعلمها.' },
      { type: 'heading', text: 'التقنية الثالثة: التركيز على الأصوات الصعبة', level: 2 },
      { type: 'list', items: [
        'P vs B: "pen" vs "ben" — الـ P تطلق هواء، الـ B لا',
        'V vs B: "vote" vs "boat" — الـ V تحتاج احتكاك بين الأسنان والشفة',
        'TH: "this" و "think" — اللسان يلمس الأسنان',
        'Short vowels: "sit" vs "seat", "bit" vs "beat"',
      ]},
      { type: 'tip', text: 'ضع يدك أمام فمك. عند نطق P و T تشعر بنفس الهواء، عند B و D لا.', label: '🔬 تجربة علمية' },
      { type: 'heading', text: 'التقنية الرابعة: التنغيم والإيقاع', level: 2 },
      { type: 'paragraph', text: 'الإنجليزية لغة موسيقية. الكلمات المهمة تُنطق بصوت أعلى وأطول. الجمل التقريرية تنتهي بصوت هابط، والأسئلة بصوت صاعد.' },
      { type: 'heading', text: 'التقنية الخامسة: البطء أولاً', level: 2 },
      { type: 'paragraph', text: 'انطق كل كلمة ببطء مبالغ فيه أولاً. تأكد من كل صوت. ثم زد السرعة تدريجياً. الدقة ثم السرعة، لا العكس.' },
      { type: 'highlight', text: 'طبّق هذه التقنيات الخمس لمدة أسبوعين فقط وستلاحظ فرقاً واضحاً في نطقك.' },
    ],
  },

  /* ── 6 ── */
  {
    id: 6,
    slug: 'english-for-work',
    title: 'الإنجليزية في بيئة العمل: كل ما تحتاج معرفته',
    excerpt: 'تعلّم أهم العبارات والمصطلحات المهنية التي ستجعلك أكثر احترافاً في بيئة العمل.',
    category: 'إنجليزية العمل',
    categoryColor: 'bg-purple-100 text-purple-700',
    tags: ['عمل', 'مهني', 'مقابلات'],
    readTime: '9',
    date: '8 فبراير 2025',
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'الإنجليزية في بيئة العمل لها قواعد وعبارات خاصة تختلف عن اللغة اليومية. إتقانها يميزك عن غيرك ويفتح أبواباً لفرص دولية.' },
      { type: 'heading', text: 'في الاجتماعات', level: 2 },
      { type: 'list', items: [
        '"Could you clarify that point?" — هل يمكنك توضيح هذه النقطة؟',
        '"I completely agree with your suggestion." — أوافق تماماً على اقتراحك',
        '"Let me summarize what we discussed." — دعني ألخص ما ناقشناه',
        '"I have a question regarding..." — لديّ سؤال بخصوص...',
        '"Could we schedule a follow-up?" — هل يمكننا تحديد موعد لمتابعة؟',
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&q=80', alt: 'اجتماع عمل', caption: 'الإنجليزية المهنية تفتح أبواباً للفرص الدولية' },
      { type: 'heading', text: 'في البريد الإلكتروني', level: 2 },
      { type: 'list', items: [
        '"I hope this email finds you well." — أتمنى أن تكون بخير',
        '"Please find attached the document..." — يرجى الاطلاع على المرفق...',
        '"I am writing to inquire about..." — أكتب للاستفسار عن...',
        '"Looking forward to your reply." — أتطلع لردك',
        '"Best regards / Kind regards" — مع أطيب التحيات',
      ]},
      { type: 'quote', text: 'في عالم الأعمال الدولي، الإنجليزية ليست ميزة — هي ضرورة.' },
      { type: 'heading', text: 'في المقابلات الوظيفية', level: 2 },
      { type: 'list', items: [
        '"I am a detail-oriented person." — أنا شخص دقيق في التفاصيل',
        '"My greatest strength is..." — أكبر نقطة قوة لديّ هي...',
        '"I see this as an opportunity to grow." — أرى هذا فرصة للنمو',
        '"I am passionate about..." — أنا متحمس جداً لـ...',
      ]},
      { type: 'tip', text: 'حضّر 10 عبارات جاهزة لكل موقف مهني. لا تحتاج إبداع — فقط استخدم العبارات الجاهزة بثقة.', label: '💼 نصيحة مهنية' },
      { type: 'highlight', text: 'ابدأ اليوم بحفظ 3 عبارات من كل قسم. بعد أسبوع ستكون مستعداً لأي موقف مهني بالإنجليزية.' },
    ],
  },

  /* ── 7 ── */
  {
    id: 7,
    slug: 'memorize-vocabulary-fast',
    title: 'كيف تحفظ الكلمات الإنجليزية ولا تنساها أبداً',
    excerpt: 'هناك طرق علمية لحفظ المفردات تجعل دماغك يتذكرها طويلاً. تعرف عليها.',
    category: 'نصائح التعلم',
    categoryColor: 'bg-blue-100 text-blue-700',
    tags: ['مفردات', 'حفظ', 'تقنيات'],
    readTime: '6',
    date: '1 فبراير 2025',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'قوائم المفردات الطويلة؟ ننسى 90% منها بعد يوم واحد. الحل ليس الحفظ الأعمى — بل تقنيات علمية تخدع دماغك لتتذكر أكثر.' },
      { type: 'heading', text: 'التقنية الأولى: الارتباط العاطفي', level: 2 },
      { type: 'paragraph', text: 'الدماغ يتذكر المشاعر أكثر من المعلومات الجافة. عندما تتعلم كلمة جديدة، ربطها بموقف أو شعور معين. كلمة "embarrassed" ستتذكرها أكثر إذا ربطتها بموقف محرج حصل معك.' },
      { type: 'quote', text: 'دماغك يتذكر القصص، لا القوائم.' },
      { type: 'heading', text: 'التقنية الثانية: التعلم السياقي', level: 2 },
      { type: 'paragraph', text: 'لا تحفظ "exhausted = متعب جداً". احفظ "I am exhausted after a long day at work." الجملة تعطيك السياق والمعنى والاستخدام في آن واحد.' },
      { type: 'heading', text: 'التقنية الثالثة: بطاقات Spaced Repetition', level: 2 },
      { type: 'paragraph', text: 'تطبيق Anki يعتمد على هذا المبدأ العلمي: يكرر الكلمات التي تنساها أكثر، والكلمات التي تتذكرها أقل. النتيجة: حفظ أكثر بوقت أقل.' },
      { type: 'tip', text: 'استهدف 10-15 كلمة جديدة يومياً فقط. الكمية الكبيرة تقتل الدافعية ولا تنجح.', label: '📊 رقم مثالي' },
      { type: 'heading', text: 'التقنية الرابعة: الاستخدام الفوري', level: 2 },
      { type: 'paragraph', text: 'استخدم الكلمة الجديدة في 3 جمل مختلفة خلال أول 24 ساعة من تعلمها. هذا يثبتها في ذاكرتك طويلة المدى.' },
      { type: 'highlight', text: 'الهدف ليس معرفة أكبر عدد من الكلمات — بل استخدام ما تعرفه بثقة وطلاقة.' },
    ],
  },

  /* ── 8 ── */
  {
    id: 8,
    slug: 'think-in-english',
    title: 'كيف تبدأ التفكير بالإنجليزية بدون ترجمة',
    excerpt: 'التفكير المباشر بالإنجليزية هو المستوى الذي يجعلك طليقاً حقاً. هذا هو كيف تصله.',
    category: 'النطق والكلام',
    categoryColor: 'bg-green-100 text-green-700',
    tags: ['طلاقة', 'تفكير', 'متقدم'],
    readTime: '7',
    date: '25 يناير 2025',
    img: 'https://images.unsplash.com/photo-1495563381401-ecf95721b73e?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'طالما أنت تترجم في ذهنك من العربية للإنجليزية، ستكون دائماً بطيئاً في الكلام. الهدف النهائي هو أن تفكر مباشرة بالإنجليزية.' },
      { type: 'heading', text: 'لماذا الترجمة تبطئك؟', level: 2 },
      { type: 'paragraph', text: 'الترجمة عملية تستهلك وقتاً وطاقة ذهنية. عندما تتكلم مع شخص، دماغك مشغول بالترجمة بدلاً من التواصل الحقيقي. هذا يسبب التردد والأخطاء.' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1541516160071-4bb0c5af65ba?w=800&q=80', alt: 'شخص يفكر بالإنجليزية', caption: 'التفكير المباشر يعني التواصل بلا حواجز' },
      { type: 'heading', text: 'خطوة 1: فكّر بكلمات مفردة', level: 2 },
      { type: 'paragraph', text: 'ابدأ بتسمية الأشياء من حولك بالإنجليزية في ذهنك. "table, chair, window, coffee" — هذا التمرين يربط العقل مباشرة باللغة بدون وسيط.' },
      { type: 'heading', text: 'خطوة 2: حدّث نفسك بالإنجليزية', level: 2 },
      { type: 'paragraph', text: 'عندما تقوم بأي نشاط يومي، صف ما تفعله بالإنجليزية في ذهنك. "I am making coffee. I need to add sugar. Now I will go to work." هذه تمارين قوية جداً.' },
      { type: 'quote', text: 'المرحلة التي تنتظرها — التفكير بالإنجليزية — تبدأ حين تتوقف عن الترجمة وتبدأ في التجربة.' },
      { type: 'tip', text: 'خصص 5 دقائق يومياً تُحدّث فيها نفسك بالإنجليزية. في الحمام، أثناء الطبخ، في السيارة.', label: '🧠 تمرين ذهني' },
      { type: 'highlight', text: 'الطلاقة الحقيقية لا تأتي بالحفظ — تأتي حين تبدأ عقلك بالإنجليزية.' },
    ],
  },

  /* ── 9 ── */
  {
    id: 9,
    slug: 'british-vs-american-english',
    title: 'الفرق بين الإنجليزية البريطانية والأمريكية',
    excerpt: 'أيهما يجب أن تتعلم؟ وما هي أبرز الفروقات في النطق والمفردات؟',
    category: 'نصائح التعلم',
    categoryColor: 'bg-blue-100 text-blue-700',
    tags: ['بريطانية', 'أمريكية', 'مقارنة'],
    readTime: '5',
    date: '18 يناير 2025',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'سؤال كلاسيكي: هل أتعلم الإنجليزية البريطانية أم الأمريكية؟ الجواب يعتمد على هدفك، لكن من المهم معرفة الفروقات الأساسية بينهما.' },
      { type: 'heading', text: 'الفروقات في المفردات', level: 2 },
      { type: 'list', items: [
        'سيارة: Car (أمريكي) = Car, Automobile (بريطاني)',
        'تاكسي: Cab (أمريكي) = Taxi (بريطاني)',
        'مصعد: Elevator (أمريكي) = Lift (بريطاني)',
        'سكن طلابي: Dorm (أمريكي) = Hall of residence (بريطاني)',
        'بطاطس مقلية: Fries (أمريكي) = Chips (بريطاني)',
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', alt: 'بريطانيا وأمريكا', caption: 'لغة واحدة، لكنثتين مختلفتين' },
      { type: 'heading', text: 'الفروقات في النطق', level: 2 },
      { type: 'list', items: [
        'حرف R: الأمريكي ينطقه بقوة، البريطاني أحياناً لا ينطقه',
        'كلمة "water": الأمريكي "wader"، البريطاني "waw-ter"',
        'كلمة "dance": الأمريكي بالـ a القصير، البريطاني بالـ a الطويل',
      ]},
      { type: 'quote', text: 'تعلم الاثنتين وكن مرناً. الأهم أن تُفهم وتفهم.' },
      { type: 'tip', text: 'اختر أحدهما لتبدأ به، لكن تعرف على فروقات الأخرى حتى لا تتفاجأ.', label: '🎯 نصيحة عملية' },
      { type: 'highlight', text: 'كلا اللهجتين صحيحتان ومقبولتان في أي مكان. اختر ما تسمعه أكثر في محتواك المفضل.' },
    ],
  },

  /* ── 10 ── */
  {
    id: 10,
    slug: 'learn-english-for-free',
    title: 'كيف تتعلم الإنجليزية مجاناً بالكامل في 2025',
    excerpt: 'ليس عليك إنفاق أي مال لتعلم الإنجليزية. إليك أفضل الموارد المجانية المتاحة الآن.',
    category: 'نصائح التعلم',
    categoryColor: 'bg-blue-100 text-blue-700',
    tags: ['مجاني', 'موارد', 'تطبيقات'],
    readTime: '6',
    date: '10 يناير 2025',
    img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'لا تحتاج إلى إنفاق آلاف الدراهم على كتب ومعاهد. الإنترنت يقدم موارد مجانية رائعة — كل ما تحتاجه هو المعرفة بها والانضباط في استخدامها.' },
      { type: 'heading', text: 'أفضل المنصات المجانية', level: 2 },
      { type: 'list', items: [
        'BBC Learning English — محتوى يومي عالي الجودة',
        'Duolingo — للمبتدئين: ممتع وفعال',
        'YouTube — آلاف الدروس المجانية',
        'Anki — بطاقات ذاكرة احترافية مجاناً',
        'HelloTalk — تواصل مع ناطقين أصليين',
        'Elllo.org — اختبارات استماع مجانية',
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80', alt: 'تعلم مجاني عبر الإنترنت', caption: 'الإنترنت هو أكبر مدرسة مجانية في التاريخ' },
      { type: 'heading', text: 'خطة تعلم مجانية مدتها شهر', level: 2 },
      { type: 'list', ordered: true, items: [
        'الأسبوع 1: Duolingo 15 دقيقة + BBC مقطع واحد',
        'الأسبوع 2: أضف Anki 10 كلمات يومياً',
        'الأسبوع 3: أضف HelloTalk محادثة يومية قصيرة',
        'الأسبوع 4: فيلم أو مسلسل يومياً مع الترجمة',
      ]},
      { type: 'quote', text: 'المال لا يشتري الإرادة. والإرادة وحدها كافية للتعلم.' },
      { type: 'highlight', text: 'المال لا يشتري الإرادة. ابدأ اليوم بأحد هذه الموارد المجانية.' },
    ],
  },

  /* ── 11 ── */
  {
    id: 11,
    slug: 'english-for-travel',
    title: 'الإنجليزية للسفر: 50 جملة تنقذك في أي مطار أو فندق',
    excerpt: 'سافر بثقة وتواصل في أي بلد باستخدام هذه الجمل الأساسية.',
    category: 'نصائح التعلم',
    categoryColor: 'bg-blue-100 text-blue-700',
    tags: ['سفر', 'جمل', 'عملي'],
    readTime: '8',
    date: '3 يناير 2025',
    img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'لا تحتاج إلى إتقان الإنجليزية كاملاً لتسافر براحة. مجموعة صغيرة من الجمل الصحيحة في الوقت الصحيح تكفي لجعل رحلتك سلسة.' },
      { type: 'heading', text: 'في المطار', level: 2 },
      { type: 'list', items: [
        '"Where is gate 12 please?" — أين البوابة 12 من فضلك؟',
        '"I would like a window seat." — أريد مقعداً بجانب النافذة',
        '"How long is the flight?" — كم مدة الرحلة؟',
        '"My luggage is lost." — أمتعتي ضاعت',
        '"I need to declare this." — أحتاج الإفصاح عن هذا',
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80', alt: 'مطار', caption: 'بضع جمل بسيطة تجعل تجربة المطار أسهل بكثير' },
      { type: 'heading', text: 'في الفندق', level: 2 },
      { type: 'list', items: [
        '"I have a reservation under [name]." — لديّ حجز باسم...',
        '"Can I check in early?" — هل يمكنني الوصول مبكراً؟',
        '"Could I have a quiet room?" — هل يمكنني الحصول على غرفة هادئة؟',
        '"There is a problem with my room." — يوجد مشكلة في غرفتي',
        '"What time is breakfast?" — في أي وقت الإفطار؟',
      ]},
      { type: 'heading', text: 'في المطعم', level: 2 },
      { type: 'list', items: [
        '"Do you have a table for two?" — هل لديكم طاولة لشخصين؟',
        '"I am allergic to..." — لديّ حساسية من...',
        '"Could I have the bill please?" — هل يمكنني الحصول على الفاتورة؟',
        '"This is delicious!" — هذا لذيذ جداً!',
      ]},
      { type: 'tip', text: 'احفظ هذه الجمل قبل رحلتك واكتبها في ورقة صغيرة. بعد رحلتين ستصبح طبيعية تماماً.', label: '✈️ نصيحة المسافر' },
      { type: 'highlight', text: 'السفر هو أفضل معلم للإنجليزية. خطط لرحلتك وتحدث بثقة.' },
    ],
  },

  /* ── 12 ── */
  {
    id: 12,
    slug: 'build-5-minute-conversation',
    title: 'كيف تبني محادثة كاملة من 5 دقائق بالإنجليزية',
    excerpt: 'المحادثة الإنجليزية لها هيكل. تعلّمه وستتكلم براحة في أي موقف.',
    category: 'النطق والكلام',
    categoryColor: 'bg-green-100 text-green-700',
    tags: ['محادثة', 'هيكل', 'تواصل'],
    readTime: '6',
    date: '27 ديسمبر 2024',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'كثير من الناس يتعثرون في المحادثة لأنهم لا يعرفون كيف يبدأونها أو يستمرون فيها. في الواقع، المحادثة الطبيعية لها هيكل يمكن تعلمه.' },
      { type: 'heading', text: 'هيكل المحادثة الناجحة', level: 2 },
      { type: 'list', ordered: true, items: [
        'الافتتاح: التحية والتعارف (30 ثانية)',
        'كاسر الجليد: سؤال بسيط عن الحال أو الطقس (1 دقيقة)',
        'الموضوع الرئيسي: اسأل عن عملهم، هواياتهم (2 دقيقة)',
        'التعمق: اسأل عن تفاصيل ما ذكروه (1 دقيقة)',
        'الختام: "It was nice talking to you!" (30 ثانية)',
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', alt: 'محادثة مريحة', caption: 'المحادثة الطبيعية لها إيقاع وهيكل' },
      { type: 'quote', text: 'المحادثة ليست أداءً — هي تبادل حقيقي. ركّز على الاستماع قدر ما تركز على الكلام.' },
      { type: 'heading', text: 'أسئلة كاسرة الجليد', level: 2 },
      { type: 'list', items: [
        '"How has your day been?"',
        '"Have you been here before?"',
        '"What do you do for work?"',
        '"Are you from around here?"',
        '"What brings you here today?"',
      ]},
      { type: 'tip', text: 'تعلم 5 أسئلة مفتوحة عن غيب. الأسئلة المفتوحة تجعل المحادثة تستمر بشكل طبيعي.', label: '💬 سر المحادثة' },
      { type: 'highlight', text: 'الاستماع الجيد أهم من الكلام الكثير. اهتم بما يقوله الآخرون وستبني علاقات أقوى.' },
    ],
  },

  /* ── 13 ── */
  {
    id: 13,
    slug: 'success-stories',
    title: 'قصص نجاح: طلاب غيّروا حياتهم بالإنجليزية',
    excerpt: 'قصص حقيقية لأشخاص بدأوا من الصفر وأصبحوا يتكلمون الإنجليزية بطلاقة.',
    category: 'تحفيز وثقة',
    categoryColor: 'bg-yellow-100 text-yellow-700',
    tags: ['قصص', 'نجاح', 'تحفيز'],
    readTime: '8',
    date: '20 ديسمبر 2024',
    img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'لا شيء يحفز أكثر من قصص أشخاص حقيقيين مرّوا بنفس ما تمر به. هذه قصص بعض طلابي الذين غيّروا حياتهم بالإنجليزية.' },
      { type: 'heading', text: 'قصة أحمد: من الصمت إلى مدير دولي', level: 2 },
      { type: 'paragraph', text: 'أحمد كان مهندساً ممتازاً لكنه لم يستطع التعبير عن نفسه أمام الزملاء الأجانب. بعد 3 أشهر من التدريب المكثف، أصبح يقود اجتماعات دولية بكل ثقة.' },
      { type: 'quote', text: 'أكثر شيء تغيّر هو ثقتي بنفسي. الإنجليزية فتحت لي أبواباً كنت أعتقد أنها مغلقة.', author: 'أحمد — مهندس من المغرب' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80', alt: 'نجاح مهني', caption: 'الإنجليزية تفتح أبواباً لم تكن تتخيلها' },
      { type: 'heading', text: 'قصة سارة: من الخجل إلى التدريس', level: 2 },
      { type: 'paragraph', text: 'سارة كانت تخاف من الكلام حتى بالعربية في جماعات كبيرة. اليوم تدرّس الإنجليزية وتلقي محاضرات أمام مئات الأشخاص.' },
      { type: 'heading', text: 'قصة محمد: من البطالة إلى العمل الدولي', level: 2 },
      { type: 'paragraph', text: 'محمد كان يبحث عن عمل لمدة سنة دون نجاح. بعد إتقان الإنجليزية، حصل على وظيفة في شركة متعددة الجنسيات براتب ضاعف مدخوله السابق.' },
      { type: 'tip', text: 'قصتك قادمة. ابدأ اليوم والتزم لمدة 90 يوماً. ستكتب قصة نجاحك أنت.', label: '🌟 رسالة تحفيزية' },
      { type: 'highlight', text: 'كل شخص في هذه القصص بدأ من نفس المكان الذي أنت فيه الآن. الفارق الوحيد هو أنهم قرروا البدء.' },
    ],
  },

  /* ── 14 ── */
  {
    id: 14,
    slug: 'listening-skills',
    title: 'تحسين مهارة الاستماع: لماذا لا تفهم الأفلام الإنجليزية؟',
    excerpt: 'تعلمت المفردات والقواعد لكنك لا تزال لا تفهم الأفلام. المشكلة في مهارة الاستماع لا في مستواك.',
    category: 'النطق والكلام',
    categoryColor: 'bg-green-100 text-green-700',
    tags: ['استماع', 'أفلام', 'فهم'],
    readTime: '7',
    date: '13 ديسمبر 2024',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'هذه مشكلة يشكو منها أغلب متعلمي الإنجليزية: يفهمون الدروس الصوتية البطيئة، لكن حين يشاهدون فيلماً حقيقياً لا يفهمون شيئاً. السبب محدد ويمكن علاجه.' },
      { type: 'heading', text: 'لماذا يصعب فهم الأفلام؟', level: 2 },
      { type: 'list', items: [
        'الناطقون الأصليون يدمجون الكلمات (connected speech)',
        'يحذفون أصواتاً كثيرة في الكلام السريع',
        'يستخدمون مصطلحات عامية (slang) لا تُدرَّس',
        'يتكلمون بسرعة طبيعية لا بسرعة "تعليمية"',
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', alt: 'مشاهدة فيلم إنجليزي', caption: 'الأفلام معلم رائع... بعد تعلم التقنية الصحيحة' },
      { type: 'quote', text: '"Would you like to go?" تُنطق "Wouldja like to go?" في الحديث السريع.' },
      { type: 'heading', text: 'الحل: خطة من 3 مراحل', level: 2 },
      { type: 'list', ordered: true, items: [
        'المرحلة الأولى: الترجمة العربية — استمع وافهم القصة',
        'المرحلة الثانية: الترجمة الإنجليزية — ركّز على الكلمات',
        'المرحلة الثالثة: بدون ترجمة — اعتمد على الفهم الكلي',
      ]},
      { type: 'tip', text: 'ابدأ بمحتوى مصنوع للمتعلمين مثل TED-Ed أو BBC أخبار. ثم انتقل تدريجياً للمحتوى الطبيعي.', label: '📺 خطوة بخطوة' },
      { type: 'highlight', text: 'الفهم السمعي يحتاج تدريباً منفصلاً. خصص 15 دقيقة يومياً للاستماع النشط.' },
    ],
  },

  /* ── 15 ── */
  {
    id: 15,
    slug: 'motivation-to-learn',
    title: 'كيف تحافظ على دافعيتك لتعلم الإنجليزية عندما تشعر بالإحباط',
    excerpt: 'كل متعلم يمر بمرحلة الإحباط. السر ليس في عدم الشعور به — بل في كيفية التعامل معه.',
    category: 'تحفيز وثقة',
    categoryColor: 'bg-yellow-100 text-yellow-700',
    tags: ['تحفيز', 'إحباط', 'استمرارية'],
    readTime: '6',
    date: '6 ديسمبر 2024',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=85',
    featured: false,
    author: 'حمزة القصراوي',
    content: [
      { type: 'paragraph', text: 'هناك لحظة يمر بها كل متعلم: الإحساس بأن مستواه لم يتحسن، وأن كل ما تعلمه ينسى، وأن الأمر مستحيل. هذا طبيعي جداً — وله حل.' },
      { type: 'heading', text: 'ما هو "فخ الراكد"؟', level: 2 },
      { type: 'paragraph', text: 'في تعلم اللغات، هناك مرحلة تسمى "Plateau" — فترة لا يشعر فيها المتعلم بالتقدم رغم الاستمرار في الدراسة. هذه المرحلة مؤقتة وطبيعية تماماً.' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', alt: 'شخص يحافظ على دافعيته', caption: 'كل رحلة لها منعرجات — لكن الوجهة تستحق' },
      { type: 'quote', text: 'التقدم الحقيقي لا يبدو كتقدم أثناء حدوثه. يظهر فجأة في يوم لم تتوقعه.', author: 'حمزة القصراوي' },
      { type: 'heading', text: '5 طرق للخروج من فترة الركود', level: 2 },
      { type: 'list', ordered: true, items: [
        'غيّر المصدر: إذا كنت تستمع، جرب القراءة أو المحادثة',
        'راجع تقدمك: اسمع تسجيلاً قديم لك واقارنه باليوم',
        'تواصل مع طلاب آخرين في نفس المرحلة',
        'ضع هدفاً صغيراً جداً: جملة واحدة جديدة اليوم فقط',
        'تذكّر لماذا بدأت: اكتب سببك الأصلي وضعه أمامك',
      ]},
      { type: 'tip', text: 'في أصعب يوم، افعل شيئاً واحداً فقط: استمع لدقيقتين من محتوى إنجليزي. هذا يكفي.', label: '💪 الحد الأدنى' },
      { type: 'highlight', text: 'الفارق بين من يتعلم ومن لا يتعلم ليس الموهبة — بل الاستمرار في أصعب الأيام.' },
    ],
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}

export function getRelatedArticles(currentSlug: string, category: string, count = 3): Article[] {
  return articles
    .filter(a => a.slug !== currentSlug && a.category === category)
    .slice(0, count)
}

export function getRecentArticles(count = 5): Article[] {
  return articles.slice(0, count)
}
