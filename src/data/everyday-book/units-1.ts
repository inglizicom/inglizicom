import { script, words, type EverydayUnit } from './types.ts'

/** Units 1–7: morning routine, café, kitchen, bathroom, laundry, restaurant, supermarket. */

export const UNITS_1_7: EverydayUnit[] = [
  {
    n: 1, titleEn: 'Morning Routine', titleAr: 'الروتين الصباحي', icons: ['⏰', '☕'],
    goal: 'تحدّث عن روتينك الصباحي وعاداتك اليومية.',
    vocab: words('⏰ Wake up = أستيقظ من النوم | 🔕 Turn off the alarm = أُطفئ المنبّه | 🚶 Get out of bed = أنهض من السرير | 🛏️ Make my bed = أرتّب سريري | 🚪 Go to the bathroom = أذهب إلى الحمّام | 💦 Wash my face = أغسل وجهي | 🪥 Brush my teeth = أنظّف أسناني | 🚿 Take a shower = أستحمّ | 👔 Get dressed = ألبس ملابسي | 💇 Comb my hair = أسرّح شعري | 🍳 Have breakfast = أتناول الفطور | 🫖 Make coffee = أُعدّ القهوة | ☕ Drink coffee = أشرب القهوة | 📱 Check my phone = أتفقّد هاتفي | 👜 Grab my bag = آخذ حقيبتي | 👟 Put on my shoes = ألبس حذائي | 🏠 Leave home = أخرج من البيت | 🔐 Lock the door = أقفل الباب'),
    expressions: [
      ['What time do you usually wake up?', 'I usually wake up at seven.', 'في أي ساعة تستيقظ عادةً؟', 'أستيقظ عادةً في السابعة.'],
      ['What time does your alarm go off?', 'It goes off at seven. I turn it off and get out of bed.', 'في أي ساعة يرنّ منبّهك؟', 'يرنّ في السابعة. أُطفئه وأنهض من السرير.'],
      ["What's the first thing you do?", 'I wash my face first.', 'ما أول شيء تفعله؟', 'أغسل وجهي أولًا.'],
      ['Do you take a shower in the morning?', 'Yes, usually. I take a quick shower.', 'هل تستحمّ في الصباح؟', 'نعم، عادةً. أستحمّ بسرعة.'],
      ['What do you do after that?', 'After that, I get dressed and comb my hair.', 'ماذا تفعل بعد ذلك؟', 'بعد ذلك، ألبس ملابسي وأسرّح شعري.'],
      ['Do you have breakfast at home?', 'Yes, usually. But sometimes I skip breakfast.', 'هل تتناول الفطور في البيت؟', 'نعم، عادةً. لكن أحيانًا لا أفطر.'],
      ['What do you usually have for breakfast?', 'I usually have coffee and bread.', 'ماذا تتناول عادةً في الفطور؟', 'أتناول عادةً القهوة والخبز.'],
      ['What do you do before you leave?', 'I check my phone, grab my bag, and put on my shoes.', 'ماذا تفعل قبل أن تخرج؟', 'أتفقّد هاتفي، وآخذ حقيبتي، وألبس حذائي.'],
      ['What time do you leave home?', 'At about eight. What about you?', 'في أي ساعة تخرج من البيت؟', 'حوالي الثامنة. وأنت؟'],
      ['Are you ready to go?', "Yes, I'm ready. Let's go.", 'هل أنت جاهز للخروج؟', 'نعم، أنا جاهز. هيا بنا.'],
    ],
    talk: script(`
      SAMI: Morning, Nour. You're early again.
      NOUR: Morning! I usually leave home at about seven forty-five.
      SAMI: Really? What time do you usually wake up?
      NOUR: Around six thirty. What about you?
      SAMI: Around seven. But I don't always get up right away.
      NOUR: Same here. I sometimes stay in bed for a few minutes. What's the first thing you do when you get up?
      SAMI: I wash my face first, then I brush my teeth. What about you? Do you take a shower in the morning?
      NOUR: Yes, usually. I brush my teeth first, then I take a quick shower.
      SAMI: And what do you do after that?
      NOUR: I get dressed, comb my hair, and then I have breakfast. Do you have breakfast at home?
      SAMI: Most days. I usually have coffee and bread. What do you usually have for breakfast?
      NOUR: Tea, bread, and cheese. I always eat something before I leave. And you?
      SAMI: I sometimes skip breakfast when I'm late.
      NOUR: Why are you late? You wake up at seven!
      SAMI: My phone. I check it before I leave, and five minutes becomes fifteen.
      NOUR: Then check your phone after breakfast.
      SAMI: Good idea. Do you check your phone in the morning?
      NOUR: Yes, but only for a minute. Then I grab my bag and put on my shoes.
      SAMI: What time do you leave home?
      NOUR: At about seven forty-five. What about you?
      SAMI: About eight. I think I need to be a little faster.
      NOUR: Maybe check your phone later!
      SAMI: You're right. Are you ready to go?
      NOUR: Yes, I'm ready. Let's go.
    `),
    reading: { title: 'My Morning Routine', body: [
      "I usually wake up at seven o'clock. My alarm goes off at seven, and I turn it off. I don't always get out of bed right away, but I try not to stay in bed for too long.",
      'First, I go to the bathroom, wash my face, and brush my teeth. Then I take a quick shower, get dressed, and comb my hair.',
      "After that, I make coffee and have breakfast. I usually have coffee and bread. Sometimes I check my phone while I'm having breakfast, but I try to keep it short.",
      "Before I leave home, I grab my bag and put on my shoes. I usually leave at about eight o'clock. When I'm ready on time, my morning feels much easier.",
    ] },
    yours: [
      'Say what time you wake up and leave home. - قل في أي ساعة تستيقظ وتخرج من البيت.',
      'Describe your morning with First, Then, After that. - صِف صباحك بالترتيب: أولًا، ثم، بعد ذلك.',
      'Write five sentences about your own morning routine. - اكتب خمس جمل عن روتينك الصباحي.',
    ],
  },

  {
    n: 2, titleEn: 'At the Café', titleAr: 'في المقهى', icons: ['☕', '🥐'],
    goal: 'تعلّم كيف تطلب المشروبات والوجبات الخفيفة، وتسأل عن الخيارات، وتدفع بطريقة طبيعية.',
    vocab: words('📋 menu = قائمة الطعام | 🧑‍🍳 counter = الكاونتر | ☕ coffee = قهوة | 🍵 tea = شاي | 🧃 juice = عصير | 🥪 sandwich = شطيرة | 🍰 cake = كعكة | 🥛 cup = كوب | 🤏 small = صغير | 🥤 medium = متوسط | 🧋 large = كبير | 🔥 hot = ساخن | 🧊 iced = مثلّج | 🍼 milk = حليب | 🍬 sugar = سكر | 🛍️ for here / to go = هنا / للأخذ | 💳 cash / card = نقدًا / بالبطاقة | 🧾 receipt = إيصال'),
    expressions: [
      ['Can I see the menu, please?', 'Sure. Here you are.', 'هل يمكنني رؤية قائمة الطعام، من فضلك؟', 'بالتأكيد. تفضّل.'],
      ['What do you recommend?', 'The cappuccino is very popular.', 'بماذا تنصحني؟', 'الكابتشينو مطلوب جدًا.'],
      ['Can I get a coffee, please?', 'Of course. What kind would you like?', 'هل يمكنني الحصول على قهوة، من فضلك؟', 'بالطبع. أي نوع تريد؟'],
      ['Would you like milk or sugar?', 'Just a little milk, please.', 'هل تريد الحليب أم السكر؟', 'القليل من الحليب فقط، من فضلك.'],
      ['For here or to go?', 'For here, please.', 'هنا أم للأخذ؟', 'هنا، من فضلك.'],
      ['Do you have any pastries?', 'Yes. We have croissants and cake.', 'هل لديكم معجّنات؟', 'نعم. لدينا كرواسون وكعك.'],
      ['How much is it?', "It's forty dirhams.", 'كم السعر؟', 'السعر أربعون درهمًا.'],
      ['Can I pay in cash?', "Of course. Here's your change.", 'هل يمكنني الدفع نقدًا؟', 'بالطبع. تفضّل الباقي.'],
      ['Can I pay by card?', 'Yes, of course.', 'هل يمكنني الدفع بالبطاقة؟', 'نعم، بالطبع.'],
      ['Could I have the receipt, please?', 'Sure. Here you are.', 'هل يمكنني الحصول على الإيصال، من فضلك؟', 'بالتأكيد. تفضّل.'],
      ['Is this seat free?', 'Yes, it is. Go ahead.', 'هل هذا المقعد شاغر؟', 'نعم، إنه شاغر. تفضّل.'],
    ],
    talk: script(`
      STAFF: Hi. What would you like?
      AMINE: Hi. I'd like a coffee, please.
      STAFF: Sure. What size would you like?
      AMINE: Medium, please.
      STAFF: Would you like it hot or iced?
      AMINE: Hot, please. And can I have it without sugar?
      STAFF: Of course. Would you like some milk?
      AMINE: Yes, a little, please.
      STAFF: Is that for here or to go?
      AMINE: For here, please.
      STAFF: Would you like anything to eat?
      AMINE: What sandwiches do you have?
      STAFF: We have chicken and cheese sandwiches.
      AMINE: I'll have a cheese sandwich, please.
      STAFF: Sure. Anything else?
      AMINE: Actually, can I have an orange juice too?
      STAFF: Of course. Small or large?
      AMINE: Small, please. That's all.
      STAFF: So, one medium coffee, one cheese sandwich, and one small orange juice.
      AMINE: That's right. How much is it?
      STAFF: It's sixty-two dirhams.
      AMINE: Can I pay by card?
      STAFF: Yes, of course.
      AMINE: Great. Could I have the receipt, please?
      STAFF: Sure. Here you are.
      AMINE: Thank you.
      STAFF: You're welcome. Your order will be ready soon.
    `),
    reading: { title: "Amine's Coffee Break", body: [
      'Amine works near a café, and he takes a break there every afternoon. The café is usually busy, so he waits at the counter and looks at the menu.',
      'Today the server, Sara, asks him, "What would you like?" Amine orders a medium coffee. He likes it hot, with a little milk and no sugar.',
      'Then Sara asks, "Would you like anything to eat?" Amine is hungry, so he takes a cheese sandwich. Before he pays, he changes his mind and adds a small orange juice too.',
      'It is for here today, because he has time. The coffee and the food are sixty-two dirhams. Amine pays by card and asks for the receipt.',
      'He sits near the window with his coffee. He has twenty minutes before he goes back to work. When he is in a hurry, he takes his coffee to go instead.',
    ] },
    yours: [
      'Order your favourite drink: size, hot or iced, milk or sugar. - اطلب مشروبك المفضّل: الحجم، ساخن أو مثلّج، حليب أو سكر.',
      'Ask the price and how you can pay. - اسأل عن السعر وطريقة الدفع.',
      'Write a short dialogue between you and a server. - اكتب حوارًا قصيرًا بينك وبين النادل.',
    ],
  },

  {
    n: 3, titleEn: 'In the Kitchen', titleAr: 'في المطبخ', icons: ['🍳', '🥗'],
    goal: 'تعلّم أهم كلمات المطبخ والأفعال التي نستعملها أثناء تحضير الطعام.',
    vocab: words('🧊 check the fridge = أتفقّد الثلاجة | 🥚 some eggs = بعض البيض | 🍞 some bread = بعض الخبز | 🥛 some milk = بعض الحليب | 🍚 some rice = بعض الأرز | 🥐 make breakfast = أُعدّ الفطور | 🥬 wash the vegetables = أغسل الخضار | 🥕 peel the vegetables = أقشّر الخضار | 🔪 cut the bread = أقطع الخبز | 🫖 boil some water = أغلي بعض الماء | 🍗 cook the chicken = أطبخ الدجاج | 🍲 cook lunch = أطبخ الغداء | 🍳 fry the eggs = أقلي البيض | ♨️ heat the milk = أسخّن الحليب | 🧂 add some salt = أضيف بعض الملح | 🫒 add some oil / sugar = أضيف بعض الزيت / السكر | 🍽️ set the table = أجهّز الطاولة | 👨‍👩‍👧 eat with my family = آكل مع عائلتي'),
    expressions: [
      ['What are you making?', "I'm making lunch.", 'ماذا تحضّر؟', 'أحضّر الغداء.'],
      ['Do we have any eggs?', 'Yes, we have some in the fridge.', 'هل لدينا بيض؟', 'نعم، لدينا بعضه في الثلاجة.'],
      ["We're out of bread.", "That's OK. We can have rice instead.", 'نفد منا الخبز.', 'لا بأس. يمكننا تناول الأرز بدلًا منه.'],
      ['Can you help me?', 'Sure. What do you need?', 'هل يمكنك مساعدتي؟', 'بالتأكيد. ماذا تحتاج؟'],
      ['Can you wash the vegetables?', "Sure. I'll do that.", 'هل يمكنك غسل الخضار؟', 'بالتأكيد. سأفعل ذلك.'],
      ['Can you boil some water?', 'Sure. How much do you need?', 'هل يمكنك غلي بعض الماء؟', 'بالتأكيد. كم تحتاج؟'],
      ['Is it ready?', 'Not yet. Give it five more minutes.', 'هل أصبح جاهزًا؟', 'ليس بعد. اتركه خمس دقائق أخرى.'],
      ['Can you taste this?', 'It needs a little more salt.', 'هل يمكنك تذوّق هذا؟', 'يحتاج إلى قليل من الملح.'],
      ['Is that enough?', "Yes, that's enough.", 'هل هذا كافٍ؟', 'نعم، هذا كافٍ.'],
      ['Can you set the table?', 'Of course. Anything else?', 'هل يمكنك تجهيز الطاولة؟', 'بالطبع. هل هناك شيء آخر؟'],
      ['Would you like some tea?', "Yes, please. I'm thirsty.", 'هل تريد بعض الشاي؟', 'نعم، من فضلك. أنا عطشان.'],
      ["The food is ready. Let's eat.", 'Great. It looks really good.', 'الطعام جاهز. لنأكل.', 'رائع. يبدو شهيًّا جدًا.'],
      ['Do you like it?', "It's really delicious.", 'هل أعجبك؟', 'إنه لذيذ جدًا.'],
    ],
    talk: script(`
      NOUR: Hi, Sami. What are you making?
      SAMI: I'm making lunch. Chicken and rice.
      NOUR: Sounds good. Do we have everything?
      SAMI: I think so. Can you check if we have any rice?
      NOUR: Yes, we have some. But we're out of bread.
      SAMI: That's OK. I'll buy some later.
      NOUR: Do you want some help?
      SAMI: Yes, please. Can you wash the vegetables?
      NOUR: Sure. Do you want me to peel them too?
      SAMI: Yes, please. I'll start cooking the chicken.
      NOUR: Do you need some oil?
      SAMI: Yes, just a little. Can you pass it to me?
      NOUR: Here you are. What about the rice?
      SAMI: Good point. Can you boil some water for it?
      NOUR: Sure. How much water do you need?
      SAMI: About two cups. That should be enough.
      NOUR: OK. The vegetables are ready too.
      SAMI: Great. Can you add them to the pan?
      NOUR: Sure. Do you want some salt?
      SAMI: A little, please. Not too much.
      NOUR: Is that enough?
      SAMI: Yes, that's enough. Can you mix it well?
      NOUR: Done. Can I taste it?
      SAMI: Of course. Tell me what you think.
      NOUR: It's good, but it needs a little more salt.
      SAMI: OK, just a little more.
      NOUR: Is the chicken ready?
      SAMI: Not yet. Give it about five more minutes.
      NOUR: No problem. I'll set the table while we wait.
      SAMI: Thanks. Can you put some water on the table too?
      NOUR: Sure. Would you like some tea as well?
      SAMI: Yes, please. I'll make it after we finish cooking.
      NOUR: Everything smells good. I'm hungry now.
      SAMI: Me too. The chicken is ready now. Let's eat.
      NOUR: Great. It looks really good.
      SAMI: Thanks for helping.
    `),
    reading: { title: 'Sami Cooks Lunch', body: [
      'On Friday, Sami cooks lunch for his family: chicken and rice. First he checks the fridge. He has chicken, rice and some vegetables, but there is no bread, so he will buy some later.',
      'Nour helps him. She washes the vegetables and peels them. Sami starts cooking the chicken. He adds a little oil, then a little salt.',
      'He boils some water for the rice. He needs about two cups. While the food is cooking, he mixes it well and tastes it. It is good, but it needs a little more salt.',
      'The chicken is not ready yet, so they wait five more minutes. Nour sets the table and puts some water on it.',
      'Everything smells good, and they are both hungry. When the chicken is ready, they sit down and eat together. After lunch, Sami makes some tea.',
    ] },
    yours: [
      'Ask for help in the kitchen: wash, cut, boil, set the table. - اطلب المساعدة في المطبخ: اغسل، اقطع، اغلِ، جهّز الطاولة.',
      'Explain how you make your favourite dish, step by step. - اشرح طريقة تحضير طبقك المفضّل خطوة بخطوة.',
      'Write what you have in your fridge today. - اكتب ما يوجد في ثلاجتك اليوم.',
    ],
  },

  {
    n: 4, titleEn: 'In the Bathroom', titleAr: 'في الحمّام والعناية الشخصية', icons: ['🪥', '🚿'],
    goal: 'تعلّم أدوات الحمّام والأفعال اليومية المرتبطة بالنظافة والعناية الشخصية.',
    vocab: words('🪥 toothbrush = فرشاة أسنان | 🦷 toothpaste = معجون أسنان | 🧼 soap = صابون | 🛁 towel = منشفة | 💦 wash my face = أغسل وجهي | 😁 brush my teeth = أنظّف أسناني | ➕ put toothpaste on the toothbrush = أضع المعجون على الفرشاة | 🚰 rinse my mouth = أشطف فمي | 🧴 shampoo = شامبو | 🫧 conditioner = بلسم | 🚿 take a shower = أستحمّ | 💆 wash my hair = أغسل شعري | 🤗 dry myself = أُجفّف جسمي | 💨 dry my hair = أُجفّف شعري | 🌬️ hairdryer = مجفّف الشعر | 💇 comb my hair = أمشّط شعري | 🌼 put on deodorant = أضع مزيل العرق | 🪞 look in the mirror = أنظر في المرآة'),
    expressions: [
      ["Where's my toothbrush?", "It's next to the mirror.", 'أين فرشاة أسناني؟', 'إنها بجانب المرآة.'],
      ['Do we have any toothpaste?', "Yes, there's some under the sink.", 'هل لدينا معجون أسنان؟', 'نعم، يوجد بعضه تحت المغسلة.'],
      ['Can you pass me the towel?', 'Sure. Here you are.', 'هل يمكنك أن تناولني المنشفة؟', 'بالتأكيد. تفضّل.'],
      ['What are you doing?', "I'm just brushing my teeth.", 'ماذا تفعل؟', 'أنا فقط أنظّف أسناني.'],
      ['Are you going to take a shower?', 'Yes, I need to wash my hair.', 'هل ستستحمّ؟', 'نعم، أحتاج إلى غسل شعري.'],
      ["Where's the shampoo?", "It's in the shower, next to the conditioner.", 'أين الشامبو؟', 'إنه في الدُّش، بجانب البلسم.'],
      ['Is your hair still wet?', "Yes, I'm drying it now.", 'هل ما زال شعرك مبلّلًا؟', 'نعم، أنا أجفّفه الآن.'],
      ['Do you need the hairdryer?', 'Yes, please. Where is it?', 'هل تحتاج إلى مجفّف الشعر؟', 'نعم، من فضلك. أين هو؟'],
      ['Have you seen my comb?', "Yes, it's next to the mirror.", 'هل رأيت مشطي؟', 'نعم، إنه بجانب المرآة.'],
      ['Are you going to shave?', "Yes, but I can't find my razor.", 'هل ستحلق؟', 'نعم، لكنني لا أجد شفرة الحلاقة.'],
      ['How long will you be?', 'Give me five minutes.', 'كم ستستغرق؟', 'أمهلني خمس دقائق.'],
      ['Are you almost ready?', 'Almost. I just need to put on deodorant.', 'هل أنت شبه جاهز؟', 'تقريبًا. أحتاج فقط إلى وضع مزيل العرق.'],
      ['Is the water hot?', "No, it's not. It's warm.", 'هل الماء ساخن؟', 'لا، ليس كذلك. إنه دافئ.'],
      ["Be careful. It's cold.", 'I hate cold showers.', 'انتبه، إنه بارد.', 'أكره الاستحمام بالماء البارد.'],
      ['How often do you shower?', 'Almost every day.', 'كم مرة تستحمّ؟', 'كل يوم تقريبًا.'],
    ],
    talk: script(`
      LINA: Omar, are you still in the bathroom?
      OMAR: Yes, but I'm almost finished. Do you need something?
      LINA: I can't find my comb. Have you seen it?
      OMAR: Yes, it's next to the mirror.
      LINA: Found it. Thanks. What are you doing?
      OMAR: I'm just brushing my teeth.
      LINA: Do we have any toothpaste left?
      OMAR: Only a little. There's a new tube under the sink.
      LINA: Good. Are you going to take a shower too?
      OMAR: Yes. I need to wash my hair.
      LINA: How long will you be?
      OMAR: About five minutes. Are you in a hurry?
      LINA: A little. I need the bathroom before we leave.
      OMAR: No problem. I'll take a quick shower.
      LINA: Do you have shampoo?
      OMAR: Yes, but where's the conditioner?
      LINA: It's next to the shampoo.
      OMAR: Perfect. Can you pass me a clean towel too?
      LINA: Sure. Here you are.
      OMAR: Thanks. I'll be quick.
      LINA: Omar, are you finished?
      OMAR: Yes. The bathroom is free now.
      LINA: Great. Is your hair still wet?
      OMAR: A little. I'm going to dry it.
      LINA: Do you want the hairdryer?
      OMAR: Yes, please. Where is it?
      LINA: It's in the drawer. I put it there this morning.
      OMAR: Got it. Do you need anything from here?
      LINA: Yes, can you pass me the soap?
      OMAR: Sure. Anything else?
      LINA: No, that's all. Thanks.
      OMAR: OK. I need to shave now.
      LINA: Have you found your razor?
      OMAR: Yes. It was next to the mirror.
      LINA: Good. I'm almost ready too.
      OMAR: Me too. I just need to put on deodorant.
      LINA: Take a quick look in the mirror, and we're ready.
      OMAR: Done. Let's go.
    `),
    reading: { title: 'Getting Ready in the Morning', body: [
      'Lina and Omar share one bathroom, so the morning is always busy. Omar goes in first. He brushes his teeth, but there is only a little toothpaste left. There is a new tube under the sink. Then he takes a shower and washes his hair with shampoo.',
      'Lina waits outside. She is in a hurry, because she needs the bathroom before they leave. Omar says he will be about five minutes, so she takes a quick shower after him.',
      'She cannot find her comb. It is next to the mirror, where she put it that morning. Her hair is still wet, so she uses the hairdryer from the drawer.',
      'Omar shaves and looks for his razor. It is next to the mirror too. At the end, they both put on deodorant, take a quick look in the mirror, and they are ready.',
    ] },
    yours: [
      'Ask where three bathroom things are, and answer. - اسأل عن مكان ثلاثة أغراض في الحمّام، وأجب.',
      'Describe what you do in the bathroom every morning. - صِف ما تفعله في الحمّام كل صباح.',
      'Write a short list of what you need to buy for the bathroom. - اكتب لائحة قصيرة بما تحتاج شراءه للحمّام.',
    ],
  },

  {
    n: 5, titleEn: 'Laundry & Everyday Services', titleAr: 'الغسيل والخدمات اليومية', icons: ['🧺', '👔'],
    goal: 'تعلّم كيف تطلب خدمات الغسيل والتنظيف، وتسأل عن السعر وموعد الاستلام.',
    vocab: words('🧺 laundry = محل الغسيل | 🏬 dry cleaner = محل التنظيف الجاف | 👕 clothes = ملابس | 👔 shirt = قميص | 🧥 jacket = سترة | 👖 trousers = بنطال | 👗 dress = فستان | 🟤 stain = بقعة | 🫧 clean = ينظّف | ♨️ iron = يكوي | ✅ ready = جاهز | 🤲 pick up = يستلم | 💵 cash = نقدًا | 💳 card = بطاقة | 🧾 receipt = إيصال | 🫧 wash = يغسل | 👕 fold = يطوي | 🪝 hanger = علّاقة الملابس'),
    expressions: [
      ['How can I help you?', 'Can you clean these clothes, please?', 'كيف يمكنني مساعدتك؟', 'هل يمكنكم تنظيف هذه الملابس، من فضلك؟'],
      ['What do you have?', 'This jacket and these two shirts.', 'ماذا لديك؟', 'هذه السترة وهذان القميصان.'],
      ["There's a stain here.", 'I see it. What is it?', 'هناك بقعة هنا.', 'أراها. ما هي؟'],
      ["I think it's coffee. Can you remove it?", "We'll do our best.", 'أظنها بقعة قهوة. هل يمكنكم إزالتها؟', 'سنبذل ما بوسعنا.'],
      ['Does this need dry cleaning?', 'Yes, this one needs dry cleaning.', 'هل يحتاج هذا إلى تنظيف جاف؟', 'نعم، هذه القطعة تحتاج إلى تنظيف جاف.'],
      ['Can you iron this shirt too?', 'Yes, of course.', 'هل يمكنكم كيّ هذا القميص أيضًا؟', 'نعم، بالطبع.'],
      ['How much will it cost?', "It'll be ninety dirhams altogether.", 'كم سيكلّف ذلك؟', 'المجموع تسعون درهمًا.'],
      ['When will it be ready?', "It'll be ready on Tuesday afternoon.", 'متى سيكون جاهزًا؟', 'سيكون جاهزًا يوم الثلاثاء بعد الظهر.'],
      ['Can I pick it up after five?', "Yes, we're open until seven.", 'هل يمكنني استلامه بعد الخامسة؟', 'نعم، نحن مفتوحون حتى السابعة.'],
      ["I'm here to pick up my clothes.", 'Do you have your receipt?', 'جئت لاستلام ملابسي.', 'هل لديك الإيصال؟'],
      ['Do I need to pay now?', 'No, you can pay when you pick them up.', 'هل عليّ أن أدفع الآن؟', 'لا، يمكنك الدفع عند الاستلام.'],
      ['Great. The stain is gone.', 'Yes, it came out well.', 'رائع. لقد اختفت البقعة.', 'نعم، خرجت جيدًا.'],
      ['Can I pay by card?', "Yes, that's fine.", 'هل يمكنني الدفع بالبطاقة؟', 'نعم، لا مشكلة.'],
      ['Thank you. I appreciate it.', "You're welcome. Have a nice day.", 'شكرًا، أقدّر ذلك.', 'على الرحب والسعة. يومًا سعيدًا.'],
    ],
    talk: script(`
      FARID: Good morning. How can I help you?
      HODA: Good morning. Can you clean these clothes, please?
      FARID: Of course. What do you have?
      HODA: One jacket and two shirts.
      FARID: All right. Is there any problem with the jacket?
      HODA: Yes. There's a stain here on the front.
      FARID: I see it. What is it?
      HODA: I think it's coffee. Can you remove it?
      FARID: We'll do our best. It should be fine.
      HODA: Does the jacket need dry cleaning?
      FARID: Yes, it does. We can wash the shirts normally.
      HODA: Can you iron the shirts too?
      FARID: Yes, of course. Would you like both shirts ironed?
      HODA: Yes, please.
      FARID: No problem. Anything else?
      HODA: No, that's all. How much will it cost?
      FARID: The jacket is fifty dirhams, and the two shirts are forty. So that's ninety altogether.
      HODA: That's fine. When will everything be ready?
      FARID: Tuesday afternoon.
      HODA: Can I pick them up after five?
      FARID: Yes, that's fine. We're open until seven.
      HODA: Great. Do I need to pay now?
      FARID: No, you can pay when you pick up your clothes.
      HODA: Perfect. Could I have the receipt, please?
      FARID: Of course. Here you are. See you on Tuesday.
      HODA: Hello again. I'm here to pick up my clothes.
      FARID: Hello. Do you have your receipt?
      HODA: Yes, here it is.
      FARID: Thank you. One moment, please. Here are your jacket and shirts.
      HODA: Great. The stain is gone.
      FARID: Yes, it came out well. Would you like to check everything?
      HODA: Yes, please. The shirts look good too.
      FARID: Good. The total is ninety dirhams.
      HODA: Can I pay by card?
      FARID: Yes, of course.
      HODA: Done. Thank you very much.
      FARID: You're welcome. Have a nice day.
    `),
    reading: { title: 'A Visit to the Laundry', body: [
      'On Monday morning, Hoda takes some clothes to the laundry near her house. She has one jacket and two shirts.',
      'There is a stain on the front of the jacket. She thinks it is coffee. Farid, the man at the counter, looks at it and says they will do their best.',
      'The jacket needs dry cleaning, but they can wash the shirts normally. Hoda asks him to iron the shirts too. The jacket is fifty dirhams and the two shirts are forty, so it is ninety altogether.',
      'Farid tells her the clothes will be ready on Tuesday afternoon. The laundry is open until seven, so she can pick them up after work. She does not pay now; she pays when she picks up her clothes.',
      'On Tuesday, the stain is gone and the shirts look good. Hoda pays by card and takes her clothes home.',
    ] },
    yours: [
      'Explain a stain on your clothes and ask if they can remove it. - اشرح بقعة على ملابسك واسأل إن كانوا يستطيعون إزالتها.',
      'Ask the price and when your clothes will be ready. - اسأل عن السعر وموعد جاهزية ملابسك.',
      'Write a short note to leave with your clothes at the laundry. - اكتب ملاحظة قصيرة تتركها مع ملابسك في المصبنة.',
    ],
  },

  {
    n: 6, titleEn: 'At the Restaurant', titleAr: 'في المطعم', icons: ['🍽️', '🍗'],
    goal: 'تعلّم كيف تطلب طاولة، تختار وجبتك، تتفاعل مع النادل وتطلب الفاتورة.',
    vocab: words('🪑 table = طاولة | 🤵 waiter = نادل | 💁 server = مقدّم الطعام | 📋 menu = قائمة الطعام | 🥟 starter = مقبّلات | 🍽️ main course = الطبق الرئيسي | 🍮 dessert = حلوى | 🍹 drink = مشروب | 🍗 chicken = دجاج | 🐟 fish = سمك | 🥗 salad = سلطة | 🍚 rice = أرز | 🍲 soup = شوربة | 🥖 bread = خبز | 💧 water = ماء | 🥛 a glass of water = كأس ماء | 🌶️ spicy = حارّ | 🧻 napkin = منديل | 🧾 bill = الفاتورة | 🗒️ check = الحساب | 💳 card = بطاقة | 💵 cash = نقدًا | 🪙 tip = إكرامية | 🍽️ plate = صحن | 🍴 fork and spoon = الشوكة والملعقة | 📝 order = يطلب | ⭐ dish of the day = طبق اليوم'),
    expressions: [
      ['How many people?', 'A table for two, please.', 'كم عدد الأشخاص؟', 'طاولة لشخصين، من فضلك.'],
      ['Can we see the menu, please?', 'Certainly. Here you are.', 'هل يمكننا رؤية قائمة الطعام، من فضلك؟', 'بكل تأكيد. تفضّلوا.'],
      ['What do you recommend?', 'The chicken is very popular.', 'بماذا تنصحنا؟', 'الدجاج مطلوب جدًا.'],
      ["What's in this?", "It's chicken with rice and salad.", 'ما مكوّنات هذا الطبق؟', 'إنه دجاج مع أرز وسلطة.'],
      ['Is this spicy?', 'Only a little.', 'هل هذا حارّ؟', 'قليلًا فقط.'],
      ['Are you ready to order?', "I'll have the chicken, please.", 'هل أنتم مستعدّون للطلب؟', 'سآخذ الدجاج، من فضلك.'],
      ['And for you?', "I'd like the salad.", 'وأنت؟', 'أريد السلطة.'],
      ['Would you like something to drink?', 'Can I have water, please?', 'هل تريد شيئًا لتشربه؟', 'هل يمكنني الحصول على ماء، من فضلك؟'],
      ['Anything else?', "That's all for now, thank you.", 'شيء آخر؟', 'هذا كل شيء الآن، شكرًا.'],
      ['How is everything?', 'Everything is good, thank you.', 'هل كل شيء على ما يرام؟', 'كل شيء جيد، شكرًا.'],
      ['Could we have another bottle of water?', "Of course. I'll bring one.", 'هل يمكننا الحصول على زجاجة ماء أخرى؟', 'بالطبع. سأحضر واحدة.'],
      ['Would you like dessert?', "No, thanks. I'm full.", 'هل تريد حلوى؟', 'لا، شكرًا. أنا شبعان.'],
      ['Could we have the bill, please?', 'Of course. One moment, please.', 'هل يمكننا الحصول على الفاتورة، من فضلك؟', 'بالطبع. لحظة من فضلك.'],
      ['Can I pay by card?', 'Yes, of course.', 'هل يمكنني الدفع بالبطاقة؟', 'نعم، بالطبع.'],
      ['Is the tip included?', "No, the tip isn't included.", 'هل الإكرامية مشمولة؟', 'لا، الإكرامية غير مشمولة.'],
      ['Everything was very good.', 'Thank you. Please come again.', 'كان كل شيء جيدًا جدًا.', 'شكرًا. نتمنّى أن تزورونا مرة أخرى.'],
    ],
    talk: script(`
      WAITER: Good evening. How many people?
      NADIA: A table for two, please.
      WAITER: Of course. This way, please.
      SAMI: Thank you. Can we see the menu, please?
      WAITER: Certainly. Here you are.
      NADIA: There are a lot of choices. What do you recommend?
      WAITER: The chicken is very popular, and the fish is also very good.
      SAMI: Is the chicken spicy?
      WAITER: Only a little. It's not very spicy.
      SAMI: Does it come with rice?
      WAITER: Yes, it comes with rice and salad.
      NADIA: That sounds good.
      WAITER: Are you ready to order, or do you need a few more minutes?
      NADIA: We're ready. I'll have the chicken, please.
      WAITER: And for you?
      SAMI: I'd like the fish, please.
      WAITER: Would you like a starter?
      NADIA: What soup do you have today?
      WAITER: We have vegetable soup.
      NADIA: We'll share one soup, please.
      WAITER: Of course. And would you like something to drink?
      SAMI: Could we have a bottle of water, please?
      WAITER: Certainly. Anything else?
      NADIA: No, that's all for now. Thank you.
      WAITER: Enjoy your meal.
      SAMI: The soup is good.
      NADIA: Yes, I like it. And the chicken looks good too.
      WAITER: How is everything?
      NADIA: Everything is very good, thank you.
      SAMI: Could we have some more bread, please?
      WAITER: Of course. I'll bring some.
      SAMI: Excuse me, I think this is the chicken. I ordered the fish.
      WAITER: Oh, I'm sorry. You're right. I'll change it right away.
      SAMI: No problem. Thank you.
      NADIA: At least you didn't start eating it!
      SAMI: True!
      WAITER: Here is your fish. Sorry again about that.
      SAMI: That's fine. Thank you.
      WAITER: Would you like dessert or coffee?
      NADIA: No dessert for me. What about you, Sami?
      SAMI: No, thanks. I'm full.
      NADIA: Could we have the bill, please?
      WAITER: Of course. One moment, please. Here is your bill.
      SAMI: Can we pay separately?
      WAITER: Yes, no problem.
      NADIA: Can I pay by card?
      WAITER: Yes, of course.
      SAMI: Is the tip included?
      WAITER: No, the tip isn't included.
      NADIA: All right. Thank you. Everything was very good.
      WAITER: Thank you. Have a nice evening.
    `),
    reading: { title: 'Dinner at a Restaurant', body: [
      'On Saturday evening, Nadia and Sami go to a restaurant near the market. They ask for a table for two, and the waiter, Karim, shows them the way.',
      'There are a lot of choices on the menu, so they ask Karim what he recommends. He says the chicken is very popular and the fish is also very good. Nadia asks if the chicken is spicy. It is only a little spicy, and it comes with rice and salad.',
      'Nadia orders the chicken and Sami orders the fish. They share one vegetable soup as a starter, and they ask for a bottle of water.',
      'When the food arrives, there is a small problem. Karim brings chicken to Sami, but Sami ordered the fish. Karim says sorry and changes it right away.',
      'After the meal, they do not want dessert. They ask for the bill and pay by card.',
    ] },
    yours: [
      'Book a table, order a starter, a main course and a drink. - احجز طاولة واطلب مقبّلات وطبقًا رئيسيًا ومشروبًا.',
      'There is a problem with your order: explain it politely. - هناك مشكلة في طلبك: اشرحها بأدب.',
      'Write about your favourite restaurant and what you order there. - اكتب عن مطعمك المفضّل وما تطلبه فيه.',
    ],
  },

  {
    n: 7, titleEn: 'At the Supermarket', titleAr: 'في السوبرماركت', icons: ['🛒', '🍎'],
    goal: 'تعلّم كيف تبحث عن المنتجات، تسأل عن الكمية والسعر، وتدفع عند الصندوق.',
    vocab: words('🛒 shopping cart = عربة التسوّق | 🧺 shopping basket = سلّة التسوّق | 🛍️ bag = كيس | 🚶 aisle = ممرّ | 🗄️ shelf = رفّ | 🥛 milk = الحليب | 🥚 eggs = البيض | 🍞 bread = الخبز | 🍚 rice = الأرز | 💧 water = الماء | 🍗 chicken = الدجاج | 🍎 fruit = الفواكه | 🥦 vegetables = الخضروات | 🏧 checkout = صندوق الأداء | 🧑‍💼 cashier = أمين الصندوق | 🧾 receipt = إيصال | 🍾 bottle = قنينة | 📦 pack = علبة'),
    expressions: [
      ['Excuse me, where are the baskets?', "They're by the entrance, next to the carts.", 'عذرًا، أين السلال؟', 'إنها عند المدخل، بجانب العربات.'],
      ['Excuse me, where can I find the milk?', "It's in aisle four.", 'عذرًا، أين أجد الحليب؟', 'إنه في الممرّ رقم أربعة.'],
      ['Do you have this in a larger pack?', 'The larger packs are on the bottom shelf.', 'هل لديكم هذا في عبوة أكبر؟', 'العبوات الأكبر في الرفّ السفلي.'],
      ['How much is this?', "It's twenty-five dirhams.", 'بكم هذا؟', 'بخمسة وعشرين درهمًا.'],
      ['Is this on sale?', "Yes, it's twenty percent off.", 'هل عليه تخفيض؟', 'نعم، عليه تخفيض بعشرين في المئة.'],
      ['Where can I find the fresh vegetables?', "They're at the back of the store.", 'أين أجد الخضار الطازجة؟', 'إنها في الجزء الخلفي من المتجر.'],
      ['Do you have a cheaper one?', 'Yes, this one is cheaper.', 'هل لديكم واحد أرخص؟', 'نعم، هذا أرخص.'],
      ['Do you have any bottled water?', "Yes, it's in aisle six.", 'هل لديكم مياه معبّأة؟', 'نعم، إنها في الممرّ رقم ستة.'],
      ['Can I have a bag, please?', 'Would you like a small or a large one?', 'هل يمكنني الحصول على كيس، من فضلك؟', 'هل تريد كيسًا صغيرًا أم كبيرًا؟'],
      ['Can I pay by card?', 'Of course. Please tap your card here.', 'هل يمكنني الدفع بالبطاقة؟', 'بالطبع. مرّر بطاقتك هنا من فضلك.'],
      ['Could I have the receipt, please?', 'Sure. Here you are.', 'هل يمكنني الحصول على الإيصال، من فضلك؟', 'بالتأكيد. تفضّل.'],
    ],
    talk: script(`
      AMINE: Excuse me. Could you help me?
      STAFF: Of course. What are you looking for?
      AMINE: I'm looking for milk. Where can I find it?
      STAFF: It's in aisle four, on the left.
      AMINE: Great. Do you have any eggs too?
      STAFF: Yes. They're in the same aisle, on the shelf next to the milk.
      AMINE: Perfect. I also need some rice.
      STAFF: Rice is in aisle six.
      AMINE: Which side is it on?
      STAFF: On your right, near the bottled water.
      AMINE: Thanks. One more thing. Do you have this rice in a larger pack?
      STAFF: Yes, we do. There's a five-kilo pack on the bottom shelf.
      AMINE: That's too much for me. I'll take the smaller one.
      STAFF: No problem.
      AMINE: Where can I find fresh bread?
      STAFF: The bakery section is at the back of the store.
      AMINE: And where are the fruit and vegetables?
      STAFF: Straight ahead. You can't miss them.
      AMINE: How much is a kilo of tomatoes today?
      STAFF: They're fifteen dirhams a kilo.
      AMINE: OK. I'll take one kilo. Is this chicken on sale?
      STAFF: Yes. There's a twenty percent discount today.
      AMINE: Nice. How much is it now?
      STAFF: It's forty-eight dirhams.
      AMINE: Great. I'll take it. Where's the checkout?
      STAFF: Straight ahead, then turn left.
      AMINE: Thank you for your help.
      STAFF: You're welcome.
      CASHIER: Hello. Is that everything?
      AMINE: Yes, that's all.
      CASHIER: Do you need a bag?
      AMINE: Yes, please. One bag is enough.
      CASHIER: All right. That's two hundred and forty-seven dirhams.
      AMINE: Can I pay by card?
      CASHIER: Yes, of course. Please tap your card here.
      AMINE: Done.
      CASHIER: Thank you. Would you like the receipt?
      AMINE: Yes, please.
      CASHIER: Here you are. Have a good day.
      AMINE: Thank you. You too.
    `),
    reading: { title: "Amine's Weekly Shopping", body: [
      'Amine goes to the supermarket once a week, usually on Saturday. He takes a shopping cart and starts with the milk.',
      'The milk is in aisle four, on the left. The eggs are in the same aisle, on the shelf next to the milk. He needs rice too, but rice is in aisle six, near the bottled water.',
      'There is a five-kilo pack of rice on the bottom shelf. That is too much for Amine, so he takes the smaller one.',
      'The bakery section is at the back of the store, and the fruit and vegetables are straight ahead. Tomatoes are fifteen dirhams a kilo today, and he takes one kilo. The chicken is on sale with a twenty percent discount, so he takes that too.',
      'At the checkout, Youssef tells him the total is two hundred and forty-seven dirhams. Amine pays by card and asks for the receipt.',
    ] },
    yours: [
      'Ask where three products are in the supermarket. - اسأل عن مكان ثلاثة منتجات في السوبرماركت.',
      'Ask for a cheaper product or a larger pack. - اطلب منتجًا أرخص أو عبوة أكبر.',
      'Write your shopping list for this week in English. - اكتب لائحة مشترياتك لهذا الأسبوع بالإنجليزية.',
    ],
  },
]
