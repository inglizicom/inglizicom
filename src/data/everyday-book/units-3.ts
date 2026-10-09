import { script, words, type EverydayUnit } from './types.ts'

/** Units 14–19: market, transport, directions, hotel, bank, phone & WhatsApp. */

export const UNITS_14_19: EverydayUnit[] = [
  {
    n: 14, titleEn: 'At the Traditional Market', titleAr: 'في السوق التقليدي', icons: ['🍅', '⚖️'],
    goal: 'تعلّم كيف تسأل عن الأسعار والكميات، وتتفاوض على السعر بطريقة بسيطة ومهذّبة.',
    vocab: words('🍅 tomatoes = الطماطم | 🥔 potatoes = البطاطس | 🧅 onions = البصل | 🌿 fresh = طازج | 🥦 vegetables = الخضروات | 🍊 fruit = الفواكه | 🏷️ price = السعر | 💸 expensive = غالٍ | 👍 cheap = رخيص | ⚖️ kilo = كيلوغرام | ½ half a kilo = نصف كيلوغرام | 🍋 piece = قطعة | 📉 discount = تخفيض | 🤝 a better price = سعر أفضل | 💵 cash = نقدًا | 🪙 change = الباقي | 🧮 the total = المجموع'),
    expressions: [
      ['Do you have any fresh tomatoes?', 'Yes. How much would you like?', 'هل لديك طماطم طازجة؟', 'نعم. كم تريد؟'],
      ['Are these fresh?', "Yes, they're very fresh.", 'هل هذه طازجة؟', 'نعم، إنها طازجة جدًا.'],
      ['How much are these?', "They're twenty-five dirhams a kilo.", 'بكم هذه؟', 'بخمسة وعشرين درهمًا للكيلوغرام.'],
      ["I'd like one kilo, please.", 'Is that enough?', 'أريد كيلوغرامًا واحدًا، من فضلك.', 'هل هذه الكمية كافية؟'],
      ["Yes, that's enough.", 'Anything else?', 'نعم، هذا كافٍ.', 'هل تريد شيئًا آخر؟'],
      ['How much is a kilo of onions?', "It's twenty dirhams.", 'بكم كيلوغرام البصل؟', 'بعشرين درهمًا.'],
      ['Give me half a kilo, please.', 'Of course. Here you are.', 'أعطني نصف كيلوغرام، من فضلك.', 'بالطبع. تفضّل.'],
      ["That's a little expensive.", 'The tomatoes are very good today.', 'هذا غالٍ قليلًا.', 'الطماطم جيدة جدًا اليوم.'],
      ['Can you give me a better price?', 'I can make it fifty-five.', 'هل يمكنك أن تعطيني سعرًا أفضل؟', 'يمكنني أن أجعله خمسة وخمسين.'],
      ['Can you make it fifty?', 'Fifty-five is my best price.', 'هل يمكنك أن تجعله خمسين؟', 'خمسة وخمسون هو أفضل سعر عندي.'],
      ["Okay, deal. I'll take it.", 'Great. Anything else?', 'حسنًا، اتّفقنا. سآخذه.', 'رائع. هل تريد شيئًا آخر؟'],
      ["Not today, thank you. How much is it altogether?", "That's fifty-five dirhams altogether.", 'ليس اليوم، شكرًا. كم المجموع؟', 'المجموع خمسة وخمسون درهمًا.'],
      ["Here's one hundred. Do you have change?", "Yes. Here's your change.", 'تفضّل مئة درهم. هل لديك الباقي؟', 'نعم. تفضّل الباقي.'],
      ['Can I have a bag, please?', 'Sure. Here you are.', 'هل يمكنني الحصول على كيس، من فضلك؟', 'بالتأكيد. تفضّل.'],
    ],
    talk: script(`
      SELLER: Good morning. What are you looking for today?
      NADIA: Good morning. I need some tomatoes and onions. Are these tomatoes fresh?
      SELLER: Yes, very fresh. They came in this morning.
      NADIA: They look good. How much are these?
      SELLER: They're twenty-five dirhams a kilo.
      NADIA: All right. I'd like two kilos, please.
      SELLER: Two kilos. Is that enough?
      NADIA: Yes, that's enough. How much are the onions?
      SELLER: They're twenty dirhams a kilo.
      NADIA: Give me half a kilo, please.
      SELLER: Of course. Anything else?
      NADIA: How much are the potatoes?
      SELLER: Ten dirhams a kilo. They're good today.
      NADIA: Hmm, maybe. How much is everything so far?
      SELLER: The tomatoes and onions come to sixty dirhams.
      NADIA: Sixty? That's a little expensive.
      SELLER: The tomatoes are very good today.
      NADIA: I know, but can you give me a better price?
      SELLER: All right. I can make it fifty-five.
      NADIA: Can you make it fifty?
      SELLER: Fifty is too low. Fifty-five is my best price.
      NADIA: All right, fifty-five. Deal.
      SELLER: Great. Would you like a kilo of potatoes too?
      NADIA: Not today, thank you. I already have some at home.
      SELLER: No problem. Anything else?
      NADIA: No, that's all. How much is it altogether?
      SELLER: Fifty-five dirhams altogether.
      NADIA: Here's one hundred. Do you have change?
      SELLER: Yes, of course. Here's forty-five dirhams.
      NADIA: Thanks. Can I have a bag, please?
      SELLER: Sure. Do you need one bag or two?
      NADIA: One is enough, thanks.
      SELLER: Here you are. Have a nice day.
      NADIA: Thank you. You too.
    `),
    reading: { title: 'Buying Vegetables at the Market', body: [
      'On Friday morning, Nadia goes to the market. She needs tomatoes and onions.',
      'Karim tells her the tomatoes are very fresh — they came in this morning. They are twenty-five dirhams a kilo, and Nadia takes two kilos. The onions are twenty dirhams a kilo, and she asks for half a kilo.',
      'Karim adds it up: the tomatoes and onions come to sixty dirhams. Nadia thinks that is a little expensive, so she asks for a better price.',
      'Karim says he can make it fifty-five. Nadia asks if he can make it fifty, but he says fifty is too low, and fifty-five is his best price. In the end, they agree on fifty-five.',
      'Karim also offers her a kilo of potatoes, but she already has some at home. She gives him one hundred dirhams, takes her change and a bag, and goes home.',
    ] },
    yours: [
      'Ask the price of two vegetables and choose the quantity. - اسأل عن ثمن نوعين من الخضر واختر الكمية.',
      'Ask politely for a better price and agree on a deal. - اطلب بأدب سعرًا أفضل واتّفقا على الثمن.',
      'Write your market list with quantities: one kilo, half a kilo… - اكتب لائحة السوق مع الكميات.',
    ],
  },

  {
    n: 15, titleEn: 'Taxis, Buses & Trains', titleAr: 'سيارات الأجرة والحافلات والقطارات', icons: ['🚕', '🚆'],
    goal: 'تعلّم كيف تسأل عن الوجهة والوقت والسعر، تشتري تذكرة، وتسأل عن الرصيف ومكان النزول.',
    vocab: words('🚕 taxi = سيارة أجرة | 🧑‍✈️ taxi driver = سائق سيارة الأجرة | 💰 fare = ثمن الرحلة | 📍 address = العنوان | 🏙️ city centre = وسط المدينة | 🛣️ street = الشارع | 🎫 ticket = تذكرة | 🏧 ticket machine = آلة التذاكر | 🔁 return ticket = تذكرة ذهاب وإياب | 🕗 departure time = وقت المغادرة | 🕘 arrival time = وقت الوصول | 🚌 bus = حافلة | 🚆 train = قطار | 🚉 station = محطة | 🛤️ platform = رصيف القطار | 💺 seat = مقعد | 🚏 bus stop = موقف الحافلة | ⏭️ next stop = المحطة التالية'),
    expressions: [
      ['Can you take me to the train station?', 'Sure. Which station?', 'هل يمكنك أن توصلني إلى محطة القطار؟', 'بالتأكيد. أي محطة؟'],
      ['The main station, please.', "Sure. I'll stop right at the entrance.", 'المحطة الرئيسية، من فضلك.', 'بالتأكيد. سأتوقف عند المدخل مباشرة.'],
      ['How long will it take?', 'About twenty minutes.', 'كم من الوقت ستستغرق الرحلة؟', 'حوالي عشرين دقيقة.'],
      ['How much is the fare?', "It's about forty dirhams.", 'كم ثمن الرحلة؟', 'حوالي أربعين درهمًا.'],
      ['Where can I buy a ticket?', 'You can buy one here.', 'أين يمكنني شراء تذكرة؟', 'يمكنك شراء واحدة هنا.'],
      ["I'd like a return ticket, please.", 'What time would you like to leave?', 'أريد تذكرة ذهاب وإياب، من فضلك.', 'في أي وقت تريد المغادرة؟'],
      ['What time does the next train leave?', 'The next one leaves at eight thirty.', 'متى يغادر القطار التالي؟', 'يغادر التالي في الثامنة والنصف.'],
      ["I'm sorry, that train is full.", 'What about the next one?', 'عذرًا، ذلك القطار ممتلئ.', 'وماذا عن الذي بعده؟'],
      ["There are seats on the nine o'clock train.", "That's fine. I'll take that one.", 'توجد مقاعد في قطار الساعة التاسعة.', 'لا بأس. سآخذ ذلك القطار.'],
      ['Which platform is it?', 'It leaves from platform two.', 'من أي رصيف؟', 'يغادر من الرصيف رقم اثنين.'],
      ['Is this seat free?', 'Yes, it is. Go ahead.', 'هل هذا المقعد شاغر؟', 'نعم، إنه شاغر. تفضّل.'],
      ['Does this bus go to the city centre?', 'Yes, it does.', 'هل تذهب هذه الحافلة إلى وسط المدينة؟', 'نعم.'],
      ['How many stops is it to the city centre?', "It's about four stops from here.", 'كم محطة إلى وسط المدينة؟', 'حوالي أربع محطات من هنا.'],
      ['Where should I get off?', 'Get off at the third stop.', 'أين يجب أن أنزل؟', 'انزل في المحطة الثالثة.'],
      ['Please tell me when we get there.', "Of course. I'll let you know.", 'أخبرني عندما نصل، من فضلك.', 'بالطبع. سأخبرك.'],
    ],
    talk: script(`
      OMAR: Good morning. Can you take me to the main train station?
      DRIVER: Sure. What time is your train?
      OMAR: The eight-thirty train to Rabat.
      DRIVER: No problem. It's about twenty minutes from here.
      OMAR: Great. How much is the fare?
      DRIVER: About forty dirhams.
      OMAR: That's fine. Please stop at the main entrance.
      DRIVER: Of course. Here we are. That's forty dirhams.
      OMAR: Here you are. Thank you. Have a good day.
      DRIVER: You too. Have a good trip.
      OMAR: Hello. I'd like a return ticket to Rabat, please.
      CLERK: Of course. The eight-thirty train is full, but there are seats on the nine o'clock train.
      OMAR: Nine o'clock is fine. How much is it?
      CLERK: One hundred and twenty dirhams.
      OMAR: Can I pay by card?
      CLERK: Yes, of course. Here's your ticket.
      OMAR: Thanks. Which platform is it?
      CLERK: Platform two. Go straight ahead, and you'll see it on your left.
      OMAR: Perfect. Thank you.
      OMAR: Excuse me. Is this seat free?
      PASSENGER: Yes, it is. Go ahead.
      OMAR: Thanks. Are you going to Rabat too?
      PASSENGER: Yes, I am. I go every week.
      OMAR: Great. It's my first time on this train.
      PASSENGER: Don't worry. It's an easy trip.
      OMAR: Excuse me. Does this bus go to the city centre?
      BUS DRIVER: Yes, it does.
      OMAR: Where should I get off?
      BUS DRIVER: Get off at the third stop, just after the hospital.
      OMAR: Could you tell me when we get there?
      BUS DRIVER: Of course. I'll let you know.
      OMAR: Thank you.
      BUS DRIVER: Here we are. This is your stop.
      OMAR: Great. Thanks for your help.
    `),
    reading: { title: 'Getting to Rabat', body: [
      'Omar needs to take a train to Rabat, so he takes a taxi to the main train station. He asks the driver, Karim, to stop at the main entrance.',
      'Karim tells him the station is about twenty minutes away and the fare is about forty dirhams. Omar wants to take the eight-thirty train.',
      "At the station, Omar asks for a return ticket to Rabat. Unfortunately, the eight-thirty train is full. There are seats on the nine o'clock train instead, so he takes that one. The ticket is one hundred and twenty dirhams, and he pays by card.",
      'The train leaves from platform two. Huda tells him to go straight ahead and he will see it on his left.',
      'On the train, Omar finds a free seat next to Sami, who is also going to Rabat.',
    ] },
    yours: [
      'Take a taxi: say where you are going and ask the fare. - استقلّ سيارة أجرة: قل إلى أين تذهب واسأل عن الثمن.',
      'Buy a train ticket and ask about the time and the platform. - اشترِ تذكرة قطار واسأل عن الوقت والرصيف.',
      'Write how you go to work or school every day. - اكتب كيف تذهب إلى العمل أو الدراسة كل يوم.',
    ],
  },

  {
    n: 16, titleEn: 'Asking for Directions', titleAr: 'السؤال عن الاتجاهات', icons: ['🧭', '🚦'],
    goal: 'تعلّم كيف تسأل عن الطريق، تفهم تعليمات بسيطة، تستعمل المعالم القريبة، وتتأكّد أنك في الاتجاه الصحيح.',
    vocab: words('🙋 excuse me = عفوًا | 📍 the nearest = الأقرب | ⬆️ straight = إلى الأمام مباشرة | ⬅️ left = يسار | ➡️ right = يمين | 📐 corner = زاوية الشارع | 🚦 traffic lights = إشارة المرور | 👫 next to = بجانب | ↔️ opposite = مقابل | 🔙 behind = خلف | ⏩ in front of = أمام | 🏠 near = قريب | 🗺️ far = بعيد | 🚶 on foot = سيرًا على الأقدام | 🙏 thanks a lot = شكرًا جزيلًا | 😊 you\'re welcome = على الرحب والسعة'),
    expressions: [
      ["Sorry, I'm lost. Can you help me?", 'Of course. Where are you trying to go?', 'عذرًا، لقد تهت. هل يمكنك مساعدتي؟', 'بالطبع. إلى أين تريد أن تذهب؟'],
      ['Excuse me, how can I get to the bank?', 'Go straight and turn left at the traffic lights.', 'عفوًا، كيف أصل إلى البنك؟', 'امشِ إلى الأمام وانعطف يسارًا عند إشارة المرور.'],
      ['Where is the nearest pharmacy?', "It's not far from here. Take the second street on the right.", 'أين أقرب صيدلية؟', 'ليست بعيدة من هنا. خذ الشارع الثاني على اليمين.'],
      ['And then?', "Keep going until you reach the corner. It's on your right.", 'ثم؟', 'واصل السير حتى تصل إلى الزاوية. إنها على يمينك.'],
      ['Is it next to the hotel?', "Yes. It's next to the hotel, opposite the café.", 'هل هي بجانب الفندق؟', 'نعم. إنها بجانب الفندق، مقابل المقهى.'],
      ['Is it far from here?', "No, it's only about five minutes.", 'هل هو بعيد من هنا؟', 'لا، حوالي خمس دقائق فقط.'],
      ['Can I walk there?', "Yes, it's close enough to walk.", 'هل يمكنني الذهاب إلى هناك سيرًا؟', 'نعم، إنه قريب بما يكفي للمشي.'],
      ['How long does it take on foot?', 'It takes about five minutes.', 'كم يستغرق الطريق سيرًا على الأقدام؟', 'يستغرق حوالي خمس دقائق.'],
      ['Sorry, can you say that again?', "Sure. Turn left at the traffic lights. You can't miss it.", 'عذرًا، هل يمكنك أن تعيد ذلك؟', 'بالتأكيد. انعطف يسارًا عند إشارة المرور. لن تخطئه.'],
      ['Thanks a lot for your help.', "You're welcome. Have a nice day.", 'شكرًا جزيلًا على مساعدتك.', 'على الرحب والسعة. يومًا سعيدًا.'],
    ],
    talk: script(`
      SALMA: Excuse me. Sorry, I'm a little lost. Can you help me?
      AMINE: Of course. Where are you trying to go?
      SALMA: I'm looking for the bank on Green Street.
      AMINE: Oh, yes. I know it. It's not far from here. Are you walking?
      SALMA: Yes, I am. How can I get there?
      AMINE: Go straight down this street until you reach the traffic lights.
      SALMA: Okay. Straight to the traffic lights.
      AMINE: Right. Then turn left at the lights.
      SALMA: Sorry, left or right?
      AMINE: Left. Turn left at the traffic lights.
      SALMA: Got it. And then?
      AMINE: Then keep going until you reach a large hotel.
      SALMA: Is the bank next to the hotel?
      AMINE: Exactly. It's next to the hotel, opposite a café.
      SALMA: Will it be on my right or my left?
      AMINE: It'll be on your right. You can't miss it.
      SALMA: So, I go straight, turn left at the traffic lights, and keep going until I reach the hotel?
      AMINE: That's right. The bank is next to the hotel on your right.
      SALMA: Perfect. Is it far from here?
      AMINE: No, not really. It's about five minutes on foot.
      SALMA: Good. I can walk there, then.
      AMINE: Yes, definitely. It's very close.
      SALMA: One more thing. Is there a pharmacy near the bank?
      AMINE: Yes. There's one behind the bank.
      SALMA: Behind the bank?
      AMINE: Yes. Walk past the bank and you'll see the pharmacy.
      SALMA: Great. Thanks a lot for your help.
      AMINE: You're welcome. Have a nice day.
      SALMA: You too. Thanks again.
    `),
    reading: { title: 'Finding the Bank', body: [
      'Salma is a little lost. She is looking for the bank on Green Street, so she stops a man in the street and asks for help.',
      'Amine knows the street. He tells her it is not far from here. She should go straight down the street until she reaches the traffic lights, and then turn left.',
      "After the lights, she keeps going until she reaches a large hotel. The bank is next to the hotel, on her right, and it is opposite a café. Amine says she can't miss it.",
      'Salma asks if it is far on foot. It is only about five minutes, so she decides to walk.',
      'Before she goes, she asks one more thing. She needs a pharmacy too. There is one behind the bank — she just has to walk past the bank and she will see it.',
    ] },
    yours: [
      'Ask how to get to a place near your home. - اسأل عن الطريق إلى مكان قريب من بيتك.',
      'Give directions with straight, left, right, next to and opposite. - صِف الطريق بكلمات الاتجاهات: إلى الأمام، يسار، يمين، بجانب، مقابل.',
      'Write the way from your home to the nearest shop. - اكتب الطريق من بيتك إلى أقرب متجر.',
    ],
  },

  {
    n: 17, titleEn: 'At the Hotel', titleAr: 'في الفندق', icons: ['🏨', '🛎️'],
    goal: 'تعلّم كيف تسجّل الدخول، تسأل عن الغرفة والخدمات، تشرح مشكلة بسيطة، وتسجّل المغادرة.',
    vocab: words('📒 reservation = حجز | 🛎️ reception = الاستقبال | 🛂 passport = جواز السفر | 🧳 check-in = تسجيل الدخول | 🚪 room = غرفة | 🛏️ single room = غرفة لشخص واحد | 🛌 double room = غرفة لشخصين | 🔑 key = مفتاح | 💳 key card = بطاقة الغرفة | 🍳 breakfast = الفطور | 📶 Wi-Fi = الواي فاي | 🔐 Wi-Fi password = كلمة سرّ الواي فاي | ❄️ air conditioning = مكيّف الهواء | 🚿 shower = الدُّش | ♨️ hot water = ماء ساخن | 🛗 lift / elevator = المصعد | 🛄 porter = حامل الأمتعة | 🧾 check-out = تسجيل المغادرة'),
    expressions: [
      ["I'd like to check in, please.", 'Of course. Do you have a reservation?', 'أودّ تسجيل الدخول، من فضلك.', 'بالطبع. هل لديك حجز؟'],
      ['Yes, I have a reservation.', 'What name is the reservation under?', 'نعم، لديّ حجز.', 'باسم من الحجز؟'],
      ['The reservation is under Layla Hamdan.', 'Could I see your passport, please?', 'الحجز باسم ليلى حمدان.', 'هل يمكنني رؤية جواز سفرك، من فضلك؟'],
      ['I booked a double room.', "Yes, that's correct.", 'حجزت غرفة لشخصين.', 'نعم، هذا صحيح.'],
      ['What floor is my room on?', "It's on the third floor. Here's your key card.", 'في أي طابق غرفتي؟', 'في الطابق الثالث. تفضّلي بطاقة الغرفة.'],
      ['Is breakfast included?', 'Yes. Breakfast is included.', 'هل الفطور مشمول؟', 'نعم. الفطور مشمول.'],
      ['What time is breakfast?', 'Breakfast is from seven to ten.', 'في أي وقت يُقدَّم الفطور؟', 'الفطور من السابعة إلى العاشرة.'],
      ['Where is breakfast?', "It's on the ground floor.", 'أين يُقدَّم الفطور؟', 'في الطابق الأرضي.'],
      ["What's the Wi-Fi password?", "It's on a card in your room.", 'ما كلمة سرّ الواي فاي؟', 'إنها على بطاقة في غرفتك.'],
      ["The air conditioning isn't working.", "I'm sorry about that. I'll send someone up.", 'مكيّف الهواء لا يعمل.', 'آسف لذلك. سأرسل شخصًا إلى غرفتك.'],
      ["There's a problem with the shower.", "Of course. Someone will take a look at it.", 'هناك مشكلة في الدُّش.', 'بالطبع. سيأتي شخص لتفقّده.'],
      ['Could I have an extra towel?', "Of course. I'll bring one right away.", 'هل يمكنني الحصول على منشفة إضافية؟', 'بالطبع. سأحضر واحدة حالًا.'],
      ['What time is check-out?', "Check-out is at twelve.", 'متى موعد تسجيل المغادرة؟', 'تسجيل المغادرة في الثانية عشرة.'],
      ["I'd like to check out, please.", 'How was your stay?', 'أودّ تسجيل المغادرة، من فضلك.', 'كيف كانت إقامتك؟'],
      ['Everything was great, thank you.', "We're glad to hear that.", 'كان كل شيء رائعًا، شكرًا.', 'يسعدنا سماع ذلك.'],
      ['Could I leave my luggage here until five?', 'Of course. We can keep it here for you.', 'هل يمكنني ترك أمتعتي هنا حتى الخامسة؟', 'بالطبع. يمكننا الاحتفاظ بها لك هنا.'],
    ],
    talk: script(`
      RECEPTIONIST: Good evening. Welcome to the hotel. How can I help you?
      LAYLA: Good evening. I'd like to check in, please.
      RECEPTIONIST: Of course. Do you have a reservation?
      LAYLA: Yes. The reservation is under Layla Hamdan.
      RECEPTIONIST: Thank you. Could I see your passport, please?
      LAYLA: Sure. Here you are.
      RECEPTIONIST: Thank you. A double room for three nights. Is that correct?
      LAYLA: Yes, that's correct.
      RECEPTIONIST: Here's your key card. You're in room 302, on the third floor.
      LAYLA: Thank you. Is breakfast included?
      RECEPTIONIST: Yes, it is. Breakfast is from seven to ten, on the ground floor, next to reception.
      LAYLA: Great. And what's the Wi-Fi password?
      RECEPTIONIST: It's on a card in your room. The lift is on your left.
      LAYLA: Perfect. Thanks a lot.
      RECEPTIONIST: You're welcome. Enjoy your stay.
      LAYLA: Hello, this is room 302. The air conditioning isn't working.
      RECEPTIONIST: I'm sorry about that. Have you tried the remote control?
      LAYLA: Yes, I've tried it twice, but nothing happens.
      RECEPTIONIST: No problem. I'll send someone up in about ten minutes.
      LAYLA: Thank you. Could I also have an extra towel, please?
      RECEPTIONIST: Of course. They'll bring one with them.
      LAYLA: Good morning. I'd like to check out, please.
      RECEPTIONIST: Of course. How was your stay?
      LAYLA: Everything was great, thank you. The air conditioning works perfectly now.
      RECEPTIONIST: We're glad to hear that. Here's your bill.
      LAYLA: Can I pay by card?
      RECEPTIONIST: Yes, of course.
      LAYLA: Done. Could I leave my luggage here until five?
      RECEPTIONIST: Of course. We can keep it here for you.
      LAYLA: Wonderful. Thank you for everything.
      RECEPTIONIST: You're welcome. Have a safe trip.
    `),
    reading: { title: 'Three Nights at the Hotel', body: [
      'Layla arrives at the hotel in the evening and goes to reception. She has a reservation for three nights, under the name Layla Hamdan. Sami asks for her passport and checks the booking: a double room for three nights.',
      'He gives her a key card. Her room is 302, on the third floor. Breakfast is included and is served from seven to ten, on the ground floor next to reception. The Wi-Fi password is on a card in her room.',
      'Later that evening, Layla calls reception. The air conditioning in her room is not working. She has tried it twice, but nothing happens. Sami says he will send someone up in about ten minutes. She also asks for an extra towel.',
      'When she checks out, the problem has been fixed and everything was great. She pays the bill by card and leaves her luggage at reception until five.',
    ] },
    yours: [
      'Check in: give your name, show your passport, ask about breakfast. - سجّل الدخول: قدّم اسمك وجوازك واسأل عن الفطور.',
      'Call reception about a problem in your room. - اتصل بالاستقبال بخصوص مشكلة في غرفتك.',
      'Write a short review of a hotel you stayed in. - اكتب تقييمًا قصيرًا لفندق أقمت فيه.',
    ],
  },

  {
    n: 18, titleEn: 'At the Bank', titleAr: 'في البنك', icons: ['🏦', '💳'],
    goal: 'تعلّم كيف تسحب المال وتودعه وتحوّله، وتطلب المساعدة عند وجود مشكلة في البطاقة.',
    vocab: words('🏦 bank = بنك | 🏧 ATM = الصرّاف الآلي | 📒 account = حساب | 💸 withdraw = يسحب | 📥 deposit = يودع | 🔁 transfer = يحوّل | 💵 cash = نقود | 💰 money = مال | 🏷️ fee = رسوم | 💳 card = بطاقة | 🔢 PIN = الرقم السري | 📝 form = استمارة | 🪟 counter = شبّاك الخدمة | 🧾 receipt = إيصال | ⚖️ balance = الرصيد | 📄 bank statement = كشف الحساب | ✍️ signature = التوقيع | 🪪 ID = بطاقة الهوية'),
    expressions: [
      ['Good morning. Could you help me, please?', 'Of course. How can I help you?', 'صباح الخير. هل يمكنك مساعدتي، من فضلك؟', 'بالطبع. كيف يمكنني مساعدتك؟'],
      ['Is this the right counter?', 'Yes, I can help you here.', 'هل هذا هو الشبّاك الصحيح؟', 'نعم، يمكنني مساعدتك هنا.'],
      ["I'm here to open an account.", 'Could I see your ID, please?', 'جئت لفتح حساب.', 'هل يمكنني رؤية بطاقة هويتك، من فضلك؟'],
      ['How much would you like to withdraw?', "I'd like to withdraw five hundred dirhams.", 'كم تريد أن تسحب؟', 'أريد سحب خمسمئة درهم.'],
      ["I'd like to deposit one thousand dirhams.", 'Sure. Could you fill in this form, please?', 'أريد إيداع ألف درهم.', 'بالتأكيد. هل يمكنك ملء هذه الاستمارة، من فضلك؟'],
      ['Where do I sign?', 'Please sign at the bottom.', 'أين أوقّع؟', 'وقّع في الأسفل، من فضلك.'],
      ["I'd also like to make a transfer.", 'Of course. How much would you like to transfer?', 'أريد أيضًا إجراء تحويل.', 'بالطبع. كم تريد أن تحوّل؟'],
      ['Is there a fee for the transfer?', "Yes, it's ten dirhams.", 'هل توجد رسوم على التحويل؟', 'نعم، عشرة دراهم.'],
      ['How long will the transfer take?', 'The money arrives today.', 'كم يستغرق التحويل؟', 'يصل المال اليوم.'],
      ["My card isn't working.", 'What seems to be the problem?', 'بطاقتي لا تعمل.', 'ما المشكلة؟'],
      ['The ATM kept my card.', 'Which ATM did you use?', 'احتفظ الصرّاف الآلي ببطاقتي.', 'أي صرّاف آلي استعملت؟'],
      ['I forgot my PIN. Could you help me?', 'Of course. Please wait a moment while I check your details.', 'نسيت رقمي السري. هل يمكنك مساعدتي؟', 'بالطبع. انتظر لحظة من فضلك حتى أتحقّق من بياناتك.'],
      ['How can I change my PIN?', 'You can change it at the ATM.', 'كيف يمكنني تغيير رقمي السري؟', 'يمكنك تغييره في الصرّاف الآلي.'],
      ['Would you like a receipt?', 'Yes, please.', 'هل تريد إيصالًا؟', 'نعم، من فضلك.'],
      ['Is there anything else I can help you with?', "No, that's everything. Thanks a lot.", 'هل هناك شيء آخر يمكنني مساعدتك فيه؟', 'لا، هذا كل شيء. شكرًا جزيلًا.'],
    ],
    talk: script(`
      KARIM: Good morning. Could you help me, please?
      CLERK: Good morning. Of course. How can I help you?
      KARIM: I have a problem. The ATM outside kept my card this morning.
      CLERK: I'm sorry about that. What happened?
      KARIM: I think I entered the wrong PIN three times.
      CLERK: I see. Could I see your ID, please?
      KARIM: Sure. Here you are.
      CLERK: Thank you. Let me check your details.
      KARIM: No problem.
      CLERK: Yes, we have your card here. Could you fill in this form, please?
      KARIM: Of course. Where do I sign?
      CLERK: At the bottom, please. Thank you. Here's your card.
      KARIM: Great, thank you! I also need some cash. Can I withdraw money here?
      CLERK: Yes, of course. How much would you like to withdraw?
      KARIM: Five hundred dirhams, please.
      CLERK: Five hundred dirhams. Here's your cash.
      KARIM: Thank you. I'd also like to make a transfer.
      CLERK: Of course. How much would you like to transfer?
      KARIM: One thousand dirhams to my sister's account.
      CLERK: Could I have the account details, please?
      KARIM: Sure. Here they are. Is there a fee for the transfer?
      CLERK: Yes, it's ten dirhams.
      KARIM: That's fine. How long will the transfer take?
      CLERK: Her account is with our bank, so the money arrives today.
      KARIM: Great.
      CLERK: Please check the details before I continue.
      KARIM: Yes, everything looks correct.
      CLERK: The transfer is complete. Would you like a receipt?
      KARIM: Yes, please. One for the cash and one for the transfer.
      CLERK: Here you are. Is there anything else I can help you with?
      KARIM: Yes. How can I change my PIN?
      CLERK: You can change it at the ATM with your card.
      KARIM: Perfect. Thanks a lot for your help.
      CLERK: You're welcome. Have a nice day.
    `),
    reading: { title: 'A Problem at the Bank', body: [
      'Karim goes to the bank because the ATM outside kept his card this morning. He thinks he entered the wrong PIN three times.',
      'He explains the problem to Salma at the counter. She asks to see his ID and checks his details. The bank has his card, so he fills in a form, signs at the bottom, and gets his card back.',
      'Karim also needs some cash, so he withdraws five hundred dirhams at the counter.',
      "Then he transfers one thousand dirhams to his sister's account. The fee is ten dirhams, and the money arrives today, because her account is with the same bank. Karim checks the details, and the transfer is complete.",
      'He asks for a receipt for the cash and one for the transfer. Before he leaves, he asks how to change his PIN. He can change it at the ATM.',
    ] },
    yours: [
      'Ask to withdraw, deposit or transfer an amount of money. - اطلب سحب مبلغ أو إيداعه أو تحويله.',
      'Explain a problem with your card at the counter. - اشرح مشكلة في بطاقتك عند الشبّاك.',
      'Write the steps you follow to transfer money. - اكتب الخطوات التي تتبعها لتحويل المال.',
    ],
  },

  {
    n: 19, titleEn: 'Phone & WhatsApp English', titleAr: 'الإنجليزية في الهاتف وواتساب', icons: ['📱', '💬'],
    goal: 'تعلّم كيف تبدأ مكالمة، تتعامل مع سوء الاتصال، تغيّر موعدًا، وتستعمل عبارات يومية في المكالمات وواتساب.',
    vocab: words('📞 call someone = يتّصل بشخص | 📲 answer the phone = يردّ على الهاتف | 📵 a bad connection = اتصال سيئ | ☎️ a missed call = مكالمة فائتة | 🔁 call you back = يعاود الاتصال بك | 💬 send a message = يرسل رسالة | ↩️ reply to a message = يردّ على رسالة | ⏰ running late = متأخّر | 🚗 on my way = في الطريق | ⛔ busy right now = مشغول الآن | 🌙 free tonight = متفرّغ الليلة | ✋ wait for me = انتظرني | 🕖 meet at seven = نلتقي في السابعة | 📍 send your location = أرسل موقعك | 🏁 almost there = أوشكت على الوصول | 🚪 outside = في الخارج'),
    expressions: [
      ['Hi, is this Sara?', 'Yes, speaking.', 'مرحبًا، هل هذه سارة؟', 'نعم، أنا سارة.'],
      ['Is now a good time to talk?', "I'm a little busy right now.", 'هل الوقت مناسب للحديث الآن؟', 'أنا مشغولة قليلًا الآن.'],
      ['Can you hear me?', 'Not very well. The connection is bad.', 'هل تسمعني؟', 'ليس جيدًا. الاتصال سيئ.'],
      ['Sorry, can you say that again?', "I'll call you back in a minute.", 'عذرًا، هل يمكنك أن تعيد ذلك؟', 'سأعاود الاتصال بك بعد دقيقة.'],
      ['Sorry, I missed your call.', 'No problem. I just wanted to ask you something.', 'آسف، فاتتني مكالمتك.', 'لا مشكلة. أردت فقط أن أسألك عن شيء.'],
      ["I'll text you instead.", "Okay, I'll check my messages.", 'سأراسلك بدلًا من ذلك.', 'حسنًا، سأتفقّد رسائلي.'],
      ["I'm running late.", 'No problem. How late will you be?', 'أنا متأخّر.', 'لا مشكلة. كم ستتأخّر؟'],
      ["About ten minutes. I'm on my way.", "Okay, I'll wait for you.", "حوالي عشر دقائق. أنا في الطريق.", 'حسنًا، سأنتظرك.'],
      ['Are we still meeting at seven?', 'Could we make it eight instead?', 'هل ما زلنا سنلتقي في السابعة؟', 'هل يمكن أن نجعلها الثامنة بدلًا من ذلك؟'],
      ['What time works for you?', 'Eight works for me.', 'أي وقت يناسبك؟', 'الثامنة تناسبني.'],
      ['Where should we meet?', "Let's meet at the café near the station.", 'أين نلتقي؟', 'لنلتقِ في المقهى القريب من المحطة.'],
      ['Let me check and get back to you.', 'Sure. Let me know.', 'دعني أتحقّق وأعود إليك.', 'بالتأكيد. أخبرني.'],
      ['Where are you?', "I'm outside the café.", 'أين أنت؟', 'أنا خارج المقهى.'],
      ['Send me your location, please.', "Sure. I'm sending it now.", 'أرسل لي موقعك، من فضلك.', 'بالتأكيد. أرسله الآن.'],
      ["I got it. I'm almost there.", 'Great. See you in a minute.', "وصلني. أوشكت على الوصول.", 'رائع. أراك بعد دقيقة.'],
      ['Talk to you later.', 'Okay. See you soon.', 'أتحدّث إليك لاحقًا.', 'حسنًا. أراك قريبًا.'],
    ],
    talk: script(`
      OMAR: Hi, Sara. Sorry, I missed your call.
      SARA: No problem. Is now a good time to talk?
      OMAR: Yes, I can talk now. Is everything okay?
      SARA: Yes. I just wanted to check our plans for tonight.
      OMAR: Sorry, can you say that again? The connection is bad.
      SARA: I said I wanted to check our plans for tonight.
      OMAR: I can't hear you very well. I'll call you back in a minute.
      SARA: Okay. Talk to you in a minute.
      OMAR: Hi again. Can you hear me now?
      SARA: Yes, much better now.
      OMAR: Great. Are we still meeting at seven?
      SARA: That's why I called. Could we make it eight instead?
      OMAR: Eight works for me. Where should we meet?
      SARA: How about the café near the station?
      OMAR: That works for me. I'll see you there at eight.
      SARA: Perfect. I'll send you the location too.
      OMAR: Great. Talk to you later.
      SARA: See you at eight.
      OMAR: Hi, Sara. I'm running late.
      SARA: No problem. How late will you be?
      OMAR: About ten minutes. I'm on my way.
      SARA: That's fine. I'll wait inside.
      OMAR: Sara, I'm near the station, but I can't find the café.
      SARA: I'm inside the café, near the window.
      OMAR: Can you send me your location again?
      SARA: Sure. I'm sending it now.
      OMAR: Got it. I'm two minutes away.
      SARA: Okay. Let me know when you're outside.
      OMAR: I'm outside now. Can you see me?
      SARA: Yes, I can see you. I'm coming out.
      OMAR: Perfect. Sorry again for being late.
      SARA: No problem. You're here now.
    `),
    reading: { title: 'A Change of Plan', body: [
      'Omar sees a missed call from Sara, so he calls her back. He asks if it is a good time to talk. Sara says yes — she wants to check their plans for tonight.',
      'At first the connection is bad, and Omar cannot hear her very well. He tells her he will call her back in a minute. The second time, the line is much better.',
      'They were meeting at seven, but Sara asks if they can make it eight instead. Eight works for Omar. They decide to meet at the café near the station, and Sara sends him the location.',
      'In the evening, Omar is running late — about ten minutes. He sends a message to say he is on his way, and Sara says she will wait inside.',
      'When he arrives, he cannot find her. He calls again, and she comes out to meet him.',
    ] },
    yours: [
      'Call a friend, check the plan and change the time. - اتصل بصديق، تأكّد من الموعد وغيّر الوقت.',
      'Send a voice message: you are running late. - أرسل رسالة صوتية: أنت متأخّر.',
      'Write three WhatsApp messages to plan a meeting. - اكتب ثلاث رسائل واتساب لتنظيم لقاء.',
    ],
  },
]
