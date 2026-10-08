import type { WorkbookUnit } from './everyday-english.ts'

/**
 * The workbook of «الإنجليزية من الصفر (الدارجة)» — Level 1 (A0 → A1),
 * one unit per lesson of the book's second edition (data/level1-book-v2.ts).
 *
 * words      twelve single words (they go into the word search) + meaning
 * phrases    eight short sentences from the lesson + their Arabic (fill the
 *            gap, words in order, translate)
 * DIALOGUES  the Canva book's original practice conversations, which the
 *            new edition replaced: here they come back as «أكمل المحادثة»,
 *            so students meet them as fresh reading. Lessons 5, 7 and 10 had
 *            none. At most twelve lines each, to fit one page.
 */

const w = (s: string) => s.split('|').map(x => { const [en, ar] = x.split('='); return { en: en.trim(), ar: ar.trim() } })
const p = (rows: [string, string][]) => rows.map(([en, ar]) => ({ en, ar }))
const l = (s: string) => s.trim().split('\n').map(x => x.trim()).filter(Boolean)

export const LEVEL1_WORKBOOK: WorkbookUnit[] = [
  { n: 1, titleEn: 'Greetings & the Alphabet', titleAr: 'التحية والتعارف',
    words: w('hello=مرحبًا|morning=صباح|afternoon=بعد الظهر|evening=مساء|night=ليل|name=اسم|fine=بخير|thanks=شكرًا|goodbye=مع السلامة|later=لاحقًا|tomorrow=غدًا|spell=يتهجّى'),
    phrases: p([
      ['Good morning, Hind!', 'صباح الخير يا هند!'],
      ['How are you?', 'كيف حالك؟'],
      ["I'm fine, thanks.", 'أنا بخير، شكرًا.'],
      ["What's your name?", 'ما اسمك؟'],
      ['My name is Samir.', 'اسمي سمير.'],
      ['Nice to meet you.', 'تشرّفت بمعرفتك.'],
      ['How do you spell your name?', 'كيف تتهجّى اسمك؟'],
      ['See you tomorrow.', 'أراك غدًا.'],
    ]) },
  { n: 2, titleEn: 'Numbers, Age & Phone', titleAr: 'الأرقام والعمر والهاتف',
    words: w('zero=صفر|three=ثلاثة|seven=سبعة|eleven=أحد عشر|twelve=اثنا عشر|fifteen=خمسة عشر|twenty=عشرون|forty=أربعون|hundred=مئة|age=العمر|phone=هاتف|number=رقم'),
    phrases: p([
      ['How old are you?', 'كم عمرك؟'],
      ["I'm twenty-five years old.", 'عمري خمسة وعشرون عامًا.'],
      ['How old is your sister?', 'كم عمر أختك؟'],
      ['She is twelve.', 'عمرها اثنتا عشرة سنة.'],
      ['My brother is thirty.', 'عمر أخي ثلاثون سنة.'],
      ["What's your phone number?", 'ما رقم هاتفك؟'],
      ['Can you say it again, please?', 'هل يمكنك أن تعيده، من فضلك؟'],
      ['Thank you very much.', 'شكرًا جزيلًا.'],
    ]) },
  { n: 3, titleEn: 'Countries & Jobs', titleAr: 'الدول والجنسيات والمهن',
    words: w('country=دولة|nationality=جنسية|Morocco=المغرب|Moroccan=مغربي|British=بريطاني|French=فرنسي|Spanish=إسباني|German=ألماني|doctor=طبيب|teacher=أستاذ|engineer=مهندس|married=متزوّج'),
    phrases: p([
      ['Where are you from?', 'من أين أنت؟'],
      ["I'm from Morocco.", 'أنا من المغرب.'],
      ["What's your nationality?", 'ما جنسيتك؟'],
      ['My friend is Turkish.', 'صديقي تركي.'],
      ['What do you do?', 'ماذا تعمل؟'],
      ["I'm an engineer.", 'أنا مهندس.'],
      ['Are you married?', 'هل أنت متزوّج؟'],
      ["No, I'm single.", 'لا، أنا أعزب.'],
    ]) },
  { n: 4, titleEn: 'Review: Meeting People', titleAr: 'مراجعة: التعارف',
    words: w('class=القسم|student=طالب|nervous=متوتّر|medicine=الطب|nurse=ممرّضة|hairdresser=حلّاق|homework=واجب|single=أعزب|wife=زوجة|course=دورة|together=معًا|first=أوّل'),
    phrases: p([
      ['Is this the English class?', 'هل هذا قسم الإنجليزية؟'],
      ["I'm a little nervous.", 'أنا متوتّر قليلًا.'],
      ['I study medicine.', 'أدرس الطب.'],
      ['My wife is a nurse.', 'زوجتي ممرّضة.'],
      ['I live in Rabat.', 'أسكن في الرباط.'],
      ["What's your phone number?", 'ما رقم هاتفك؟'],
      ["Let's sit down.", 'لنجلس.'],
      ['See you after class!', 'أراك بعد الدرس!'],
    ]) },
  { n: 5, titleEn: 'Family & People', titleAr: 'العائلة ووصف الأشخاص',
    words: w('father=أب|mother=أم|brother=أخ|sister=أخت|uncle=عم / خال|aunt=عمة / خالة|cousin=ابن(ة) العم|grandfather=جد|grandmother=جدة|tall=طويل|funny=مضحك|kind=لطيف'),
    phrases: p([
      ['Who is Driss to Yassine?', 'من يكون إدريس بالنسبة لياسين؟'],
      ["Driss is Yassine's grandfather.", 'إدريس جدّ ياسين.'],
      ['I have two brothers.', 'لديّ أخوان.'],
      ['My sister has long hair.', 'أختي لها شعر طويل.'],
      ['My uncle is tall and funny.', 'عمّي طويل ومضحك.'],
      ['My parents are very kind.', 'والداي لطيفان جدًا.'],
      ['My grandmother is old but strong.', 'جدّتي كبيرة في السن لكنها قوية.'],
      ['My cousins are friendly.', 'أبناء عمّي ودودون.'],
    ]) },
  { n: 6, titleEn: 'Introductions & Questions', titleAr: 'التقديم وأدوات الاستفهام',
    words: w('who=من|what=ماذا|where=أين|when=متى|why=لماذا|how=كيف|neighbour=جار|hospital=مستشفى|weekend=نهاية الأسبوع|live=يسكن|work=يعمل|welcome=مرحبًا بك'),
    phrases: p([
      ['Where do you live?', 'أين تسكن؟'],
      ['Who do you live with?', 'مع من تسكن؟'],
      ['Why are you in Fez?', 'لماذا أنت في فاس؟'],
      ['When do you start work?', 'متى تبدأ العمل؟'],
      ['How do you go to work?', 'كيف تذهب إلى العمل؟'],
      ['What do you do on the weekend?', 'ماذا تفعل في نهاية الأسبوع؟'],
      ['I live with my sister.', 'أسكن مع أختي.'],
      ['Welcome to the neighbourhood!', 'مرحبًا بك في الحيّ!'],
    ]) },
  { n: 7, titleEn: 'Reading: My Day', titleAr: 'القراءة: أنا، هو، هي',
    words: w('driver=سائق|breakfast=فطور|milk=حليب|university=جامعة|colleagues=زملاء|children=أطفال|news=أخبار|receptionist=موظّفة استقبال|hotel=فندق|tram=ترامواي|guests=نزلاء|beach=شاطئ'),
    phrases: p([
      ['He gets up at half past five.', 'ينهض في الخامسة والنصف.'],
      ['He drives a bus.', 'يقود حافلة.'],
      ['She goes to work by tram.', 'تذهب إلى العمل بالترامواي.'],
      ['She has lunch at the hotel.', 'تتناول الغداء في الفندق.'],
      ['I watch the news with my wife.', 'أشاهد الأخبار مع زوجتي.'],
      ['He helps his children with their homework.', 'يساعد أطفاله في واجباتهم.'],
      ['She reads a book at home.', 'تقرأ كتابًا في البيت.'],
      ['I go to bed at ten.', 'أذهب إلى السرير في العاشرة.'],
    ]) },
  { n: 8, titleEn: 'In the Classroom', titleAr: 'في القسم',
    words: w('book=كتاب|pen=قلم|pencil=قلم رصاص|eraser=ممحاة|ruler=مسطرة|notebook=دفتر|board=سبورة|chair=كرسي|calculator=آلة حاسبة|dictionary=قاموس|homework=واجب منزلي|exam=امتحان'),
    phrases: p([
      ['Can you repeat that, please?', 'هل يمكنك إعادة ذلك، من فضلك؟'],
      ['Can I borrow your pen?', 'هل يمكنني استعارة قلمك؟'],
      ['Open your books.', 'افتحوا كتبكم.'],
      ['Look at the board.', 'انظروا إلى السبورة.'],
      ['Work in pairs.', 'اشتغلوا ثنائيًا.'],
      ["Sorry, I'm late.", 'آسف على التأخّر.'],
      ["I don't understand.", 'لم أفهم.'],
      ['Write the date.', 'اكتبوا التاريخ.'],
    ]) },
  { n: 9, titleEn: 'Pronouns & Verbs', titleAr: 'الضمائر والأفعال',
    words: w('have=يملك|go=يذهب|live=يسكن|drink=يشرب|tired=متعب|happy=سعيد|because=لأن|without=بدون|between=بين|before=قبل|after=بعد|with=مع'),
    phrases: p([
      ['I live in Rabat with my family.', 'أسكن في الرباط مع عائلتي.'],
      ['She has a cat and a dog.', 'لديها قطة وكلب.'],
      ['We go to the beach on Sunday.', 'نذهب إلى الشاطئ يوم الأحد.'],
      ['He is tired because he works a lot.', 'هو متعب لأنه يعمل كثيرًا.'],
      ['I drink tea without sugar.', 'أشرب الشاي بدون سكر.'],
      ['They do their homework before dinner.', 'يُنجزون واجباتهم قبل العشاء.'],
      ['Do you want tea or coffee?', 'هل تريد شايًا أم قهوة؟'],
      ["I'm happy, but I'm tired.", 'أنا سعيد، لكنني متعب.'],
    ]) },
  { n: 10, titleEn: 'My House', titleAr: 'البيت والأثاث',
    words: w('sofa=أريكة|bed=سرير|table=طاولة|door=باب|window=نافذة|lamp=مصباح|mirror=مرآة|fridge=ثلاجة|kitchen=مطبخ|bedroom=غرفة النوم|under=تحت|behind=خلف'),
    phrases: p([
      ['Where are my keys?', 'أين مفاتيحي؟'],
      ["They're on the sofa.", 'إنها على الأريكة.'],
      ['The cat is under the table.', 'القطة تحت الطاولة.'],
      ['The lamp is next to the bed.', 'المصباح بجانب السرير.'],
      ['The TV is in front of the sofa.', 'التلفاز أمام الأريكة.'],
      ['The plant is between the window and the door.', 'النبتة بين النافذة والباب.'],
      ['The fridge is in the kitchen.', 'الثلاجة في المطبخ.'],
      ['My bedroom is small.', 'غرفة نومي صغيرة.'],
    ]) },
  { n: 11, titleEn: 'My Day & the Time', titleAr: 'يومي والساعة',
    words: w('shower=دُش|breakfast=فطور|lunch=غداء|dinner=عشاء|work=عمل|home=البيت|bed=سرير|clock=ساعة|quarter=ربع|half=نصف|early=باكرًا|late=متأخرًا'),
    phrases: p([
      ['What time is it?', 'كم الساعة؟'],
      ["It's half past seven.", 'إنها السابعة والنصف.'],
      ["It's quarter to eight.", 'إنها الثامنة إلا ربعًا.'],
      ["I get up at six o'clock.", 'أنهض في السادسة.'],
      ['I take a shower and get dressed.', 'أستحمّ وأرتدي ملابسي.'],
      ['When do you have lunch?', 'متى تتناول الغداء؟'],
      ['I finish work at three.', 'أُنهي العمل في الثالثة.'],
      ['I go to bed at half past ten.', 'أذهب إلى السرير في العاشرة والنصف.'],
    ]) },
  { n: 12, titleEn: 'The Week', titleAr: 'أيام الأسبوع',
    words: w('Monday=الإثنين|Tuesday=الثلاثاء|Wednesday=الأربعاء|Thursday=الخميس|Friday=الجمعة|Saturday=السبت|Sunday=الأحد|always=دائمًا|usually=عادةً|often=غالبًا|sometimes=أحيانًا|never=أبدًا'),
    phrases: p([
      ['I always drink tea in the morning.', 'أشرب الشاي دائمًا في الصباح.'],
      ['She never works on Sunday.', 'هي لا تعمل أبدًا يوم الأحد.'],
      ['He is often late.', 'هو غالبًا متأخّر.'],
      ['How often do you go to the cinema?', 'كم مرة تذهب إلى السينما؟'],
      ['I go to the gym twice a week.', 'أذهب إلى قاعة الرياضة مرتين في الأسبوع.'],
      ['We usually visit my grandmother on Friday.', 'عادةً نزور جدّتي يوم الجمعة.'],
      ["I'm never busy on Thursday.", 'لست مشغولًا أبدًا يوم الخميس.'],
      ['See you on Saturday!', 'أراك يوم السبت!'],
    ]) },
  { n: 13, titleEn: 'Food', titleAr: 'الطعام',
    words: w('bread=خبز|cheese=جبن|eggs=بيض|chicken=دجاج|fish=سمك|meat=لحم|rice=أرز|pasta=معكرونة|salad=سلطة|soup=حساء|apple=تفاحة|cake=كعكة'),
    phrases: p([
      ['What food do you like?', 'ما الطعام الذي تحبّه؟'],
      ['I like fish and rice.', 'أحبّ السمك والأرز.'],
      ['Do you like pizza?', 'هل تحبّ البيتزا؟'],
      ['Yes, I do. I love it!', 'نعم، أحبّها كثيرًا!'],
      ["I don't like spicy food.", 'لا أحبّ الطعام الحار.'],
      ['Does he like cake?', 'هل يحبّ الكعك؟'],
      ['My favourite food is couscous.', 'طعامي المفضّل هو الكسكس.'],
      ['There is chocolate cake in the fridge.', 'توجد كعكة شوكولاتة في الثلاجة.'],
    ]) },
  { n: 14, titleEn: 'Drinks', titleAr: 'المشروبات',
    words: w('water=ماء|tea=شاي|coffee=قهوة|milk=حليب|juice=عصير|lemonade=ليموناضة|milkshake=حليب مخفوق|cup=فنجان|glass=كأس|bottle=قنينة|sugar=سكر|cold=بارد'),
    phrases: p([
      ['Would you like a drink?', 'هل تريد مشروبًا؟'],
      ['A glass of water, please.', 'كأس ماء، من فضلك.'],
      ["What's your favourite drink?", 'ما مشروبك المفضّل؟'],
      ["It's mint tea.", 'إنه الشاي بالنعناع.'],
      ['I like my coffee with milk.', 'أحبّ قهوتي بالحليب.'],
      ['No sugar, thank you.', 'بدون سكر، شكرًا.'],
      ['A large orange juice, please.', 'عصير برتقال كبير، من فضلك.'],
      ["That's forty-five dirhams.", 'المبلغ خمسة وأربعون درهمًا.'],
    ]) },
  { n: 15, titleEn: 'Transport', titleAr: 'وسائل النقل',
    words: w('bicycle=دراجة|car=سيارة|bus=حافلة|taxi=سيارة أجرة|train=قطار|tram=ترامواي|plane=طائرة|boat=قارب|ship=سفينة|lorry=شاحنة|metro=مترو|scooter=سكوتر'),
    phrases: p([
      ['What is this?', 'ما هذا؟'],
      ['This is my ticket.', 'هذه تذكرتي.'],
      ['What are those?', 'ما تلك؟'],
      ['Those are taxis.', 'تلك سيارات أجرة.'],
      ['These are my keys.', 'هذه مفاتيحي.'],
      ['How do you go to work?', 'كيف تذهب إلى العمل؟'],
      ['I go by tram.', 'أذهب بالترامواي.'],
      ['I go to school on foot.', 'أذهب إلى المدرسة مشيًا.'],
    ]) },
  { n: 16, titleEn: 'In Town', titleAr: 'في المدينة',
    words: w('bank=بنك|mosque=مسجد|hospital=مستشفى|bakery=مخبزة|school=مدرسة|park=حديقة|pharmacy=صيدلية|hotel=فندق|cinema=سينما|library=مكتبة|left=يسار|right=يمين'),
    phrases: p([
      ['Excuse me, where is the bank?', 'عفوًا، أين البنك؟'],
      ['Go straight on.', 'امشِ إلى الأمام.'],
      ['Turn left at the traffic lights.', 'انعطف يسارًا عند إشارات المرور.'],
      ['Take the first right.', 'خذ أول شارع على اليمين.'],
      ["It's opposite the park.", 'إنه مقابل الحديقة.'],
      ['Is it far?', 'هل هو بعيد؟'],
      ["It's five minutes on foot.", 'إنه على بعد خمس دقائق مشيًا.'],
      ['The pharmacy is next to the bakery.', 'الصيدلية بجانب المخبزة.'],
    ]) },
  { n: 17, titleEn: 'My Neighbourhood', titleAr: 'حيّي: يوجد ولا يوجد',
    words: w('shop=محل|market=سوق|bench=مقعد|stadium=ملعب|gym=قاعة رياضة|playground=ساحة ألعاب|tree=شجرة|bin=سلة مهملات|museum=متحف|beach=شاطئ|building=عمارة|street=شارع'),
    phrases: p([
      ['There is a big park near my flat.', 'توجد حديقة كبيرة قرب شقّتي.'],
      ['There are three shops.', 'توجد ثلاثة محلات.'],
      ['Is there a gym near here?', 'هل توجد قاعة رياضة قريبة من هنا؟'],
      ["No, there isn't.", 'لا، لا توجد.'],
      ['Are there any cafés?', 'هل توجد مقاهٍ؟'],
      ['Yes, there are two.', 'نعم، يوجد اثنان.'],
      ["There aren't any buses at night.", 'لا توجد حافلات ليلًا.'],
      ['How many parks are there?', 'كم حديقة توجد؟'],
    ]) },
  { n: 18, titleEn: "Can & Can't", titleAr: 'أستطيع ولا أستطيع',
    words: w('swim=يسبح|run=يجري|drive=يسوق|sing=يغنّي|dance=يرقص|cook=يطبخ|speak=يتكلّم|write=يكتب|read=يقرأ|draw=يرسم|climb=يتسلّق|fly=يطير'),
    phrases: p([
      ['Can you swim?', 'هل تستطيع السباحة؟'],
      ['Yes, I can.', 'نعم، أستطيع.'],
      ["She can't drive.", 'هي لا تستطيع السياقة.'],
      ['I can speak a little English.', 'أستطيع أن أتكلّم قليلًا من الإنجليزية.'],
      ['Can you play the guitar?', 'هل تستطيع العزف على القيثارة؟'],
      ['My brother can play the piano.', 'أخي يستطيع العزف على البيانو.'],
      ["I can't sing, but I can dance.", 'لا أستطيع الغناء، لكنني أستطيع الرقص.'],
      ['Can you start on Monday?', 'هل تستطيع البدء يوم الإثنين؟'],
    ]) },
  { n: 19, titleEn: 'Hobbies', titleAr: 'الهوايات',
    words: w('reading=القراءة|swimming=السباحة|cooking=الطبخ|drawing=الرسم|singing=الغناء|dancing=الرقص|running=الجري|cycling=ركوب الدراجة|hiking=المشي في الجبال|camping=التخييم|fishing=الصيد|travelling=السفر'),
    phrases: p([
      ['What do you like doing?', 'ماذا تحبّ أن تفعل؟'],
      ['I like cycling and taking photos.', 'أحبّ ركوب الدراجة والتصوير.'],
      ["He doesn't like video games.", 'هو لا يحبّ ألعاب الفيديو.'],
      ['Does your brother like football?', 'هل يحبّ أخوك كرة القدم؟'],
      ['Yes, he does.', 'نعم، يحبّها.'],
      ['My mum likes gardening.', 'أمّي تحبّ البستنة.'],
      ["I don't like running.", 'لا أحبّ الجري.'],
      ['We love travelling.', 'نحبّ السفر.'],
    ]) },
]

