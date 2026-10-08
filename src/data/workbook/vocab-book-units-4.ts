import { d, g, pairs, tr, v, type VocabUnit } from './vocab-book.ts'

/** Units 16–19 of the vocabulary book (see vocab-book.ts). */
export const UNITS_16_19: VocabUnit[] = [
  /* ── 16 · Asking for Directions ──────────────────────────────────── */
  { n: 16, icon: '🧭',
    vocab: v(
      '↩️ | turn left | ينعطف يسارًا | Turn left at the traffic lights. | انعطف يسارًا عند إشارات المرور.',
      '🕌 | go past | يمرّ بجانب | Go past the mosque. | امرر بجانب المسجد.',
      '🚸 | cross the road | يعبر الطريق | Cross the road at the zebra crossing. | اعبر الطريق من ممرّ الراجلين.',
      '📍 | next to | بجانب | The bank is next to the post office. | البنك بجانب مكتب البريد.',
      '↔️ | between | بين | The café is between the bank and the hotel. | المقهى بين البنك والفندق.',
      '😕 | lost | تائه | Excuse me, I\'m lost. | عفوًا، أنا تائه.',
      '🚶 | a five-minute walk | خمس دقائق مشيًا | It\'s a five-minute walk from here. | إنه على بعد خمس دقائق مشيًا من هنا.',
      '🗺️ | map | خريطة | Can you show me on the map? | هل يمكنك أن تريني على الخريطة؟',
      '🏁 | at the end of | في نهاية | The station is at the end of this street. | المحطة في نهاية هذا الشارع.',
      '2️⃣ | the second right | ثاني شارع على اليمين | Take the second right after the bank. | خذ ثاني شارع على اليمين بعد البنك.',
    ),
    groups: [
      g('🏛️', 'Places in town', 'أماكن في المدينة', 'mosque=مسجد|museum=متحف|park=حديقة عمومية|library=مكتبة عمومية|town hall=مقرّ البلدية|police station=مركز الشرطة|stadium=ملعب|market=سوق|school=مدرسة|square=ساحة'),
      g('🧭', 'Directions', 'الاتجاهات', 'north=شمال|south=جنوب|east=شرق|west=غرب|up the street=في أعلى الشارع|down the street=في أسفل الشارع|on the corner=عند الزاوية|in front of=أمام|across from=قُبالة|around the corner=بعد المنعطف مباشرة'),
      g('🏙️', 'In the street', 'في الشارع', 'pavement=رصيف|bridge=جسر|tunnel=نفق|sign=لافتة|building=بناية|entrance=مدخل|exit=مخرج|crossroads=ملتقى طرق|alley=زقاق|steps=درج'),
    ],
    talks: [
      d('Asking the way | السؤال عن الطريق', "Where's the museum? | أين المتحف؟", 'Tourist | Local man', [
        ['Excuse me, how do I get to the museum?', 'عفوًا، كيف أصل إلى المتحف؟'],
        ['Go straight on and take the second left.', 'امشِ إلى الأمام وخذ ثاني شارع على اليسار.'],
        ['The second left?', 'ثاني شارع على اليسار؟'],
        ['Yes. Then go past the park. The museum is on your right.', 'نعم. ثم امرر بجانب الحديقة. المتحف على يمينك.'],
        ['Is it far?', 'هل هو بعيد؟'],
        ["No, it's a ten-minute walk.", 'لا، إنه على بعد عشر دقائق مشيًا.'],
      ]),
      d('Lost | تائه', 'On the phone | على الهاتف', 'Anas | Walid', [
        ["Walid, I'm lost. I can't find your house.", 'وليد، أنا تائه. لا أجد بيتك.'],
        ['Where are you now?', 'أين أنت الآن؟'],
        ['In front of a big pharmacy, near a roundabout.', 'أمام صيدلية كبيرة، قرب دوّار.'],
        ['OK. Cross the road and turn right.', 'حسنًا. اعبر الطريق وانعطف يمينًا.'],
        ['And then?', 'ثم ماذا؟'],
        ['My house is the third one, with a blue door.', 'بيتي هو الثالث، بباب أزرق.'],
      ]),
    ],
    ask: tr([
      ['Is there a bank near here?', 'هل يوجد بنك قريب من هنا؟'],
      ['Can you show me the way?', 'هل يمكنك أن تدلّني على الطريق؟'],
      ['Which way is the beach?', 'من أين الطريق إلى الشاطئ؟'],
      ['How far is it?', 'كم يبعد؟'],
    ]),
    answer: tr([
      ['Yes, just around the corner.', 'نعم، بعد المنعطف مباشرة.'],
      ['Sure, follow me.', 'بالتأكيد، اتبعني.'],
      ['That way, down the hill.', 'من هناك، في أسفل التلّ.'],
      ['About two kilometres.', 'حوالي كيلومترين.'],
    ]),
    reading: {
      icon: '🗺️', title: 'A Treasure Hunt in Chefchaouen', titleAr: 'البحث عن الكنز في شفشاون',
      text: "Last summer, Nada's school organised a treasure hunt in Chefchaouen, the blue city. The students worked in teams of four. Each team had a map and a list of directions. Nada's team started at the main square: \"Walk up the street to the mosque. Turn left and go past the small fountain. Take the steps on your right and stop at the green door.\" The streets were narrow and every wall was blue, so it was easy to get lost! After one hour, Nada's team found the green door. Behind it, a shop owner gave them the treasure: a box of chocolates and a big map of Morocco.",
      gloss: pairs('treasure hunt=البحث عن الكنز|teams=فِرَق|fountain=نافورة|narrow=ضيّق|shop owner=صاحب المحلّ'),
      tf: [
        { s: 'The students worked in teams of four.', ok: true },
        { s: 'The team started at the mosque.', ok: false },
        { s: 'The treasure was behind a green door.', ok: true },
      ],
      qs: [
        { q: 'Why was it easy to get lost?', a: 'The streets were narrow and every wall was blue.' },
        { q: 'What was the treasure?', a: 'A box of chocolates and a big map of Morocco.' },
      ],
    } },

  /* ── 17 · At the Hotel ───────────────────────────────────────────── */
  { n: 17, icon: '🏨',
    vocab: v(
      '🛎️ | check in | يسجّل الوصول | You can check in after two o\'clock. | يمكنك تسجيل الوصول بعد الساعة الثانية.',
      '🧳 | check out | يغادر الفندق | We check out at noon. | نغادر الفندق عند الظهر.',
      '🛏️ | single room | غرفة لشخص واحد | I\'d like a single room for two nights. | أريد غرفة لشخص واحد لليلتين.',
      '👫 | double room | غرفة لشخصين | Do you have a double room for tonight? | هل لديكم غرفة لشخصين الليلة؟',
      '🌊 | sea view | إطلالة على البحر | Our room has a beautiful sea view. | غرفتنا مطلّة على البحر بشكل جميل.',
      '🍳 | breakfast included | الفطور مشمول | Is breakfast included in the price? | هل الفطور مشمول في السعر؟',
      '❄️ | air conditioning | المكيّف | The air conditioning doesn\'t work. | المكيّف لا يعمل.',
      '🍽️ | room service | خدمة الغرف | Can I order room service? | هل يمكنني طلب خدمة الغرف؟',
      '⏰ | wake-up call | مكالمة إيقاظ | I\'d like a wake-up call at six. | أريد مكالمة إيقاظ في السادسة.',
      '🧹 | housekeeping | خدمة تنظيف الغرف | Housekeeping comes every morning. | تأتي خدمة تنظيف الغرف كل صباح.',
    ),
    groups: [
      g('🛏️', 'In the room', 'في الغرفة', 'pillow=وسادة|blanket=بطّانية|sheets=شراشف السرير|wardrobe=خزانة ملابس|safe=خزنة|balcony=شرفة|remote control=جهاز التحكّم|minibar=ثلاجة صغيرة|curtains=ستائر|socket=مقبس كهربائي'),
      g('🏊', 'Hotel services', 'خدمات الفندق', 'lobby=بهو الفندق|swimming pool=مسبح|gym=قاعة رياضة|spa=منتجع صحي|laundry service=خدمة الغسيل|airport shuttle=النقل إلى المطار|receptionist=موظّف الاستقبال|porter=حمّال الأمتعة|meeting room=قاعة الاجتماعات|24-hour reception=استقبال طوال اليوم'),
      g('📅', 'Booking', 'الحجز', 'booking=حجز|per night=لليلة الواحدة|full board=إقامة كاملة|half board=نصف إقامة|cancel=يلغي|confirm=يؤكّد|available=متوفّر|fully booked=محجوز بالكامل|guest house=دار ضيافة|riad=رياض'),
    ],
    talks: [
      d('Checking in | تسجيل الوصول', 'At reception | في الاستقبال', 'Receptionist | Mr Haddad', [
        ['Good evening. Welcome to the Atlas Hotel.', 'مساء الخير. مرحبًا بك في فندق الأطلس.'],
        ['Hello. I have a reservation. My name is Haddad.', 'مرحبًا. لديّ حجز. اسمي حدّاد.'],
        ['Yes, a double room for three nights. Can I see your passport?', 'نعم، غرفة لشخصين لثلاث ليالٍ. هل يمكنني رؤية جواز سفرك؟'],
        ['Here you are. Is breakfast included?', 'تفضّل. هل الفطور مشمول؟'],
        ['Yes, from seven to ten, on the ground floor.', 'نعم، من السابعة إلى العاشرة، في الطابق الأرضي.'],
        ["Great. What's the Wi-Fi password?", 'رائع. ما كلمة سرّ الواي فاي؟'],
      ]),
      d('A problem in the room | مشكلة في الغرفة', "It doesn't work | لا يعمل", 'Guest | Receptionist', [
        ["Hello, this is room 214. The air conditioning doesn't work.", 'مرحبًا، هنا الغرفة 214. المكيّف لا يعمل.'],
        ["I'm sorry. I'll send someone right away.", 'آسف. سأرسل شخصًا حالًا.'],
        ['Thank you. Can we have two more pillows?', 'شكرًا. هل يمكننا الحصول على وسادتين إضافيتين؟'],
        ['Of course. Anything else?', 'طبعًا. شيء آخر؟'],
        ['Yes, a wake-up call at six, please.', 'نعم، مكالمة إيقاظ في السادسة، من فضلك.'],
        ['No problem. Have a good night!', 'لا مشكلة. ليلة سعيدة!'],
      ]),
    ],
    ask: tr([
      ['Do you have any rooms available?', 'هل لديكم غرف متوفّرة؟'],
      ['How much is it per night?', 'كم السعر لليلة الواحدة؟'],
      ['What time is check-out?', 'متى موعد المغادرة؟'],
      ['Can I leave my bags here?', 'هل يمكنني ترك حقائبي هنا؟'],
    ]),
    answer: tr([
      ["Sorry, we're fully booked.", 'آسف، الفندق محجوز بالكامل.'],
      ['Six hundred dirhams, with breakfast.', 'ستمئة درهم، مع الفطور.'],
      ["At twelve o'clock.", 'في الساعة الثانية عشرة.'],
      ['Yes, of course.', 'نعم، طبعًا.'],
    ]),
    reading: {
      icon: '🏡', title: 'A Night in a Riad', titleAr: 'ليلة في رياض',
      text: "Emma is a tourist from Canada. She is visiting Fez for the first time, and she is staying in a riad in the old medina. A riad is a traditional house with a garden or a fountain in the middle. Emma's room is small but beautiful, with colourful tiles and a wooden door. In the evening, the owner, Mrs Alaoui, serves mint tea and almond biscuits on the roof terrace. From there, Emma can see the whole city. Breakfast is included: msemen, honey, eggs and fresh orange juice. \"It's not just a hotel,\" Emma writes in the guest book. \"It's a home.\"",
      gloss: pairs('tourist=سائحة|traditional=تقليدي|tiles=زليج|roof terrace=السطح|guest book=سجلّ الزوّار'),
      tf: [
        { s: 'Emma is from Canada.', ok: true },
        { s: 'Her room is big and modern.', ok: false },
        { s: 'Breakfast is not included.', ok: false },
      ],
      qs: [
        { q: 'What is a riad?', a: 'A traditional house with a garden or a fountain in the middle.' },
        { q: 'What does Mrs Alaoui serve in the evening?', a: 'Mint tea and almond biscuits.' },
      ],
    } },

  /* ── 18 · At the Bank ────────────────────────────────────────────── */
  { n: 18, icon: '🏦',
    vocab: v(
      '🏧 | cash machine | الشبّاك الآلي | Is there a cash machine near here? | هل يوجد شبّاك آلي قريب من هنا؟',
      '🔢 | PIN | الرقم السرّي | Enter your PIN, please. | أدخل رقمك السرّي، من فضلك.',
      '📂 | open an account | يفتح حسابًا | I\'d like to open an account. | أودّ فتح حساب.',
      '💱 | exchange rate | سعر الصرف | What\'s the exchange rate today? | ما سعر الصرف اليوم؟',
      '💶 | change money | يصرف العملة | Where can I change money? | أين يمكنني صرف العملة؟',
      '🌍 | money transfer | حوالة مالية | My brother sends me a money transfer every month. | يرسل لي أخي حوالة مالية كل شهر.',
      '📄 | bank statement | كشف الحساب | Can I have a bank statement, please? | هل يمكنني الحصول على كشف الحساب، من فضلك؟',
      '🐷 | save | يدّخر | I save 500 dirhams every month. | أدّخر 500 درهم كل شهر.',
      '🏠 | loan | قرض | They took a loan to buy a house. | أخذوا قرضًا لشراء بيت.',
      '🔒 | blocked | موقوفة (مجمّدة) | My card is blocked. | بطاقتي موقوفة.',
    ),
    groups: [
      g('💵', 'Money words', 'كلمات المال', 'coins=قطع نقدية|notes=أوراق نقدية|purse=محفظة نقود|salary=راتب|budget=ميزانية|debt=دَين|interest=فائدة|currency=عملة|euros=أورو|dollars=دولارات'),
      g('🏦', 'At the bank', 'في البنك', 'bank clerk=موظّف البنك|branch=وكالة بنكية|queue ticket=رقم الانتظار|proof of address=شهادة السكنى|cheque=شيك|chequebook=دفتر الشيكات|online banking=البنك عبر الإنترنت|banking app=التطبيق البنكي|security code=رمز الأمان|opening hours=أوقات العمل'),
      g('💳', 'Paying', 'الدفع', 'pay in cash=يدفع نقدًا|pay by card=يدفع بالبطاقة|contactless=دفع بدون تلامس|instalments=أقساط|invoice=فاتورة|top up=يعبّئ الرصيد|QR code=رمز QR|online payment=دفع إلكتروني|transfer fee=رسوم التحويل|monthly payment=دفعة شهرية'),
    ],
    talks: [
      d('Opening an account | فتح حساب', 'At the bank | في البنك', 'Clerk | Salma', [
        ['Good morning. How can I help you?', 'صباح الخير. كيف أساعدك؟'],
        ["I'd like to open an account, please.", 'أودّ فتح حساب، من فضلك.'],
        ['Sure. Do you have your ID card and proof of address?', 'بالتأكيد. هل معك بطاقة التعريف وشهادة السكنى؟'],
        ['Yes, here they are.', 'نعم، ها هما.'],
        ['Thank you. Please fill in this form and sign here.', 'شكرًا. من فضلك املئي هذه الاستمارة ووقّعي هنا.'],
        ['When will I get my card?', 'متى سأحصل على بطاقتي؟'],
      ]),
      d('A problem | مشكلة', 'The machine took my card | الشبّاك أخذ بطاقتي', 'Karim | Clerk', [
        ['Excuse me, the cash machine outside took my card.', 'عفوًا، الشبّاك الآلي في الخارج أخذ بطاقتي.'],
        ['Did you enter the wrong PIN?', 'هل أدخلت رقمًا سرّيًا خاطئًا؟'],
        ["Yes, three times. I'm sorry.", 'نعم، ثلاث مرات. أنا آسف.'],
        ["Don't worry. Can I see your ID?", 'لا تقلق. هل يمكنني رؤية بطاقة تعريفك؟'],
        ['Here you are.', 'تفضّل.'],
        ["Thank you. Here's your card. Be careful next time!", 'شكرًا. هذه بطاقتك. انتبه في المرة القادمة!'],
      ]),
    ],
    ask: tr([
      ['Can I withdraw money here?', 'هل يمكنني سحب المال هنا؟'],
      ["What's the fee for a transfer?", 'كم رسوم التحويل؟'],
      ['What are your opening hours?', 'ما أوقات عملكم؟'],
      ['Can I pay in instalments?', 'هل يمكنني الدفع بالأقساط؟'],
    ]),
    answer: tr([
      ['Yes, at counter three.', 'نعم، في الشبّاك الثالث.'],
      ['Twenty dirhams.', 'عشرون درهمًا.'],
      ['From 8:15 to 3:45, Monday to Friday.', 'من 8:15 إلى 15:45، من الاثنين إلى الجمعة.'],
      ['Yes, over twelve months.', 'نعم، على اثني عشر شهرًا.'],
    ]),
    reading: {
      icon: '🐷', title: 'Saving for a Dream', titleAr: 'الادّخار من أجل حلم',
      text: "Youssef is twenty-three and works in a call centre in Rabat. His dream is to buy a small car. Last year, he opened a savings account at his bank. Now, on the first day of every month, the bank moves 800 dirhams from his salary to his savings account. Youssef also has a banking app on his phone. He checks his balance every week and writes down everything he spends. He stopped buying coffee outside and now takes a flask from home. After one year, Youssef has saved almost 10,000 dirhams. \"Saving is not easy,\" he says, \"but it's a good habit.\"",
      gloss: pairs('call centre=مركز الاتصال|savings account=حساب التوفير|spends=يُنفق|flask=ترمس|habit=عادة'),
      tf: [
        { s: 'Youssef works in a bank.', ok: false },
        { s: 'He checks his balance every week.', ok: true },
        { s: 'He has saved almost 10,000 dirhams.', ok: true },
      ],
      qs: [
        { q: "What is Youssef's dream?", a: 'To buy a small car.' },
        { q: 'How much does the bank move to his savings every month?', a: '800 dirhams.' },
      ],
    } },

  /* ── 19 · Phone & WhatsApp English ───────────────────────────────── */
  { n: 19, icon: '📱',
    vocab: v(
      '📞 | call back | يعاود الاتصال | Can I call you back in ten minutes? | هل يمكنني معاودة الاتصال بك بعد عشر دقائق؟',
      '🎙️ | voice note | رسالة صوتية | She sent me a long voice note. | أرسلت لي رسالة صوتية طويلة.',
      '🪫 | my battery is low | بطّاريتي ضعيفة | Sorry, my battery is low. | آسف، بطّاريتي ضعيفة.',
      '📵 | cut off | انقطع الاتصال | Sorry, we got cut off. | آسف، انقطع الاتصال.',
      '🔊 | speak up | يرفع صوته | Can you speak up, please? | هل يمكنك أن ترفع صوتك، من فضلك؟',
      '✍️ | typing | يكتب الآن | Wait, she\'s typing… | انتظر، إنها تكتب…',
      '👁️ | seen | تمّت المشاهدة | My message says "seen", but no reply! | رسالتي تظهر «تمّت المشاهدة»، لكن بدون ردّ!',
      '📸 | send a photo | يرسل صورة | Can you send me a photo of the menu? | هل يمكنك أن ترسل لي صورة لقائمة الطعام؟',
      '👥 | group chat | مجموعة دردشة | I added you to the family group chat. | أضفتك إلى مجموعة العائلة.',
      '📹 | video call | مكالمة فيديو | Let\'s do a video call tonight. | لنقم بمكالمة فيديو الليلة.',
    ),
    groups: [
      g('📱', 'Phone words', 'كلمات الهاتف', 'screen=شاشة|power bank=بطارية خارجية|SIM card=بطاقة SIM|phone credit=رصيد الهاتف|missed call=مكالمة فائتة|ringtone=نغمة الرنين|contacts=جهات الاتصال|settings=الإعدادات|signal=الشبكة|airplane mode=وضع الطيران'),
      g('💬', 'Chat words', 'كلمات الدردشة', 'emoji=إيموجي|sticker=ملصق|status=الحالة|profile picture=صورة الملف الشخصي|forward=يعيد توجيه|delete=يحذف|block=يحظر|mute=يكتم|online=متّصل الآن|last seen=آخر ظهور'),
      g('⚡', 'Short forms in texts', 'اختصارات في الرسائل', 'BRB=سأعود حالًا|ASAP=في أقرب وقت|LOL=أضحك كثيرًا|OMG=يا للمفاجأة!|BTW=بالمناسبة|IDK=لا أعرف|THX=شكرًا|PLZ=من فضلك|TTYL=أكلّمك لاحقًا|GN=تصبح على خير'),
    ],
    talks: [
      d('On the phone | على الهاتف', 'A bad connection | اتصال سيّئ', 'Nora | Ayoub', [
        ['Hello? Ayoub? Can you hear me?', 'ألو؟ أيوب؟ هل تسمعني؟'],
        ['Sorry, Nora, the connection is bad. Can you speak up?', 'آسف يا نورة، الاتصال سيّئ. هل يمكنك أن ترفعي صوتك؟'],
        ['I said: are you coming to dinner tonight?', 'قلت: هل ستأتي إلى العشاء الليلة؟'],
        ["Yes, but I'll be a little late.", 'نعم، لكنني سأتأخّر قليلًا.'],
        ['No problem. Send me your location.', 'لا مشكلة. أرسل لي موقعك.'],
        ["OK. My battery is low. I'll call you back!", 'حسنًا. بطّاريتي ضعيفة. سأعاود الاتصال بك!'],
      ]),
      d('On WhatsApp | على واتساب', 'The family group | مجموعة العائلة', 'Mum | Yasmine', [
        ["Who's coming for lunch on Friday?", 'من سيأتي إلى الغداء يوم الجمعة؟'],
        ['Me! Can I bring anything?', 'أنا! هل أُحضر شيئًا؟'],
        ['Yes, a dessert, please.', 'نعم، حلوى من فضلك.'],
        ["OK! Can you send me a photo of Grandma's cake recipe?", 'حسنًا! هل يمكنك أن ترسلي لي صورة لوصفة كعكة الجدّة؟'],
        ['Sure. Check your messages.', 'بالتأكيد. تحقّقي من رسائلك.'],
        ['Got it, thanks! See you on Friday.', 'وصلت، شكرًا! أراكِ يوم الجمعة.'],
      ]),
    ],
    ask: tr([
      ['Can I speak to Mr Idrissi, please?', 'هل يمكنني التحدّث مع السيد الإدريسي، من فضلك؟'],
      ["Who's calling, please?", 'من المتّصل، من فضلك؟'],
      ['Can I leave a message?', 'هل يمكنني ترك رسالة؟'],
      ["What's your number?", 'ما رقمك؟'],
    ]),
    answer: tr([
      ["Sorry, he's in a meeting.", 'آسف، إنه في اجتماع.'],
      ["It's Laila, his colleague.", 'أنا ليلى، زميلته.'],
      ['Of course. Go ahead.', 'طبعًا. تفضّل.'],
      ["It's 06 12 34 56 78.", 'إنه 06 12 34 56 78.'],
    ]),
    reading: {
      icon: '👵', title: 'Grandma Joins WhatsApp', titleAr: 'الجدّة تنضمّ إلى واتساب',
      text: "Last month, Grandma Zahra got her first smartphone. She is seventy-two and lives alone in a village near Taza. Her grandson Ilyas installed WhatsApp and showed her how to use it. At first, it was difficult. She sent empty messages and called people by mistake! But Ilyas was patient. Now Grandma Zahra loves voice notes because she doesn't like typing. Every morning, she sends \"Good morning\" to the family group with a flower sticker. On Fridays, she makes video calls with her daughter in France. \"Now my family is in my pocket,\" she says with a big smile.",
      gloss: pairs('smartphone=هاتف ذكي|alone=وحدها|installed=ثبّت|by mistake=عن طريق الخطأ|patient=صبور'),
      tf: [
        { s: 'Grandma Zahra lives in the city of Taza.', ok: false },
        { s: 'She loves voice notes.', ok: true },
        { s: 'She makes video calls with her son in France.', ok: false },
      ],
      qs: [
        { q: 'Who installed WhatsApp for her?', a: 'Her grandson Ilyas.' },
        { q: 'What does she send every morning?', a: '"Good morning", with a flower sticker.' },
      ],
    } },
]
