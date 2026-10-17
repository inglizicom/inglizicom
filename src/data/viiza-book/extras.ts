import type { Pair } from './types.ts'

/**
 * The pages before and after the journey: the traveller's toolkit (letters,
 * numbers, times, dates, money), the survival phrases, "My trip", the
 * point-and-show dictionary, emergency numbers and conversions. Facts that
 * change (emergency numbers, plugs, sizes) were checked in October 2026;
 * sizes are approximate and the pages say so.
 */

/** The spelling alphabet airlines and hotels use on the phone. */
export const SPELLING: [letter: string, word: string][] = [
  ['A', 'Alpha'], ['B', 'Bravo'], ['C', 'Charlie'], ['D', 'Delta'], ['E', 'Echo'], ['F', 'Foxtrot'], ['G', 'Golf'],
  ['H', 'Hotel'], ['I', 'India'], ['J', 'Juliet'], ['K', 'Kilo'], ['L', 'Lima'], ['M', 'Mike'], ['N', 'November'],
  ['O', 'Oscar'], ['P', 'Papa'], ['Q', 'Quebec'], ['R', 'Romeo'], ['S', 'Sierra'], ['T', 'Tango'], ['U', 'Uniform'],
  ['V', 'Victor'], ['W', 'Whiskey'], ['X', 'X-ray'], ['Y', 'Yankee'], ['Z', 'Zulu'],
]

/** Letter names Arabic speakers mix up: [letters, how they sound (Arabic letters), tip]. */
export const LETTER_TRAPS: [letters: string, sound: string, tip: string][] = [
  ['A · E · I', 'إيه · إي · آي', 'الثلاثة مختلفة: A = إيه، E = إي، I = آي.'],
  ['G · J', 'جي · جيه', 'G تُنطق جي، و J تُنطق جيه.'],
  ['B · P · V', 'بي · پي · ڤي', 'P بشفتين مغلقتين بلا صوت، V بالأسنان على الشفة.'],
  ['H', 'إيتش', 'ليست «آش» كما في الفرنسية.'],
  ['R', 'آر', 'ليست «إير».'],
  ['W', 'دابليو', 'double U: حرف واحد.'],
  ['Y', 'واي', 'ليست «إيغريك».'],
  ['Z', 'زِد / زي', 'بريطانيا: zed · أمريكا: zee.'],
]

/** How travellers read numbers aloud: [on paper, said, Arabic note]. */
export const SAY_NUMBERS: [seen: string, said: string, note: string][] = [
  ['Flight AT 802', 'A-T eight-oh-two', 'رقم الرحلة رقمًا رقمًا، والصفر = oh'],
  ['Gate B12', 'gate B twelve', 'البوابة: الحرف ثم العدد'],
  ['Seat 23A', 'twenty-three A', 'المقعد: الصف ثم الحرف'],
  ['Room 1208', 'twelve-oh-eight', 'رقم الغرفة مقسّم اثنين اثنين'],
  ['0661 23 45 77', 'oh-six-six-one, two-three, four-five, double seven', 'الهاتف رقمًا رقمًا، و77 = double seven'],
  ['2027', 'twenty twenty-seven', 'السنة اثنين اثنين'],
  ['1,500', 'one thousand five hundred', 'أو fifteen hundred'],
  ['K7Q2PM', 'K for kilo, seven, Q for Quebec, two, P for papa, M for mike', 'رقم الحجز بأبجدية الهاتف'],
]

/** Times: [24-hour, said, Arabic]. */
export const TIMES: [h24: string, said: string, ar: string][] = [
  ['07:15', 'seven fifteen a.m. · quarter past seven', 'السابعة والربع صباحًا'],
  ['12:00', 'twelve noon · midday', 'منتصف النهار'],
  ['14:30', 'two thirty p.m. · half past two', 'الثانية والنصف بعد الظهر'],
  ['18:45', 'six forty-five p.m. · quarter to seven', 'السابعة إلا ربعًا مساءً'],
  ['21:05', 'nine oh five p.m. · five past nine', 'التاسعة وخمس دقائق ليلًا'],
  ['00:00', 'midnight', 'منتصف الليل'],
]

