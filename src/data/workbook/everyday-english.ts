/**
 * «الإنجليزية للمواقف اليومية» (A1 → A2) — the 19 units' vocabulary and
 * useful expressions, as the source for the workbook exercises in
 * /admin/games (word search, phrases in order, matching).
 *
 * Taken from the book's VOCABULARY and USEFUL EXPRESSIONS pages. A few of the
 * book's Arabic labels are wrong (e.g. "cash = فحص طبي", "tonight = أسود",
 * "next to = آلة التذاكر"); the translations here are the correct ones, so the
 * workbook doesn't repeat those mistakes.
 *
 * words   single words only — they go into the word-search grid
 * pairs   word ↔ Arabic for the matching exercise (can be multi-word)
 * phrases short, complete chunks for "put the words in order"
 */

export interface WorkbookUnit {
  n: number
  titleEn: string
  titleAr: string
  words: { en: string; ar: string }[]
  phrases: string[]
}

const w = (s: string) => s.split('|').map(x => { const [en, ar] = x.split('='); return { en: en.trim(), ar: ar.trim() } })

export const EVERYDAY_ENGLISH: WorkbookUnit[] = [
  { n: 1, titleEn: 'Morning Routine', titleAr: 'الروتين الصباحي',
    words: w('alarm=منبّه|bed=سرير|bathroom=حمّام|face=وجه|teeth=أسنان|shower=دُش|breakfast=فطور|coffee=قهوة|phone=هاتف|bag=حقيبة|shoes=حذاء|hair=شعر'),
    phrases: ['What time do you usually wake up?', 'I usually wake up at seven.', "What's the first thing you do?", 'I wash my face first.',
      'Do you take a shower in the morning?', 'After that, I get dressed and comb my hair.', 'What time do you leave home?', 'Are you ready to go?'] },
  { n: 2, titleEn: 'At the Café', titleAr: 'في المقهى',
    words: w('menu=قائمة الطعام|counter=الكاونتر|coffee=قهوة|tea=شاي|juice=عصير|sandwich=شطيرة|cake=كعكة|cup=كوب|milk=حليب|sugar=سكر|receipt=إيصال|iced=مثلّج'),
    phrases: ['Can I see the menu, please?', 'What do you recommend?', 'Can I get a coffee, please?', 'How much is it?',
      'Can I pay by card?', 'Could I have the receipt, please?', 'For here or to go?', 'Would you like milk or sugar?'] },
  { n: 3, titleEn: 'In the Kitchen', titleAr: 'في المطبخ',
    words: w('fridge=ثلاجة|eggs=بيض|bread=خبز|milk=حليب|rice=أرز|vegetables=خضار|salt=ملح|oil=زيت|sugar=سكر|chicken=دجاج|water=ماء|table=طاولة'),
    phrases: ['What are you making?', "I'm making lunch.", 'Do we have any eggs?', 'We have some in the fridge.',
      'Can you wash the vegetables?', 'Can you boil some water?', 'It needs a little more salt.', 'Can you set the table?'] },
  { n: 4, titleEn: 'In the Bathroom', titleAr: 'في الحمّام',
    words: w('toothbrush=فرشاة أسنان|toothpaste=معجون أسنان|soap=صابون|towel=منشفة|shampoo=شامبو|conditioner=بلسم|hairdryer=مجفّف الشعر|comb=مشط|mirror=مرآة|deodorant=مزيل العرق|razor=شفرة حلاقة|shower=دُش'),
    phrases: ["Where's my toothbrush?", "It's next to the mirror.", 'Do we have any toothpaste?', 'Can you pass me the towel?',
      "I'm just brushing my teeth.", 'I need to wash my hair.', 'Is your hair still wet?', 'Give me five minutes.'] },
  { n: 5, titleEn: 'Laundry & Everyday Services', titleAr: 'الغسيل والخدمات اليومية',
    words: w('laundry=محل غسيل|clothes=ملابس|shirt=قميص|jacket=سترة|trousers=بنطال|dress=فستان|stain=بقعة|iron=كيّ|receipt=إيصال|ready=جاهز|cash=نقدًا|card=بطاقة'),
    phrases: ["I'd like to have these cleaned.", "There's a stain here.", 'Can you remove this stain?', 'Does this need dry cleaning?',
      'Can you iron this shirt too?', 'How much will it cost?', 'When will it be ready?', "I'm here to pick up my clothes."] },
  { n: 6, titleEn: 'At the Restaurant', titleAr: 'في المطعم',
    words: w('table=طاولة|waiter=نادل|menu=قائمة الطعام|starter=مقبّلات|dessert=حلوى|drink=مشروب|soup=شوربة|fish=سمك|salad=سلطة|bill=الفاتورة|tip=إكرامية|napkin=منديل'),
    phrases: ['A table for two, please.', 'Can we see the menu?', 'Is this spicy?', 'Are you ready to order?',
      "I'll have the chicken, please.", 'Would you like something to drink?', 'Could we have the bill, please?', 'Is the tip included?'] },
  { n: 7, titleEn: 'At the Supermarket', titleAr: 'في السوبرماركت',
    words: w('cart=عربة التسوق|basket=سلة التسوق|bag=كيس|aisle=ممر|shelf=رف|milk=حليب|eggs=بيض|bread=خبز|fruit=فواكه|vegetables=خضروات|checkout=صندوق الأداء|cashier=أمين الصندوق'),
    phrases: ['Where can I find the milk?', "It's in aisle four.", 'Do you have this in a larger pack?', 'How much is this?',
      'Is this on sale?', 'Do you have a cheaper one?', 'Can I have a bag, please?', 'Could I have the receipt, please?'] },
  { n: 8, titleEn: 'At the Bakery', titleAr: 'المخبزة والخبز',
    words: w('bakery=مخبزة|fresh=طازج|warm=دافئ|bread=خبز|baguette=خبز فرنسي|loaf=رغيف|croissant=كرواسون|pastry=معجّنات|cake=كعكة|piece=قطعة|dozen=دزينة|sesame=سمسم'),
    phrases: ["What's fresh today?", 'The baguettes are fresh and still warm.', "I'd like two baguettes, please.", 'Do you have whole-wheat bread?',
      "Sorry, we're out of it today.", 'Are the croissants fresh?', 'How much is one?', "They're six dirhams each."] },
  { n: 9, titleEn: 'At the Clothes Shop', titleAr: 'في متجر الملابس',
    words: w('shirt=قميص|jacket=سترة|dress=فستان|jeans=جينز|trousers=بنطال|shoes=حذاء|size=مقاس|small=صغير|medium=متوسط|large=كبير|black=أسود|white=أبيض'),
    phrases: ["I'm looking for a jacket.", 'What size do you usually wear?', 'I usually wear a medium.', 'Do you have it in black?',
      'Can I try it on?', "It's a little too small.", 'This one fits much better.', "Can I exchange it if there's a problem?"] },
  { n: 10, titleEn: 'Meeting a Friend', titleAr: 'مقابلة صديق',
    words: w('meet=أقابل|friend=صديق|class=الصف|work=العمل|busy=مشغول|family=العائلة|weekend=عطلة نهاية الأسبوع|plans=خطط|tonight=الليلة|later=لاحقًا|tomorrow=غدًا|lunch=غداء'),
    phrases: ["It's good to see you.", "It's been a while.", 'How have you been?', "I've been busy with work.",
      "How's your family?", 'Are you free this weekend?', 'Do you want to get a coffee?', 'It was really good seeing you.'] },
  { n: 11, titleEn: 'At the Barber', titleAr: 'عند الحلاق',
    words: w('barber=حلاق|salon=صالون|appointment=موعد|haircut=قصّة شعر|trim=تشذيب|style=تصفيف|short=قصير|long=طويل|beard=لحية|sides=الجانبان|back=الخلف|curly=مجعّد'),
    phrases: ['Do you have an appointment?', 'The wait is about ten minutes.', 'How would you like it?', 'Just a little shorter, please.',
      'Leave the top a little longer.', 'Not too short, please.', 'Can you trim my beard too?', 'Take a look in the mirror.'] },
  { n: 12, titleEn: 'At the Pharmacy', titleAr: 'في الصيدلية',
    words: w('headache=صداع|cough=سعال|pain=ألم|fever=حمّى|cold=زكام|pharmacist=صيدلي|medicine=دواء|tablets=أقراص|syrup=شراب|dose=جرعة|morning=صباحًا|night=ليلًا'),
    phrases: ['I have a sore throat.', 'How long have you had it?', "I've had it for three days.", 'Do you have any other symptoms?',
      'Do you have something for this?', 'Do you prefer tablets or syrup?', 'How should I take it?', 'Should I take it with food?'] },
  { n: 13, titleEn: 'At the Clinic', titleAr: 'في العيادة',
    words: w('appointment=موعد|clinic=عيادة|doctor=طبيب|reception=الاستقبال|nurse=ممرّض|pain=ألم|fever=حمّى|cough=سعال|temperature=درجة الحرارة|allergy=حساسية|prescription=وصفة طبية|rest=راحة'),
    phrases: ["I'd like to make an appointment.", 'Please take a seat in the waiting room.', "I'm not feeling well.", 'I have a cough and a headache.',
      'It started about three days ago.', 'Is it getting better or worse?', 'Do you have any allergies?', 'What should I do next?'] },
  { n: 14, titleEn: 'At the Traditional Market', titleAr: 'في السوق التقليدي',
    words: w('tomatoes=طماطم|potatoes=بطاطس|onions=بصل|fresh=طازج|fruit=فواكه|price=السعر|expensive=غالٍ|cheap=رخيص|kilo=كيلوغرام|discount=تخفيض|change=الباقي|total=المجموع'),
    phrases: ['Are these fresh?', 'Do you have any fresh tomatoes?', 'How much are these?', "I'd like one kilo, please.",
      'Give me half a kilo, please.', "That's a little expensive.", 'Can you give me a better price?', 'Do you have change?'] },
  { n: 15, titleEn: 'Taxis, Buses & Trains', titleAr: 'التنقل',
    words: w('taxi=سيارة أجرة|driver=سائق|fare=أجرة الرحلة|street=شارع|address=عنوان|ticket=تذكرة|station=محطة|platform=رصيف المحطة|seat=مقعد|train=قطار|bus=حافلة|stop=محطة توقف'),
    phrases: ['Can you take me to the train station?', 'How long will it take?', 'How much is the fare?', "I'd like a return ticket, please.",
      'What time does the next train leave?', 'Which platform is it?', 'Does this bus go to the city centre?', 'Where should I get off?'] },
  { n: 16, titleEn: 'Asking for Directions', titleAr: 'السؤال عن الاتجاهات',
    words: w('straight=إلى الأمام|corner=زاوية|right=يمين|left=يسار|opposite=مقابل|behind=خلف|near=قريب|far=بعيد|bank=بنك|pharmacy=صيدلية|hotel=فندق|street=شارع'),
    phrases: ['Excuse me, how can I get to the bank?', 'Where is the nearest pharmacy?', 'Turn left at the traffic lights.', 'Take the second street on the right.',
      "It's next to the hotel.", "It's opposite the café.", 'Is it far from here?', 'It takes about five minutes.'] },
  { n: 17, titleEn: 'At the Hotel', titleAr: 'في الفندق',
    words: w('reservation=حجز|reception=الاستقبال|passport=جواز السفر|room=غرفة|key=مفتاح|breakfast=فطور|shower=دُش|elevator=المصعد|towel=منشفة|luggage=أمتعة|floor=طابق|password=كلمة السر'),
    phrases: ["I'd like to check in, please.", 'I have a reservation.', 'Could I see your passport, please?', 'I booked a double room.',
      'What floor is my room on?', 'Is breakfast included?', "The air conditioning isn't working.", 'Could I have an extra towel?'] },
  { n: 18, titleEn: 'At the Bank', titleAr: 'في البنك',
    words: w('account=حساب|withdraw=يسحب|deposit=يودع|transfer=يحوّل|cash=نقد|money=مال|fee=رسوم|card=بطاقة|form=استمارة|balance=الرصيد|signature=التوقيع|receipt=إيصال'),
    phrases: ["I'm here to open an account.", 'Could I see your ID, please?', "I'd like to withdraw 500 dirhams.", "I'd also like to make a transfer.",
      'Is there a fee for the transfer?', "My card isn't working.", 'Where do I sign?', 'Could I have a receipt?'] },
  { n: 19, titleEn: 'Phone & WhatsApp English', titleAr: 'الإنجليزية عبر الهاتف وواتساب',
    words: w('call=مكالمة|phone=هاتف|message=رسالة|connection=اتصال|location=الموقع|late=متأخر|outside=بالخارج|busy=مشغول|free=متفرّغ|tonight=الليلة|wait=انتظر|reply=ردّ'),
    phrases: ['Is now a good time to talk?', "I'm a little busy right now.", 'Can you hear me?', "I'll call you back in a minute.",
      'Sorry, I missed your call.', "I'm running late.", 'Are we still meeting at seven?', 'Send me your location, please.'] },
]

export const WORKBOOKS = [
  { id: 'everyday', title: 'الإنجليزية للمواقف اليومية', level: 'A1 → A2', units: EVERYDAY_ENGLISH },
] as const
