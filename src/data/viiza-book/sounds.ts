import type { SoundTip } from './types.ts'

/**
 * "Say it right": the pronunciation point of each stop, printed under the
 * conversation and played in the app. Each one targets a sound or a habit
 * Arabic speakers find hard, with words the stop has just taught.
 */
export const SOUNDS: Record<number, SoundTip> = {
  1: {
    title: ['P, not B', 'حرف P وليس B'],
    how: 'العربية ليس فيها P. أغلق شفتيك ثم افتحهما بدفعة هواء، بلا صوت من الحلق. ضع ورقة أمام فمك: مع P تتحرك الورقة، ومع B لا تتحرك.',
    words: ['passport', 'apply', 'upload', 'purpose', 'appointment', 'expiry'],
    say: 'Please upload a recent photo of your passport.',
  },
  2: {
    title: ['V, not F', 'حرف V وليس F'],
    how: 'العربية ليس فيها V. ضع أسنانك العليا على شفتك السفلى كما في F، ثم أضف صوتًا من الحلق. F بلا صوت، و V بصوت يهتز.',
    words: ['visa', 'visit', 'interview', 'travel', 'five', 'invitation'],
    say: "I'm visiting my cousin for five days.",
  },
  3: {
    title: ['Stress in long words', 'المقطع القوي في الكلمات الطويلة'],
    how: 'في الكلمة الطويلة مقطع واحد أقوى وأطول من الباقي، وهو هنا بالحروف الكبيرة. إن وضعت القوة في المكان الخطأ قد لا يفهمك الموظف.',
    words: ['non-reFUNDable', 'conNECTing', 'reserVAtion', 'EConomy', 'destiNAtion'],
    say: 'This ticket is non-refundable.',
  },
  4: {
    title: ['Short i or long ee', 'الكسرة القصيرة أم الطويلة'],
    how: 'i القصيرة في twin و city و live قصيرة ومرتخية. ee الطويلة في free و three و leave طويلة مع ابتسامة. الخلط يغيّر المعنى: live يعيش و leave يغادر.',
    words: ['twin', 'city', 'free', 'three', 'live', 'leave'],
    say: 'We leave the city on the sixteenth.',
  },
  5: {
    title: ['TH: thank, the', 'صوت TH'],
    how: 'ضع طرف لسانك بين أسنانك وأخرج الهواء. في thank و three يكون بلا صوت مثل «ث»، وفي the و this بصوت مثل «ذ». لا تقلها s أو z أو t.',
    words: ['thank you', 'three', 'the', 'this', 'think', 'with'],
    say: 'Is there a fee for paying with this card?',
  },
  6: {
    title: ['No extra vowel', 'لا تضف حركة قبل الحرفين'],
    how: 'يضيف كثيرون حركة قبل حرفين ساكنين أو بينهما: «إسكيلز» أو «سِكيلز». في الإنجليزية ابدأ بالحرفين معًا مباشرة: sc-ales، cl-othes، pl-ugs.',
    words: ['scales', 'clothes', 'plugs', 'small', 'spray', 'travel'],
    say: 'My small suitcase is full of clothes.',
  },
  7: {
    title: ['Your voice in questions', 'نبرة السؤال'],
    how: 'في أسئلة نعم أو لا يرتفع صوتك في الآخر ↗، وفي أسئلة how و where و what ينزل ↘. هكذا تبدو مهذبًا وواضحًا للسائق.',
    words: ['Can you open the boot? ↗', 'Is it far? ↗', 'How much is it? ↘', 'Where to? ↘'],
    say: 'How long does it take to the airport?',
  },
  8: {
    title: ['Thirteen or thirty?', 'thirteen أم thirty؟'],
    how: 'في thirTEEN القوة في الآخر ونسمع n واضحة. في THIRty القوة في الأول والآخر خفيف. إن لم تكن متأكدًا فاسأل: «Thirteen? One, three?»',
    words: ['thirteen', 'thirty', 'fourteen', 'forty', 'fifteen', 'fifty'],
    say: 'Boarding is at gate thirteen, not thirty.',
  },
  9: {
    title: ['Words that join', 'كلمات تلتصق'],
    how: 'إذا انتهت كلمة بحرف ساكن وبدأت التالية بحرف متحرك فإنهما تلتصقان: take off تُنطق «تيكوف»، و put it in «پُتِتِن». لهذا تبدو جمل الضابط سريعة.',
    words: ['take off', 'put it in', 'empty it', 'arms up', 'laptop out'],
    say: 'Take off your belt and put it in the tray.',
  },
  10: {
    title: ['E or I? G or J?', 'الحروف على الشاشات'],
    how: 'E تُنطق «إي» و I تُنطق «آي». G تُنطق «جي» و J تُنطق «جَيْ». على البوابات والمقاعد استمع جيدًا: gate E7 غير gate I7.',
    words: ['E', 'I', 'G', 'J', 'gate E7', 'seat 23A'],
    say: 'Flight EK 201 is now boarding at gate E7.',
  },
  11: {
    title: ['Small words are quick', 'الكلمات الصغيرة سريعة'],
    how: 'كلمات مثل to و for و a و of تُقال بسرعة وبصوت ضعيف: «تَ»، «فَ»، «ءَ». إن نطقتها بقوة تصبح جملتك بطيئة. ضع القوة على الكلمات المهمة.',
    words: ['a window seat', 'to London', 'for group three', 'a lot of bags'],
    say: 'Is this the line for group three?',
  },
  12: {
    title: ["won't or want?", 'won’t أم want؟'],
    how: "الموظفون يستعملون الأشكال القصيرة: it's و we've و I'll. انتبه: won't (لن) تُنطق «وونت» بضمة طويلة، و want (يريد) «وانت». الخلط بينهما يغيّر المعنى.",
    words: ["it's", "we've", "I'll", "won't", 'want', "don't"],
    say: "We won't leave before six.",
  },
  13: {
    title: ['Could you → “couldja”', 'Could you في الكلام السريع'],
    how: 'في الكلام السريع تُنطق Could you «كُدجو»، و Would you «وُدجو»، و Did you «دِدجو». لا تتفاجأ عندما تسمعها هكذا من المضيفة.',
    words: ['Could you', 'Would you like', 'Did you order', 'Can I have'],
    say: 'Would you like chicken or pasta?',
  },
  14: {
    title: ['ch = k: headache', 'ch تُنطق k'],
    how: 'في كلمات طبية كثيرة تُنطق ch مثل k: headache «هيدِيك»، و stomach «ستَمَك»، و chemist «كِمِست»، و ache «إيك».',
    words: ['headache', 'stomach ache', 'earache', 'chemist', 'toothache'],
    say: 'I have a headache and a stomach ache.',
  },
  15: {
    title: ['-tion = “shun”', 'نهاية tion'],
    how: 'نهاية tion تُنطق «شَن»: connection «كَنِكشَن»، و destination، و information. والقوة على المقطع الذي قبلها مباشرة: conNECtion.',
    words: ['connection', 'destination', 'information', 'immigration', 'station'],
    say: 'Where is the information desk for my connection?',
  },
  16: {
    title: ['Stress the answer', 'القوة على المعلومة'],
    how: 'في أجوبتك ضع القوة على المعلومة المهمة: I’m here on HOLiday. I’m staying for TEN days. هكذا يفهمك الضابط من أول مرة.',
    words: ['on HOLiday', 'for TEN days', 'at a HOTel', "I'm a TEACHer"],
    say: "I'm staying for ten days at a hotel.",
  },
  17: {
    title: ['The a in bag, black', 'صوت a في bag'],
    how: 'صوت a في bag و black و back و handle مفتوح: افتح فمك أكثر من «إي» وأقل من «آ». لا تقل «بيغ» ولا «باغ» الطويلة.',
    words: ['bag', 'black', 'back', 'handle', 'damaged', 'track'],
    say: 'My black bag is damaged at the back.',
  },
  18: {
    title: ['-ing ends softly', 'نهاية ing'],
    how: 'نهاية ing صوت واحد يخرج من الأنف، بلا «گ» قوية في الآخر: nothing «نَثِنْ»، و carrying، و bringing.',
    words: ['nothing', 'carrying', 'bringing', 'clothing', 'something', 'shopping'],
    say: "I'm not carrying anything to declare.",
  },
  19: {
    title: ['Say prices like a local', 'نطق الأسعار'],
    how: '£12.50 تُقال twelve fifty أو twelve pounds fifty، و $3.99 تُقال three ninety-nine. لا تقل «twelve point fifty».',
    words: ['twelve fifty', 'three ninety-nine', 'twenty euros', 'five pounds'],
    say: "It's ninety-nine dirhams for seven days.",
  },
  20: {
    title: ['Two-word names', 'الأسماء المركّبة'],
    how: 'في الأسماء المكوّنة من كلمتين تكون القوة غالبًا على الأولى: TICKet machine، TAXi rank، BUS stop، TRAIN station.',
    words: ['TICKet machine', 'TAXi rank', 'BUS stop', 'TRAIN station', 'CAR park'],
    say: 'Where is the ticket machine?',
  },
  21: {
    title: ['A soft R', 'راء لا تهتز'],
    how: 'الراء العربية تهتز، والإنجليزية لا تهتز: ارفع لسانك قليلًا إلى الخلف دون أن يلمس سقف الفم. room، و reception، و reservation.',
    words: ['room', 'reception', 'reservation', 'breakfast', 'floor', 'wrong'],
    say: 'I have a reservation for three nights.',
  },
  22: {
    title: ['ow in towel, shower', 'صوت ow'],
    how: 'صوت ow في towel و shower و now يبدأ بفتحة «آ» وينتهي بضمة «و»: «تاوِل»، «شاوَر». لا تقل «تُوِل».',
    words: ['towel', 'shower', 'now', 'out', 'hour'],
    say: 'There are no towels in the shower room.',
  },
  23: {
    title: ['Fewer syllables', 'مقاطع أقل مما تُكتب'],
    how: 'بعض الكلمات تُقال بمقاطع أقل مما تُكتب: vegetable «فيجتَبِل»، و chocolate «تشوكلِت»، و restaurant «رِسترونت»، و comfortable «كَمفتَبِل».',
    words: ['vegetable', 'chocolate', 'restaurant', 'comfortable', 'different'],
    say: 'The vegetable soup and the chocolate cake, please.',
  },
  24: {
    title: ["Can or can't?", "can أم can't؟"],
    how: "في can't تكون a طويلة وقوية مع t خفيفة في الآخر. في can تكون قصيرة وضعيفة «كَن». الفرق مهم: You can pay here و You can't pay here.",
    words: ['I can', "I can't", 'Can I have', "You can't"],
    say: 'Can I have a medium latte, please?',
  },
  25: {
    title: ['Plural s: often z', 'نهاية الجمع'],
    how: 'نهاية الجمع s تُنطق z بعد الأصوات المجهورة: shoes «شوز»، و jeans «جينز»، و sizes «سايزِز». وتُنطق s بعد المهموسة: shirts و socks.',
    words: ['shoes', 'jeans', 'sizes', 'shirts', 'socks', 'dresses'],
    say: 'Do you have these shoes in other sizes?',
  },
  26: {
    title: ['-ed: t, d or id', 'نهاية ed'],
    how: 'لنهاية ed ثلاثة أصوات: stopped «ستوبت»، و changed «تشينجد»، و waited «ويتِد». لا تقل «ستوبِد».',
    words: ['stopped', 'changed', 'waited', 'missed', 'arrived', 'needed'],
    say: 'The train stopped, so I changed lines.',
  },
  27: {
    title: ['full or fuel?', 'الضمة القصيرة والطويلة'],
    how: 'u القصيرة في full و push و put قصيرة. u الطويلة في fuel و rule و route طويلة مع ضمّ الشفتين. full tank خزان ممتلئ.',
    words: ['full', 'fuel', 'push', 'rule', 'route'],
    say: 'Bring it back with a full tank of fuel.',
  },
  28: {
    title: ['Silent letters', 'حروف لا تُنطق'],
    how: 'gh في straight و right و light لا تُنطق: «ستريت»، «رايت». و l في walk و half لا تُنطق، و s في island كذلك.',
    words: ['straight', 'right', 'light', 'walk', 'half', 'island'],
    say: 'Go straight on and turn right at the lights.',
  },
  29: {
    title: ['Sound interested', 'نبرة الاهتمام'],
    how: 'في الحديث الودي نرفع الصوت وننزله بحماس: Really? ↗ Oh, nice! That’s amazing! إن تكلمت بنبرة واحدة تبدو غير مهتم.',
    words: ['Really? ↗', 'Oh, nice!', "That's amazing!", 'Me too!'],
    say: "Oh, really? That's amazing!",
  },
  30: {
    title: ['muSEum, phoTOgraphy', 'المقطع القوي في كلمات المتحف'],
    how: 'لكلمات المتحف قوة في مكان غير متوقّع: muSEum (لا MUseum)، و phoTOgraphy لكن PHOtograph، و souveNIR، و exhiBItion.',
    words: ['muSEum', 'phoTOgraphy', 'PHOtograph', 'souveNIR', 'exhiBItion'],
    say: 'Is photography allowed in the museum?',
  },
  31: {
    title: ['gh = f: cough', 'gh تُنطق f'],
    how: 'تُنطق gh مثل f في بعض الكلمات: cough «كوف»، و enough «إنَف»، و laugh. لكنها صامتة في high و through و night.',
    words: ['cough', 'enough', 'laugh', 'high', 'through'],
    say: 'I have a cough and a sore throat.',
  },
  32: {
    title: ['poLICE, AMbulance', 'كلمات الطوارئ بوضوح'],
    how: 'police بالقوة على الثانية «پَليس»، و AMbulance بالقوة على الأولى، و eMERgency على الثانية. في الطوارئ قلها ببطء ووضوح.',
    words: ['poLICE', 'AMbulance', 'eMERgency', 'HOSpital', 'ACCident'],
    say: 'Please call the police and an ambulance!',
  },
  33: {
    title: ['Silent p: receipt', 'حروف صامتة أخرى'],
    how: 'p في receipt لا تُنطق: «رِسيت». وكذلك cupboard «كَبَرد»، و Wednesday «وِنزدي»، و listen «لِسِن».',
    words: ['receipt', 'cupboard', 'Wednesday', 'listen', 'foreign'],
    say: 'Could I have a receipt, please?',
  },
  34: {
    title: ['gonna, wanna', 'ما تسمعه في الكلام اليومي'],
    how: 'في الكلام اليومي تصير going to «gonna»، و want to «wanna»، و got to «gotta». افهمها عندما تسمعها، وقل أنت الشكل الكامل في المواقف الرسمية.',
    words: ['going to → gonna', 'want to → wanna', 'got to → gotta', 'let me → lemme'],
    say: "I'm going to miss this city.",
  },
}

/** A tip's word as the voice should read it: no arrows, no stress capitals, "going to → gonna" as both. */
export const soundText = (w: string) => w.replace(/[↗↘]/g, '').replace(/\s*→\s*/g, ', ').replace(/\b(\w*[a-z]\w*)\b/g, m => (/[a-z][A-Z]|[A-Z]{2,}[a-z]/.test(m) ? m.toLowerCase() : m)).trim()