/** Dates: [where, written, said]. */
export const DATES: [where: string, written: string, said: string][] = [
  ['UK · Europe · Gulf', '14/03/2027', 'the fourteenth of March, twenty twenty-seven'],
  ['USA', '03/14/2027', 'March fourteenth, twenty twenty-seven'],
  ['Tickets · forms', '14 MAR 2027', 'the clearest way: the month in letters'],
]

export const ORDINALS: Pair[] = [
  ['1st first', 'الأول'], ['2nd second', 'الثاني'], ['3rd third', 'الثالث'], ['4th fourth', 'الرابع'], ['5th fifth', 'الخامس'],
  ['12th twelfth', 'الثاني عشر'], ['20th twentieth', 'العشرون'], ['21st twenty-first', 'الحادي والعشرون'], ['22nd twenty-second', 'الثاني والعشرون'], ['31st thirty-first', 'الحادي والثلاثون'],
]

export const MONTHS: Pair[] = [
  ['January', 'يناير'], ['February', 'فبراير'], ['March', 'مارس'], ['April', 'أبريل'], ['May', 'مايو'], ['June', 'يونيو'],
  ['July', 'يوليو'], ['August', 'أغسطس'], ['September', 'سبتمبر'], ['October', 'أكتوبر'], ['November', 'نوفمبر'], ['December', 'ديسمبر'],
]

export const DAYS: Pair[] = [
  ['Monday', 'الإثنين'], ['Tuesday', 'الثلاثاء'], ['Wednesday', 'الأربعاء'], ['Thursday', 'الخميس'], ['Friday', 'الجمعة'], ['Saturday', 'السبت'], ['Sunday', 'الأحد'],
]

/** Currencies: [name, code / sign, small unit, Arabic, where]. */
export const CURRENCIES: [name: string, code: string, unit: string, ar: string][] = [
  ['euro', '€ · EUR', 'cents', 'اليورو'],
  ['pound sterling', '£ · GBP', 'pence (p)', 'الجنيه الإسترليني'],
  ['US dollar', '$ · USD', 'cents', 'الدولار الأمريكي'],
  ['UAE dirham', 'AED', 'fils', 'الدرهم الإماراتي'],
  ['Saudi riyal', 'SAR', 'halala', 'الريال السعودي'],
  ['Qatari riyal', 'QAR', 'dirham', 'الريال القطري'],
  ['Kuwaiti dinar', 'KWD', 'fils', 'الدينار الكويتي'],
  ['Omani rial', 'OMR', 'baisa', 'الريال العماني'],
  ['Bahraini dinar', 'BHD', 'fils', 'الدينار البحريني'],
]

/** Prices aloud: [written, said]. */
export const SAY_PRICES: [written: string, said: string][] = [
  ['€4.50', 'four euros fifty · four fifty'],
  ['£12.99', 'twelve pounds ninety-nine · twelve ninety-nine'],
  ['$0.25', 'twenty-five cents · a quarter'],
  ['AED 1,250', 'one thousand two hundred and fifty dirhams'],
]

