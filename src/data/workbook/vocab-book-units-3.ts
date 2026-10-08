import { d, g, pairs, tr, v, type VocabUnit } from './vocab-book.ts'

/** Units 11–15 of the vocabulary book (see vocab-book.ts). */
export const UNITS_11_15: VocabUnit[] = [
  /* ── 11 · At the Barber ──────────────────────────────────────────── */
  { n: 11, icon: '💈',
    vocab: v(
      '🪒 | a clean shave | حلاقة كاملة للذقن | Just a clean shave today, please. | حلاقة كاملة للذقن فقط اليوم، من فضلك.',
      '✂️ | take a little off | يقصّ قليلًا | Just take a little off the top. | قصّ قليلًا من الأعلى فقط.',
      '🔝 | on top | من الأعلى | Keep it long on top, please. | اتركه طويلًا من الأعلى، من فضلك.',
      '💈 | fade | تدرّج (في القصّة) | I\'d like a fade on the sides. | أريد تدرّجًا على الجانبين.',
      '🧔 | shape my beard | يحدّد لحيتي | Can you shape my beard too? | هل يمكنك تحديد لحيتي أيضًا؟',
      '🙋 | who\'s next? | من التالي؟ | Hello! Who\'s next? | مرحبًا! من التالي؟',
      '🚿 | wash my hair | يغسل شعري | Do you want me to wash your hair? | هل تريد أن أغسل شعرك؟',
      '🧴 | gel | جِل | No gel, please. | بدون جِل، من فضلك.',
      '🪞 | how does it look? | كيف يبدو؟ | How does it look from the back? | كيف يبدو من الخلف؟',
      '🎨 | dye | يصبغ | She wants to dye her hair brown. | تريد أن تصبغ شعرها بالبنّي.',
    ),
    groups: [
      g('💇', 'Hairstyles', 'تسريحات الشعر', 'straight=أملس|wavy=مموّج|fringe=غُرّة|ponytail=ذيل حصان|plait=ضفيرة|bun=كعكة شعر|parting=فَرق الشعر|bald=أصلع|moustache=شارب|layers=قصّة متدرّجة'),
      g('🧰', 'At the salon', 'في الصالون', 'scissors=مقصّ|clippers=ماكينة الحلاقة|blow-dry=تجفيف وتصفيف|spray bottle=بخّاخ ماء|cape=رداء الحلاقة|chair=كرسي|hair wax=شمع الشعر|aftershave=عطر ما بعد الحلاقة|shaving foam=رغوة الحلاقة|price list=قائمة الأسعار'),
      g('✨', 'Beauty and care', 'التجميل والعناية', 'manicure=تجميل الأظافر|nail polish=طلاء الأظافر|henna=حنّاء|face mask=قناع الوجه|eyebrows=حواجب|make-up=مكياج|hair oil=زيت الشعر|argan oil=زيت الأركان|hair treatment=علاج الشعر|hairdresser=مصفّف شعر'),
    ],
    talks: [
      d("At the barber's | عند الحلاق", 'A haircut | قصّة شعر', 'Barber | Hamza', [
        ["Hi! Who's next?", 'مرحبًا! من التالي؟'],
        ["Me. I'd like a haircut, please.", 'أنا. أريد قصّة شعر، من فضلك.'],
        ['Sure. How would you like it?', 'بالتأكيد. كيف تريدها؟'],
        ['Short on the sides and a bit longer on top.', 'قصيرة على الجانبين وأطول قليلًا من الأعلى.'],
        ['And your beard?', 'ولحيتك؟'],
        ['Just shape it, please. Not too short.', 'حدّدها فقط، من فضلك. ليس قصيرة جدًا.'],
      ]),
      d('Booking | حجز', 'At the salon | في الصالون', 'Nisrine | Receptionist', [
        ["Hello, I'd like to book an appointment.", 'مرحبًا، أودّ حجز موعد.'],
        ['What would you like to have done?', 'ماذا تريدين أن تفعلي؟'],
        ['A wash, a trim and a blow-dry.', 'غسل وتشذيب وتجفيف بالمجفّف.'],
        ['Is Thursday at four OK?', 'هل يناسبك الخميس في الرابعة؟'],
        ['Yes, perfect. How much is it?', 'نعم، ممتاز. كم السعر؟'],
        ["It's 150 dirhams. See you on Thursday!", 'المبلغ 150 درهمًا. نراك يوم الخميس!'],
      ]),
    ],
    ask: tr([
      ['How long is the wait?', 'كم مدة الانتظار؟'],
      ['Can you make it shorter?', 'هل يمكنك جعله أقصر؟'],
      ['Do I need an appointment?', 'هل أحتاج إلى موعد؟'],
      ['How much is a haircut?', 'كم سعر قصّة الشعر؟'],
    ]),
    answer: tr([
      ['About twenty minutes.', 'حوالي عشرين دقيقة.'],
      ['Of course. How much shorter?', 'طبعًا. كم أقصر؟'],
      ['No, just come in.', 'لا، ادخل مباشرة.'],
      ['Fifty dirhams.', 'خمسون درهمًا.'],
    ]),
    reading: {
      icon: '💈', title: "Abdellah's Barbershop", titleAr: 'صالون عبد الله للحلاقة',
      text: "Abdellah has been a barber for twenty-five years. His small barbershop is in a busy street in Marrakech. Every day, he gives haircuts and shaves to students, workers and old men from the neighbourhood. Young customers often show him photos of football players and ask for the same style. Old customers just say, \"As usual, please.\" On Friday mornings, before the prayer, the shop is full and people wait on the bench outside. Abdellah's son now works with him. He knows the new styles, and Abdellah knows every customer. \"People don't come only for a haircut,\" Abdellah says. \"They come to talk.\"",
      gloss: pairs('barbershop=صالون الحلاقة|style=تسريحة|as usual=كالعادة|prayer=الصلاة|bench=مقعد طويل'),
      tf: [
        { s: 'The barbershop is in Marrakech.', ok: true },
        { s: 'Young customers show him photos of actors.', ok: false },
        { s: "Abdellah's son works with him.", ok: true },
      ],
      qs: [
        { q: 'When is the shop full?', a: 'On Friday mornings, before the prayer.' },
        { q: 'Why do people come to the shop?', a: 'For a haircut, and to talk.' },
      ],
    } },

  /* ── 12 · At the Pharmacy ────────────────────────────────────────── */
  { n: 12, icon: '💊',
    vocab: v(
      '🗣️ | sore throat | التهاب الحلق | I have a sore throat. | لديّ التهاب في الحلق.',
      '🤢 | stomach ache | ألم في المعدة | He has a stomach ache. | لديه ألم في المعدة.',
      '🩹 | plasters | لصقات الجروح | Do you have any plasters? | هل لديكم لصقات للجروح؟',
      '🧾 | over the counter | بدون وصفة طبية | Can I buy this over the counter? | هل يمكنني شراء هذا بدون وصفة طبية؟',
      '🍽️ | after meals | بعد الأكل | Take one tablet after meals. | تناول قرصًا واحدًا بعد الأكل.',
      '💊 | painkiller | مسكّن | I need a painkiller for my back. | أحتاج إلى مسكّن لظهري.',
      '⚠️ | side effects | أعراض جانبية | Are there any side effects? | هل توجد أعراض جانبية؟',
      '😴 | drowsy | ناعس | This medicine can make you drowsy. | هذا الدواء قد يسبّب لك النعاس.',
      '🚫 | allergic to | لديه حساسية من | I\'m allergic to penicillin. | لديّ حساسية من البنسلين.',
      '🌙 | pharmacy on duty | صيدلية الحراسة | Where\'s the pharmacy on duty tonight? | أين صيدلية الحراسة الليلة؟',
    ),
    groups: [
      g('🤒', 'Symptoms', 'الأعراض', 'runny nose=سيلان الأنف|sneeze=يعطس|toothache=ألم الأسنان|earache=ألم الأذن|backache=ألم الظهر|rash=طفح جلدي|dizzy=دائخ|tired=متعب|sunburn=حروق الشمس|flu=أنفلونزا'),
      g('💊', 'At the pharmacy', 'في الصيدلية', 'drops=قطرات|ointment=مرهم|capsules=كبسولات|vitamins=فيتامينات|bandage=ضمادة|thermometer=ميزان الحرارة|cough sweets=حلوى السعال|mask=كمّامة|hand gel=معقّم اليدين|inhaler=بخّاخ الربو'),
      g('🧍', 'The body', 'الجسم', 'head=رأس|throat=حلق|chest=صدر|stomach=معدة|arm=ذراع|leg=ساق|knee=ركبة|foot=قدم|ear=أذن|eye=عين'),
    ],
    talks: [
      d('Asking for advice | طلب النصيحة', 'A bad cold | زكام شديد', 'Pharmacist | Imane', [
        ['Good afternoon. How can I help?', 'مساء الخير. كيف أساعدك؟'],
        ['I have a sore throat and a runny nose.', 'لديّ التهاب في الحلق وسيلان في الأنف.'],
        ['Do you have a fever?', 'هل لديك حمى؟'],
        ['No, but I feel very tired.', 'لا، لكنني أشعر بتعب شديد.'],
        ['Take this syrup three times a day, and drink lots of water.', 'تناولي هذا الشراب ثلاث مرات في اليوم، واشربي الكثير من الماء.'],
        ['Thank you. Will it make me drowsy?', 'شكرًا. هل سيسبّب لي النعاس؟'],
      ]),
      d('Instructions | تعليمات', 'How do I take it? | كيف أتناوله؟', 'Omar | Pharmacist', [
        ['Can I buy this painkiller without a prescription?', 'هل يمكنني شراء هذا المسكّن بدون وصفة؟'],
        ['Yes. Is it for you?', 'نعم. هل هو لك؟'],
        ['Yes, it is. How do I take it?', 'نعم. كيف أتناوله؟'],
        ['One tablet every eight hours, after meals.', 'قرص واحد كل ثماني ساعات، بعد الأكل.'],
        ['Are there any side effects?', 'هل توجد أعراض جانبية؟'],
        ["Not usually. Don't take more than three a day.", 'ليس عادةً. لا تتناول أكثر من ثلاثة في اليوم.'],
      ]),
    ],
    ask: tr([
      ['Do you have something for a cough?', 'هل لديكم شيء للسعال؟'],
      ['How many times a day?', 'كم مرة في اليوم؟'],
      ['Is it safe for children?', 'هل هو آمن للأطفال؟'],
      ['Do I need a prescription?', 'هل أحتاج إلى وصفة طبية؟'],
    ]),
    answer: tr([
      ['Yes, try this syrup.', 'نعم، جرّب هذا الشراب.'],
      ['Twice a day, morning and night.', 'مرتين في اليوم، صباحًا ومساءً.'],
      ['Not for children under six.', 'ليس للأطفال دون السادسة.'],
      ['No, you can buy it over the counter.', 'لا، يمكنك شراؤه بدون وصفة.'],
    ]),
    reading: {
      icon: '🌙', title: 'The Night Pharmacy', titleAr: 'صيدلية الحراسة',
      text: "It was eleven o'clock at night, and little Adam had a high fever. His mother, Khadija, was worried. All the pharmacies in her street were closed. She looked at the list on the pharmacy door and found the pharmacy on duty. It was ten minutes away by taxi. The pharmacist was very kind. He asked about Adam's age and weight, then gave Khadija a syrup for children and a thermometer. \"Give him the syrup every six hours, and call a doctor if the fever doesn't go down by tomorrow,\" he said. The next morning, Adam felt much better and asked for his breakfast!",
      gloss: pairs('high=مرتفع|worried=قلِق|kind=لطيف|weight=وزن|go down=ينخفض'),
      tf: [
        { s: 'Adam had a high fever at night.', ok: true },
        { s: 'The pharmacy on duty was in their street.', ok: false },
        { s: 'Adam felt better the next morning.', ok: true },
      ],
      qs: [
        { q: 'What did the pharmacist give Khadija?', a: 'A syrup for children and a thermometer.' },
        { q: 'How often should Adam take the syrup?', a: 'Every six hours.' },
      ],
    } },

  /* ── 13 · At the Clinic ──────────────────────────────────────────── */
  { n: 13, icon: '🩺',
    vocab: v(
      '📋 | fill in a form | يملأ استمارة | Please fill in this form. | من فضلك املأ هذه الاستمارة.',
      '🪪 | health insurance | التأمين الصحي | Do you have health insurance? | هل لديك تأمين صحي؟',
      '🩺 | check-up | فحص طبي عامّ | I go for a check-up every year. | أُجري فحصًا طبيًا كل سنة.',
      '💉 | injection | حقنة | The nurse will give you an injection. | ستعطيك الممرّضة حقنة.',
      '🩸 | blood test | تحليل الدم | You need a blood test. | تحتاج إلى تحليل للدم.',
      '💓 | blood pressure | ضغط الدم | Your blood pressure is normal. | ضغط دمك طبيعي.',
      '📆 | since | منذ | I\'ve had this pain since Monday. | أشعر بهذا الألم منذ يوم الاثنين.',
      '😣 | it hurts | يؤلمني | It hurts when I walk. | يؤلمني عندما أمشي.',
      '🌱 | get better | يتحسّن | Rest and you\'ll get better soon. | ارتح وستتحسّن قريبًا.',
      '🚑 | emergency | حالة طارئة | In an emergency, call 15. | في حالة طارئة، اتصل بالرقم 15.',
    ),
    groups: [
      g('👩‍⚕️', 'Doctors', 'الأطباء', "dentist=طبيب أسنان|eye doctor=طبيب العيون|children's doctor=طبيب الأطفال|heart doctor=طبيب القلب|skin doctor=طبيب الجلد|surgeon=جرّاح|specialist=طبيب مختصّ|GP=طبيب عامّ|midwife=قابلة|physiotherapist=معالج فيزيائي"),
      g('🏥', 'In the hospital', 'في المستشفى', 'ward=جناح|waiting room=قاعة الانتظار|X-ray=صورة بالأشعة|scan=فحص بالأشعة (سكانير)|wheelchair=كرسي متحرّك|stretcher=نقّالة|operation=عملية جراحية|patient=مريض|visiting hours=أوقات الزيارة|ambulance=سيارة إسعاف'),
      g('🩹', 'Health problems', 'مشاكل صحية', 'diabetes=داء السكّري|asthma=الربو|broken arm=ذراع مكسورة|cut=جرح|burn=حرق|infection=عدوى|virus=فيروس|high blood pressure=ارتفاع ضغط الدم|food poisoning=تسمّم غذائي|sprained ankle=التواء الكاحل'),
    ],
    talks: [
      d('At reception | في الاستقبال', 'Checking in | تسجيل الحضور', 'Receptionist | Mr Tazi', [
        ['Good morning. Do you have an appointment?', 'صباح الخير. هل لديك موعد؟'],
        ['Yes, at ten with Dr Benjelloun.', 'نعم، في العاشرة مع الدكتور بنجلون.'],
        ["What's your name, please?", 'ما اسمك، من فضلك؟'],
        ['Ahmed Tazi.', 'أحمد التازي.'],
        ['Thank you. Please fill in this form and take a seat.', 'شكرًا. من فضلك املأ هذه الاستمارة وتفضّل بالجلوس.'],
        ['How long will I wait?', 'كم سأنتظر؟'],
      ]),
      d('With the doctor | مع الطبيب', "What's the problem? | ما المشكلة؟", 'Doctor | Mr Tazi', [
        ["Come in. What's the problem?", 'تفضّل بالدخول. ما المشكلة؟'],
        ['I have a pain in my back.', 'لديّ ألم في ظهري.'],
        ['Since when?', 'منذ متى؟'],
        ['Since last week. It hurts when I sit.', 'منذ الأسبوع الماضي. يؤلمني عندما أجلس.'],
        ['Let me check… You need an X-ray and some rest.', 'دعني أفحصك… تحتاج إلى صورة بالأشعة وبعض الراحة.'],
        ['Thank you, doctor.', 'شكرًا لك يا دكتور.'],
      ]),
    ],
    ask: tr([
      ['Can I see a doctor today?', 'هل يمكنني رؤية طبيب اليوم؟'],
      ['Where does it hurt?', 'أين يؤلمك؟'],
      ['Is it serious?', 'هل هو خطير؟'],
      ['When should I come back?', 'متى يجب أن أعود؟'],
    ]),
    answer: tr([
      ["Yes, at three o'clock.", 'نعم، في الساعة الثالثة.'],
      ['Here, in my knee.', 'هنا، في ركبتي.'],
      ["No, don't worry.", 'لا، لا تقلق.'],
      ['In two weeks.', 'بعد أسبوعين.'],
    ]),
    reading: {
      icon: '🩺', title: 'The Yearly Check-up', titleAr: 'الفحص الطبي السنوي',
      text: "Every year in January, Fatima goes to the clinic for a check-up. This year, she booked her appointment online. At reception, she showed her ID card and her insurance card. The nurse checked her weight and her blood pressure. Then the doctor asked her some questions about her sleep, her food and her sport. Fatima said she walks every day but eats too much sugar. The doctor asked for a blood test. A week later, the results came back. Everything was normal, but the doctor told her to eat fewer sweets. Now Fatima is trying to drink her tea without sugar!",
      gloss: pairs('insurance card=بطاقة التأمين|online=عبر الإنترنت|sleep=النوم|results=النتائج|fewer=أقلّ'),
      tf: [
        { s: 'Fatima goes for a check-up every January.', ok: true },
        { s: 'The doctor checked her blood pressure.', ok: false },
        { s: 'Her results were normal.', ok: true },
      ],
      qs: [
        { q: 'How did Fatima book her appointment?', a: 'Online.' },
        { q: 'What did the doctor tell her?', a: 'To eat fewer sweets.' },
      ],
    } },

  /* ── 14 · At the Traditional Market ──────────────────────────────── */
  { n: 14, icon: '🧺',
    vocab: v(
      '🤝 | bargain | يساوم | In the souk, you can bargain. | في السوق، يمكنك أن تساوم.',
      '💬 | last price | آخر ثمن | What\'s your last price? | ما آخر ثمن عندك؟',
      '🌿 | a bunch of | حزمة من | A bunch of mint, please. | حزمة نعناع، من فضلك.',
      '⚖️ | half a kilo | نصف كيلو | Half a kilo of carrots, please. | نصف كيلو من الجزر، من فضلك.',
      '🍅 | ripe | ناضج | These tomatoes are very ripe. | هذه الطماطم ناضجة جدًا.',
      '🫒 | stall | طاولة البائع | My uncle has an olive stall in the souk. | لعمّي طاولة لبيع الزيتون في السوق.',
      '🧑‍🌾 | seller | بائع | The seller gave me a good price. | أعطاني البائع ثمنًا جيدًا.',
      '👆 | choose | يختار | Can I choose the oranges myself? | هل يمكنني اختيار البرتقال بنفسي؟',
      '➕ | a little more | قليلًا أكثر | A little more, please. | أكثر قليلًا، من فضلك.',
      '✅ | It\'s a deal! | اتفقنا! | Forty dirhams? It\'s a deal! | أربعون درهمًا؟ اتفقنا!',
    ),
    groups: [
      g('🍊', 'Fruit', 'الفواكه', 'oranges=برتقال|lemons=ليمون حامض|strawberries=فراولة|watermelon=بطّيخ أحمر|melon=شمّام|figs=تين|dates=تمر|pomegranate=رمّان|peaches=خوخ|cherries=كرز'),
      g('🏺', 'In the souk', 'في السوق', 'spices=توابل|pickles=مخلّلات|dried fruit=فواكه مجفّفة|nuts=مكسّرات|herbs=أعشاب|carpets=زرابي|pottery=فخّار|leather=جلد|copper=نحاس|souvenirs=تذكارات'),
      g('🔢', 'Quantities', 'الكمّيات', 'a box of=علبة من|a bag of=كيس من|a bottle of=قنينة من|a jar of=برطمان من|a piece of=قطعة من|a pair of=زوج من|a handful of=حفنة من|a litre of=لتر من|a tray of=صينية من|a sack of=كيس كبير من'),
    ],
    talks: [
      d('Bargaining | مساومة', 'In the souk | في السوق', 'Tourist | Seller', [
        ['How much is this bag?', 'كم ثمن هذه الحقيبة؟'],
        ["Three hundred dirhams. It's real leather.", 'ثلاثمئة درهم. إنها من الجلد الحقيقي.'],
        ["That's too expensive. How about one hundred and fifty?", 'هذا غالٍ جدًا. ما رأيك في مئة وخمسين؟'],
        ['No, no. Two hundred and fifty.', 'لا، لا. مئتان وخمسون.'],
        ["Two hundred. That's my last price.", 'مئتان. هذا آخر ثمن عندي.'],
        ["OK, two hundred. It's a deal!", 'حسنًا، مئتان. اتفقنا!'],
      ]),
      d('Buying vegetables | شراء الخضر', 'At the vegetable stall | عند بائع الخضر', 'Malika | Seller', [
        ['Good morning! Are the tomatoes fresh?', 'صباح الخير! هل الطماطم طازجة؟'],
        ["Very fresh. They're from my farm.", 'طازجة جدًا. إنها من مزرعتي.'],
        ['Two kilos, please. And a bunch of coriander.', 'كيلوغرامان، من فضلك. وحزمة كزبرة.'],
        ['Here you are. Anything else?', 'تفضّلي. شيء آخر؟'],
        ['No, thanks. How much is that?', 'لا، شكرًا. كم المجموع؟'],
        ['Fourteen dirhams. The coriander is a gift!', 'أربعة عشر درهمًا. والكزبرة هدية!'],
      ]),
    ],
    ask: tr([
      ['How much are the oranges?', 'بكم البرتقال؟'],
      ['Can you give me a better price?', 'هل يمكنك أن تعطيني ثمنًا أفضل؟'],
      ['Can I taste one?', 'هل يمكنني تذوّق واحدة؟'],
      ['Where are they from?', 'من أين هي؟'],
    ]),
    answer: tr([
      ['Eight dirhams a kilo.', 'ثمانية دراهم للكيلو.'],
      ['OK, just for you.', 'حسنًا، من أجلك فقط.'],
      ['Of course, go ahead.', 'طبعًا، تفضّل.'],
      ['From Berkane.', 'من بركان.'],
    ]),
    reading: {
      icon: '🧺', title: 'Souk Day in the Village', titleAr: 'يوم السوق في القرية',
      text: "In many Moroccan villages, the weekly souk is the most important day of the week. In Ait Ourir, the souk is on Tuesday. Farmers arrive early with their vegetables, fruit, eggs and animals. Women sell bread, honey and argan oil. There are also stalls for clothes, tools and spices. People from nearby villages come to buy food for the whole week. They also come to meet friends and hear the news. Everyone bargains, but always with a smile. At lunchtime, the smell of grilled meat and mint tea is everywhere. In the afternoon, the stalls close and the village is quiet again.",
      gloss: pairs('weekly=أسبوعي|farmers=فلّاحون|tools=أدوات|nearby=مجاور|quiet=هادئ'),
      tf: [
        { s: 'The souk in Ait Ourir is on Tuesday.', ok: true },
        { s: 'Only farmers come to the souk.', ok: false },
        { s: 'The stalls close in the afternoon.', ok: true },
      ],
      qs: [
        { q: 'What do women sell at the souk?', a: 'Bread, honey and argan oil.' },
        { q: 'Why do people come to the souk?', a: 'To buy food for the week, meet friends and hear the news.' },
      ],
    } },

  /* ── 15 · Taxis, Buses & Trains ──────────────────────────────────── */
  { n: 15, icon: '🚆',
    vocab: v(
      '🧮 | meter | العدّاد | Can you turn on the meter, please? | هل يمكنك تشغيل العدّاد، من فضلك؟',
      '🔁 | return ticket | تذكرة ذهاب وإياب | A return ticket to Fez, please. | تذكرة ذهاب وإياب إلى فاس، من فضلك.',
      '➡️ | single ticket | تذكرة ذهاب فقط | A single ticket costs 90 dirhams. | تذكرة الذهاب فقط بتسعين درهمًا.',
      '🕐 | timetable | جدول المواعيد | Let\'s check the train timetable. | لنتحقّق من جدول مواعيد القطارات.',
      '⏳ | delayed | متأخّر | The train is delayed by twenty minutes. | القطار متأخّر عشرين دقيقة.',
      '🚌 | get on | يركب | Get on the bus at the front door. | اركب الحافلة من الباب الأمامي.',
      '🚏 | get off | ينزل | I get off at the next stop. | أنزل في المحطة القادمة.',
      '🔄 | change trains | يغيّر القطار | You need to change trains in Casablanca. | يجب أن تغيّر القطار في الدار البيضاء.',
      '🚦 | traffic jam | ازدحام مروري | Sorry I\'m late. There was a traffic jam. | آسف على التأخّر. كان هناك ازدحام مروري.',
      '💺 | first class | الدرجة الأولى | First class is more comfortable. | الدرجة الأولى أكثر راحة.',
    ),
    groups: [
      g('🚆', 'Transport', 'وسائل النقل', 'tram=ترامواي|grand taxi=طاكسي كبير|coach=حافلة بين المدن|motorbike=درّاجة نارية|bicycle=درّاجة هوائية|plane=طائرة|boat=قارب|ferry=عبّارة|car=سيارة|on foot=مشيًا على الأقدام'),
      g('🚉', 'At the station', 'في المحطة', 'ticket office=شبّاك التذاكر|ticket machine=آلة التذاكر|departures=المغادرة|arrivals=الوصول|information desk=مكتب الاستعلامات|left luggage=أمانات الأمتعة|carriage=عربة القطار|track=سكّة|ticket inspector=مراقب التذاكر|announcement=إعلان'),
      g('🛣️', 'On the road', 'على الطريق', 'traffic lights=إشارات المرور|roundabout=دوّار|zebra crossing=ممرّ الراجلين|motorway=طريق سيّار|petrol station=محطة الوقود|car park=موقف السيارات|seat belt=حزام الأمان|speed=سرعة|accident=حادثة سير|rush hour=ساعة الذروة'),
    ],
    talks: [
      d('In a taxi | في التاكسي', 'To the station, please | إلى المحطة، من فضلك', 'Driver | Soukaina', [
        ['Where to?', 'إلى أين؟'],
        ['To the train station, please.', 'إلى محطة القطار، من فضلك.'],
        ['OK. Get in.', 'حسنًا. اركبي.'],
        ['Can you turn on the meter, please?', 'هل يمكنك تشغيل العدّاد، من فضلك؟'],
        ["Of course. There's a traffic jam, so it'll take fifteen minutes.", 'طبعًا. هناك ازدحام، لذا سيستغرق ربع ساعة.'],
        ['No problem. My train is at six.', 'لا مشكلة. قطاري في السادسة.'],
      ]),
      d('Buying a ticket | شراء تذكرة', 'At the ticket office | عند شبّاك التذاكر', 'Tarik | Clerk', [
        ['A return ticket to Marrakech, please.', 'تذكرة ذهاب وإياب إلى مراكش، من فضلك.'],
        ['First or second class?', 'الدرجة الأولى أم الثانية؟'],
        ['Second class. What time is the next train?', 'الدرجة الثانية. متى القطار القادم؟'],
        ['At 10:15, from platform four.', 'في العاشرة والربع، من الرصيف الرابع.'],
        ['Do I need to change trains?', 'هل يجب أن أغيّر القطار؟'],
        ["No, it's direct. That's 220 dirhams.", 'لا، إنه مباشر. المبلغ 220 درهمًا.'],
      ]),
    ],
    ask: tr([
      ['Does this bus go to the city centre?', 'هل تذهب هذه الحافلة إلى وسط المدينة؟'],
      ['How long is the journey?', 'كم تستغرق الرحلة؟'],
      ['Which platform is it?', 'من أي رصيف؟'],
      ['Is this seat taken?', 'هل هذا المقعد محجوز؟'],
    ]),
    answer: tr([
      ['Yes, number 7 goes there.', 'نعم، الحافلة رقم 7 تذهب إلى هناك.'],
      ['About three hours.', 'حوالي ثلاث ساعات.'],
      ['Platform two.', 'الرصيف الثاني.'],
      ["No, it's free. Sit down.", 'لا، إنه شاغر. تفضّل بالجلوس.'],
    ]),
    reading: {
      icon: '🚄', title: 'The Al Boraq Train', titleAr: 'قطار البراق',
      text: "Al Boraq is Morocco's high-speed train. It goes from Tangier to Casablanca, through Kenitra and Rabat. Before Al Boraq, the trip from Tangier to Casablanca took almost five hours. Now it takes about two hours and ten minutes. Last month, Ilham took Al Boraq for the first time. She bought her ticket online and chose a seat by the window. The train was clean, quiet and very fast: up to 320 kilometres an hour! There was a small café on board, so she had a coffee and a croissant. \"It's like flying,\" she told her friends. Now she visits her family in Tangier every month.",
      gloss: pairs('high-speed=فائق السرعة|through=مرورًا بـ|almost=تقريبًا|on board=على متن القطار|flying=الطيران'),
      tf: [
        { s: 'Al Boraq goes from Tangier to Casablanca.', ok: true },
        { s: 'Ilham bought her ticket at the station.', ok: false },
        { s: 'There is a café on the train.', ok: true },
      ],
      qs: [
        { q: 'How long is the trip now?', a: 'About two hours and ten minutes.' },
        { q: 'What did Ilham have on the train?', a: 'A coffee and a croissant.' },
      ],
    } },
]
