import { d, g, pairs, tr, v, type VocabUnit } from './vocab-book.ts'

/** Units 1–5 of the vocabulary book (see vocab-book.ts). */
export const UNITS_1_5: VocabUnit[] = [
  /* ── 1 · Morning Routine ─────────────────────────────────────────── */
  { n: 1, icon: '🌅',
    vocab: v(
      '⏰ | wake up | يستيقظ | I wake up at half past six on weekdays. | أستيقظ في السادسة والنصف في أيام العمل.',
      '🛏️ | get up | ينهض من السرير | I get up five minutes after my alarm. | أنهض من السرير بعد خمس دقائق من رنين المنبّه.',
      '😴 | snooze | يؤجّل المنبّه | Don\'t snooze your alarm again! | لا تؤجّل منبّهك مرة أخرى!',
      '🪥 | brush my teeth | أنظّف أسناني | I brush my teeth for two minutes. | أنظّف أسناني بالفرشاة لمدة دقيقتين.',
      '👕 | get dressed | يرتدي ملابسه | She gets dressed very quickly. | ترتدي ملابسها بسرعة كبيرة.',
      '🛌 | make the bed | يرتّب السرير | I make the bed before breakfast. | أرتّب السرير قبل الفطور.',
      '🍳 | have breakfast | يتناول الفطور | We have breakfast together at 7:15. | نتناول الفطور معًا في السابعة والربع.',
      '🎒 | pack my bag | أجهّز حقيبتي | I pack my bag the night before. | أجهّز حقيبتي في الليلة السابقة.',
      '🏃 | in a hurry | مستعجل | I\'m always in a hurry in the morning. | أنا مستعجل دائمًا في الصباح.',
      '🚪 | leave home | يغادر البيت | I leave home at eight o\'clock. | أغادر البيت في الساعة الثامنة.',
    ),
    groups: [
      g('🕖', 'Time words', 'كلمات الوقت', "early=باكرًا|late=متأخرًا|on time=في الوقت المحدّد|o'clock=تمامًا (للساعة)|half past=والنصف|quarter past=والربع|quarter to=إلا ربعًا|minute=دقيقة|hour=ساعة|weekend=عطلة نهاية الأسبوع"),
      g('🍞', 'At breakfast', 'على الفطور', 'butter=زبدة|jam=مربّى|honey=عسل|cheese=جبن|olives=زيتون|olive oil=زيت الزيتون|cereal=حبوب الفطور|yoghurt=زبادي|orange juice=عصير البرتقال|mint tea=شاي بالنعناع'),
      g('🧥', 'Before I go', 'قبل أن أخرج', 'socks=جوارب|belt=حزام|watch=ساعة يد|glasses=نظّارات|keys=مفاتيح|wallet=محفظة|umbrella=مظلّة|charger=شاحن|headphones=سمّاعات|ID card=بطاقة التعريف'),
    ],
    talks: [
      d('Friendly | ودّي', 'A busy morning | صباح مزدحم', 'Mum | Adam', [
        ["Adam, wake up! It's seven o'clock.", 'آدم، استيقظ! إنها الساعة السابعة.'],
        ['Five more minutes, please.', 'خمس دقائق أخرى، من فضلك.'],
        ["No, you're late. Get up now!", 'لا، أنت متأخر. انهض الآن!'],
        ["OK, OK. Where's my towel?", 'حسنًا، حسنًا. أين منشفتي؟'],
        ["It's in the bathroom. Hurry up!", 'إنها في الحمّام. أسرِع!'],
        ['Is breakfast ready?', 'هل الفطور جاهز؟'],
      ]),
      d('Questions | أسئلة', 'Talking about routines | الحديث عن الروتين', 'Lina | Karim', [
        ['What time do you get up on weekdays?', 'في أي ساعة تنهض في أيام العمل؟'],
        ['At half past six. And you?', 'في السادسة والنصف. وأنت؟'],
        ['At seven. Do you have breakfast at home?', 'في السابعة. هل تتناول الفطور في البيت؟'],
        ["Yes, always. I can't start my day without tea.", 'نعم، دائمًا. لا أستطيع أن أبدأ يومي دون شاي.'],
        ['How do you go to work?', 'كيف تذهب إلى العمل؟'],
        ['By bus. I leave home at a quarter to eight.', 'بالحافلة. أغادر البيت في الثامنة إلا ربعًا.'],
      ]),
    ],
    ask: tr([
      ['What time do you wake up?', 'في أي ساعة تستيقظ؟'],
      ['When do you usually get up?', 'متى تنهض عادةً؟'],
      ['What do you do first in the morning?', 'ماذا تفعل أولًا في الصباح؟'],
      ['Are you a morning person?', 'هل أنت شخص صباحي؟'],
    ]),
    answer: tr([
      ['I wake up at six.', 'أستيقظ في السادسة.'],
      ['Usually around seven.', 'عادةً حوالي السابعة.'],
      ['First, I wash my face.', 'أولًا، أغسل وجهي.'],
      ['Not really. I love sleeping!', 'ليس حقًّا. أحبّ النوم!'],
    ]),
    reading: {
      icon: '🌅', title: "Yasmine's Morning", titleAr: 'صباح ياسمين',
      text: "Yasmine is a nurse in Rabat. She wakes up at half past five every morning. She doesn't snooze her alarm because her work starts at seven. First, she drinks a glass of water and takes a quick shower. Then she gets dressed and makes her bed. Yasmine has a small breakfast: bread, olive oil and a cup of tea. At a quarter past six, she packs her bag and leaves home. She takes the bus to the hospital. On Sundays, Yasmine doesn't work, so she gets up late and has a big breakfast with her family.",
      gloss: pairs('nurse=ممرّضة|quick=سريع|glass=كأس|hospital=مستشفى|late=متأخرًا'),
      tf: [
        { s: 'Yasmine works in a hospital.', ok: true },
        { s: 'She snoozes her alarm every day.', ok: false },
        { s: 'She goes to work by taxi.', ok: false },
      ],
      qs: [
        { q: 'What time does Yasmine wake up?', a: 'At half past five.' },
        { q: 'What does she have for breakfast?', a: 'Bread, olive oil and a cup of tea.' },
      ],
    } },

  /* ── 2 · At the Café ─────────────────────────────────────────────── */
  { n: 2, icon: '☕',
    vocab: v(
      '📝 | order | يطلب | I\'d like to order a mint tea, please. | أودّ أن أطلب شايًا بالنعناع، من فضلك.',
      '🪑 | a table for two | طاولة لشخصين | A table for two, please. | طاولة لشخصين، من فضلك.',
      '🥤 | to take away | للأخذ معك | Two coffees to take away, please. | قهوتان للأخذ، من فضلك.',
      '🍰 | a slice of | قطعة من | Can I have a slice of chocolate cake? | هل يمكنني الحصول على قطعة من كعكة الشوكولاتة؟',
      '🫖 | a pot of tea | إبريق شاي | We\'d like a pot of mint tea. | نريد إبريقًا من شاي النعناع.',
      '🧊 | no ice | بدون ثلج | An orange juice with no ice, please. | عصير برتقال بدون ثلج، من فضلك.',
      '📶 | Wi-Fi password | كلمة سرّ الواي فاي | What\'s the Wi-Fi password? | ما هي كلمة سرّ الواي فاي؟',
      '🔥 | hot | ساخن | Be careful, the coffee is very hot. | انتبه، القهوة ساخنة جدًا.',
      '💰 | keep the change | احتفظ بالباقي | Here\'s fifty dirhams. Keep the change. | تفضّل خمسين درهمًا. احتفظ بالباقي.',
      '💺 | free seat | مقعد شاغر | Excuse me, is this seat free? | عفوًا، هل هذا المقعد شاغر؟',
    ),
    groups: [
      g('☕', 'Hot drinks', 'مشروبات ساخنة', 'espresso=إسبريسو|cappuccino=كابتشينو|latte=لاتيه|black coffee=قهوة سوداء|coffee with milk=قهوة بالحليب|green tea=شاي أخضر|herbal tea=شاي الأعشاب|hot chocolate=شوكولاتة ساخنة|decaf=قهوة منزوعة الكافيين|verbena=لويزة'),
      g('🥐', 'Snacks', 'وجبات خفيفة', 'croissant=كرواسون|muffin=مافن|cookie=بسكويت|toast=خبز محمّص|pancake=فطيرة|omelette=عجّة|doughnut=دونات|waffle=وافل|crêpe=كريب|cheesecake=تشيز كيك'),
      g('🍽️', 'On the table', 'على الطاولة', 'spoon=ملعقة|teaspoon=ملعقة صغيرة|knife=سكّين|fork=شوكة|napkin=منديل|glass=كأس|saucer=صحن الفنجان|straw=ماصّة|tray=صينية|plate=صحن'),
    ],
    talks: [
      d('Polite | مهذّب', 'Ordering | الطلب', 'Waiter | Nadia', [
        ['Good morning! What can I get you?', 'صباح الخير! ماذا أُحضر لك؟'],
        ['Can I have a latte and a croissant, please?', 'هل يمكنني الحصول على لاتيه وكرواسون، من فضلك؟'],
        ['Sure. Large or small?', 'بالتأكيد. كبير أم صغير؟'],
        ['Small, please. And no sugar.', 'صغير، من فضلك. وبدون سكر.'],
        ['For here or to take away?', 'هنا أم للأخذ؟'],
        ['For here. Thank you.', 'هنا. شكرًا لك.'],
      ]),
      d('Small problem | مشكلة صغيرة', 'A wrong order | طلب خاطئ', 'Sami | Waiter', [
        ["Excuse me, I think this isn't my order.", 'عفوًا، أظنّ أن هذا ليس طلبي.'],
        ['Oh, sorry! What did you order?', 'أوه، آسف! ماذا طلبت؟'],
        ['A mint tea, not a black coffee.', 'شايًا بالنعناع، وليس قهوة سوداء.'],
        ["I'm very sorry. I'll change it now.", 'أنا آسف جدًا. سأغيّره الآن.'],
        ['No problem. Can I also have some water?', 'لا مشكلة. هل يمكنني أيضًا الحصول على بعض الماء؟'],
        ["Of course. It's free.", 'طبعًا. إنه مجاني.'],
      ]),
    ],
    ask: tr([
      ['Can I have a coffee, please?', 'هل يمكنني الحصول على قهوة، من فضلك؟'],
      ["I'd like a mint tea.", 'أودّ شايًا بالنعناع.'],
      ['Could we have the bill?', 'هل يمكننا الحصول على الحساب؟'],
      ['Do you have any cakes?', 'هل لديكم كعك؟'],
    ]),
    answer: tr([
      ['Sure, coming right up!', 'بالتأكيد، حالًا!'],
      ["Sorry, we don't have any left.", 'آسف، لم يبقَ لدينا منه شيء.'],
      ["That's twenty-five dirhams.", 'المبلغ خمسة وعشرون درهمًا.'],
      ['Here you are.', 'تفضّل.'],
    ]),
    reading: {
      icon: '☕', title: 'A Café in Fez', titleAr: 'مقهى في فاس',
      text: "Hamid has a small café near the old medina in Fez. It opens at seven in the morning. Every day, students and workers come for breakfast. The most popular drink is mint tea, but young people like cappuccino too. Hamid's wife makes fresh msemen and cakes at home. On cold days, the café is full and every seat is taken. Hamid knows his customers' names and their favourite drinks. \"A good café is like a family,\" he says. The café closes at ten in the evening, after the last football match on TV.",
      gloss: pairs('popular=مشهور|msemen=مسمّن|customers=زبائن|favourite=مفضّل|match=مباراة'),
      tf: [
        { s: 'The café is near the old medina.', ok: true },
        { s: 'Young people only drink mint tea.', ok: false },
        { s: 'The café closes at ten in the evening.', ok: true },
      ],
      qs: [
        { q: 'Who makes the msemen and the cakes?', a: "Hamid's wife." },
        { q: 'What is the most popular drink?', a: 'Mint tea.' },
      ],
    } },

  /* ── 3 · In the Kitchen ──────────────────────────────────────────── */
  { n: 3, icon: '🍳',
    vocab: v(
      '🔪 | cut | يقطّع | Cut the onions into small pieces. | قطّع البصل إلى قطع صغيرة.',
      '🫕 | boil | يغلي | Boil the water for the pasta. | اغلِ الماء للمعكرونة.',
      '🍳 | fry | يقلي | My mother fries the fish in olive oil. | أمّي تقلي السمك في زيت الزيتون.',
      '🥄 | mix | يخلط | Mix the flour and the eggs. | اخلط الدقيق والبيض.',
      '👅 | taste | يتذوّق | Can you taste the soup, please? | هل يمكنك تذوّق الشوربة، من فضلك؟',
      '🔥 | oven | فرن | Put the cake in the oven for thirty minutes. | ضع الكعكة في الفرن لمدة ثلاثين دقيقة.',
      '🧽 | wash up | يغسل الأواني | I wash up after dinner. | أغسل الأواني بعد العشاء.',
      '🍽️ | set the table | يُعِدّ المائدة | Can you set the table, please? | هل يمكنك إعداد المائدة، من فضلك؟',
      '📖 | recipe | وصفة | This is my grandmother\'s recipe. | هذه وصفة جدّتي.',
      '😋 | delicious | لذيذ | The tagine smells delicious! | رائحة الطاجين لذيذة!',
    ),
    groups: [
      g('🍳', 'Kitchen tools', 'أدوات المطبخ', 'pan=مقلاة|pot=قِدر|cutting board=لوح التقطيع|bowl=وعاء|kettle=غلّاية|microwave=ميكروويف|cooker=موقد|sink=مغسلة|grater=مبشرة|blender=خلّاط'),
      g('🥕', 'Vegetables', 'الخضر', 'carrot=جزر|onion=بصل|garlic=ثوم|tomato=طماطم|potato=بطاطس|pepper=فلفل|cucumber=خيار|lettuce=خس|courgette=كوسة|aubergine=باذنجان'),
      g('🌿', 'Spices and herbs', 'التوابل والأعشاب', 'cumin=كمّون|paprika=فلفل أحمر حلو|cinnamon=قرفة|ginger=زنجبيل|saffron=زعفران|turmeric=كركم|black pepper=فلفل أسود|parsley=بقدونس|coriander=كزبرة|mint=نعناع'),
    ],
    talks: [
      d('Teamwork | تعاون', 'Cooking together | نطبخ معًا', 'Mum | Rania', [
        ['Rania, can you help me with dinner?', 'رانيا، هل يمكنك مساعدتي في العشاء؟'],
        ['Sure! What can I do?', 'بالتأكيد! ماذا أفعل؟'],
        ['Please cut the carrots and the onions.', 'من فضلك قطّعي الجزر والبصل.'],
        ["OK. Where's the cutting board?", 'حسنًا. أين لوح التقطيع؟'],
        ['Next to the sink. Be careful with the knife!', 'بجانب المغسلة. انتبهي للسكّين!'],
        ["Don't worry, I'm careful.", 'لا تقلقي، أنا حذِرة.'],
      ]),
      d('Asking for a recipe | طلب وصفة', 'A delicious salad | سلطة لذيذة', 'Ali | Sofia', [
        ["This salad is delicious! What's in it?", 'هذه السلطة لذيذة! ماذا فيها؟'],
        ['Tomatoes, cucumbers, onions and a little cumin.', 'طماطم وخيار وبصل وقليل من الكمّون.'],
        ['Is it difficult to make?', 'هل تحضيرها صعب؟'],
        ['Not at all. It takes ten minutes.', 'أبدًا. تستغرق عشر دقائق.'],
        ['Can you give me the recipe?', 'هل يمكنك أن تعطيني الوصفة؟'],
        ["Of course! I'll send it to you.", 'طبعًا! سأرسلها إليك.'],
      ]),
    ],
    ask: tr([
      ['What are you cooking?', 'ماذا تطبخ؟'],
      ["What's for dinner?", 'ماذا سنتناول على العشاء؟'],
      ['Does it need more salt?', 'هل يحتاج إلى مزيد من الملح؟'],
      ['How long does it take?', 'كم من الوقت يستغرق؟'],
    ]),
    answer: tr([
      ["I'm making a tagine.", 'أحضّر طاجينًا.'],
      ['Chicken and rice.', 'دجاج وأرز.'],
      ["No, it's perfect.", 'لا، إنه ممتاز.'],
      ['About an hour.', 'حوالي ساعة.'],
    ]),
    reading: {
      icon: '🥘', title: 'Friday Couscous', titleAr: 'كسكس يوم الجمعة',
      text: "In many Moroccan homes, Friday is couscous day. Karima starts cooking at ten in the morning. First, she cuts the meat and the vegetables: carrots, courgettes, onions and pumpkin. Then she puts them in a big pot with water, salt, pepper, ginger and turmeric. The couscous cooks on top of the pot, in the steam. After two hours, lunch is ready. Her children set the table and the whole family sits together. After lunch, everyone drinks mint tea, and Karima's son washes up. \"Couscous is not just food,\" Karima says. \"It's a family moment.\"",
      gloss: pairs('meat=لحم|pumpkin=قرع (يقطين)|steam=بخار|whole=كامل|moment=لحظة'),
      tf: [
        { s: 'Karima starts cooking in the evening.', ok: false },
        { s: 'The couscous cooks in the steam.', ok: true },
        { s: "Karima's son washes up after lunch.", ok: true },
      ],
      qs: [
        { q: 'Which vegetables does Karima use?', a: 'Carrots, courgettes, onions and pumpkin.' },
        { q: 'What does the family drink after lunch?', a: 'Mint tea.' },
      ],
    } },

  /* ── 4 · In the Bathroom ─────────────────────────────────────────── */
  { n: 4, icon: '🛁',
    vocab: v(
      '🛁 | take a bath | يأخذ حمّامًا | I take a bath on Sunday evening. | آخذ حمّامًا مساء الأحد.',
      '🚿 | have a shower | يستحمّ | He has a shower after the gym. | يستحمّ بعد النادي الرياضي.',
      '💦 | rinse | يشطف | Rinse your hair with warm water. | اشطف شعرك بالماء الدافئ.',
      '💨 | dry | يجفّف | Dry your hands with the towel. | جفّف يديك بالمنشفة.',
      '🪒 | shave | يحلق | My father shaves every morning. | أبي يحلق كل صباح.',
      '🚰 | tap | صنبور | Please turn off the tap. | من فضلك أغلق الصنبور.',
      '🫧 | bubbles | فقاعات | The children love bubbles in the bath. | يحبّ الأطفال الفقاعات في حوض الاستحمام.',
      '🧻 | toilet paper | ورق المرحاض | We need more toilet paper. | نحتاج إلى مزيد من ورق المرحاض.',
      '✨ | clean | نظيف | The bathroom is clean now. | الحمّام نظيف الآن.',
      '🌡️ | hot water | الماء الساخن | There\'s no hot water today. | لا يوجد ماء ساخن اليوم.',
    ),
    groups: [
      g('🚽', 'Bathroom things', 'أشياء في الحمّام', 'washbasin=حوض المغسلة|bathtub=حوض الاستحمام|toilet=مرحاض|bath mat=سجّادة الحمّام|shelf=رفّ|cabinet=خزانة صغيرة|bin=سلّة المهملات|hook=علّاقة|light=ضوء|water heater=سخّان الماء'),
      g('🧴', 'Personal care', 'العناية الشخصية', 'face wash=غسول الوجه|cream=كريم|body lotion=مرطّب الجسم|perfume=عطر|nail clippers=قلّامة الأظافر|cotton=قطن|tissues=مناديل ورقية|lip balm=مرطّب الشفاه|sunscreen=واقي الشمس|hairbrush=فرشاة الشعر'),
      g('🧽', 'Cleaning', 'التنظيف', 'bleach=ماء جافيل|sponge=إسفنجة|bucket=دلو|mop=ممسحة|brush=فرشاة|gloves=قفّازات|spray=بخّاخ|cloth=قطعة قماش|cleaner=منظّف|dustpan=مجرفة الغبار'),
    ],
    talks: [
      d('Family | عائلي', "Who's in the bathroom? | من في الحمّام؟", 'Yassine | Salma', [
        ['Salma, are you in the bathroom?', 'سلمى، هل أنتِ في الحمّام؟'],
        ["Yes, I'm having a shower.", 'نعم، أنا أستحمّ.'],
        ["Please hurry. I'm late for work!", 'أسرعي من فضلك. أنا متأخر عن العمل!'],
        ["Two minutes! I'm drying my hair.", 'دقيقتان! أنا أجفّف شعري.'],
        ["Can you pass me my razor? It's on the shelf.", 'هل يمكنك أن تناوليني شفرة الحلاقة؟ إنها على الرفّ.'],
        ['Here you are. The bathroom is all yours!', 'تفضّل. الحمّام لك الآن!'],
      ]),
      d('Problem | مشكلة', 'No hot water | لا يوجد ماء ساخن', 'Guest | Host', [
        ['Excuse me, the water is cold.', 'عفوًا، الماء بارد.'],
        ['Oh, sorry! Turn on the water heater first.', 'أوه، آسف! شغّل سخّان الماء أولًا.'],
        ['Where is it?', 'أين هو؟'],
        ['Behind the door. Then wait ten minutes.', 'خلف الباب. ثم انتظر عشر دقائق.'],
        ['Thanks. Is there a clean towel?', 'شكرًا. هل توجد منشفة نظيفة؟'],
        ['Yes, in the cabinet under the washbasin.', 'نعم، في الخزانة تحت حوض المغسلة.'],
      ]),
    ],
    ask: tr([
      ['Is the bathroom free?', 'هل الحمّام شاغر؟'],
      ['Can I use the bathroom?', 'هل يمكنني استعمال الحمّام؟'],
      ["Where's the towel?", 'أين المنشفة؟'],
      ['Is there any shampoo left?', 'هل بقي شيء من الشامبو؟'],
    ]),
    answer: tr([
      ['Yes, go ahead.', 'نعم، تفضّل.'],
      ["Not yet. Someone's in there.", 'ليس بعد. يوجد شخص في الداخل.'],
      ["It's on the hook.", 'إنها على العلّاقة.'],
      ["No, it's finished.", 'لا، لقد نفد.'],
    ]),
    reading: {
      icon: '🛁', title: 'Saturday at the Hammam', titleAr: 'يوم السبت في الحمّام',
      text: "Every Saturday morning, Omar goes to the hammam with his father and his brother. The hammam is a public bath near their house. Omar takes a towel, soap, shampoo and a small bucket. Inside, there are three rooms: a warm room, a hot room and a very hot room. They sit in the hot room and relax. Then his father washes his back with a special glove. At the end, they rinse with cool water. After the hammam, Omar feels clean and fresh. They drink a glass of cold water and walk home happily.",
      gloss: pairs('public=عمومي|relax=يسترخي|back=ظهر|glove=قفّاز (الكيس)|fresh=منتعش'),
      tf: [
        { s: 'Omar goes to the hammam every Friday.', ok: false },
        { s: 'The hammam has three rooms.', ok: true },
        { s: 'They rinse with hot water at the end.', ok: false },
      ],
      qs: [
        { q: 'What does Omar take to the hammam?', a: 'A towel, soap, shampoo and a small bucket.' },
        { q: 'How does Omar feel after the hammam?', a: 'Clean and fresh.' },
      ],
    } },

  /* ── 5 · Laundry & Everyday Services ─────────────────────────────── */
  { n: 5, icon: '🧺',
    vocab: v(
      '🧺 | wash | يغسل | Can you wash this blanket? | هل يمكنك غسل هذه البطّانية؟',
      '🧼 | dry-clean | ينظّف تنظيفًا جافًّا | This coat is dry-clean only. | هذا المعطف للتنظيف الجاف فقط.',
      '👔 | do the ironing | يكوي الملابس | I do the ironing on Sunday. | أكوي الملابس يوم الأحد.',
      '🪡 | sew | يخيط | The tailor can sew the button back on. | يستطيع الخيّاط أن يخيط الزرّ من جديد.',
      '✂️ | shorten | يقصّر | Can you shorten these trousers? | هل يمكنك تقصير هذا البنطال؟',
      '🔘 | button | زرّ | A button is missing. | هناك زرّ ناقص.',
      '🕳️ | hole | ثقب | There\'s a hole in my sock. | يوجد ثقب في جوربي.',
      '📥 | pick up | يستلم | When can I pick it up? | متى يمكنني استلامه؟',
      '🚚 | deliver | يوصّل | Do you deliver to homes? | هل توصّلون إلى المنازل؟',
      '🔑 | copy a key | ينسخ مفتاحًا | I need to copy this key. | أحتاج إلى نسخ هذا المفتاح.',
    ),
    groups: [
      g('🧺', 'Laundry words', 'كلمات الغسيل', 'washing machine=غسّالة|dryer=مجفّفة|washing powder=مسحوق الغسيل|fabric softener=ملطّف الأقمشة|hanger=علّاقة ملابس|laundry basket=سلّة الغسيل|clothesline=حبل الغسيل|peg=ملقط الغسيل|ironing board=طاولة الكيّ|wrinkles=تجاعيد (في الثوب)'),
      g('🧵', "At the tailor's", 'عند الخيّاط', 'tailor=خيّاط|needle=إبرة|thread=خيط|zip=سحّاب|pocket=جيب|sleeve=كمّ|collar=ياقة|fabric=قماش|fit=يناسب (المقاس)|repair=إصلاح'),
      g('🛠️', 'Everyday services', 'خدمات يومية', 'shoe repair=إصلاح الأحذية|phone repair=إصلاح الهواتف|photocopy=نسخة (فوتوكوبي)|post office=مكتب البريد|parcel=طرد|stamp=طابع بريدي|printing=طباعة|car wash=غسل السيارات|locksmith=صانع الأقفال|home delivery=التوصيل إلى المنزل'),
    ],
    talks: [
      d('Service | خدمة', "At the dry cleaner's | عند محلّ التنظيف", 'Customer | Worker', [
        ['Hello. Can you clean this coat, please?', 'مرحبًا. هل يمكنك تنظيف هذا المعطف، من فضلك؟'],
        ['Sure. Is there a stain?', 'بالتأكيد. هل توجد بقعة؟'],
        ['Yes, a coffee stain on the sleeve.', 'نعم، بقعة قهوة على الكمّ.'],
        ["No problem. It'll be ready on Thursday.", 'لا مشكلة. سيكون جاهزًا يوم الخميس.'],
        ['How much is it?', 'كم السعر؟'],
        ["Forty dirhams. Here's your receipt.", 'أربعون درهمًا. هذا إيصالك.'],
      ]),
      d('Asking for help | طلب المساعدة', "At the tailor's | عند الخيّاط", 'Hind | Tailor', [
        ['These trousers are too long for me.', 'هذا البنطال طويل جدًا عليّ.'],
        ['Let me see. I can shorten them three centimetres.', 'دعيني أرى. يمكنني تقصيره ثلاثة سنتيمترات.'],
        ['Great. Can you also fix the zip?', 'رائع. هل يمكنك أيضًا إصلاح السحّاب؟'],
        ['Yes, of course.', 'نعم، طبعًا.'],
        ['When can I pick them up?', 'متى يمكنني استلامه؟'],
        ['Tomorrow after five.', 'غدًا بعد الخامسة.'],
      ]),
    ],
    ask: tr([
      ['When will it be ready?', 'متى سيكون جاهزًا؟'],
      ['Can you fix this?', 'هل يمكنك إصلاح هذا؟'],
      ['How much do I owe you?', 'كم أدين لك؟'],
      ['Do you take cards?', 'هل تقبلون البطاقات؟'],
    ]),
    answer: tr([
      ["It'll be ready tomorrow.", 'سيكون جاهزًا غدًا.'],
      ['Yes, but it takes two days.', 'نعم، لكنه يستغرق يومين.'],
      ['Thirty dirhams, please.', 'ثلاثون درهمًا، من فضلك.'],
      ['Sorry, cash only.', 'آسف، نقدًا فقط.'],
    ]),
    reading: {
      icon: '🪡', title: 'Mr Driss, the Busy Tailor', titleAr: 'السيد إدريس، الخيّاط المشغول',
      text: "Mr Driss has a small tailor's shop in Casablanca. He opens at nine and closes at eight. People bring him trousers to shorten, dresses to fix and jackets with missing buttons. Before Eid, his shop is very busy. Everybody wants new clothes, or old clothes that look new! Mr Driss works with his daughter, Nora. She takes the clothes, writes the receipts and answers the phone. Mr Driss sews and irons. He doesn't use a computer, but he never forgets a customer. His prices are low and his work is excellent, so people come back again and again.",
      gloss: pairs('bring=يُحضر|missing=ناقص|Eid=العيد|look=يبدو|excellent=ممتاز'),
      tf: [
        { s: 'The shop is in Casablanca.', ok: true },
        { s: 'Nora sews the clothes.', ok: false },
        { s: 'The shop is very busy before Eid.', ok: true },
      ],
      qs: [
        { q: 'What time does the shop close?', a: 'At eight.' },
        { q: 'Why do people come back again and again?', a: 'His prices are low and his work is excellent.' },
      ],
    } },
]