/** The survival phrases, in groups: [group English, group Arabic, phrases]. */
export const SURVIVAL: { en: string; ar: string; icon: string; items: Pair[] }[] = [
  { en: 'Polite words', ar: 'كلمات الأدب', icon: 'Smile', items: [
    ['Hello. / Hi.', 'مرحبًا.'], ['Excuse me.', 'عذرًا (لتنادي أحدًا أو لتمرّ).'], ['Sorry!', 'آسف!'], ['Please.', 'من فضلك.'],
    ['Thank you. / Thanks a lot.', 'شكرًا. / شكرًا جزيلًا.'], ["You're welcome.", 'عفوًا.'], ['No problem.', 'لا مشكلة.'], ['Have a nice day!', 'يومًا سعيدًا!'],
  ] },
  { en: "When you don't understand", ar: 'عندما لا تفهم', icon: 'CircleHelp', items: [
    ["Sorry, I don't understand.", 'عذرًا، لا أفهم.'], ['Could you repeat that, please?', 'هل تعيد من فضلك؟'],
    ['Could you speak more slowly, please?', 'هل تتكلم ببطء أكثر؟'], ['Could you write it down, please?', 'هل تكتبه لي من فضلك؟'],
    ['What does "______" mean?', 'ماذا تعني «…»؟'], ['How do you say "______" in English?', 'كيف تقول «…» بالإنجليزية؟'],
    ['Do you speak Arabic or French?', 'هل تتكلم العربية أو الفرنسية؟'], ['My English is not very good, sorry.', 'إنجليزيتي ليست جيدة، آسف.'],
  ] },
  { en: 'Ask for anything', ar: 'اسأل عن أي شيء', icon: 'MessageCircleQuestion', items: [
    ['Where is ______?', 'أين …؟'], ['Is there a ______ near here?', 'هل يوجد … قريب من هنا؟'], ['How much is it?', 'كم الثمن؟'],
    ['Can I ______?', 'هل يمكنني …؟'], ['Do you have ______?', 'هل لديكم …؟'], ["I'd like ______, please.", 'أريد … من فضلك.'],
    ['Could you help me, please?', 'هل تساعدني من فضلك؟'], ['What time does it open / close?', 'متى يفتح / يُغلق؟'],
    ['How long does it take?', 'كم يستغرق ذلك؟'], ['Which way is ______?', 'من أي طريق إلى …؟'],
  ] },
  { en: 'Problems', ar: 'المشاكل', icon: 'TriangleAlert', items: [
    ['I have a problem.', 'عندي مشكلة.'], ["It's not working.", 'إنه لا يعمل.'], ["I've lost my ______.", 'أضعت …'], ["I'm lost.", 'أنا تائه.'],
    ["I don't feel well.", 'لا أشعر بخير.'], ['I need a doctor.', 'أحتاج طبيبًا.'], ['Please call the police.', 'اتصل بالشرطة من فضلك.'], ['I need help.', 'أحتاج مساعدة.'],
  ] },
  { en: 'Say no, politely and firmly', ar: 'الرفض بأدب وحزم', icon: 'Hand', items: [
    ['No, thank you.', 'لا، شكرًا.'], ["I'm not interested, thanks.", 'لست مهتمًا، شكرًا.'], ["That's too expensive.", 'هذا غالٍ جدًا.'],
    ["I'll think about it.", 'سأفكّر في الأمر.'], ['Please stop.', 'توقّف من فضلك.'], ['Leave me alone, please.', 'اتركني من فضلك.'],
  ] },
  { en: 'About you', ar: 'عنك', icon: 'UserRound', items: [
    ['My name is ______.', 'اسمي …'], ["I'm from ______.", 'أنا من …'], ["I'm here on holiday.", 'أنا هنا في عطلة.'],
    ["I'm staying at ______.", 'أسكن في …'], ['My phone number is ______.', 'رقم هاتفي …'], ["I'm travelling with my family.", 'أسافر مع عائلتي.'],
  ] },
]

/** "My trip": the fields a traveller fills in before leaving. */
export const MY_TRIP: { en: string; ar: string; icon: string; fields: Pair[] }[] = [
  { en: 'Me', ar: 'أنا', icon: 'UserRound', fields: [
    ['Full name (as in the passport)', 'الاسم الكامل كما في الجواز'], ['Passport number · expiry date', 'رقم الجواز · تاريخ الانتهاء'],
    ['Visa: type · valid until', 'التأشيرة: النوع · صالحة حتى'], ['Blood type · allergies · medicines', 'فصيلة الدم · الحساسية · الأدوية'],
  ] },
  { en: 'Flights', ar: 'الرحلات', icon: 'Plane', fields: [
    ['Outbound: date · flight · booking reference', 'الذهاب: التاريخ · الرحلة · رقم الحجز'], ['Return: date · flight · booking reference', 'العودة: التاريخ · الرحلة · رقم الحجز'],
  ] },
  { en: 'Where I stay', ar: 'إقامتي', icon: 'Hotel', fields: [
    ['Hotel / host · address', 'الفندق أو المضيف · العنوان'], ['Phone · nearest station', 'الهاتف · أقرب محطة'],
  ] },
  { en: 'If something goes wrong', ar: 'إن حدث طارئ', icon: 'LifeBuoy', fields: [
    ['Travel insurance · policy number · emergency phone', 'التأمين · رقم العقد · هاتف الطوارئ'], ["My bank's emergency number", 'رقم الطوارئ في بنكي'],
    ["My country's embassy / consulate · phone", 'سفارة بلدي / القنصلية · الهاتف'], ['Someone at home · phone', 'شخص في البلد · الهاتف'],
  ] },
]

