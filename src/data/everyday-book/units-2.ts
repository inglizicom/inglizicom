import { script, words, type EverydayUnit } from './types.ts'

/** Units 8–13: bakery, clothes shop, meeting a friend, barber, pharmacy, clinic. */

export const UNITS_8_13: EverydayUnit[] = [
  {
    n: 8, titleEn: 'At the Bakery', titleAr: 'في المخبزة', icons: ['🥖', '🥐'],
    goal: 'تعلّم كيف تسأل عن أنواع الخبز والمعجّنات والكميات والأسعار، وما هو طازج اليوم.',
    vocab: words('🧑‍🍳 bakery = مخبزة | ✨ fresh = طازج | ♨️ warm = دافئ | 🍞 bread = خبز | 🥖 baguette = خبز الباغيت | 🌾 whole-wheat bread = خبز القمح الكامل | 🫓 loaf = رغيف | 🥐 croissant = كرواسون | 🥧 pastry = معجّنات | 🎂 cake = كعكة | 🍰 piece = قطعة | 🥯 sesame bread = خبز بالسمسم | 2️⃣ two loaves = رغيفان | 4️⃣ four croissants = أربع قطع كرواسون | 🔢 dozen = دزينة | 🧾 receipt = إيصال'),
    expressions: [
      ['Good morning. What can I get you?', "Good morning. What's fresh today?", 'صباح الخير. ماذا تريد؟', 'صباح الخير. ما الطازج اليوم؟'],
      ['The baguettes are fresh and still warm.', "I'd like two baguettes, please.", 'الباغيت طازج وما زال دافئًا.', 'أريد قطعتين من الباغيت، من فضلك.'],
      ['Of course. Anything else?', 'Do you have whole-wheat bread?', 'بالطبع. هل تريد شيئًا آخر؟', 'هل لديكم خبز القمح الكامل؟'],
      ["Sorry, we're out of it today.", 'Do you have anything similar?', 'عذرًا، لقد نفد اليوم.', 'هل لديكم شيء مشابه؟'],
      ['We have this fresh loaf instead.', "That looks good. I'll take one.", 'لدينا هذا الرغيف الطازج بدلًا منه.', 'يبدو جيدًا. سآخذ واحدًا.'],
      ['Are the croissants fresh?', 'Yes, they were made this morning.', 'هل الكرواسون طازج؟', 'نعم، حُضّر هذا الصباح.'],
      ['How much is one?', "They're six dirhams each.", 'بكم الواحدة؟', 'ستة دراهم للواحدة.'],
      ['How many would you like?', 'Four, please.', 'كم تريد؟', 'أربعًا، من فضلك.'],
      ['Would you like anything sweet?', 'What kind of cake do you have?', 'هل تريد شيئًا حلوًا؟', 'ما أنواع الكعك لديكم؟'],
      ['We have chocolate and vanilla cake.', 'Could I have a piece of chocolate cake?', 'لدينا كعك بالشوكولاتة وبالفانيليا.', 'هل يمكنني الحصول على قطعة من كعك الشوكولاتة؟'],
      ['Is that everything?', "Yes, that's all. Thank you.", 'هل هذا كل شيء؟', 'نعم، هذا كل شيء. شكرًا.'],
      ['How much is it altogether?', 'That comes to seventy-five dirhams.', 'كم المجموع؟', 'المجموع خمسة وسبعون درهمًا.'],
      ['Can I pay by card?', 'Yes, of course.', 'هل يمكنني الدفع بالبطاقة؟', 'نعم، بالتأكيد.'],
      ['Could I have a bag, please?', 'Sure. Here you are.', 'هل يمكنني الحصول على كيس، من فضلك؟', 'بالتأكيد. تفضّل.'],
      ['Keep the change.', 'Thank you. Come again.', 'احتفظ بالباقي.', 'شكرًا. مرحبًا بك مرة أخرى.'],
    ],
    talk: script(`
      BAKER: Good morning. What can I get you?
      RANIA: Good morning. What's fresh today?
      BAKER: The baguettes are fresh and still warm.
      RANIA: That sounds good. I'd like two baguettes, please.
      BAKER: Of course. Anything else?
      RANIA: Yes. Do you have whole-wheat bread?
      BAKER: Sorry, we're out of it today.
      RANIA: Oh, that's a shame. Do you have anything similar?
      BAKER: Yes. We have this fresh loaf. It's very good.
      RANIA: Is it from today?
      BAKER: Yes. It was made this morning.
      RANIA: Great. I'll take one, please.
      BAKER: Sure. Would you like any pastries?
      RANIA: Maybe. Are the croissants fresh?
      BAKER: Yes, they were made this morning too.
      RANIA: How much is one?
      BAKER: They're six dirhams each.
      RANIA: OK. I'll take four.
      BAKER: Four croissants. Anything sweet?
      RANIA: What kind of cake do you have?
      BAKER: We have chocolate cake and vanilla cake.
      RANIA: Which one do you recommend?
      BAKER: The chocolate cake is very popular.
      RANIA: All right. Could I have one piece, please?
      BAKER: Of course. A large piece or a small one?
      RANIA: A small one is fine.
      BAKER: No problem. Is that everything?
      RANIA: Actually, can I have two more croissants?
      BAKER: Of course. So that's six croissants altogether.
      RANIA: Yes, that's right.
      BAKER: Anything else?
      RANIA: No, that's all. How much is it altogether?
      BAKER: That comes to seventy-five dirhams.
      RANIA: Can I pay by card?
      BAKER: Yes, of course.
      RANIA: Great. Could I have a bag, please?
      BAKER: Sure. Would you like everything in one bag?
      RANIA: Yes, that's fine.
      BAKER: Here you are. Have a nice day.
      RANIA: Thank you. You too.
    `),
    reading: { title: 'Fresh from the Bakery', body: [
      'Rania goes to the bakery near her house most mornings. The first thing she asks is, "What\'s fresh today?"',
      'Today the baguettes are fresh and still warm, so she takes two. She also wants whole-wheat bread, but Hakim is out of it today. Instead, he shows her a fresh loaf that was made this morning. It looks good, so she takes one.',
      'The croissants are fresh too. They are six dirhams each, and Rania takes four. Then she changes her mind and asks for two more, so that is six croissants altogether.',
      'Hakim has chocolate cake and vanilla cake. He says the chocolate one is very popular, so Rania takes a small piece.',
      'Everything comes to seventy-five dirhams. She pays by card and asks for a bag.',
    ] },
    yours: [
      'Ask what is fresh today and order your bread. - اسأل عن الطازج اليوم واطلب خبزك.',
      'Ask the price of one item, then the total. - اسأل عن ثمن قطعة واحدة، ثم عن المجموع.',
      'Write what you usually buy at the bakery. - اكتب ما تشتريه عادةً من المخبزة.',
    ],
  },

  {
    n: 9, titleEn: 'At the Clothes Shop', titleAr: 'في متجر الملابس', icons: ['👕', '🛍️'],
    goal: 'تعلّم كيف تسأل عن المقاس واللون والسعر، تجرّب الملابس، وتطلب مقاسًا أو لونًا آخر.',
    vocab: words('👔 shirt = قميص | 👕 T-shirt = تي شيرت | 🧥 jacket = سترة / جاكيت | 🕴️ trousers = بنطال / بنطلون | 👖 jeans = بنطال جينز | 👗 dress = فستان | 👞 shoes = حذاء | 📏 size = مقاس | 🤏 small = صغير | 👌 medium = متوسط | 🙌 large = كبير | 🎨 colour = لون | ⚫ black = أسود | ⚪ white = أبيض | 🚪 fitting room = غرفة القياس | 🏷️ price = سعر / ثمن | 🔄 exchange = استبدال | 💸 refund = استرجاع المبلغ'),
    expressions: [
      ['Hello. Can I help you?', "Yes, I'm looking for a jacket.", 'مرحبًا. هل يمكنني مساعدتك؟', 'نعم، أبحث عن سترة.'],
      ['What kind of jacket are you looking for?', 'Something simple for everyday use.', 'ما نوع السترة التي تبحث عنها؟', 'شيء بسيط للاستعمال اليومي.'],
      ['How about this one?', 'I like it. Do you have it in my size?', 'ما رأيك في هذه؟', 'تعجبني. هل لديكم منها بمقاسي؟'],
      ['What size do you usually wear?', 'I usually wear a medium.', 'ما المقاس الذي ترتديه عادةً؟', 'أرتدي عادةً المقاس المتوسط.'],
      ['Do you have it in black?', 'We have it in black and white.', 'هل لديكم منها باللون الأسود؟', 'لدينا منها بالأسود والأبيض.'],
      ['Can I try it on?', 'Of course. The fitting rooms are over there.', 'هل يمكنني تجربتها؟', 'بالطبع. غرف القياس هناك.'],
      ['How does it fit?', "It's a little too small.", 'هل مقاسها مناسب؟', 'إنها صغيرة قليلًا.'],
      ['Would you like a larger size?', 'Yes. Can I try the large?', 'هل تريد مقاسًا أكبر؟', 'نعم. هل يمكنني تجربة المقاس الكبير؟'],
      ['Do you have the large in black?', 'Sorry, we only have the large in white.', 'هل لديكم المقاس الكبير بالأسود؟', 'عذرًا، لدينا المقاس الكبير بالأبيض فقط.'],
      ['Is this size better?', 'Yes, this one fits much better.', 'هل هذا المقاس أفضل؟', 'نعم، هذه تناسبني أفضل بكثير.'],
      ['How much is it?', "It's three hundred and fifty dirhams.", 'كم ثمنها؟', 'ثمنها ثلاثمئة وخمسون درهمًا.'],
      ['Is it on sale?', "Yes, it's twenty percent off today.", 'هل عليها تخفيض؟', 'نعم، عليها تخفيض بعشرين في المئة اليوم.'],
      ['It looks good on you.', "Great. I'll take it.", 'تبدو جميلة عليك.', 'رائع. سآخذها.'],
      ["Can I exchange it if there's a problem?", 'Yes. Just keep the receipt.', 'هل يمكنني استبدالها إن كانت هناك مشكلة؟', 'نعم. فقط احتفظ بالإيصال.'],
      ['Can I get a refund?', 'You can exchange it or get a refund with the receipt.', 'هل يمكنني استرجاع المبلغ؟', 'يمكنك استبدالها أو استرجاع المبلغ بالإيصال.'],
    ],
    talk: script(`
      ASSISTANT: Hello. Can I help you?
      KARIM: Yes, please. I'm looking for a jacket.
      ASSISTANT: Sure. What kind of jacket are you looking for?
      KARIM: Something simple and comfortable for everyday wear.
      ASSISTANT: How about this one?
      KARIM: I like the style. Do you have it in black?
      ASSISTANT: Yes, we do. What size do you usually wear?
      KARIM: I usually wear a medium.
      ASSISTANT: Here you are. Would you like to try it on?
      KARIM: Yes, please. Where are the fitting rooms?
      ASSISTANT: They're over there, next to the mirror. How does it fit?
      KARIM: I like it, but it's a little too small.
      ASSISTANT: Would you like to try a large?
      KARIM: Yes, please. I think a large will be better.
      ASSISTANT: Let me check. We have a large, but unfortunately not in black.
      KARIM: Oh. What colours do you have in large?
      ASSISTANT: We have white and grey.
      KARIM: Can I see the grey one?
      ASSISTANT: Of course. Here it is.
      KARIM: I actually like this colour too. Can I try it on?
      ASSISTANT: Sure. Is this size better?
      KARIM: Yes, much better. It fits me well.
      ASSISTANT: It looks good on you too.
      KARIM: Thanks. How much is it?
      ASSISTANT: The regular price is three hundred and fifty dirhams.
      KARIM: Is it on sale today?
      ASSISTANT: Yes. It's twenty percent off.
      KARIM: Nice. What's the price after the discount?
      ASSISTANT: It's two hundred and eighty dirhams.
      KARIM: That's a good price. One question: can I exchange it if there's a problem?
      ASSISTANT: Yes, of course. Just keep the receipt.
      KARIM: And can I get a refund if I return it?
      ASSISTANT: Yes, you can return or exchange it with the receipt.
      KARIM: Perfect. I'll take it.
      ASSISTANT: Great. Would you like a bag?
      KARIM: Yes, please. Can I pay by card?
      ASSISTANT: Of course. You can tap your card here.
      KARIM: Done.
      ASSISTANT: Thank you. Here's your receipt. Keep it. You need it to exchange the jacket.
      KARIM: I will. Thank you for your help.
      ASSISTANT: You're welcome. Have a nice day.
    `),
    reading: { title: 'Karim Buys a Jacket', body: [
      'Karim needs a jacket for everyday use — something simple and comfortable. He goes to a clothes shop after work, and Hala helps him.',
      'She shows him a jacket, and Karim likes the style. He asks if they have it in black. They do, so he tries it on. The fitting rooms are next to the mirror.',
      'The medium is a little too small, so he asks for a large. Unfortunately, they do not have the large in black. They only have it in white and grey.',
      'Karim looks at the grey one. He actually likes that colour too, so he tries it on again. This time it fits him well, and Hala says it looks good on him.',
      'The normal price is three hundred and fifty dirhams, but today there is twenty percent off. Karim pays two hundred and eighty dirhams and keeps the receipt.',
    ] },
    yours: [
      'Ask for an item in your size and your favourite colour. - اطلب قطعة بمقاسك ولونك المفضّل.',
      "Say it doesn't fit and ask for another size. - قل إنها لا تناسبك واطلب مقاسًا آخر.",
      'Write about the clothes you are wearing today. - اكتب عن الملابس التي ترتديها اليوم.',
    ],
  },

  {
    n: 10, titleEn: 'Meeting a Friend', titleAr: 'لقاء صديق', icons: ['🤝', '☕'],
    goal: 'تعلّم كيف تبدأ محادثة ودّية، تسأل عن الأخبار والحياة اليومية، وتقترح لقاءً بطريقة طبيعية.',
    vocab: words('🤝 meet = أقابل | 🧑‍🤝‍🧑 friend = صديق | ⏳ a while = مدة | 🏫 class = الحصة الدراسية | 💼 work = العمل | 🏃 busy = مشغول | 👨‍👩‍👧 family = العائلة | 🗓️ weekend = عطلة نهاية الأسبوع | 📝 plans = خطط | 😌 free = متفرّغ | ☕ coffee = قهوة | 🥙 lunch = غداء | 🌙 tonight = الليلة | ⏰ later = لاحقًا | 📅 tomorrow = غدًا | 💛 take care = اعتنِ بنفسك'),
    expressions: [
      ["Hey! It's good to see you.", "You too! It's been a while.", 'أهلًا! سعيد برؤيتك.', 'وأنا أيضًا! مضت مدة.'],
      ['How have you been?', "I've been good, thanks. What about you?", 'كيف حالك هذه الأيام؟', 'بخير، شكرًا. وأنت؟'],
      ['What have you been up to?', "I've been busy with work.", 'ماذا كنت تفعل مؤخرًا؟', 'كنت مشغولًا بالعمل.'],
      ['That sounds busy.', 'Yes, but things are calmer now.', 'يبدو أنك كنت مشغولًا.', 'نعم، لكن الأمور أهدأ الآن.'],
      ["How's your family?", "They're doing well, thanks.", 'كيف حال عائلتك؟', 'إنهم بخير، شكرًا.'],
      ['Anything new with you?', 'Actually, I started a new job.', 'هل من جديد عندك؟', 'في الحقيقة، بدأت عملًا جديدًا.'],
      ["Really? That's great!", "Thanks. I'm really happy about it.", 'حقًا؟ هذا رائع!', 'شكرًا. أنا سعيد جدًا بذلك.'],
      ['Are you free this weekend?', 'I think so. What do you have in mind?', 'هل أنت متفرّغ في عطلة نهاية الأسبوع؟', 'أظن ذلك. ماذا تقترح؟'],
      ['Do you want to get a coffee?', "I'd love to.", 'هل تريد أن نشرب قهوة؟', 'بكل سرور.'],
      ['What time works for you?', 'How about Saturday afternoon?', 'ما الوقت المناسب لك؟', 'ما رأيك في السبت بعد الظهر؟'],
      ["I'd love to, but I'm busy then.", 'No problem. What about Sunday?', 'أودّ ذلك، لكنني مشغول حينها.', 'لا مشكلة. ماذا عن الأحد؟'],
      ['Sunday works for me.', 'Great. See you on Sunday.', 'الأحد يناسبني.', 'رائع. أراك يوم الأحد.'],
      ['I should get going.', 'It was really good seeing you.', 'يجب أن أذهب الآن.', 'سعدت كثيرًا برؤيتك.'],
      ['Take care.', "You too. I'll text you.", 'اعتنِ بنفسك.', 'وأنت أيضًا. سأراسلك.'],
    ],
    talk: script(`
      KARIM: Salma? Hey! Is that you?
      SALMA: Karim! Wow, it's good to see you.
      KARIM: You too. It's been a while.
      SALMA: It really has. How have you been?
      KARIM: I've been good, thanks. Busy, but good. What about you?
      SALMA: Pretty good. I've been really busy with work too.
      KARIM: I know the feeling. What have you been up to?
      SALMA: Mostly work and family. I haven't had much free time.
      KARIM: Same here. I feel like every week goes so quickly.
      SALMA: Exactly! One week ends and another one starts.
      KARIM: So, how's your family?
      SALMA: They're doing well, thanks. My sister started university this year.
      KARIM: Really? That's great. How does she like it?
      SALMA: She loves it, but she says she has a lot of work.
      KARIM: That sounds normal! And how are your parents?
      SALMA: They're fine, thanks. What about your family?
      KARIM: Everyone's doing well. My brother just started a new job.
      SALMA: Nice! Is he enjoying it?
      KARIM: Yes, he likes it. He's still learning a lot.
      SALMA: That's good. Anything new with you?
      KARIM: Actually, I'm working on a new project at work.
      SALMA: Oh, nice. How's it going?
      KARIM: Pretty well, but it's keeping me busy.
      SALMA: Well, at least you're enjoying it.
      KARIM: That's true. Are you free this weekend?
      SALMA: Maybe. What do you have in mind?
      KARIM: We should get a coffee and catch up properly.
      SALMA: I'd love to. How about Saturday afternoon?
      KARIM: Ah, I can't on Saturday. I'm visiting my family.
      SALMA: No problem. What about Sunday?
      KARIM: Sunday works for me. Are you free in the afternoon?
      SALMA: Yes. How about around four?
      KARIM: Perfect. Four works for me.
      SALMA: Great. It'll be nice to sit down and talk properly.
      KARIM: Definitely. We have a lot to catch up on.
      SALMA: I should get going now. My class starts in ten minutes.
      KARIM: Oh, I don't want to make you late.
      SALMA: It's fine. I'm still on time.
      KARIM: All right. It was really good seeing you.
      SALMA: You too. See you on Sunday.
      KARIM: See you then. Take care.
      SALMA: You too. Bye!
    `),
    reading: { title: 'An Old Friend in the Street', body: [
      'Karim is walking to the shops when he sees Salma. They have not seen each other for a long time, so they stop to talk.',
      'Both of them are busy. Salma has a lot of work, and she says she has not had much free time. Karim feels the same. He is working on a new project, and it is keeping him busy.',
      "They talk about their families. Salma's sister started university this year. She loves it, but she says she has a lot of work. Karim's brother started a new job. He likes it, and he is still learning a lot.",
      "They decide to meet again and catch up properly. Saturday is not good for Karim, because he is visiting his family, but Sunday afternoon works for both of them. They agree on four o'clock.",
      'Then Salma looks at the time. Her class starts in ten minutes, so she says goodbye and goes.',
    ] },
    yours: [
      'Greet a friend you have not seen for a while and ask for news. - حيِّ صديقًا لم تره منذ مدة واسأله عن أخباره.',
      'Suggest a day and a time to meet, then agree. - اقترح يومًا ووقتًا للقاء، ثم اتّفقا.',
      'Write a message to invite a friend for coffee. - اكتب رسالة تدعو فيها صديقًا لشرب القهوة.',
    ],
  },

  {
    n: 11, titleEn: 'At the Barber / Hair Salon', titleAr: 'عند الحلاق / صالون الشعر', icons: ['💈', '✂️'],
    goal: 'تعلّم كيف تشرح قصّة الشعر التي تريدها، تسأل عن الطول والتفاصيل، وتسأل عن السعر.',
    vocab: words('💈 barber = حلاق | 💇‍♀️ hair salon = صالون الشعر | 📅 appointment = موعد | 💇 haircut = قصّة شعر | ✂️ cut = يقصّ | 📏 trim = تشذيب | 💨 style = تصفيف | 🔽 short = قصير | 🔼 long = طويل | 💁 hair = شعر | 🫧 wash = يغسل | 🧔 beard = لحية | ↔️ sides = الجانبان | ⬆️ top = الأعلى | ↩️ back = الخلف | 〰️ wavy = مموّج | 👩‍🦱 curly = مجعّد | 🎀 ponytail = ذيل حصان'),
    expressions: [
      ['Hello. Do you have an appointment?', "No, I don't. Is that OK?", 'مرحبًا. هل لديك موعد؟', 'لا. هل هذا مناسب؟'],
      ["That's fine. The wait is about ten minutes.", "That's fine. I'll wait.", 'لا مشكلة. الانتظار حوالي عشر دقائق.', 'لا بأس. سأنتظر.'],
      ['How would you like it?', 'Just a little shorter, please.', 'كيف تريد قصّة شعرك؟', 'أقصر قليلًا فقط، من فضلك.'],
      ['How about the sides?', 'Shorter on the sides, please.', 'وماذا عن الجانبين؟', 'أقصر على الجانبين، من فضلك.'],
      ['And the top?', 'Leave the top a little longer. Not too short, please.', 'وماذا عن الأعلى؟', 'اترك الأعلى أطول قليلًا. ليس قصيرًا جدًا، من فضلك.'],
      ['Would you like me to wash your hair first?', 'Yes, please.', 'هل تريد أن أغسل شعرك أولًا؟', 'نعم، من فضلك.'],
      ['Would you like anything else?', 'Can you trim my beard too?', 'هل تريد شيئًا آخر؟', 'هل يمكنك تشذيب لحيتي أيضًا؟'],
      ['Take a look in the mirror.', 'Can you make it a little shorter here?', 'ألقِ نظرة في المرآة.', 'هل يمكنك أن تقصّره قليلًا هنا؟'],
      ['Here?', 'Yes, exactly.', 'هنا؟', 'نعم، بالضبط.'],
      ['Is that better?', "Yes, that's perfect.", 'هل هذا أفضل؟', 'نعم، هذا ممتاز.'],
      ['How much is it?', "It's one hundred and twenty dirhams.", 'كم السعر؟', 'السعر مئة وعشرون درهمًا.'],
      ['Can I pay by card?', 'Yes, of course.', 'هل يمكنني الدفع بالبطاقة؟', 'نعم، بالتأكيد.'],
      ["Thanks. I'm happy with it.", "You're welcome. See you next time.", 'شكرًا. أنا سعيد بالنتيجة.', 'على الرحب والسعة. إلى المرة القادمة.'],
    ],
    talk: script(`
      RANIA: Hello. Do I need an appointment?
      KARIM: Hello. No, you don't. But there's a short wait.
      RANIA: How long is the wait?
      KARIM: About ten minutes.
      RANIA: That's fine. I'll wait.
      KARIM: Great. You can sit over there.
      RANIA: Thank you.
      KARIM: All right, I'm ready for you. What would you like today?
      RANIA: I'd like a haircut, please.
      KARIM: Sure. How would you like it?
      RANIA: Just a little shorter. I don't want a big change.
      KARIM: No problem. How about the sides?
      RANIA: A little shorter on the sides, please.
      KARIM: And the back?
      RANIA: The back can be short too.
      KARIM: What about the top?
      RANIA: Leave the top a little longer, please.
      KARIM: Got it. So, shorter on the sides and back, but longer on top.
      RANIA: Exactly. And not too short, please.
      KARIM: Of course. Would you like me to wash your hair first?
      RANIA: Yes, please.
      KARIM: All right. Come this way, please.
      RANIA: OK.
      KARIM: Now, how does the length look so far?
      RANIA: The top looks good. Can you make the sides a little shorter?
      KARIM: Sure. Just a little?
      RANIA: Yes, just a little.
      KARIM: Like this?
      RANIA: Yes, that's better.
      KARIM: Good. I'll finish the back now.
      RANIA: Take your time.
      KARIM: All done. Take a look in the mirror.
      RANIA: It looks good. Can you make it a little shorter here?
      KARIM: Here on the side?
      RANIA: Yes, exactly. Just a little more.
      KARIM: How about now?
      RANIA: That's perfect. I really like it.
      KARIM: Great. Would you like anything else?
      RANIA: No, that's all. Thank you. How much is it?
      KARIM: It's one hundred and twenty dirhams.
      RANIA: Can I pay by card?
      KARIM: Yes, of course.
      RANIA: Done. Thanks. I'm really happy with it.
      KARIM: You're welcome. See you next time.
    `),
    reading: { title: 'A Haircut on a Busy Day', body: [
      'Rania does not have an appointment, but she goes to the hair salon anyway. Karim tells her there is a short wait — about ten minutes. That is fine, so she sits down and waits.',
      'When it is her turn, Karim asks what she would like today. Rania wants a haircut, but not a big change. She asks for it just a little shorter.',
      'She wants the sides a little shorter and the back short too, but she asks Karim to leave the top a little longer. Not too short, she says.',
      'First Karim washes her hair. While he is cutting, he stops and asks how the length looks. The top looks good, but Rania asks him to make the sides a little shorter.',
      'At the end, she takes a look in the mirror. It is exactly what she wanted. The haircut is one hundred and twenty dirhams, and she pays by card.',
    ] },
    yours: [
      'Describe the haircut you want: sides, back and top. - صِف القصّة التي تريدها: الجانبان والخلف والأعلى.',
      'Ask for a small change after looking in the mirror. - اطلب تعديلًا صغيرًا بعد النظر في المرآة.',
      'Write how you usually like your hair. - اكتب كيف تحبّ شعرك عادةً.',
    ],
  },

  {
    n: 12, titleEn: 'At the Pharmacy', titleAr: 'في الصيدلية', icons: ['💊', '🩺'],
    goal: 'تعلّم كيف تصف مشكلة صحية بسيطة، تسأل عن دواء، وتفهم التعليمات الأساسية بطريقة آمنة.',
    vocab: words('🤕 headache = صداع | 😷 sore throat = التهاب الحلق | 😮‍💨 cough = سعال | 🤧 cold = زكام | 🤒 fever = حمّى | 😣 pain = ألم | 👩‍⚕️ pharmacist = الصيدلي | 💊 medicine = دواء | ⚪ tablets = أقراص | 🍯 syrup = شراب | 🥄 dose = جرعة | 🌅 morning = صباحًا | 🌙 night = ليلًا | 💵 cash = نقدًا | 💳 card = بطاقة | 🧾 receipt = إيصال'),
    expressions: [
      ['How can I help you?', 'I have a sore throat.', 'كيف يمكنني مساعدتك؟', 'عندي التهاب في الحلق.'],
      ['How long have you had it?', "I've had it for three days.", 'منذ متى وأنت تشعر به؟', 'منذ ثلاثة أيام.'],
      ['Do you have any other symptoms?', 'I have a cough too, but no fever.', 'هل لديك أعراض أخرى؟', 'عندي سعال أيضًا، لكن بدون حمّى.'],
      ['Do you have something for a cough?', 'Yes. We have tablets or syrup.', 'هل لديكم شيء للسعال؟', 'نعم. لدينا أقراص أو شراب.'],
      ['Do you prefer tablets or syrup?', 'Syrup, please.', 'هل تفضّل الأقراص أم الشراب؟', 'الشراب، من فضلك.'],
      ['Are you taking any other medicine?', "No, I'm not.", 'هل تتناول أي دواء آخر؟', 'لا.'],
      ['How often should I take it?', 'Three times a day, after meals.', 'كم مرة يجب أن أتناوله؟', 'ثلاث مرات في اليوم، بعد الأكل.'],
      ['How much should I take?', "One spoon each time. It's on the label.", 'ما الكمية التي أتناولها؟', 'ملعقة واحدة في كل مرة. مكتوب على العلبة.'],
      ['Does it make you sleepy?', "A little. Don't drive after you take it.", 'هل يسبّب النعاس؟', 'قليلًا. لا تَقُد السيارة بعد تناوله.'],
      ["What if I don't feel better?", "If you're not better in three days, see a doctor.", 'ماذا أفعل إذا لم أتحسّن؟', 'إذا لم تتحسّن خلال ثلاثة أيام، راجع طبيبًا.'],
      ['How much is it?', "It's forty-five dirhams.", 'كم ثمنه؟', 'ثمنه خمسة وأربعون درهمًا.'],
      ['Thank you for your help.', "You're welcome. Get well soon.", 'شكرًا على مساعدتك.', 'على الرحب والسعة. شفاك الله.'],
    ],
    talk: script(`
      SALMA: Hello. Can you help me, please?
      PHARMACIST: Of course. What's the problem?
      SALMA: I have a sore throat and a cough.
      PHARMACIST: I'm sorry to hear that. How long have you had it?
      SALMA: For about three days.
      PHARMACIST: Do you have a fever?
      SALMA: No, I don't. Just the sore throat and the cough.
      PHARMACIST: Is the cough bad?
      SALMA: It's worse at night. I can't sleep well.
      PHARMACIST: Are you taking any other medicine at the moment?
      SALMA: No, nothing.
      PHARMACIST: Do you have any allergies?
      SALMA: No, I don't.
      PHARMACIST: OK. We have a cough medicine. Do you prefer tablets or syrup?
      SALMA: Syrup, please. It's easier for me.
      PHARMACIST: Here you are. It's good for a cough and a sore throat.
      SALMA: How often should I take it?
      PHARMACIST: Three times a day: morning, afternoon and night.
      SALMA: And how much each time?
      PHARMACIST: One spoon. It's written here on the label.
      SALMA: Should I take it with food?
      PHARMACIST: Yes. Take it after meals.
      SALMA: Does it make you sleepy?
      PHARMACIST: A little. So don't drive after you take it.
      SALMA: That's fine. I don't drive.
      PHARMACIST: Also, drink a lot of water and rest.
      SALMA: What if I don't feel better?
      PHARMACIST: If you're not better in three days, please see a doctor.
      SALMA: All right. How much is it?
      PHARMACIST: It's forty-five dirhams.
      SALMA: Can I pay by card?
      PHARMACIST: Yes, of course.
      SALMA: Here you are. Thank you for your help.
      PHARMACIST: You're welcome. Get well soon.
    `),
    reading: { title: 'At the Pharmacy', body: [
      'Salma has a sore throat and a cough. She has had them for about three days. She does not have a fever, but the cough is worse at night, and she cannot sleep well.',
      'She goes to the pharmacy near her house and explains the problem. The pharmacist asks if she is taking any other medicine or has any allergies. She is not, and she has no allergies.',
      'The pharmacist shows her a cough medicine. There are tablets and there is syrup, and Salma prefers syrup. She takes one spoon three times a day, after meals. The instructions are on the label.',
      'The syrup can make her a little sleepy, so she should not drive after she takes it. The pharmacist also tells her to drink a lot of water and rest. If she is not better in three days, she should see a doctor.',
      'The syrup is forty-five dirhams. Salma pays by card and goes home to rest.',
    ] },
    yours: [
      'Describe a small health problem and how long you have had it. - صِف مشكلة صحية بسيطة ومنذ متى تعاني منها.',
      'Ask how and when to take a medicine. - اسأل كيف ومتى تتناول دواءً.',
      'Write three questions to ask a pharmacist. - اكتب ثلاثة أسئلة تطرحها على الصيدلي.',
    ],
  },

  {
    n: 13, titleEn: 'At the Clinic', titleAr: 'في العيادة', icons: ['🏥', '🩺'],
    goal: 'تعلّم كيف تحجز موعدًا، تصف أعراضك ومنذ متى بدأت، وتجيب عن أسئلة الطبيب.',
    vocab: words('📅 appointment = موعد | 🏥 clinic = عيادة | 👨‍⚕️ doctor = طبيب | 🛎️ reception = الاستقبال | 👩‍⚕️ nurse = ممرّض / ممرّضة | 🪑 waiting room = قاعة الانتظار | 😣 pain = ألم | 🤒 fever = حمّى | 😮‍💨 cough = سعال | 🌡️ temperature = درجة الحرارة | 🌼 allergy = حساسية | 💊 medicine = دواء | 📝 prescription = وصفة طبية | 🛌 rest = راحة | 🩺 examination = فحص طبي | 🩸 blood pressure = ضغط الدم | 📋 medical history = التاريخ الطبي | 🧪 test results = نتائج التحاليل'),
    expressions: [
      ["I'd like to make an appointment.", 'Of course. What day works for you?', 'أودّ حجز موعد.', 'بالطبع. أي يوم يناسبك؟'],
      ['Do you have anything available today?', 'We have an appointment at four.', 'هل لديكم موعد متاح اليوم؟', 'لدينا موعد في الساعة الرابعة.'],
      ['Hello. I have an appointment at four.', 'Can I have your name, please?', 'مرحبًا. لديّ موعد في الرابعة.', 'ما اسمك، من فضلك؟'],
      ["It's Nadia Hassan.", 'Please take a seat in the waiting room.', 'اسمي نادية حسن.', 'تفضّلي بالجلوس في قاعة الانتظار.'],
      ['How long is the wait?', 'Not long. The doctor will see you soon.', 'كم مدة الانتظار؟', 'ليست طويلة. سيستقبلك الطبيب قريبًا.'],
      ['How can I help you today?', "I'm not feeling well.", 'كيف يمكنني مساعدتك اليوم؟', 'لا أشعر أنني بخير.'],
      ['What symptoms are you having?', 'I have a cough and a headache.', 'ما الأعراض التي تشعر بها؟', 'عندي سعال وصداع.'],
      ['When did it start?', 'It started about three days ago.', 'متى بدأ؟', 'بدأ منذ حوالي ثلاثة أيام.'],
      ['Is it getting better or worse?', "It's about the same.", 'هل يتحسّن أم يزداد سوءًا؟', 'إنه تقريبًا كما هو.'],
      ['Do you have a fever?', "No, I don't.", 'هل لديك حمّى؟', 'لا.'],
      ['Does it hurt anywhere?', 'Yes, my stomach hurts here.', 'هل تشعر بألم في مكان ما؟', 'نعم، معدتي تؤلمني هنا.'],
      ['Does it hurt when I press here?', 'Yes, right there.', 'هل يؤلمك عندما أضغط هنا؟', 'نعم، هناك بالضبط.'],
      ['Are you taking any medication?', "No, I'm not taking anything.", 'هل تتناول أي دواء؟', 'لا، لا أتناول أي شيء.'],
      ['Do you have any allergies?', 'No, not that I know of.', 'هل لديك أي حساسية؟', 'لا، ليس على حدّ علمي.'],
      ['What should I do?', 'Rest at home and drink a lot of water.', 'ماذا يجب أن أفعل؟', 'ارتح في البيت واشرب الكثير من الماء.'],
      ['Do I need a prescription?', 'Yes. Take this to the pharmacy.', 'هل أحتاج إلى وصفة طبية؟', 'نعم. خذ هذه إلى الصيدلية.'],
    ],
    talk: script(`
      NADIA: Hello. I'd like to make an appointment, please.
      RECEPTIONIST: Of course. Do you need to see the doctor today?
      NADIA: If possible. I'm not feeling very well.
      RECEPTIONIST: All right. We have an appointment available at four.
      NADIA: That works for me.
      RECEPTIONIST: Great. Can I have your name, please?
      NADIA: Yes. Nadia Hassan.
      RECEPTIONIST: Thank you. We'll see you at four.
      NADIA: Good afternoon. I have an appointment at four.
      RECEPTIONIST: Of course. What's your name, please?
      NADIA: Nadia Hassan.
      RECEPTIONIST: Thank you. Please take a seat in the waiting room.
      NADIA: How long is the wait?
      RECEPTIONIST: Not long. The doctor will see you soon.
      NADIA: Thank you.
      DOCTOR: Hello, Nadia. Come in and take a seat.
      NADIA: Thank you, doctor.
      DOCTOR: How can I help you today?
      NADIA: I haven't been feeling well for the last few days.
      DOCTOR: What symptoms are you having?
      NADIA: I have a cough and a headache, and I feel very tired.
      DOCTOR: When did the cough start?
      NADIA: About three days ago.
      DOCTOR: Is it getting better or worse?
      NADIA: It's about the same.
      DOCTOR: Do you have a fever?
      NADIA: I'm not sure. I felt hot last night.
      DOCTOR: All right. I'll check your temperature. Do you have any pain anywhere else?
      NADIA: Yes, my stomach hurts a little.
      DOCTOR: Can you show me where?
      NADIA: Here, on this side.
      DOCTOR: Does it hurt when I press here?
      NADIA: A little, yes.
      DOCTOR: What about here?
      NADIA: No, not there.
      DOCTOR: All right. Are you taking any medication at the moment?
      NADIA: No, I'm not taking anything.
      DOCTOR: Do you have any allergies?
      NADIA: No, not that I know of.
      DOCTOR: All right. Your temperature is thirty-eight. You have a fever.
      NADIA: Is it serious?
      DOCTOR: No, don't worry. I think it's the flu.
      NADIA: What should I do?
      DOCTOR: Rest at home for a few days and drink a lot of water.
      NADIA: Do I need a prescription?
      DOCTOR: Yes. Here you are. Take this to the pharmacy.
      NADIA: Should I come back?
      DOCTOR: If you don't feel better in a week, make another appointment.
      NADIA: I understand. Thank you, doctor.
      DOCTOR: You're welcome. Get well soon.
    `),
    reading: { title: 'Nadia Sees the Doctor', body: [
      "Nadia has not been feeling well for a few days, so she calls the clinic near her house. She asks for an appointment, and the receptionist gives her one at four o'clock the same day.",
      'When she arrives, she gives her name and takes a seat in the waiting room. The wait is not long, and soon the doctor calls her in.',
      'Nadia explains her symptoms. She has a cough and a headache, and she feels very tired. The cough started about three days ago, and it is about the same now.',
      'The doctor asks if she has a fever. Nadia is not sure, but she felt hot last night, so the doctor checks her temperature. Her stomach also hurts a little on one side.',
      'The doctor asks if Nadia takes any medication or has any allergies. She does not. Her temperature is thirty-eight, so she has a fever. The doctor thinks it is the flu, gives her a prescription, and tells her to rest at home and drink a lot of water.',
    ] },
    yours: [
      'Call the clinic and book an appointment for today. - اتصل بالعيادة واحجز موعدًا لليوم.',
      'Answer the doctor: your symptoms, since when, any allergies. - أجب الطبيب: أعراضك، منذ متى، وهل لديك حساسية.',
      'Write a short note about how you feel today. - اكتب ملاحظة قصيرة عن شعورك اليوم.',
    ],
  },
]
