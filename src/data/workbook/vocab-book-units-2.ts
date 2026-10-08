import { d, g, pairs, tr, v, type VocabUnit } from './vocab-book.ts'

/** Units 6–10 of the vocabulary book (see vocab-book.ts). */
export const UNITS_6_10: VocabUnit[] = [
  /* ── 6 · At the Restaurant ───────────────────────────────────────── */
  { n: 6, icon: '🍽️',
    vocab: v(
      '📅 | book a table | يحجز طاولة | I\'d like to book a table for Saturday night. | أودّ حجز طاولة لليلة السبت.',
      '🍲 | main course | الطبق الرئيسي | For the main course, I\'ll have the chicken. | كطبق رئيسي، سآخذ الدجاج.',
      '🥩 | well done | مطهوّ جيدًا | I\'d like my steak well done, please. | أريد شريحة اللحم مطهوّة جيدًا، من فضلك.',
      '🌶️ | spicy | حارّ | Is this dish very spicy? | هل هذا الطبق حارّ جدًا؟',
      '🥦 | vegetarian | نباتي | Do you have any vegetarian dishes? | هل لديكم أطباق نباتية؟',
      '🙋 | ready to order | مستعد للطلب | Are you ready to order? | هل أنتم مستعدون للطلب؟',
      '⭐ | today\'s special | طبق اليوم | What\'s today\'s special? | ما هو طبق اليوم؟',
      '🥡 | a box for the rest | علبة لما تبقّى | Can I have a box for the rest, please? | هل يمكنني الحصول على علبة لما تبقّى، من فضلك؟',
      '➗ | split the bill | نقسم الحساب | Let\'s split the bill. | لنقسم الحساب بيننا.',
      '😋 | enjoy your meal | بالهناء والشفاء | Here\'s your food. Enjoy your meal! | تفضّل طعامك. بالهناء والشفاء!',
    ),
    groups: [
      g('🍲', 'Main dishes', 'أطباق رئيسية', 'tagine=طاجين|couscous=كسكس|grilled fish=سمك مشوي|roast chicken=دجاج محمّر|kebabs=كباب (لحم مشوي)|pasta=معكرونة|pizza=بيتزا|burger=برغر|steak=شريحة لحم|seafood=مأكولات بحرية'),
      g('🍨', 'Desserts and drinks', 'الحلويات والمشروبات', 'ice cream=مثلّجات|fruit salad=سلطة فواكه|chocolate mousse=موس الشوكولاتة|crème caramel=كريم كراميل|sparkling water=ماء غازي|still water=ماء عادي|lemonade=عصير الليمون|smoothie=عصير مخفوق|soft drink=مشروب غازي|avocado juice=عصير الأفوكادو'),
      g('👅', 'Describing food', 'وصف الطعام', 'tasty=شهي|salty=مالح|sweet=حلو|sour=حامض|bitter=مُرّ|cold=بارد|raw=نيء|grilled=مشوي|fried=مقلي|homemade=منزلي'),
    ],
    talks: [
      d('Polite | مهذّب', 'Ordering a meal | طلب وجبة', 'Waiter | Mr Alami', [
        ['Good evening. Are you ready to order?', 'مساء الخير. هل أنت مستعد للطلب؟'],
        ["Yes. What's today's special?", 'نعم. ما هو طبق اليوم؟'],
        ['Lamb tagine with prunes.', 'طاجين لحم الغنم بالبرقوق.'],
        ['Sounds good. Is it spicy?', 'يبدو جيدًا. هل هو حارّ؟'],
        ["No, it's a little sweet.", 'لا، إنه حلو قليلًا.'],
        ["Perfect. I'll have that, with still water.", 'ممتاز. سآخذه، مع ماء عادي.'],
      ]),
      d('Complaint | شكوى', 'The soup is cold | الشوربة باردة', 'Leila | Waiter', [
        ['Excuse me, my soup is cold.', 'عفوًا، الشوربة باردة.'],
        ["I'm so sorry. I'll heat it up for you.", 'أنا آسف جدًا. سأسخّنها لك.'],
        ['Thank you. Could we have more bread?', 'شكرًا. هل يمكننا الحصول على مزيد من الخبز؟'],
        ['Of course. Anything else?', 'طبعًا. شيء آخر؟'],
        ['Yes, the bill after dessert, please.', 'نعم، الحساب بعد الحلوى، من فضلك.'],
        ['No problem. Enjoy your meal!', 'لا مشكلة. بالهناء والشفاء!'],
      ]),
    ],
    ask: tr([
      ['Do you have a table for four?', 'هل لديكم طاولة لأربعة أشخاص؟'],
      ["What's in this dish?", 'ماذا يوجد في هذا الطبق؟'],
      ['Can I have it without onions?', 'هل يمكنني الحصول عليه بدون بصل؟'],
      ['Is service included?', 'هل الخدمة مشمولة في السعر؟'],
    ]),
    answer: tr([
      ['Yes, follow me, please.', 'نعم، اتبعني من فضلك.'],
      ['Chicken, olives and lemon.', 'دجاج وزيتون وحامض.'],
      ['Sure, no problem.', 'بالتأكيد، لا مشكلة.'],
      ['Yes, it is.', 'نعم، إنها مشمولة.'],
    ]),
    reading: {
      icon: '🎂', title: 'A Birthday Dinner', titleAr: 'عشاء عيد ميلاد',
      text: "Last Saturday was Salma's birthday, so her husband booked a table at a small restaurant by the sea in Essaouira. They arrived at eight. The waiter gave them the menu and recommended the grilled fish. Salma ordered the fish with a salad, and her husband had a seafood tagine. The food was fresh and delicious. For dessert, the waiter brought a chocolate cake with a candle, and all the staff sang \"Happy Birthday\". Salma was very surprised. At the end, they paid the bill and left a good tip. \"It was my best birthday ever,\" Salma said.",
      gloss: pairs('by the sea=على البحر|recommended=نصح بـ|staff=العاملون|candle=شمعة|surprised=متفاجئ'),
      tf: [
        { s: 'The restaurant is in Essaouira.', ok: true },
        { s: 'Salma ordered a seafood tagine.', ok: false },
        { s: 'They left a good tip.', ok: true },
      ],
      qs: [
        { q: 'What time did they arrive?', a: 'At eight.' },
        { q: 'What did the waiter bring for dessert?', a: 'A chocolate cake with a candle.' },
      ],
    } },

  /* ── 7 · At the Supermarket ──────────────────────────────────────── */
  { n: 7, icon: '🛒',
    vocab: v(
      '📝 | shopping list | قائمة المشتريات | Don\'t forget the shopping list! | لا تنسَ قائمة المشتريات!',
      '🏷️ | on offer | عليه عرض | Rice is on offer this week. | الأرز عليه عرض هذا الأسبوع.',
      '🎁 | buy one, get one free | الثاني مجانًا | This shampoo is buy one, get one free. | هذا الشامبو: اشترِ واحدًا وخذ الثاني مجانًا.',
      '📅 | expiry date | تاريخ انتهاء الصلاحية | Check the expiry date on the milk. | تحقّق من تاريخ انتهاء صلاحية الحليب.',
      '⚖️ | weigh | يزن | You need to weigh the apples first. | يجب أن تزن التفاح أولًا.',
      '🧊 | frozen | مجمّد | Frozen food is in aisle six. | الأطعمة المجمّدة في الممر السادس.',
      '📦 | out of stock | نفد من المخزون | Sorry, this item is out of stock. | آسف، هذا المنتج نفد من المخزون.',
      '💳 | loyalty card | بطاقة الوفاء | Do you have a loyalty card? | هل لديك بطاقة الوفاء؟',
      '🧍 | queue | طابور | The queue at the checkout is long. | الطابور عند الصندوق طويل.',
      '💲 | price tag | ملصق السعر | This item has no price tag. | هذا المنتج ليس عليه ملصق السعر.',
    ),
    groups: [
      g('🥫', 'In the cupboard', 'في خزانة المطبخ', 'flour=دقيق|lentils=عدس|chickpeas=حمّص|beans=فاصوليا|tuna=تونة|tomato paste=معجون الطماطم|tea bags=أكياس الشاي|canned food=معلّبات|vinegar=خلّ|noodles=شعيرية'),
      g('🥩', 'Fresh food', 'الأطعمة الطازجة', 'meat=لحم|minced meat=لحم مفروم|chicken breast=صدر الدجاج|fish fillet=شريحة سمك|turkey=ديك رومي|prawns=قريدس (جمبري)|fresh cream=قشدة|apples=تفاح|bananas=موز|grapes=عنب'),
      g('🧴', 'Household', 'مواد منزلية', 'washing-up liquid=سائل غسل الأواني|kitchen roll=مناديل المطبخ|bin bags=أكياس القمامة|batteries=بطاريات|light bulb=مصباح كهربائي|foil=ورق الألمنيوم|cling film=غلاف بلاستيكي|matches=أعواد الثقاب|candles=شموع|air freshener=معطّر الجو'),
    ],
    talks: [
      d('Asking for help | طلب المساعدة', 'Where is it? | أين يوجد؟', 'Customer | Assistant', [
        ['Excuse me, where can I find the flour?', 'عفوًا، أين يمكنني أن أجد الدقيق؟'],
        ["It's in aisle three, next to the sugar.", 'إنه في الممر الثالث، بجانب السكر.'],
        ['Thanks. And do you have brown rice?', 'شكرًا. وهل لديكم أرز بنّي؟'],
        ["Sorry, it's out of stock today.", 'آسف، لقد نفد اليوم.'],
        ['When will you have more?', 'متى سيصلكم المزيد؟'],
        ['Tomorrow morning, I think.', 'صباح الغد، على ما أظنّ.'],
      ]),
      d('At the checkout | عند الصندوق', 'Paying | الدفع', 'Cashier | Reda', [
        ['Hello. Do you have a loyalty card?', 'مرحبًا. هل لديك بطاقة الوفاء؟'],
        ["No, I don't.", 'لا، ليست لديّ.'],
        ['Do you need a bag?', 'هل تحتاج إلى كيس؟'],
        ['Yes, two bags, please.', 'نعم، كيسين من فضلك.'],
        ["That's 186 dirhams. Cash or card?", 'المبلغ 186 درهمًا. نقدًا أم بالبطاقة؟'],
        ['Card, please. Here you are.', 'بالبطاقة، من فضلك. تفضّل.'],
      ]),
    ],
    ask: tr([
      ['Where can I find the eggs?', 'أين يمكنني أن أجد البيض؟'],
      ['Is this on offer?', 'هل على هذا عرض؟'],
      ['How much is it per kilo?', 'كم سعر الكيلو؟'],
      ['Do you deliver?', 'هل توصّلون إلى المنازل؟'],
    ]),
    answer: tr([
      ['Aisle five, on the left.', 'الممر الخامس، على اليسار.'],
      ["Yes, it's twenty percent off.", 'نعم، عليه خصم عشرين بالمئة.'],
      ['Fifteen dirhams a kilo.', 'خمسة عشر درهمًا للكيلو.'],
      ['Yes, for orders over 300 dirhams.', 'نعم، للطلبات التي تفوق 300 درهم.'],
    ]),
    reading: {
      icon: '🛒', title: 'The Big Monthly Shop', titleAr: 'التسوّق الشهري الكبير',
      text: "Once a month, the Bennani family goes to a big supermarket outside the city. Before they leave, Mrs Bennani writes a long shopping list: rice, pasta, flour, oil, tea and cleaning products. At the supermarket, her son pushes the trolley and her daughter reads the list. They always look for special offers. This month, olive oil is on offer, so they buy three bottles. Mr Bennani checks the expiry dates on the yoghurts. The queue at the checkout is long, but they are not in a hurry. After shopping, they have lunch in the food court. Shopping day is a family day!",
      gloss: pairs('outside=خارج|cleaning products=مواد التنظيف|trolley=عربة التسوّق|bottles=قنينات|food court=ركن المطاعم'),
      tf: [
        { s: 'The family goes to the supermarket every week.', ok: false },
        { s: 'Olive oil is on offer this month.', ok: true },
        { s: 'They have lunch at home after shopping.', ok: false },
      ],
      qs: [
        { q: 'Who writes the shopping list?', a: 'Mrs Bennani.' },
        { q: 'What does Mr Bennani check?', a: 'The expiry dates on the yoghurts.' },
      ],
    } },

  /* ── 8 · At the Bakery ───────────────────────────────────────────── */
  { n: 8, icon: '🥖',
    vocab: v(
      '🧑‍🍳 | baker | خبّاز | The baker starts work at four in the morning. | يبدأ الخبّاز عمله في الرابعة صباحًا.',
      '🍞 | brown bread | خبز أسمر | Do you have any brown bread? | هل لديكم خبز أسمر؟',
      '🌾 | whole wheat | القمح الكامل | I prefer whole wheat bread. | أفضّل خبز القمح الكامل.',
      '🔥 | out of the oven | خارج من الفرن | These loaves are just out of the oven. | هذه الأرغفة خرجت من الفرن للتوّ.',
      '🎂 | order a cake | يطلب كعكة | I\'d like to order a cake for Friday. | أودّ أن أطلب كعكة ليوم الجمعة.',
      '🍫 | filled with | محشوّ بـ | These croissants are filled with chocolate. | هذه الكرواسونات محشوّة بالشوكولاتة.',
      '🔪 | slice | يقطّع شرائح | Can you slice the bread, please? | هل يمكنك تقطيع الخبز شرائح، من فضلك؟',
      '🏷️ | half price | بنصف السعر | Yesterday\'s bread is half price. | خبز الأمس بنصف السعر.',
      '🧁 | sweet tooth | محبّ للحلويات | My son has a sweet tooth. | ابني يحبّ الحلويات كثيرًا.',
      '🥨 | crispy | مقرمش | I love crispy bread with soup. | أحبّ الخبز المقرمش مع الشوربة.',
    ),
    groups: [
      g('🥖', 'Breads', 'أنواع الخبز', 'flatbread=خبز مسطّح|pitta bread=خبز عربي|bread roll=خبزة صغيرة|sandwich bread=خبز التوست|barley bread=خبز الشعير|cornbread=خبز الذرة|semolina bread=خبز السميد|sourdough=خبز بالخميرة الطبيعية|bagel=خبز البيغل|breadsticks=أعواد الخبز'),
      g('🧁', 'Sweets', 'الحلويات', 'biscuits=بسكويت|cupcake=كب كيك|tart=تارت|cream puff=شو بالكريمة|brownie=براوني|gazelle horns=كعب الغزال|chebakia=الشبّاكية|almond biscuits=حلوى باللوز|apple pie=فطيرة التفاح|cinnamon roll=لفائف القرفة'),
      g('🥣', 'Ingredients', 'المكوّنات', 'yeast=خميرة|dough=عجين|semolina=سميد|almonds=لوز|walnuts=جوز|raisins=زبيب|vanilla=فانيليا|cocoa=كاكاو|icing sugar=سكر ناعم|baking powder=مسحوق الخبز'),
    ],
    talks: [
      d('Everyday | يومي', 'Fresh bread | خبز طازج', 'Baker | Nabil', [
        ['Good morning! What would you like?', 'صباح الخير! ماذا تريد؟'],
        ['Two baguettes and four croissants, please.', 'خبزتان فرنسيتان وأربع كرواسونات، من فضلك.'],
        ['Plain or with chocolate?', 'سادة أم بالشوكولاتة؟'],
        ['Two of each, please.', 'اثنتان من كل نوع، من فضلك.'],
        ["Here you are. They're still warm.", 'تفضّل. ما زالت دافئة.'],
        ['Great! How much is that?', 'رائع! كم الثمن؟'],
      ]),
      d('Special order | طلب خاص', 'A birthday cake | كعكة عيد ميلاد', 'Asmae | Baker', [
        ['Hello. Can I order a birthday cake?', 'مرحبًا. هل يمكنني طلب كعكة عيد ميلاد؟'],
        ['Of course. For how many people?', 'طبعًا. لكم شخصًا؟'],
        ['About fifteen.', 'حوالي خمسة عشر.'],
        ['Chocolate or vanilla?', 'بالشوكولاتة أم بالفانيليا؟'],
        ['Chocolate, with "Happy Birthday, Rim" on it.', 'بالشوكولاتة، ومكتوب عليها «عيد ميلاد سعيد يا ريم».'],
        ["No problem. It'll be ready on Saturday morning.", 'لا مشكلة. ستكون جاهزة صباح السبت.'],
      ]),
    ],
    ask: tr([
      ['Is the bread fresh today?', 'هل الخبز طازج اليوم؟'],
      ['What time do you open?', 'في أي ساعة تفتحون؟'],
      ['Can I have half a dozen?', 'هل يمكنني الحصول على نصف دزينة؟'],
      ['Do you make gluten-free bread?', 'هل تصنعون خبزًا خاليًا من الغلوتين؟'],
    ]),
    answer: tr([
      ["Yes, it's just out of the oven.", 'نعم، خرج من الفرن للتوّ.'],
      ['At six every morning.', 'في السادسة كل صباح.'],
      ['Sure. Which ones?', 'بالتأكيد. أيّها؟'],
      ['Sorry, not at the moment.', 'آسف، ليس حاليًا.'],
    ]),
    reading: {
      icon: '🔥', title: 'The Neighbourhood Oven', titleAr: 'فرّان الحيّ',
      text: "In old Moroccan neighbourhoods, many families still make bread at home, but they don't bake it there. Every morning, children carry the dough on a wooden board to the neighbourhood oven, the farran. The baker, Si Mohamed, knows every family's bread by its shape and its cloth. He bakes the loaves in a big wood oven, and the children come back an hour later to collect them. The bread is warm and crispy, and the whole street smells wonderful. Si Mohamed's oven also bakes cakes for weddings and biscuits for Eid. For many people, the farran is the heart of the neighbourhood.",
      gloss: pairs('neighbourhood=حيّ|carry=يحمل|wooden board=لوح خشبي|shape=شكل|collect=يستلم'),
      tf: [
        { s: 'Families bake the bread at home.', ok: false },
        { s: "The baker knows every family's bread.", ok: true },
        { s: 'The children collect the bread the next day.', ok: false },
      ],
      qs: [
        { q: 'What do the children carry to the oven?', a: 'The dough, on a wooden board.' },
        { q: 'What else does the oven bake?', a: 'Cakes for weddings and biscuits for Eid.' },
      ],
    } },

  /* ── 9 · At the Clothes Shop ─────────────────────────────────────── */
  { n: 9, icon: '👗',
    vocab: v(
      '👗 | try on | يجرّب (ملابس) | Can I try on this dress? | هل يمكنني تجربة هذا الفستان؟',
      '🚪 | fitting room | غرفة القياس | The fitting rooms are at the back. | غرف القياس في الخلف.',
      '📏 | too tight | ضيّق جدًا | These jeans are too tight. | هذا الجينز ضيّق جدًا.',
      '👖 | too loose | واسع جدًا | The shirt is too loose for me. | القميص واسع جدًا عليّ.',
      '🔄 | exchange | يستبدل | Can I exchange this for a bigger size? | هل يمكنني استبداله بمقاس أكبر؟',
      '💸 | refund | استرداد المال | I\'d like a refund, please. | أودّ استرداد مالي، من فضلك.',
      '🏷️ | in the sale | في التخفيضات | Everything is half price in the sale. | كل شيء بنصف السعر في التخفيضات.',
      '🎨 | another colour | لون آخر | Do you have this in another colour? | هل لديكم هذا بلون آخر؟',
      '👌 | suit | يليق بـ | That colour really suits you! | هذا اللون يليق بك حقًّا!',
      '👀 | just looking | أتفرّج فقط | No, thanks. I\'m just looking. | لا، شكرًا. أتفرّج فقط.',
    ),
    groups: [
      g('👕', 'Clothes', 'الملابس', 'T-shirt=قميص قصير الأكمام|sweater=كنزة|coat=معطف|skirt=تنّورة|shorts=سروال قصير|blouse=بلوزة|tracksuit=بذلة رياضية|djellaba=جلّابة|kaftan=قفطان|pyjamas=منامة'),
      g('👟', 'Shoes and accessories', 'الأحذية والإكسسوارات', 'trainers=حذاء رياضي|sandals=صندل|boots=جزمة|slippers=شبشب|scarf=وشاح|hat=قبّعة|cap=قبّعة رياضية|handbag=حقيبة يد|tie=ربطة عنق|necklace=قلادة'),
      g('🎨', 'Colours and patterns', 'الألوان والنقوش', 'red=أحمر|blue=أزرق|green=أخضر|yellow=أصفر|grey=رمادي|brown=بنّي|pink=وردي|navy=كحلي|striped=مخطّط|plain=سادة'),
    ],
    talks: [
      d('Shopping | تسوّق', 'Trying on | تجربة الملابس', 'Assistant | Meryem', [
        ['Hi! Can I help you?', 'مرحبًا! هل يمكنني مساعدتك؟'],
        ['Yes, do you have this jacket in medium?', 'نعم، هل لديكم هذه السترة بمقاس متوسط؟'],
        ['Let me check… Yes, here you are.', 'دعيني أتحقّق… نعم، تفضّلي.'],
        ['Can I try it on?', 'هل يمكنني تجربتها؟'],
        ['Sure. The fitting room is over there.', 'بالتأكيد. غرفة القياس هناك.'],
        ["It fits perfectly. I'll take it!", 'إنها مناسبة تمامًا. سآخذها!'],
      ]),
      d('Returning | إرجاع', "It's too small | إنه صغير جدًا", 'Youssef | Assistant', [
        ["Hello. I bought this shirt yesterday, but it's too small.", 'مرحبًا. اشتريت هذا القميص أمس، لكنه صغير جدًا.'],
        ['Do you have the receipt?', 'هل لديك الإيصال؟'],
        ['Yes, here it is.', 'نعم، ها هو.'],
        ['Would you like a bigger size or a refund?', 'هل تريد مقاسًا أكبر أم استرداد المال؟'],
        ['A bigger size, please. Large.', 'مقاسًا أكبر، من فضلك. كبير.'],
        ["No problem. Here's a large one.", 'لا مشكلة. هذا بمقاس كبير.'],
      ]),
    ],
    ask: tr([
      ['What size are you?', 'ما مقاسك؟'],
      ['Does it come in black?', 'هل يتوفّر باللون الأسود؟'],
      ['How does it look?', 'كيف يبدو؟'],
      ['Is it in the sale?', 'هل عليه تخفيض؟'],
    ]),
    answer: tr([
      ["I'm a medium.", 'مقاسي متوسط.'],
      ['Yes, and in navy too.', 'نعم، وبالكحلي أيضًا.'],
      ['It looks great on you!', 'يبدو رائعًا عليك!'],
      ["Yes, it's thirty percent off.", 'نعم، عليه خصم ثلاثين بالمئة.'],
    ]),
    reading: {
      icon: '🛍️', title: 'A New Outfit for the Wedding', titleAr: 'ملابس جديدة للعرس',
      text: "Sara's cousin is getting married next month, and Sara needs a new outfit. On Saturday, she goes shopping with her sister. In the first shop, she tries on a long green dress, but it is too tight. In the second shop, the dresses are beautiful but too expensive. Finally, in a small shop near the market, she finds a blue kaftan. It fits perfectly and the colour suits her. The price is 900 dirhams, but it is in the sale, so she pays only 650. Her sister buys a pair of silver sandals. They go home tired but happy.",
      gloss: pairs('cousin=ابنة العمّ أو الخال|getting married=سيتزوّج|outfit=طقم ملابس|finally=أخيرًا|silver=فضّي'),
      tf: [
        { s: 'The green dress was too tight.', ok: true },
        { s: 'Sara finds the kaftan near the market.', ok: true },
        { s: 'She pays 900 dirhams.', ok: false },
      ],
      qs: [
        { q: 'Who goes shopping with Sara?', a: 'Her sister.' },
        { q: 'What does her sister buy?', a: 'A pair of silver sandals.' },
      ],
    } },

  /* ── 10 · Meeting a Friend ───────────────────────────────────────── */
  { n: 10, icon: '🤝',
    vocab: v(
      '👋 | long time no see | لم أرك منذ مدة | Hi Karim! Long time no see! | مرحبًا كريم! لم أرك منذ مدة!',
      '☕ | catch up | نتبادل الأخبار | Let\'s meet for coffee and catch up. | لنلتقِ على قهوة ونتبادل الأخبار.',
      '📱 | keep in touch | نبقى على تواصل | We keep in touch on WhatsApp. | نبقى على تواصل عبر واتساب.',
      '🙋 | introduce | يقدّم (شخصًا) | Let me introduce my friend Hiba. | دعني أقدّم لك صديقتي هبة.',
      '🏖️ | hang out | يقضي الوقت مع | We hang out at the beach on Sundays. | نقضي الوقت معًا على الشاطئ أيام الأحد.',
      '🗓️ | free | متفرّغ | Are you free on Friday evening? | هل أنت متفرّغ مساء الجمعة؟',
      '💡 | good idea | فكرة جيدة | A picnic? That\'s a good idea! | نزهة؟ هذه فكرة جيدة!',
      '🔁 | another time | مرة أخرى | Sorry, I can\'t today. Maybe another time. | آسف، لا أستطيع اليوم. ربما مرة أخرى.',
      '🎉 | congratulations | مبروك | You got the job? Congratulations! | حصلت على الوظيفة؟ مبروك!',
      '👀 | see you soon | أراك قريبًا | Bye! See you soon. | إلى اللقاء! أراك قريبًا.',
    ),
    groups: [
      g('🙂', 'Small talk', 'عبارات للدردشة', "How's it going?=كيف الأحوال؟|Not bad.=لا بأس.|What's new?=ما الجديد؟|Nice to see you.=سعيد برؤيتك.|Take care.=اعتنِ بنفسك.|Good luck!=بالتوفيق!|Have fun!=استمتع بوقتك!|Me too.=وأنا أيضًا.|By the way…=بالمناسبة…|Of course!=طبعًا!"),
      g('🎳', 'Things to do', 'أشياء نفعلها', 'go for a walk=نتمشّى|go to the cinema=نذهب إلى السينما|play football=نلعب كرة القدم|go to the beach=نذهب إلى الشاطئ|eat out=نأكل خارج البيت|go shopping=نتسوّق|watch a match=نشاهد مباراة|visit family=نزور العائلة|go to a café=نذهب إلى مقهى|have a picnic=نقوم بنزهة'),
      g('🧑‍🤝‍🧑', 'People', 'الأشخاص', 'best friend=أعزّ صديق|neighbour=جار|classmate=زميل الدراسة|colleague=زميل العمل|relative=قريب (من العائلة)|guest=ضيف|stranger=شخص غريب|team=فريق|group=مجموعة|partner=شريك'),
    ],
    talks: [
      d('Friendly | ودّي', 'Long time no see! | لم أرك منذ مدة!', 'Hiba | Amine', [
        ['Amine! Long time no see! How are you?', 'أمين! لم أرك منذ مدة! كيف حالك؟'],
        ["Hiba! I'm great, thanks. And you?", 'هبة! أنا بخير، شكرًا. وأنتِ؟'],
        ["Very well. What's new?", 'بخير جدًا. ما الجديد؟'],
        ['I have a new job in Tangier.', 'لديّ عمل جديد في طنجة.'],
        ["Congratulations! Let's have coffee and catch up.", 'مبروك! لنشرب قهوة ونتبادل الأخبار.'],
        ['Good idea. Are you free on Sunday?', 'فكرة جيدة. هل أنتِ متفرّغة يوم الأحد؟'],
      ]),
      d('Making plans | وضع خطط', 'This weekend | نهاية هذا الأسبوع', 'Zakaria | Ilyas', [
        ['What are you doing this weekend?', 'ماذا ستفعل في نهاية هذا الأسبوع؟'],
        ['Nothing special. Why?', 'لا شيء مميّز. لماذا؟'],
        ["There's a big match on Saturday. Shall we watch it together?", 'هناك مباراة كبيرة يوم السبت. هل نشاهدها معًا؟'],
        ['Sure! Where?', 'بالتأكيد! أين؟'],
        ['At the café near my house, at nine.', 'في المقهى القريب من بيتي، في التاسعة.'],
        ['Perfect. See you there!', 'ممتاز. أراك هناك!'],
      ]),
    ],
    ask: tr([
      ['Do you want to go out tonight?', 'هل تريد الخروج الليلة؟'],
      ['How about a walk?', 'ما رأيك في جولة مشيًا؟'],
      ['What time shall we meet?', 'في أي ساعة نلتقي؟'],
      ['Where shall we meet?', 'أين نلتقي؟'],
    ]),
    answer: tr([
      ["I'd love to!", 'يسعدني ذلك!'],
      ["Sorry, I'm busy. Maybe another time.", 'آسف، أنا مشغول. ربما مرة أخرى.'],
      ["How about seven o'clock?", 'ما رأيك في السابعة؟'],
      ["Let's meet at the station.", 'لنلتقِ عند المحطة.'],
    ]),
    reading: {
      icon: '🤝', title: 'Old Friends', titleAr: 'صديقان قديمان',
      text: "Rachid and Mehdi were classmates at school in Meknes. After school, Rachid moved to Agadir for work, and Mehdi stayed in Meknes. For ten years, they only kept in touch on social media. Last week, Mehdi visited Agadir for a conference. He sent Rachid a message: \"I'm in your city! Are you free tonight?\" Rachid was very happy. They met at a café on the beach and talked for hours about school, their families and their jobs. Rachid introduced Mehdi to his wife and his little son. \"Let's not wait ten years again,\" Mehdi said. Now they call each other every month.",
      gloss: pairs('moved=انتقل|social media=مواقع التواصل|conference=مؤتمر|for hours=لساعات|each other=بعضهما'),
      tf: [
        { s: 'Rachid and Mehdi were classmates.', ok: true },
        { s: 'Mehdi lives in Agadir.', ok: false },
        { s: 'They met at a café on the beach.', ok: true },
      ],
      qs: [
        { q: 'Why did Mehdi visit Agadir?', a: 'For a conference.' },
        { q: 'How often do they call each other now?', a: 'Every month.' },
      ],
    } },
]