/** The night-before checklist. */
export const CHECKLIST: Pair[] = [
  ['Passport (valid 6 months+)', 'الجواز (صالح 6 أشهر أو أكثر)'], ['Visa / ETA / e-visa', 'التأشيرة أو الإذن الإلكتروني'],
  ['Flight tickets (screenshot)', 'تذاكر الطيران (صورة شاشة)'], ['Hotel booking + address', 'حجز الفندق والعنوان'],
  ['Travel insurance', 'تأمين السفر'], ['Two bank cards + some cash', 'بطاقتان بنكيتان وقليل من النقود'],
  ['Phone, charger, power bank', 'الهاتف والشاحن والبطارية'], ['Plug adapter', 'محوّل المقبس'],
  ['Medicine + prescription', 'الدواء والوصفة'], ['Copies of documents in your email', 'نسخ الوثائق في بريدك'],
  ['Offline map of the city', 'خريطة المدينة بدون إنترنت'], ['eSIM or roaming ready', 'eSIM أو التجوال جاهز'],
  ['Liquids: 100 ml, clear bag', 'السوائل: 100 ml في كيس شفاف'], ['This book!', 'هذا الكتاب!'],
]

/** Point and show: [icon, English, Arabic] by theme, two themes a page. */
export const DICTIONARY: { en: string; ar: string; items: [icon: string, en: string, ar: string][] }[] = [
  { en: 'Food & drink', ar: 'الأكل والشرب', items: [
    ['GlassWater', 'water', 'ماء'], ['Wheat', 'bread', 'خبز'], ['Drumstick', 'chicken', 'دجاج'], ['Beef', 'meat (beef)', 'لحم بقر'],
    ['Fish', 'fish', 'سمك'], ['Egg', 'eggs', 'بيض'], ['Milk', 'milk', 'حليب'], ['Carrot', 'vegetables', 'خضر'],
    ['Apple', 'fruit', 'فواكه'], ['Salad', 'salad', 'سلطة'], ['Soup', 'soup', 'حساء'], ['Sandwich', 'sandwich', 'شطيرة'],
    ['Pizza', 'pizza', 'بيتزا'], ['Coffee', 'coffee · tea', 'قهوة · شاي'], ['CupSoda', 'juice', 'عصير'], ['IceCreamCone', 'ice cream', 'مثلّجات'],
    ['Cookie', 'biscuits', 'بسكويت'], ['Candy', 'sweets', 'حلويات'], ['BadgeCheck', 'halal, please', 'حلال من فضلك'], ['Ban', 'no pork, no alcohol', 'بلا خنزير ولا كحول'],
  ] },
  { en: 'Places', ar: 'الأماكن', items: [
    ['DoorClosed', 'toilets', 'المراحيض'], ['Moon', 'mosque', 'مسجد'], ['Hospital', 'hospital', 'مستشفى'], ['Cross', 'pharmacy', 'صيدلية'],
    ['Landmark', 'bank', 'بنك'], ['CreditCard', 'ATM', 'صرّاف آلي'], ['Shield', 'police station', 'مركز الشرطة'], ['Hotel', 'hotel', 'فندق'],
    ['Plane', 'airport', 'المطار'], ['TrainFront', 'train station', 'محطة القطار'], ['Bus', 'bus stop', 'موقف الحافلة'], ['TramFront', 'metro', 'المترو'],
    ['CarTaxiFront', 'taxi', 'سيارة أجرة'], ['ShoppingCart', 'supermarket', 'متجر'], ['Utensils', 'restaurant', 'مطعم'], ['ShoppingBag', 'shopping centre', 'مركز تجاري'],
    ['Mail', 'post office', 'مكتب البريد'], ['Flag', 'embassy', 'السفارة'], ['Trees', 'park', 'حديقة'], ['Fuel', 'petrol station', 'محطة وقود'],
  ] },
  { en: 'Health & pharmacy', ar: 'الصحة والصيدلية', items: [
    ['Brain', 'headache', 'صداع'], ['Thermometer', 'fever', 'حمّى'], ['Wind', 'cough', 'سعال'], ['Snowflake', 'a cold', 'زكام'],
    ['Mic', 'sore throat', 'ألم الحلق'], ['Activity', 'stomach ache', 'ألم المعدة'], ['Smile', 'toothache', 'ألم الأسنان'], ['Plus', 'plasters', 'لصقات جروح'],
    ['Pill', 'painkiller', 'مسكّن'], ['Droplet', 'cream', 'مرهم'], ['TriangleAlert', 'allergy', 'حساسية'], ['Syringe', 'diabetes', 'السكري'],
    ['HeartPulse', 'blood pressure', 'ضغط الدم'], ['Baby', 'pregnant', 'حامل'], ['Eye', 'eye drops', 'قطرة العين'], ['Ear', 'earache', 'ألم الأذن'],
    ['Sun', 'sun cream', 'واقي الشمس'], ['Bug', 'insect bite', 'لدغة حشرة'], ['FileText', 'prescription', 'وصفة طبية'], ['Ambulance', 'ambulance', 'إسعاف'],
  ] },
  { en: 'Things you need', ar: 'أشياء تحتاجها', items: [
    ['BookUser', 'passport', 'جواز السفر'], ['Ticket', 'ticket', 'تذكرة'], ['Cable', 'charger', 'شاحن'], ['Plug', 'adapter', 'محوّل'],
    ['Smartphone', 'SIM card', 'شريحة'], ['BatteryCharging', 'power bank', 'بطارية خارجية'], ['Wifi', 'Wi-Fi', 'واي فاي'], ['KeyRound', 'key', 'مفتاح'],
    ['Wallet', 'wallet', 'محفظة'], ['Luggage', 'suitcase', 'حقيبة'], ['Umbrella', 'umbrella', 'مظلة'], ['Bath', 'towel', 'منشفة'],
    ['Droplets', 'soap', 'صابون'], ['Brush', 'toothbrush', 'فرشاة أسنان'], ['Layers', 'tissues', 'مناديل'], ['Baby', 'nappies · diapers', 'حفاضات'],
    ['Bed', 'blanket', 'بطانية'], ['Compass', 'qibla direction', 'اتجاه القبلة'], ['Pen', 'pen', 'قلم'], ['Map', 'map', 'خريطة'],
  ] },
]