/** The Canva book's original conversations, by lesson (see the note above). */
export const LEVEL1_DIALOGUES: Record<number, string[]> = {
  1: l(`
    Khadija: Good afternoon, how are you today?
    Said: I'm OK. And you? How are you?
    Khadija: I'm great. What's your name?
    Said: My name is Said.
    Khadija: How do you spell your name?
    Said: It's spelled S-A-I-D. And you?
    Khadija: My name is Khadija.
    Said: How do you spell your name?
    Khadija: I spell it K-H-A-D-I-J-A. Nice to meet you.
    Said: Nice to meet you too.`),
  2: l(`
    Hamza: Hello Ali, how old are you?
    Ali: I am 27 years old. And you?
    Hamza: I am 19 years old.
    Ali: What's your phone number?
    Hamza: My phone number is 0600000121. And you?
    Ali: My phone number is 0765432132.
    Hamza: Thank you. See you later.
    Ali: Goodbye.`),
  3: l(`
    Hamza: Hello, my name is Hamza. And you?
    Sara: My name is Sara. Where are you from?
    Hamza: I am from Morocco. And you?
    Sara: I am from Spain. My nationality is Spanish.
    Hamza: What is your job?
    Sara: I am a nurse. And you?
    Hamza: I am a barber.
    Sara: Are you married?
    Hamza: No, I'm not. I'm single. And you?
    Sara: I'm married and I have two kids.
    Hamza: Nice to meet you.
    Sara: Nice to meet you too.`),
  4: l(`
    Hamza: Hello! My name is Hamza. What's your name?
    Sara: Hi Hamza. My name is Sara. Nice to meet you.
    Hamza: Nice to meet you too. How are you?
    Sara: I'm fine, thank you. And you?
    Hamza: I'm good. Where are you from?
    Sara: I'm from Spain. And you?
    Hamza: I'm from Morocco. I'm Moroccan.
    Sara: What's your job?
    Hamza: I'm a barber. And you?
    Sara: I'm a nurse. How old are you?
    Hamza: I'm 31 years old.
    Sara: Thank you. See you later!`),
  6: l(`
    Omar: What's your name?
    Fatima: My name is Fatima.
    Omar: Where are you from?
    Fatima: I'm from Rabat.
    Omar: How old are you?
    Fatima: I'm 22 years old.
    Omar: What do you do?
    Fatima: I'm a teacher. What about you?
    Omar: I'm a driver. Where do you work?
    Fatima: I work at a school in Rabat.
    Omar: What time do you wake up?
    Fatima: I wake up at 6 o'clock.`),
  8: l(`
    Teacher: Good morning, everyone!
    Students: Good morning, teacher!
    Teacher: Open your books, please.
    Ali: What page, teacher?
    Teacher: Page 5. Now, listen and repeat after me.
    Sara: Teacher, I don't understand.
    Teacher: No problem, Sara. I will repeat.
    Ali: Can I go to the toilet?
    Teacher: Yes, you can. Be quick.
    Teacher: Now, read this sentence, please.
    Omar: "I am from Morocco."
    Teacher: Very good, Omar!`),
  9: l(`
    Sara: Hello! What's your name?
    Youssef: Hi! My name is Youssef. And you?
    Sara: I'm Sara. Where are you from?
    Youssef: I'm from Agadir, but I live in Casablanca now.
    Sara: Do you live with your family?
    Youssef: Yes, I do. I live with my parents and my sister.
    Sara: Do you study or work?
    Youssef: I study. I go to school every day.
    Sara: I have English class on Monday and Wednesday.
    Youssef: I play football with my friends after school.
    Sara: Do you want to study together tomorrow?
    Youssef: Sure! Let's meet at the café at 5.`),
  11: l(`
    Sara: Hi Nabil. What time do you wake up?
    Nabil: I wake up at 6:00.
    Sara: Do you make your bed?
    Nabil: Yes, I do. I make my bed, then I brush my teeth.
    Sara: What do you do next?
    Nabil: I wash my face and get dressed.
    Sara: What time do you go to work?
    Nabil: I go to work at 8:30.
    Sara: And what time do you go back home?
    Nabil: At 5:00. I take a shower, have dinner, then watch TV.
    Sara: What time do you go to sleep?
    Nabil: At 10:00. And you?`),
  12: l(`
    Hana: What do you do on Monday?
    Yassine: I always go to school on Monday.
    Hana: Do you study on Friday?
    Yassine: No, I never study on Friday.
    Hana: When do you visit your grandmother?
    Yassine: I usually visit her on Saturday.
    Hana: What do you do on Sunday?
    Yassine: Sometimes I play football with my friends.
    Hana: Do you have English class on Tuesday?
    Yassine: Yes, I do. It's at 10:00.
    Hana: Nice! I have English on Thursday.
    Yassine: Great! See you next week!`),
  13: l(`
    Lina: Hello Adam, how are you today?
    Adam: I'm fine, thank you. And you?
    Lina: I'm good. What food do you like?
    Adam: I like couscous and grilled fish. And you?
    Lina: I like roast chicken and rice.
    Adam: Do you like salad?
    Lina: Yes, I do. I eat it every day. Do you like soup?
    Adam: No, I don't like soup.
    Lina: What do you like to eat for lunch?
    Adam: I like to eat tacos or pasta.
    Lina: Where do you eat lunch?
    Adam: At home, with my family.`),
  14: l(`
    Adam: Hi, Rania! How are you today?
    Rania: I'm good. What drink do you like?
    Adam: I usually drink tea in the morning and juice in the afternoon.
    Rania: Nice! Do you like coffee?
    Adam: No, I don't like coffee. It's too bitter for me.
    Rania: I drink coffee sometimes, but I prefer milk.
    Adam: What food don't you like?
    Rania: I don't like fish. And you?
    Adam: I don't like spicy food.
    Rania: Good to know! Let's eat together one day.
    Adam: Sure! See you later.
    Rania: Bye!`),
  15: l(`
    Salma: Hello Adam, how are you today?
    Adam: I'm fine, thank you! And you?
    Salma: I'm good. What is this?
    Adam: This is my bike.
    Salma: Is that your taxi?
    Adam: No, that is my father's taxi.
    Salma: Are these your keys?
    Adam: Yes, these are mine.
    Salma: And what are those?
    Adam: Those are buses. They go to the city.
    Salma: How do you go to school?
    Adam: I go by tram. What about you?`),
  16: l(`
    Ahmed: Excuse me! Can you help me, please?
    Mona: Sure!
    Ahmed: Where is the pharmacy?
    Mona: Go straight.
    Ahmed: Okay.
    Mona: Then turn right at the roundabout.
    Ahmed: Right at the roundabout. Got it.
    Mona: You'll see the bakery.
    Ahmed: And the pharmacy?
    Mona: The pharmacy is next to the bakery.
    Ahmed: Thank you!
    Mona: You're welcome.`),
  17: l(`
    Omar: Hello. Can I ask you a question?
    Fatima: Sure.
    Omar: Is there a bus station near here?
    Fatima: Yes, there is. The bus station is next to the hotel.
    Omar: Great. How can I get there?
    Fatima: Go straight, then turn right.
    Omar: Thank you! Are there many buses at the station?
    Fatima: Yes, there are many buses every day.
    Omar: That's perfect. Thanks for your help.
    Fatima: You're welcome!`),
  18: l(`
    Lina: Hi Youssef! What do you do?
    Youssef: I'm a driver. I can drive a taxi and a bus.
    Lina: Nice! Can you ride a bike?
    Youssef: Yes, I can. I ride my bike every weekend.
    Lina: I can't ride a bike. But I can swim!
    Youssef: Great! I can't swim. I'm afraid of water.
    Lina: My brother is a pilot. He can fly an airplane.
    Youssef: Wow! My sister is a teacher. She can speak three languages.
    Lina: Can she speak English?
    Youssef: Yes, she can. She teaches English and French.
    Lina: Can you cook?
    Youssef: I can make tea, but that's it!`),
  19: l(`
    Lina: Hi Youssef! What do you do?
    Youssef: I'm a driver. What about you?
    Lina: I'm a student.
    Youssef: What do you like to do in your free time?
    Lina: I like hiking and drawing. Do you like hiking?
    Youssef: No, I don't. But I like reading and playing football.
    Lina: Does your brother like football?
    Youssef: Yes, he does. He plays every weekend.
    Lina: Can you cook?
    Youssef: A little. My sister cooks very well.
    Lina: Nice! I like baking with my mom.
    Youssef: That's great. Let's practise English together.`),
}
