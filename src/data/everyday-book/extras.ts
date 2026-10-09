/**
 * What fills each unit's expression and reading pages around the core
 * content, in the Level 1 book's manner: a «Notice - لاحظ» box (how the
 * unit's expressions work), six extra words for the curious (their photos
 * go in public/everyday-book/extra/uNN/<word>.png), a «Tip - نصيحة» box of
 * real-life advice, and, under the reading, its own «Notice» and four
 * comprehension questions.
 *
 * Lines are "English - العربية" (printed on two lines) or Arabic only.
 * An Arabic half never ends on an English word: its full stop would land on
 * the wrong side of the line.
 */

export interface UnitExtras {
  /** «Your turn»: three questions the student answers about their own life. */
  yourTurn: string[]
  notice: string[]
  /** [picture, English, Arabic] */
  extra: [string, string, string][]
  tip: string[]
  readNotice: string[]
  questions: string[]
  /** The answers to `questions`, for the answer key. */
  answers: string[]
}

export const EXTRAS: Record<number, UnitExtras> = {
  1: {
    yourTurn: ['What time do you wake up on Saturdays?', 'What do you usually have for breakfast?', 'What do you do before you leave home?'],
    notice: [
      'What time do you wake up? — At seven. / At about eight.',
      'I usually / always / sometimes have breakfast at home.',
      'كلمات التكرار usually و always و sometimes تأتي قبل الفعل.',
    ],
    extra: [['⏰', 'set the alarm', 'أضبط المنبّه'], ['🍵', 'drink tea', 'أشرب الشاي'], ['👓', 'put on my glasses', 'ألبس نظاراتي'], ['🎒', 'pack my bag', 'أجهّز حقيبتي'], ['🚌', 'catch the bus', 'ألحق بالحافلة'], ['🛏️', 'go to bed', 'أذهب إلى النوم']],
    tip: [
      'Say your routine out loud every morning in English. - قل روتينك بالإنجليزية بصوت مرتفع كل صباح.',
      'Connect your sentences with first, then, after that. - اربط جملك بكلمات الترتيب.',
    ],
    readNotice: ["I don't always get out of bed right away.", 'First… Then… After that… Before I leave…', "I usually leave at about eight o'clock."],
    questions: ['What time does the alarm go off?', 'What does the writer do first?', 'What does the writer usually have for breakfast?', 'What does the writer do before leaving home?'],
    answers: ['At seven.', 'The writer goes to the bathroom, washes their face and brushes their teeth.', 'Coffee and bread.', 'The writer grabs a bag and puts on their shoes.'],
  },
  2: {
    yourTurn: ['What is your favourite drink at a café?', 'Do you prefer hot or iced drinks?', 'Do you usually pay in cash or by card?'],
    notice: [
      "I'd like a coffee, please. - أطلب بأدب.",
      'Can I have…? / Could I have…? / Can I get…? - كلها للطلب.',
      'Small, medium or large? Hot or iced? For here or to go?',
    ],
    extra: [['🍫', 'hot chocolate', 'شوكولاتة ساخنة'], ['🧁', 'muffin', 'كعكة صغيرة'], ['🍪', 'cookie', 'بسكويت'], ['🥄', 'spoon', 'ملعقة'], ['🥤', 'straw', 'مصّاصة'], ['🍯', 'sweet', 'حلو']],
    tip: [
      'Say please and thank you: it makes every order friendly. - قل من فضلك وشكرًا: يصبح طلبك ألطف.',
      'Not sure? Ask: What do you recommend? - لست متأكدًا؟ اسأل عمّا ينصحك به.',
    ],
    readNotice: ['He takes a break there every afternoon.', 'He changes his mind and adds a small orange juice.', 'When he is in a hurry, he takes his coffee to go.'],
    questions: ['Where does Amine take a break every afternoon?', 'How does he like his coffee?', 'What does he eat?', 'How much is everything?'],
    answers: ['At a café near his work.', 'Hot, with a little milk and no sugar.', 'A cheese sandwich.', 'Sixty-two dirhams.'],
  },
  3: {
    yourTurn: ['What can you cook?', 'Who cooks in your family?', 'What is your favourite dish?'],
    notice: [
      'Can you wash the vegetables? - لطلب المساعدة بأدب.',
      'Do we have any eggs? — Yes, we have some. - any في السؤال، و some في الجواب المثبت.',
      "We're out of bread. - نفد منّا الخبز.",
    ],
    extra: [['🔪', 'knife', 'سكين'], ['🍳', 'pan', 'مقلاة'], ['🍲', 'pot', 'قِدر'], ['🥣', 'bowl', 'وعاء'], ['🍴', 'fork', 'شوكة'], ['🔥', 'stove', 'الموقد']],
    tip: [
      'Name the things in your kitchen in English while you cook. - سمِّ أشياء مطبخك بالإنجليزية وأنت تطبخ.',
      'Read a short recipe in English and follow it. - اقرأ وصفة قصيرة بالإنجليزية واتّبعها.',
    ],
    readNotice: ['First he checks the fridge.', 'While the food is cooking, he tastes it.', 'It needs a little more salt.'],
    questions: ['What does Sami cook on Friday?', 'What does Nour do to help?', 'How much water does Sami need for the rice?', 'What does Sami make after lunch?'],
    answers: ['Chicken and rice.', 'She washes and peels the vegetables, and sets the table.', 'About two cups.', 'Some tea.'],
  },
  4: {
    yourTurn: ['Do you take a shower in the morning or at night?', 'How long do you spend in the bathroom in the morning?', 'What do you need to buy for the bathroom?'],
    notice: [
      "Where's my toothbrush? — It's next to the mirror.",
      'under the sink · in the drawer · next to the mirror - حروف المكان.',
      'Have you seen my comb? - هل رأيت مشطي؟',
    ],
    extra: [['🪒', 'razor', 'شفرة الحلاقة'], ['🧻', 'toilet paper', 'ورق المرحاض'], ['🛁', 'bath', 'حوض الاستحمام'], ['🚰', 'sink', 'المغسلة'], ['🧽', 'sponge', 'إسفنجة'], ['🧴', 'body lotion', 'مرطّب الجسم']],
    tip: [
      'Stick small notes with English words on things in your bathroom. - ألصق أوراقًا صغيرة بأسماء الأشياء على أغراض حمّامك.',
      'Describe what you are doing while you do it. - صِف ما تفعله وأنت تفعله.',
    ],
    readNotice: ['He brushes his teeth. / She washes her hair.', 'There is only a little toothpaste left.', 'She cannot find her comb.'],
    questions: ['Who goes into the bathroom first?', 'Where is the new tube of toothpaste?', 'Why is Lina in a hurry?', 'Where is the hairdryer?'],
    answers: ['Omar.', 'Under the sink.', 'She needs the bathroom before they leave.', 'In the drawer.'],
  },
  5: {
    yourTurn: ['Do you wash your clothes at home or at the laundry?', 'Who irons the clothes in your house?', 'Which of your clothes need dry cleaning?'],
    notice: [
      "It'll be ready on Tuesday. - نستعمل on مع الأيام.",
      'Can I pick it up after five? - pick up تعني يستلم.',
      'Do I need to pay now? - هل عليّ أن أدفع الآن؟',
    ],
    extra: [['🧦', 'socks', 'جوارب'], ['🧥', 'coat', 'معطف'], ['🧣', 'scarf', 'وشاح'], ['🛏️', 'sheets', 'أغطية السرير'], ['🔘', 'button', 'زر'], ['🧵', 'sew', 'يخيط']],
    tip: [
      'Keep your receipt: you need it to pick up your clothes. - احتفظ بالإيصال: تحتاجه لاستلام ملابسك.',
      'Show the stain and say what it is: coffee, tea, oil. - أشر إلى البقعة وقل ما هي.',
    ],
    readNotice: ['The jacket needs dry cleaning.', 'They can wash the shirts normally.', 'She pays when she picks up her clothes.'],
    questions: ['What clothes does Hoda take to the laundry?', 'What is on the jacket?', 'How much is it altogether?', 'When are the clothes ready?'],
    answers: ['One jacket and two shirts.', 'A stain — she thinks it is coffee.', 'Ninety dirhams.', 'On Tuesday afternoon.'],
  },
  6: {
    yourTurn: ['What is your favourite restaurant?', 'What do you usually order there?', 'Do you like spicy food?'],
    notice: [
      "I'll have the chicken. / I'd like the fish. - لتطلب طبقك.",
      'Is it spicy? Does it come with rice? - لتسأل عن الطبق.',
      'Could we have the bill, please? - لتطلب الفاتورة.',
    ],
    extra: [['🍝', 'pasta', 'معكرونة'], ['🥩', 'meat', 'لحم'], ['🍟', 'chips', 'بطاطس مقلية'], ['🧂', 'salt and pepper', 'الملح والفلفل'], ['🍹', 'fresh juice', 'عصير طازج'], ['📞', 'book a table', 'يحجز طاولة']],
    tip: [
      'Wait for the waiter to show you to a table. - انتظر النادل ليرشدك إلى طاولة.',
      'If there is a problem, say it politely: Excuse me, I ordered the fish. - إن كانت هناك مشكلة، قلها بأدب.',
    ],
    readNotice: ['Sami ordered the fish.', 'Karim says sorry and changes it right away.', 'They do not want dessert.'],
    questions: ['Where do Nadia and Sami go on Saturday evening?', 'What does the waiter recommend?', 'What is the problem with the food?', 'How do they pay?'],
    answers: ['To a restaurant near the market.', 'The chicken (and the fish is also very good).', 'Karim brings chicken to Sami, but he ordered the fish.', 'By card.'],
  },
  7: {
    yourTurn: ['How often do you go to the supermarket?', 'What do you always buy?', 'Do you take a basket or a cart?'],
    notice: [
      "Where can I find the milk? — It's in aisle four.",
      'Do you have this in a larger pack? - لتطلب عبوة أكبر.',
      "It's twenty percent off. - عليه تخفيض بعشرين في المئة.",
    ],
    extra: [['🧈', 'butter', 'زبدة'], ['🧀', 'cheese', 'جبن'], ['🫒', 'olive oil', 'زيت الزيتون'], ['🧼', 'washing powder', 'مسحوق الغسيل'], ['🍫', 'chocolate', 'شوكولاتة'], ['🥫', 'a can of tomatoes', 'علبة طماطم']],
    tip: [
      'Write your shopping list in English before you go. - اكتب لائحة مشترياتك بالإنجليزية قبل أن تذهب.',
      'Read the labels on the shelves: price, kilo, discount. - اقرأ الملصقات على الرفوف: الثمن والكيلو والتخفيض.',
    ],
    readNotice: ['The milk is in aisle four, on the left.', 'That is too much for Amine.', 'The chicken is on sale with a twenty percent discount.'],
    questions: ['How often does Amine go to the supermarket?', 'Where are the eggs?', 'How much are the tomatoes today?', 'How much is the total?'],
    answers: ['Once a week, usually on Saturday.', 'In aisle four, next to the milk.', 'Fifteen dirhams a kilo.', 'Two hundred and forty-seven dirhams.'],
  },
  8: {
    yourTurn: ['What bread do you usually buy?', 'How many loaves does your family eat every day?', 'What is your favourite pastry?'],
    notice: [
      "What's fresh today? - ما الطازج اليوم؟",
      "They're six dirhams each. - each تعني للواحدة.",
      "We're out of it today. - نفد اليوم.",
    ],
    extra: [['🫓', 'msemen', 'مسمّن'], ['🍩', 'doughnut', 'دونات'], ['🍪', 'biscuits', 'بسكويت'], ['🥐', 'pain au chocolat', 'خبز بالشوكولاتة'], ['🧁', 'cupcake', 'كعكة صغيرة'], ['🍞', 'sliced bread', 'خبز مقطّع']],
    tip: [
      'Go early: the bread is freshest in the morning. - اذهب باكرًا: الخبز أطزج في الصباح.',
      'Count with the baker: one loaf, two loaves, six croissants. - تدرّب على العدّ مع الخبّاز.',
    ],
    readNotice: ['Hakim is out of it today.', 'She changes her mind and asks for two more.', 'Everything comes to seventy-five dirhams.'],
    questions: ['What does Rania ask first?', 'Why does she not buy whole-wheat bread?', 'How many croissants does she buy in the end?', 'Which cake is very popular?'],
    answers: ["What's fresh today?", 'Hakim is out of it today.', 'Six.', 'The chocolate cake.'],
  },
  9: {
    yourTurn: ['What size do you usually wear?', 'What colour do you like for your clothes?', 'Where do you buy your clothes?'],
    notice: [
      'Can I try it on? - هل يمكنني تجربتها؟',
      "It's a little too small. - too قبل الصفة تعني مشكلة.",
      'It looks good on you. - تبدو جميلة عليك.',
    ],
    extra: [['🧢', 'cap', 'قبّعة'], ['🩳', 'shorts', 'سروال قصير'], ['👟', 'trainers', 'حذاء رياضي'], ['🧶', 'sweater', 'كنزة'], ['👜', 'handbag', 'حقيبة يد'], ['🔵', 'blue', 'أزرق']],
    tip: [
      'Know your size before you go: S, M, L, XL. - اعرف مقاسك قبل أن تذهب.',
      'Always keep the receipt for an exchange or a refund. - احتفظ دائمًا بالإيصال للاستبدال أو الاسترجاع.',
    ],
    readNotice: ['The medium is a little too small.', 'They only have it in white and grey.', 'This time it fits him well.'],
    questions: ['What does Karim need?', 'Why does he try a large?', 'What colour does he buy?', 'How much does he pay?'],
    answers: ['A jacket for everyday use.', 'The medium is a little too small.', 'Grey.', 'Two hundred and eighty dirhams.'],
  },
  10: {
    yourTurn: ['Where do you meet your friends?', 'What do you do together at the weekend?', 'When did you last see an old friend?'],
    notice: [
      "It's been a while! - مضت مدة!",
      "How have you been? — I've been good, thanks.",
      'Are you free this weekend? - لتقترح لقاءً.',
    ],
    extra: [['🎂', 'birthday', 'عيد ميلاد'], ['🎬', 'cinema', 'السينما'], ['⚽', 'football', 'كرة القدم'], ['🏖️', 'beach', 'الشاطئ'], ['🎉', 'party', 'حفلة'], ['📸', 'photo', 'صورة']],
    tip: [
      'Answer, then ask back: And you? What about you? - أجب، ثم اسأل صديقك أيضًا.',
      'End politely: I should get going. Take care! - أنهِ الحديث بلطف.',
    ],
    readNotice: ['They have not seen each other for a long time.', 'Saturday is not good for Karim.', "They agree on four o'clock."],
    questions: ['Where is Karim going when he sees Salma?', "What is new with Salma's sister?", 'Why can Karim not meet on Saturday?', 'Why does Salma have to go?'],
    answers: ['To the shops.', 'She started university this year.', 'He is visiting his family.', 'Her class starts in ten minutes.'],
  },
  11: {
    yourTurn: ['How often do you get a haircut?', 'How do you like your hair?', 'How much is a haircut in your town?'],
    notice: [
      'Just a little shorter, please. - أقصر قليلًا فقط، من فضلك.',
      'Shorter on the sides, longer on top. - أقصر على الجانبين، أطول في الأعلى.',
      'Not too short, please. - ليس قصيرًا جدًا، من فضلك.',
    ],
    extra: [['🪮', 'comb', 'مشط'], ['✂️', 'scissors', 'مقصّ'], ['🧴', 'hair gel', 'جِل الشعر'], ['💇', 'fringe', 'غُرّة'], ['🪒', 'shave', 'حلاقة'], ['🎨', 'hair colour', 'صبغة الشعر']],
    tip: [
      'Show a photo of the haircut you want. - أرِ الحلاق صورة للقصّة التي تريدها.',
      'Look in the mirror and ask for small changes. - انظر في المرآة واطلب تعديلات صغيرة.',
    ],
    readNotice: ['She does not have an appointment.', 'She wants the sides a little shorter.', 'It is exactly what she wanted.'],
    questions: ['How long is the wait?', 'Does Rania want a big change?', 'What does Karim do first?', 'How much is the haircut?'],
    answers: ['About ten minutes.', 'No, just a little shorter.', 'He washes her hair.', 'One hundred and twenty dirhams.'],
  },
  12: {
    yourTurn: ['What do you do when you have a cold?', 'Is there a pharmacy near your house?', 'Do you prefer tablets or syrup?'],
    notice: [
      "I've had it for three days. - نستعمل for مع المدة.",
      'How often should I take it? — Three times a day.',
      "Don't drive after you take it. - لا تَقُد السيارة بعد تناوله.",
    ],
    extra: [['🩹', 'plaster', 'لصقة جروح'], ['🌡️', 'thermometer', 'ميزان الحرارة'], ['😷', 'face mask', 'كمامة'], ['🧴', 'cream', 'كريم'], ['💧', 'eye drops', 'قطرة العين'], ['🤧', 'tissues', 'مناديل']],
    tip: [
      'Always read the label before you take a medicine. - اقرأ دائمًا الملصق قبل تناول أي دواء.',
      'Tell the pharmacist about your other medicines and allergies. - أخبر الصيدلي بأدويتك الأخرى وبالحساسية.',
    ],
    readNotice: ['She has had them for about three days.', 'She should not drive after she takes it.', 'If she is not better in three days, she should see a doctor.'],
    questions: ['What is wrong with Salma?', 'When is the cough worse?', 'How often does she take the syrup?', 'What else does the pharmacist tell her to do?'],
    answers: ['A sore throat and a cough.', 'At night.', 'Three times a day, after meals.', 'Drink a lot of water and rest.'],
  },
  13: {
    yourTurn: ['When did you last see a doctor?', 'Do you have any allergies?', 'What do you do when you have a fever?'],
    notice: [
      "I'd like to make an appointment. - أودّ حجز موعد.",
      'It started three days ago. - مع الماضي نستعمل ago بعد المدة.',
      'Does it hurt here? — Yes, a little.',
    ],
    extra: [['💉', 'injection', 'حقنة'], ['🩻', 'X-ray', 'صورة بالأشعة'], ['🦷', 'dentist', 'طبيب الأسنان'], ['🚑', 'ambulance', 'سيارة إسعاف'], ['🩹', 'bandage', 'ضمادة'], ['🫁', 'breathe', 'يتنفّس']],
    tip: [
      'Before you go, write your symptoms in English. - قبل أن تذهب، اكتب أعراضك بالإنجليزية.',
      'Say when it started: two days ago, last night. - قل متى بدأ: منذ يومين، البارحة ليلًا.',
    ],
    readNotice: ['She has not been feeling well for a few days.', 'She felt hot last night.', 'The doctor thinks it is the flu.'],
    questions: ["What time is Nadia's appointment?", 'What are her symptoms?', 'What is her temperature?', 'What does the doctor tell her to do?'],
    answers: ["At four o'clock.", 'A cough and a headache, and she feels very tired.', 'Thirty-eight.', 'Rest at home and drink a lot of water.'],
  },
  14: {
    yourTurn: ['Do you prefer the market or the supermarket?', 'What do you usually buy at the market?', 'Do you ask for a better price?'],
    notice: [
      'How much are these? — Twenty-five dirhams a kilo.',
      'Give me half a kilo, please. - أعطني نصف كيلوغرام، من فضلك.',
      'Can you make it fifty? - هل يمكنك أن تجعله خمسين؟',
    ],
    extra: [['🥕', 'carrots', 'جزر'], ['🍌', 'bananas', 'موز'], ['🍊', 'oranges', 'برتقال'], ['🍇', 'grapes', 'عنب'], ['🫑', 'peppers', 'فلفل'], ['🌿', 'mint', 'نعناع']],
    tip: [
      'Ask the price first, then decide the quantity. - اسأل عن الثمن أولًا، ثم حدّد الكمية.',
      'Smile and stay polite when you ask for a better price. - ابتسم وكن مهذّبًا عندما تطلب سعرًا أفضل.',
    ],
    readNotice: ['They came in this morning.', 'Karim adds it up: sixty dirhams.', 'In the end, they agree on fifty-five.'],
    questions: ['What does Nadia need?', 'How much are the tomatoes?', 'What price do they agree on?', 'Why does she not buy potatoes?'],
    answers: ['Tomatoes and onions.', 'Twenty-five dirhams a kilo.', 'Fifty-five dirhams.', 'She already has some at home.'],
  },
  15: {
    yourTurn: ['How do you go to work or school?', 'Do you prefer the bus, the train or a taxi?', 'Where would you like to go by train?'],
    notice: [
      'How much is the fare? - كم ثمن الرحلة؟',
      "I'd like a return ticket to Rabat. - أريد تذكرة ذهاب وإياب إلى الرباط.",
      'Where should I get off? - أين يجب أن أنزل؟',
    ],
    extra: [['✈️', 'plane', 'طائرة'], ['🚊', 'tram', 'الترامواي'], ['🧳', 'luggage', 'أمتعة'], ['⏱️', 'delay', 'تأخير'], ['🗺️', 'map', 'خريطة'], ['🚲', 'bike', 'درّاجة']],
    tip: [
      'Check the departure board for your platform. - تحقّق من لوحة المغادرة لتعرف رصيفك.',
      'Ask the driver to tell you when to get off. - اطلب من السائق أن يخبرك متى تنزل.',
    ],
    readNotice: ['He takes a taxi to the main train station.', 'The eight-thirty train is full.', 'The train leaves from platform two.'],
    questions: ['Where does Omar want to go?', 'How much is the taxi fare?', "Why does he take the nine o'clock train?", 'Which platform does the train leave from?'],
    answers: ['To Rabat.', 'About forty dirhams.', 'The eight-thirty train is full.', 'Platform two.'],
  },
  16: {
    yourTurn: ['What is the nearest shop to your house?', 'How do you get there from your home?', 'How long does it take you on foot?'],
    notice: [
      'Go straight. Turn left. Turn right. - امشِ إلى الأمام، انعطف يسارًا، انعطف يمينًا.',
      "It's next to the hotel, opposite the café. - بجانب الفندق، مقابل المقهى.",
      "You can't miss it. - لن تخطئه.",
    ],
    extra: [['🏛️', 'museum', 'متحف'], ['🕌', 'mosque', 'مسجد'], ['🏥', 'hospital', 'مستشفى'], ['🌳', 'park', 'حديقة'], ['🏫', 'school', 'مدرسة'], ['🌉', 'bridge', 'جسر']],
    tip: [
      'Repeat the directions to check you understand. - كرّر التعليمات لتتأكّد أنك فهمت.',
      'Use landmarks: the hotel, the bank, the traffic lights. - استعمل المعالم: الفندق والبنك وإشارة المرور.',
    ],
    readNotice: ['She should go straight down the street.', 'The bank is opposite a café.', 'She just has to walk past the bank.'],
    questions: ['What is Salma looking for?', 'Where does she turn left?', 'What is next to the bank?', 'Where is the pharmacy?'],
    answers: ['The bank on Green Street.', 'At the traffic lights.', 'A large hotel.', 'Behind the bank.'],
  },
  17: {
    yourTurn: ['When did you last stay at a hotel?', 'What do you need in a hotel room?', 'Do you like a hotel with breakfast included?'],
    notice: [
      "I'd like to check in, please. - أودّ تسجيل الدخول، من فضلك.",
      'Is breakfast included? - هل الفطور مشمول؟',
      "The air conditioning isn't working. - مكيّف الهواء لا يعمل.",
    ],
    extra: [['🏊', 'swimming pool', 'مسبح'], ['🛎️', 'room service', 'خدمة الغرف'], ['🧳', 'suitcase', 'حقيبة سفر'], ['🌅', 'view', 'منظر'], ['🅿️', 'car park', 'موقف السيارات'], ['🔔', 'wake-up call', 'مكالمة إيقاظ']],
    tip: [
      'Keep your room number and your key card with you. - احتفظ برقم غرفتك وبطاقتها معك.',
      'Call reception when something is not working. - اتصل بالاستقبال عندما لا يعمل شيء ما.',
    ],
    readNotice: ['She has a reservation for three nights.', 'Breakfast is served from seven to ten.', 'She has tried it twice, but nothing happens.'],
    questions: ['How many nights does Layla stay?', 'What floor is her room on?', 'What is the problem in her room?', 'Where does she leave her luggage?'],
    answers: ['Three.', 'The third floor (room 302).', 'The air conditioning is not working.', 'At reception, until five.'],
  },
  18: {
    yourTurn: ['Do you prefer to pay in cash or by card?', 'How often do you use an ATM?', 'What do you do to keep your card safe?'],
    notice: [
      "I'd like to withdraw / deposit / transfer money. - أريد أن أسحب / أودع / أحوّل المال.",
      'Is there a fee for the transfer? - هل توجد رسوم على التحويل؟',
      'Where do I sign? — At the bottom.',
    ],
    extra: [['🪙', 'coins', 'قطع نقدية'], ['💵', 'banknotes', 'أوراق نقدية'], ['💶', 'euros', 'يورو'], ['📈', 'exchange rate', 'سعر الصرف'], ['🏦', 'branch', 'فرع البنك'], ['🔒', 'password', 'كلمة السر']],
    tip: [
      'Never tell anyone your PIN. - لا تخبر أحدًا برقمك السري أبدًا.',
      'Keep your receipts and check your balance. - احتفظ بإيصالاتك وتحقّق من رصيدك.',
    ],
    readNotice: ['He entered the wrong PIN three times.', 'He gets his card back.', 'The money arrives today.'],
    questions: ['Why does Karim go to the bank?', 'What does he show Salma?', 'How much is the transfer fee?', 'Where can he change his PIN?'],
    answers: ['The ATM kept his card.', 'His ID.', 'Ten dirhams.', 'At the ATM.'],
  },
  19: {
    yourTurn: ['Do you prefer calls or messages?', 'Who do you call every day?', 'What do you say when you are running late?'],
    notice: [
      'Is this Sara? — Yes, speaking.',
      "I'll call you back in a minute. - سأعاود الاتصال بك بعد دقيقة.",
      "I'm running late. I'm on my way. - أنا متأخّر. أنا في الطريق.",
    ],
    extra: [['🔋', 'battery', 'بطارية'], ['🔌', 'charger', 'شاحن'], ['🎤', 'voice message', 'رسالة صوتية'], ['📹', 'video call', 'مكالمة فيديو'], ['👥', 'group chat', 'مجموعة دردشة'], ['😀', 'emoji', 'رمز تعبيري']],
    tip: [
      'Send short, clear messages: On my way. See you at eight. - أرسل رسائل قصيرة وواضحة.',
      'On the phone, give your name with This is… - في الهاتف، قدّم نفسك بعبارة This is ثم اسمك.',
    ],
    readNotice: ['He calls her back.', 'They were meeting at seven.', 'When he arrives, he cannot find her.'],
    questions: ['Why does Sara call Omar?', 'What time do they meet in the end?', 'Where do they meet?', 'How late is Omar?'],
    answers: ['To check their plans for tonight.', 'At eight.', 'At the café near the station.', 'About ten minutes.'],
  },
}