/** Emergency numbers (checked October 2026): [where, number(s), Arabic note]. */
export const EMERGENCY: [where: string, numbers: string, note: string][] = [
  ['European Union (all countries)', '112', 'رقم واحد لكل الطوارئ'],
  ['United Kingdom', '999 · 112', '111 نصيحة طبية · 101 شرطة غير مستعجلة'],
  ['USA', '911', 'الشرطة والإسعاف والإطفاء'],
  ['United Arab Emirates', '999 police · 998 ambulance · 997 fire', ''],
  ['Saudi Arabia', '999 police · 997 ambulance · 998 civil defence', '911 في المدن الكبرى'],
  ['Qatar', '999', ''],
  ['Kuwait', '112', ''],
  ['Oman', '9999', ''],
  ['Bahrain', '999', ''],
  ['Türkiye (Istanbul transit)', '112', ''],
]

export const EMERGENCY_CALL: Pair[] = [
  ['1. Where you are: "I\'m at ______."', '١. أين أنت بالضبط'],
  ['2. What happened: "There\'s been an accident."', '٢. ماذا حدث'],
  ['3. Who is hurt: "One person is hurt."', '٣. من المصاب وكم عددهم'],
  ['4. Your number: "My number is ______."', '٤. رقم هاتفك'],
]

export const EMERGENCY_PHRASES: Pair[] = [
  ['Help!', 'النجدة!'], ['Call an ambulance!', 'اتصلوا بالإسعاف!'], ['Call the police!', 'اتصلوا بالشرطة!'], ['Fire!', 'حريق!'],
  ["I'm hurt.", 'أنا مصاب.'], ["I've been robbed.", 'سُرقت.'], ['My child is lost.', 'طفلي ضائع.'], ["I can't breathe.", 'لا أستطيع التنفّس.'],
]

