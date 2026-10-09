/**
 * What each unit's opening page promises: three «I can…» goals the student
 * ticks when the unit is done (the self-check the book's method ends on),
 * and one language tip, the small thing a teacher would say in class.
 * Every goal and tip is taught in the unit itself. The Arabic halves are
 * printed right to left, so English inside them is kept to the words the tip
 * is about.
 */

export interface UnitOpener {
  /** [I can… (English), أستطيع أن… (Arabic)] */
  canDo: [string, string][]
  tip: { en: string; ar: string }
}

export const OPENERS: Record<number, UnitOpener> = {
  1: {
    canDo: [
      ['talk about my morning routine.', 'أتحدّث عن روتيني الصباحي.'],
      ['say what time I do things.', 'أقول في أي ساعة أفعل الأشياء.'],
      ['put my morning in order: first, then, after that.', 'أرتّب أحداث صباحي: أولًا، ثم، بعد ذلك.'],
    ],
    tip: { en: 'Habits → present simple: I wake up at seven. She wakes up at six.', ar: 'للعادات اليومية نستعمل المضارع البسيط، ومع he و she و it نضيف s إلى الفعل.' },
  },
  2: {
    canDo: [
      ['order drinks and snacks.', 'أطلب المشروبات والوجبات الخفيفة.'],
      ['ask about sizes, milk and sugar.', 'أسأل عن الحجم والحليب والسكر.'],
      ['pay and ask for the receipt.', 'أدفع وأطلب الإيصال.'],
    ],
    tip: { en: "I'd like a coffee, please. sounds more polite than I want a coffee.", ar: 'عبارة I\'d like أكثر تهذيبًا من I want عند الطلب، ولا تنسَ كلمة please في آخر الجملة.' },
  },
  3: {
    canDo: [
      ['name the things in a kitchen.', 'أسمّي أدوات المطبخ.'],
      ['say what I am cooking and how.', 'أقول ماذا أطبخ وكيف.'],
      ['follow and give simple cooking instructions.', 'أفهم تعليمات الطبخ البسيطة وأعطيها.'],
    ],
    tip: { en: 'Instructions start with the verb: Cut the onions. Boil the water.', ar: 'في الوصفات والتعليمات نبدأ بالفعل مباشرة، دون فاعل.' },
  },
  4: {
    canDo: [
      ['name the things in a bathroom.', 'أسمّي أدوات الحمّام.'],
      ['talk about washing and personal care.', 'أتحدّث عن النظافة والعناية الشخصية.'],
      ['say what I do to get ready every day.', 'أقول ماذا أفعل لأستعدّ كل يوم.'],
    ],
    tip: { en: 'Body parts take my, your, his: I brush my teeth. (not the teeth)', ar: 'لا نستعمل the مع أجزاء الجسم، بل my و your و his حسب صاحبها.' },
  },
  5: {
    canDo: [
      ['ask for washing, ironing and cleaning.', 'أطلب الغسيل والكيّ والتنظيف.'],
      ['ask about the price.', 'أسأل عن السعر.'],
      ['ask when my clothes will be ready.', 'أسأل متى تكون ملابسي جاهزة.'],
    ],
    tip: { en: "It'll be ready on Tuesday. You can pick it up after five.", ar: 'نستعمل on مع الأيام، و after أو at مع الساعات.' },
  },
  6: {
    canDo: [
      ['ask for a table.', 'أطلب طاولة.'],
      ['order my meal and talk to the waiter.', 'أطلب وجبتي وأتحدّث مع النادل.'],
      ['ask for the bill and pay.', 'أطلب الفاتورة وأدفع.'],
    ],
    tip: { en: 'Could I have the bill, please? (In the US people say the check.)', ar: 'الفاتورة في المطعم هي bill في بريطانيا، و check في أمريكا.' },
  },
  7: {
    canDo: [
      ['find products in the shop.', 'أجد المنتجات في المتجر.'],
      ['ask about quantities and prices.', 'أسأل عن الكميات والأسعار.'],
      ['pay at the checkout.', 'أدفع عند الصندوق.'],
    ],
    tip: { en: 'How many apples? (we count them) · How much milk? (we don\'t)', ar: 'نستعمل How many مع ما يُعدّ، و How much مع ما لا يُعدّ كالحليب والأرز.' },
  },
  8: {
    canDo: [
      ['ask for bread and pastries.', 'أطلب الخبز والمعجّنات.'],
      ['ask what is fresh today.', 'أسأل ما هو الطازج اليوم.'],
      ['say how many I want, and pay.', 'أقول كم أريد، وأدفع.'],
    ],
    tip: { en: 'Bread is uncountable: some bread, a loaf of bread, two loaves.', ar: 'الخبز لا يُعدّ: لا نقول two breads، بل some bread أو two loaves من الخبز.' },
  },
  9: {
    canDo: [
      ['ask for my size and colour.', 'أسأل عن مقاسي واللون.'],
      ['try clothes on.', 'أجرّب الملابس.'],
      ['ask for another size or colour.', 'أطلب مقاسًا أو لونًا آخر.'],
    ],
    tip: { en: "Too + adjective is a problem: It's too small. Do you have a bigger size?", ar: 'نستعمل too قبل الصفة لنقول إن هناك مشكلة: صغير جدًا، واسع جدًا.' },
  },
  10: {
    canDo: [
      ['start a friendly conversation.', 'أبدأ محادثة ودّية.'],
      ['ask about news and daily life.', 'أسأل عن الأخبار والحياة اليومية.'],
      ['suggest meeting up.', 'أقترح أن نلتقي.'],
    ],
    tip: { en: 'Answer, then ask back: Not bad, thanks. And you?', ar: 'بعد أن تجيب، اسأل صديقك أيضًا: هذا من آداب المحادثة بالإنجليزية.' },
  },
  11: {
    canDo: [
      ['explain the haircut I want.', 'أشرح قصّة الشعر التي أريدها.'],
      ['talk about length and details.', 'أتحدّث عن الطول والتفاصيل.'],
      ['ask about the price.', 'أسأل عن السعر.'],
    ],
    tip: { en: 'Just a trim, please. = cut only a little, keep the same style.', ar: 'عبارة a trim تعني قصًّا خفيفًا فقط، مع الحفاظ على شكل الشعر.' },
  },
  12: {
    canDo: [
      ['describe a simple health problem.', 'أصف مشكلة صحية بسيطة.'],
      ['ask for medicine.', 'أطلب دواءً.'],
      ['understand the basic instructions.', 'أفهم التعليمات الأساسية.'],
    ],
    tip: { en: 'Read the label and ask: When should I take it? How often?', ar: 'اقرأ التعليمات واسأل الصيدلي متى تأخذ الدواء وكم مرة. وإن لم تتحسّن، فاستشر الطبيب.' },
  },
  13: {
    canDo: [
      ['book an appointment.', 'أحجز موعدًا.'],
      ['describe my symptoms and when they started.', 'أصف أعراضي ومتى بدأت.'],
      ["answer the doctor's questions.", 'أجيب عن أسئلة الطبيب.'],
    ],
    tip: { en: "I've had a headache for three days / since Monday.", ar: 'نستعمل for مع المدة، و since مع بداية المدة.' },
  },
  14: {
    canDo: [
      ['ask about prices and quantities.', 'أسأل عن الأسعار والكميات.'],
      ['buy fruit and vegetables by the kilo.', 'أشتري الخضر والفواكه بالكيلوغرام.'],
      ['ask for a better price, politely.', 'أطلب سعرًا أفضل بأدب.'],
    ],
    tip: { en: "That's a bit expensive. Can you do twenty dirhams?", ar: 'فاوض بلطف: قل إن السعر مرتفع قليلًا، ثم اقترح سعرًا في سؤال.' },
  },
  15: {
    canDo: [
      ['ask about the destination, the time and the price.', 'أسأل عن الوجهة والوقت والسعر.'],
      ['buy a ticket.', 'أشتري تذكرة.'],
      ['ask about the platform and where to get off.', 'أسأل عن الرصيف وأين أنزل.'],
    ],
    tip: { en: 'Get on / get off a bus or a train · get in / get out of a taxi.', ar: 'للصعود والنزول نقول get on و get off مع الحافلة والقطار، و get in و get out مع سيارة الأجرة.' },
  },
  16: {
    canDo: [
      ['ask the way politely.', 'أسأل عن الطريق بأدب.'],
      ['understand simple directions.', 'أفهم تعليمات بسيطة للاتجاهات.'],
      ["use landmarks and check I'm going the right way.", 'أستعمل المعالم وأتأكّد أنني في الاتجاه الصحيح.'],
    ],
    tip: { en: 'Excuse me, how do I get to the station? It\'s opposite the bank.', ar: 'ابدأ بـ Excuse me، واستعمل المعالم مثل next to و opposite و on the corner لتصف المكان.' },
  },
  17: {
    canDo: [
      ['check in and check out.', 'أسجّل الدخول والمغادرة.'],
      ['ask about the room and the services.', 'أسأل عن الغرفة والخدمات.'],
      ['explain a simple problem in my room.', 'أشرح مشكلة بسيطة في غرفتي.'],
    ],
    tip: { en: 'I have a reservation under the name Hamdan.', ar: 'عند الاستقبال قل I have a reservation under the name ثم اسمك العائلي.' },
  },
  18: {
    canDo: [
      ['withdraw and deposit money.', 'أسحب المال وأودعه.'],
      ['transfer money.', 'أحوّل المال.'],
      ['ask for help with a card problem.', 'أطلب المساعدة عند مشكلة في البطاقة.'],
    ],
    tip: { en: 'Withdraw = take money out · deposit = put money in · transfer = send it.', ar: 'ثلاثة أفعال أساسية في البنك: السحب، والإيداع، والتحويل.' },
  },
  19: {
    canDo: [
      ['start and end a phone call.', 'أبدأ مكالمة وأنهيها.'],
      ['deal with a bad connection.', 'أتصرّف عندما يكون الاتصال سيئًا.'],
      ['change an appointment by phone or WhatsApp.', 'أغيّر موعدًا بالهاتف أو بواتساب.'],
    ],
    tip: { en: 'Is this Sara? — Yes, speaking. / Hi, this is Omar.', ar: 'في الهاتف لا نقول I am Omar، بل This is Omar عندما نقدّم أنفسنا.' },
  },
}