export const LOST_PASSPORT: Pair[] = [
  ['Report it to the police. Get a police report.', 'بلّغ الشرطة وخذ محضرًا.'],
  ["Call your country's embassy or consulate.", 'اتصل بسفارة بلدك أو قنصليتها.'],
  ['Bring: the report, photos, a copy of the passport.', 'أحضر: المحضر، وصورًا شخصية، ونسخة من الجواز.'],
  ['Tell your airline and your insurance.', 'أخبر شركة الطيران والتأمين.'],
]

/** Sizes (approximate: always try on). */
export const SIZES: { en: string; ar: string; rows: string[][] }[] = [
  { en: "Women's clothes", ar: 'ملابس النساء', rows: [['UK', '8', '10', '12', '14', '16'], ['EU', '36', '38', '40', '42', '44'], ['US', '4', '6', '8', '10', '12']] },
  { en: "Men's jackets", ar: 'سترات الرجال', rows: [['UK · US', '36', '38', '40', '42', '44'], ['EU', '46', '48', '50', '52', '54'], ['Size', 'S', 'M', 'L', 'XL', 'XXL']] },
  { en: "Women's shoes", ar: 'أحذية النساء', rows: [['UK', '4', '5', '6', '7', '8'], ['EU', '37', '38', '39', '40', '42'], ['US', '6', '7', '8', '9', '10']] },
  { en: "Men's shoes", ar: 'أحذية الرجال', rows: [['UK', '7', '8', '9', '10', '11'], ['EU', '41', '42', '43', '44.5', '46'], ['US', '8', '9', '10', '11', '12']] },
]

export const TEMPERATURES: [c: string, f: string][] = [['0°C', '32°F'], ['10°C', '50°F'], ['20°C', '68°F'], ['25°C', '77°F'], ['30°C', '86°F'], ['35°C', '95°F'], ['40°C', '104°F'], ['45°C', '113°F']]

export const MEASURES: Pair[] = [
  ['1 mile = 1.6 km', 'الميل = 1.6 كيلومتر'], ['1 km = 0.62 miles', 'الكيلومتر = 0.62 ميل'],
  ['1 kg = 2.2 lb', 'الكيلو = 2.2 رطل (pound)'], ['23 kg ≈ 50 lb', 'الحقيبة المسجلة ≈ 50 رطلًا'],
  ['1 foot = 30 cm · 1 inch = 2.5 cm', 'القدم = 30 سم · البوصة = 2.5 سم'], ['100 ml = 3.4 fl oz', '100 ml = 3.4 أونصة سائلة'],
  ['1 US gallon = 3.8 litres', 'الغالون الأمريكي = 3.8 لتر'], ['°F = °C × 1.8 + 32', 'الفهرنهايت = المئوية × 1.8 + 32'],
]

/** Plugs and voltage: [where, plug types, voltage]. */
export const PLUGS: [where: string, plug: string, volts: string][] = [
  ['USA', 'A · B', '120 V'], ['United Kingdom', 'G', '230 V'], ['Europe', 'C · F', '230 V'],
  ['UAE', 'G', '230 V'], ['Saudi Arabia', 'G', '230 V'], ['Qatar', 'G · D', '240 V'],
]

/** The apps index: each app once, by need, with the stops where it helps. */
export const APPS_INDEX: { en: string; ar: string; icon: string; items: [name: string, ar: string, stops: number[]][] }[] = [
  { en: 'Visa & documents', ar: 'التأشيرة والوثائق', icon: 'Stamp', items: [
    ['VFS Global · TLScontact · BLS', 'مواعيد مراكز التأشيرات', [1]],
    ['ceac.state.gov', 'استمارة DS-160 وتتبّع الطلب', [1, 2]],
    ['travel.state.gov', 'تأشيرة أمريكا: المعلومات الرسمية', [2]],
    ['gov.uk · UK ETA app', 'تأشيرة بريطانيا و ETA والجمارك', [1, 18]],
    ['ICP · GDRFA', 'تأشيرات الإمارات', [1]],
    ['i94.cbp.dhs.gov', 'سجل دخولك إلى أمريكا', [16]],
  ] },
  { en: 'Flights & airports', ar: 'الطيران والمطارات', icon: 'Plane', items: [
    ['Google Flights · Skyscanner · Kayak', 'مقارنة أسعار الرحلات', [3]],
    ["Your airline's app", 'الحجز والتسجيل والتنبيهات', [3, 8, 11, 12, 15, 34]],
    ['Apple Wallet · Google Wallet', 'بطاقة الصعود في الهاتف', [8]],
    ['Flightradar24 · FlightAware', 'أين طائرتك الآن', [3, 10, 12]],
    ['Airport apps', 'خرائط المطار والانتظار', [8, 9, 10, 15]],
    ['MyTSA (USA)', 'ما يُسمح به في التفتيش', [9]],
    ['WorldTracer', 'تتبّع الحقيبة المتأخرة', [17]],
  ] },
  { en: 'Places to stay', ar: 'الإقامة', icon: 'Hotel', items: [
    ['Booking.com', 'فنادق وشقق وتقييمات', [4, 21, 33]],
    ['Airbnb', 'شقق عند السكان', [4, 21]],
    ['Agoda', 'فنادق في الخليج وآسيا', [4]],
    ['Hotel apps', 'مفتاح رقمي وطلبات', [21, 22]],
  ] },
  { en: 'Money & phone', ar: 'المال والهاتف', icon: 'Wallet', items: [
    ['Airalo · Holafly', 'باقات eSIM', [5, 19]],
    ['XE Currency', 'السعر الحقيقي للعملات', [5, 19, 25]],
    ["Your bank's app", 'الإشعارات وإيقاف البطاقة', [5, 32]],
    ['Global Blue · Planet', 'استرجاع الضريبة', [25, 33]],
    ['WhatsApp', 'رسائل ومكالمات بالواي فاي', [19, 22, 29, 34]],
  ] },
  { en: 'Getting around', ar: 'التنقّل', icon: 'Route', items: [
    ['Google Maps', 'الطريق وخرائط بدون إنترنت', [4, 7, 19, 26, 28]],
    ['Citymapper', 'أفضل طريق بالنقل العام', [20, 26, 28]],
    ['Uber · Careem · Bolt · Lyft', 'سيارات الأجرة بالتطبيق', [7, 20, 33]],
    ['TfL Go · OMNY', 'لندن · نيويورك', [20, 26]],
    ['Bonjour RATP · nol Pay', 'باريس · دبي', [20, 26]],
    ['Rentalcars.com', 'كراء السيارات', [27]],
    ['Waze · PayByPhone', 'السياقة والموقف', [27]],
    ['GasBuddy (USA)', 'أرخص بنزين', [27]],
    ['Maps.me · what3words', 'خرائط offline وموقع دقيق', [28]],
  ] },
  { en: 'Food', ar: 'الأكل', icon: 'Utensils', items: [
    ['Zabihah', 'مطاعم حلال', [23, 24]],
    ['OpenTable · TheFork', 'حجز طاولة', [23]],
    ['Uber Eats · Deliveroo · Talabat', 'توصيل الأكل', [23]],
    ['Too Good To Go', 'أكل رخيص في أوروبا', [24]],
    ['Google Lens', 'ترجمة الملصقات والأسعار', [24, 25]],
  ] },
  { en: 'Prayer & places', ar: 'الصلاة والمعالم', icon: 'Moon', items: [
    ['Muslim Pro', 'أوقات الصلاة والقبلة والمساجد', [13, 30]],
    ['GetYourGuide · Tripadvisor', 'جولات وتقييمات', [30, 34]],
    ['Meetup · Instagram · LinkedIn', 'التعارف والأنشطة', [29]],
    ['Google Photos', 'مشاركة صور الرحلة', [34]],
  ] },
  { en: 'Safety & health', ar: 'السلامة والصحة', icon: 'ShieldCheck', items: [
    ['Google Translate', 'الترجمة بالكاميرا والصوت', [2, 14, 16, 31]],
    ['Find My · Find My Device', 'تحديد الهاتف أو الحقيبة', [17, 32]],
    ['Your insurance app', 'الطبيب والتعويض', [31]],
    ['111.nhs.uk (UK)', 'نصائح طبية في بريطانيا', [31]],
    ["Your embassy's website", 'رقم السفارة وعنوانها', [32]],
    ['cbp.gov · Afseh (UAE)', 'الجمارك والتصريح بالنقود', [18]],
  ] },
]
